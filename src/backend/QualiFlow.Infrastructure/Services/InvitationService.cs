// -----------------------------------------------------------------------
// <copyright file="InvitationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Application.Features.TeamMembers.DTOs;
using QualiFlow.Application.Features.TeamMembers.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Implementation of invitation management service.
/// </summary>
public partial class InvitationService : IInvitationService
{
    private const int InvitationExpiryDays = 7;

    private readonly QualiFlowDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<InvitationService> _logger;
    private readonly string _frontendUrl;

    public InvitationService(
        QualiFlowDbContext context,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<InvitationService> logger)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
        _frontendUrl = configuration["App:FrontendUrl"] ?? "http://localhost:3000";
    }

    /// <inheritdoc/>
    public async Task<InvitationDto> InviteAsync(
        Guid businessId,
        InviteTeamMemberRequest request,
        Guid invitedByUserId,
        CancellationToken cancellationToken = default)
    {
        LogCreatingInvitation(businessId, request.Email, request.Role);

        // Validate role
        if (!ApplicationRole.IsValidRole(request.Role))
        {
            throw new ArgumentException($"Invalid role: {request.Role}", nameof(request));
        }

        // Get business and inviter info first (needed for domain validation)
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        var inviter = await _context.Users.FindAsync([invitedByUserId], cancellationToken)
            ?? throw new InvalidOperationException($"Inviter {invitedByUserId} not found");

        // SECURITY: Validate email domain restriction
        if (business.EnforceEmailDomainRestriction && !string.IsNullOrWhiteSpace(business.AllowedEmailDomain))
        {
            var inviteeEmailDomain = GetEmailDomain(request.Email);
            var allowedDomain = business.AllowedEmailDomain.ToLowerInvariant().Trim();

            if (!string.Equals(inviteeEmailDomain, allowedDomain, StringComparison.OrdinalIgnoreCase))
            {
                // Log security breach attempt
                LogDomainRestrictionViolation(businessId, request.Email, inviteeEmailDomain, allowedDomain, invitedByUserId, inviter.Email ?? "unknown");

                // Create security audit log entry
                await CreateSecurityAuditLogAsync(
                    businessId,
                    invitedByUserId,
                    $"Attempted to invite {request.Email} (domain: {inviteeEmailDomain}) but only {allowedDomain} domain is allowed",
                    request.Email,
                    cancellationToken);

                throw new SecurityException(
                    $"Email domain restriction: Only emails from @{allowedDomain} can be invited to this business. " +
                    $"The email {request.Email} uses domain @{inviteeEmailDomain} which is not allowed. " +
                    "Contact your business administrator if you believe this is an error.");
            }
        }

        // Check if user already exists in this business
        var existingUser = await _context.Users
            .AnyAsync(u => u.Email == request.Email && u.BusinessId == businessId, cancellationToken);
        if (existingUser)
        {
            throw new InvalidOperationException($"User with email {request.Email} is already a member of this business");
        }

        // Auto-expire any invitations that have passed their expiry date
        var now = DateTime.UtcNow;
        await _context.Set<Invitation>()
            .Where(i => i.BusinessId == businessId &&
                        i.Status == InvitationStatus.Pending &&
                        i.ExpiresAt < now)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.Status, InvitationStatus.Expired), cancellationToken);

        // Check for existing pending AND valid (not expired) invitation
        var hasPendingInvitation = await _context.Set<Invitation>()
            .AnyAsync(
                i => i.Email == request.Email &&
                    i.BusinessId == businessId &&
                    i.Status == InvitationStatus.Pending &&
                    i.ExpiresAt > now, // Only block if invitation is still valid
                cancellationToken);

        if (hasPendingInvitation)
        {
            throw new InvalidOperationException($"A pending invitation already exists for {request.Email}");
        }

        // Create invitation
        var invitation = new Invitation
        {
            BusinessId = businessId,
            Email = request.Email,
            Role = request.Role,
            InvitedByUserId = invitedByUserId,
            Token = Invitation.GenerateToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(InvitationExpiryDays),
            Status = InvitationStatus.Pending
        };

        _context.Set<Invitation>().Add(invitation);
        await _context.SaveChangesAsync(cancellationToken);

        // Send invitation email
        await SendInvitationEmailAsync(invitation, business, inviter, request.PersonalMessage, cancellationToken);

        LogInvitationCreated(invitation.Id, businessId, request.Email);
        return MapToDto(invitation, inviter);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<InvitationDto>> GetPendingInvitationsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var invitations = await _context.Set<Invitation>()
            .AsNoTracking()
            .Include(i => i.InvitedByUser)
            .Where(i => i.BusinessId == businessId && i.Status == InvitationStatus.Pending)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);

        // Update expired invitations
        var now = DateTime.UtcNow;
        var expiredIds = invitations.Where(i => i.ExpiresAt < now).Select(i => i.Id).ToList();
        if (expiredIds.Count > 0)
        {
            await _context.Set<Invitation>()
                .Where(i => expiredIds.Contains(i.Id))
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.Status, InvitationStatus.Expired), cancellationToken);
        }

        return invitations
            .Where(i => i.ExpiresAt >= now)
            .Select(i => MapToDto(i, i.InvitedByUser))
            .ToList();
    }

    /// <inheritdoc/>
    public async Task<InvitationDto?> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var invitation = await _context.Set<Invitation>()
            .AsNoTracking()
            .Include(i => i.InvitedByUser)
            .Include(i => i.Business)
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);

        if (invitation == null)
        {
            return null;
        }

        // Check if expired
        if (invitation.ExpiresAt < DateTime.UtcNow && invitation.Status == InvitationStatus.Pending)
        {
            invitation.Status = InvitationStatus.Expired;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return MapToDto(invitation, invitation.InvitedByUser);
    }

    /// <inheritdoc/>
    public async Task<AcceptInvitationResponse> AcceptAsync(
        AcceptInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        LogAcceptingInvitation(request.Token);

        var invitation = await _context.Set<Invitation>()
            .Include(i => i.Business)
            .FirstOrDefaultAsync(i => i.Token == request.Token, cancellationToken)
            ?? throw new InvalidOperationException("Invalid invitation token");

        if (!invitation.IsValid)
        {
            throw new InvalidOperationException($"Invitation is no longer valid. Status: {invitation.Status}");
        }

        // Check if email already registered
        var existingUser = await _userManager.FindByEmailAsync(invitation.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("An account with this email already exists");
        }

        // Create user
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = invitation.Email,
            Email = invitation.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            BusinessId = invitation.BusinessId,
            EmailConfirmed = true, // Accepted via invitation
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user: {errors}");
        }

        // Assign role
        await _userManager.AddToRoleAsync(user, invitation.Role);

        // Update invitation
        invitation.Status = InvitationStatus.Accepted;
        invitation.AcceptedAt = DateTime.UtcNow;
        invitation.AcceptedByUserId = user.Id;
        invitation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        LogInvitationAccepted(invitation.Id, user.Id);

        return new AcceptInvitationResponse
        {
            UserId = user.Id,
            BusinessId = invitation.BusinessId,
            BusinessName = invitation.Business.Name,
            Role = invitation.Role
        };
    }

    /// <inheritdoc/>
    public async Task<InvitationDto> ResendAsync(
        Guid businessId,
        Guid invitationId,
        CancellationToken cancellationToken = default)
    {
        var invitation = await _context.Set<Invitation>()
            .Include(i => i.InvitedByUser)
            .Include(i => i.Business)
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.BusinessId == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Invitation {invitationId} not found");

        if (invitation.Status != InvitationStatus.Pending && invitation.Status != InvitationStatus.Expired)
        {
            throw new InvalidOperationException($"Cannot resend invitation with status: {invitation.Status}");
        }

        // Reset token and expiry
        invitation.Token = Invitation.GenerateToken();
        invitation.ExpiresAt = DateTime.UtcNow.AddDays(InvitationExpiryDays);
        invitation.Status = InvitationStatus.Pending;
        invitation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Resend email
        await SendInvitationEmailAsync(invitation, invitation.Business, invitation.InvitedByUser, null, cancellationToken);

        LogInvitationResent(invitationId, invitation.Email);
        return MapToDto(invitation, invitation.InvitedByUser);
    }

    /// <inheritdoc/>
    public async Task CancelAsync(
        Guid businessId,
        Guid invitationId,
        CancellationToken cancellationToken = default)
    {
        var invitation = await _context.Set<Invitation>()
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.BusinessId == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Invitation {invitationId} not found");

        if (invitation.Status != InvitationStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot cancel invitation with status: {invitation.Status}");
        }

        invitation.Status = InvitationStatus.Cancelled;
        invitation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        LogInvitationCancelled(invitationId);
    }

    private async Task SendInvitationEmailAsync(
        Invitation invitation,
        Business business,
        ApplicationUser? inviter,
        string? personalMessage,
        CancellationToken cancellationToken)
    {
        var inviteUrl = $"{_frontendUrl}/accept-invitation?token={invitation.Token}";
        var inviterName = inviter?.FullName ?? "QualiFlow Team";
        var htmlBody = GenerateInvitationEmailHtml(business.Name, inviterName, invitation.Role, inviteUrl, personalMessage);
        var textBody = GenerateInvitationEmailText(business.Name, inviterName, invitation.Role, inviteUrl, personalMessage);

        var emailRequest = new SendEmailRequest
        {
            BusinessId = invitation.BusinessId,
            FromEmail = _configuration["Email:FromAddress"] ?? EmailConstants.NoReplyEmail,
            FromName = EmailConstants.FromName,
            ToEmail = invitation.Email,
            Subject = $"You've been invited to join {business.Name} on QualiFlow",
            HtmlBody = htmlBody,
            TextBody = textBody,
            Tags = new Dictionary<string, string> { { "type", "team_invitation" } }
        };

        await _emailService.SendEmailAsync(emailRequest, cancellationToken);
    }

    private static string GenerateInvitationEmailHtml(string businessName, string inviterName, string role, string inviteUrl, string? personalMessage)
    {
        var messageHtml = string.IsNullOrEmpty(personalMessage) ? string.Empty : $"<p style=\"margin-bottom:20px;color:#666;font-style:italic;\">\"{personalMessage}\"</p>";
        return $@"<!DOCTYPE html><html><body style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"">
<h1 style=""color:#1a1a2e;"">You're invited!</h1>
<p><strong>{inviterName}</strong> has invited you to join <strong>{businessName}</strong> on QualiFlow as a <strong>{role}</strong>.</p>
{messageHtml}
<p><a href=""{inviteUrl}"" style=""display:inline-block;padding:12px 24px;background:#f97316;color:white;text-decoration:none;border-radius:6px;"">Accept Invitation</a></p>
<p style=""color:#666;font-size:12px;margin-top:30px;"">This invitation expires in 7 days. If you didn't expect this invitation, you can ignore this email.</p>
</body></html>";
    }

    private static string GenerateInvitationEmailText(string businessName, string inviterName, string role, string inviteUrl, string? personalMessage)
    {
        var message = string.IsNullOrEmpty(personalMessage) ? string.Empty : $"\n\"{personalMessage}\"\n";
        return $"You're invited!\n\n{inviterName} has invited you to join {businessName} on QualiFlow as a {role}.\n{message}\nAccept your invitation: {inviteUrl}\n\nThis invitation expires in 7 days.";
    }

    private static InvitationDto MapToDto(Invitation invitation, ApplicationUser? inviter) => new()
    {
        Id = invitation.Id,
        Email = invitation.Email,
        Role = invitation.Role,
        Status = invitation.Status.ToString(),
        ExpiresAt = invitation.ExpiresAt,
        IsValid = invitation.IsValid,
        InvitedByName = inviter?.FullName ?? "Unknown",
        CreatedAt = invitation.CreatedAt,
        AcceptedAt = invitation.AcceptedAt
    };

    // Logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Creating invitation for {Email} to business {BusinessId} with role {Role}")]
    private partial void LogCreatingInvitation(Guid businessId, string email, string role);

    [LoggerMessage(Level = LogLevel.Information, Message = "Invitation {InvitationId} created for {Email} in business {BusinessId}")]
    private partial void LogInvitationCreated(Guid invitationId, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Accepting invitation with token {Token}")]
    private partial void LogAcceptingInvitation(string token);

    [LoggerMessage(Level = LogLevel.Information, Message = "Invitation {InvitationId} accepted by user {UserId}")]
    private partial void LogInvitationAccepted(Guid invitationId, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Invitation {InvitationId} resent to {Email}")]
    private partial void LogInvitationResent(Guid invitationId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Invitation {InvitationId} cancelled")]
    private partial void LogInvitationCancelled(Guid invitationId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "SECURITY: Email domain restriction violation in business {BusinessId}. Attempted to invite {Email} (domain: {InviteeDomain}) but only @{AllowedDomain} is allowed. Attempted by user {InviterId} ({InviterEmail})")]
    private partial void LogDomainRestrictionViolation(Guid businessId, string email, string inviteeDomain, string allowedDomain, Guid inviterId, string inviterEmail);

    /// <summary>
    /// Extracts the domain from an email address.
    /// </summary>
    private static string GetEmailDomain(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return string.Empty;
        }

        var atIndex = email.LastIndexOf('@');
        return atIndex >= 0 ? email[(atIndex + 1)..].ToLowerInvariant().Trim() : string.Empty;
    }

    /// <summary>
    /// Creates a security audit log entry for domain restriction violations.
    /// </summary>
    private async Task CreateSecurityAuditLogAsync(
        Guid businessId,
        Guid userId,
        string details,
        string targetEmail,
        CancellationToken cancellationToken)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            UserId = userId,
            Username = string.Empty,
            Action = AuditAction.SecurityViolation,
            EntityType = "Invitation",
            EntityId = Guid.Empty,
            OldValues = null,
            NewValues = System.Text.Json.JsonSerializer.Serialize(new
            {
                TargetEmail = targetEmail,
                Violation = details,
                Severity = "High"
            }),
            IpAddress = string.Empty,
            UserAgent = string.Empty
        };

        _context.Set<AuditLog>().Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

