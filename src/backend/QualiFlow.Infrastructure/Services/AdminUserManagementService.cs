using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Features.Admin.UserManagement;
using QualiFlow.Application.Features.Admin.UserManagement.DTOs;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing platform users by administrators.
/// </summary>
public class AdminUserManagementService : IAdminUserManagementService
{
    private readonly QualiFlowDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminUserManagementService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminUserManagementService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="userManager">User manager.</param>
    /// <param name="emailService">Email service for sending emails.</param>
    /// <param name="configuration">Application configuration.</param>
    /// <param name="logger">Logger.</param>
    public AdminUserManagementService(
        QualiFlowDbContext context,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AdminUserManagementService> logger)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<AdminUserListDto>> GetAllUsersAsync(
        AdminUserQuery query,
        CancellationToken cancellationToken = default)
    {
        var queryable = _context.Users
            .AsNoTracking()
            .Include(u => u.Business)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            queryable = queryable.Where(u =>
                u.FirstName.Contains(query.Search, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(query.Search, StringComparison.OrdinalIgnoreCase) ||
                (u.Email != null && u.Email.Contains(query.Search, StringComparison.OrdinalIgnoreCase)));
        }

        if (query.BusinessId.HasValue)
        {
            queryable = queryable.Where(u => u.BusinessId == query.BusinessId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var isActive = query.Status.Equals("active", StringComparison.OrdinalIgnoreCase);
            queryable = queryable.Where(u => u.IsActive == isActive);
        }

        // Apply sorting
        queryable = ApplySorting(queryable, query.SortBy, query.SortDirection);

        // Get total count
        var totalItems = await queryable.CountAsync(cancellationToken);

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(u => new AdminUserListDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Role = string.Empty, // Will be populated from UserRoles
                BusinessId = u.BusinessId,
                BusinessName = u.Business.Name,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
            })
            .ToListAsync(cancellationToken);

        // Get roles for each user (UserManager doesn't support async projection)
        foreach (var item in items)
        {
            var user = await _userManager.FindByIdAsync(item.Id.ToString());
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                item.GetType().GetProperty(nameof(AdminUserListDto.Role))!
                    .SetValue(item, roles.FirstOrDefault() ?? ApplicationRole.Viewer);
            }
        }

        return new PagedResult<AdminUserListDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    /// <inheritdoc/>
    public async Task<AdminUserDetailDto?> GetUserByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Business)
                .ThenInclude(b => b.Subscription)
                    .ThenInclude(s => s!.Plan)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault() ?? ApplicationRole.Viewer;

        // Get activity statistics
        var totalLeadsCreated = await _context.Leads
            .CountAsync(l => l.BusinessId == user.BusinessId, cancellationToken);

        var totalConversationsHandled = await _context.Conversations
            .CountAsync(c => c.AssignedToUserId == userId, cancellationToken);

        return new AdminUserDetailDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            Role = userRole,
            BusinessId = user.BusinessId,
            BusinessName = user.Business.Name,
            SubscriptionTier = user.Business.Subscription != null ? user.Business.Subscription.Plan.DisplayName : "Free Flow",
            IsActive = user.IsActive,
            EmailConfirmed = user.EmailConfirmed,
            OAuthProvider = user.OAuthProvider,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = null, // Not tracked in ApplicationUser
            TotalLeadsCreated = totalLeadsCreated,
            TotalConversationsHandled = totalConversationsHandled,
        };
    }

    /// <inheritdoc/>
    public async Task<AdminUserDetailDto> UpdateUserAsync(
        Guid userId,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        // Update properties
        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            user.FirstName = request.FirstName;
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            user.LastName = request.LastName;
        }

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            user.Email = request.Email;
            user.UserName = request.Email;
            user.EmailConfirmed = false; // Require re-confirmation
        }

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            user.PhoneNumber = request.PhoneNumber;
        }

        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to update user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        // Update role if specified
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, request.Role);
        }

        _logger.LogInformation("Admin updated user {UserId}", userId);

        return (await GetUserByIdAsync(userId, cancellationToken))!;
    }

    /// <inheritdoc/>
    public async Task DeleteUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to delete user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        _logger.LogInformation("Admin soft-deleted user {UserId}", userId);
    }

    /// <inheritdoc/>
    public async Task SendPasswordResetEmailAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        // Generate reset token using ASP.NET Identity
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Build reset URL
#pragma warning disable S1075 // Hardcoded URI is a fallback for development
        var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:3000";
#pragma warning restore S1075
        var resetUrl = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(user.Email!)}";

        var emailBody = $@"
            <html>
            <body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333;"">
                <div style=""max-width: 600px; margin: 0 auto; padding: 20px;"">
                    <h2 style=""color: #6366F1;"">🔒 Password Reset Request</h2>
                    <p>Hi {user.FirstName ?? "there"},</p>
                    <p>An administrator has requested a password reset for your QualiFlow account.</p>
                    <p>Click the button below to set a new password:</p>
                    <div style=""text-align: center; margin: 30px 0;"">
                        <a href=""{resetUrl}""
                           style=""background-color: #6366F1; color: white; padding: 12px 30px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;"">
                            Reset Password
                        </a>
                    </div>
                    <p style=""color: #666; font-size: 14px;"">
                        This link expires in <strong>1 hour</strong>.
                    </p>
                    <p style=""color: #666; font-size: 14px;"">
                        If you didn't expect this, please contact your administrator.
                    </p>
                    <hr style=""border: none; border-top: 1px solid #eee; margin: 30px 0;"" />
                    <p style=""color: #999; font-size: 12px;"">
                        QualiFlow<br/>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </body>
            </html>";

        try
        {
            await _emailService.SendEmailAsync(
                new SendEmailRequest
                {
                    ToEmail = user.Email!,
                    ToName = $"{user.FirstName} {user.LastName}".Trim(),
                    Subject = "Password Reset - QualiFlow",
                    HtmlBody = emailBody,
                    FromEmail = _configuration["Email:FromAddress"] ?? "noreply@qualiflow.ai",
                },
                cancellationToken);

            _logger.LogInformation(
                "Password reset email sent to user {UserId} ({Email})",
                userId,
                user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send password reset email to user {UserId} ({Email})",
                userId,
                user.Email);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task SuspendUserAsync(
        Guid userId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to suspend user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        _logger.LogInformation("Admin suspended user {UserId} for reason: {Reason}", userId, reason);
    }

    /// <inheritdoc/>
    public async Task ReactivateUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to reactivate user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        _logger.LogInformation("Admin reactivated user {UserId}", userId);
    }

    private static IQueryable<ApplicationUser> ApplySorting(
        IQueryable<ApplicationUser> queryable,
        string? sortBy,
        string? sortDirection)
    {
        var isDescending = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? false;

        return sortBy?.ToLowerInvariant() switch
        {
            "email" => isDescending ? queryable.OrderByDescending(u => u.Email) : queryable.OrderBy(u => u.Email),
            "name" => isDescending ? queryable.OrderByDescending(u => u.FirstName) : queryable.OrderBy(u => u.FirstName),
            "createdat" => isDescending ? queryable.OrderByDescending(u => u.CreatedAt) : queryable.OrderBy(u => u.CreatedAt),
            _ => queryable.OrderByDescending(u => u.CreatedAt),
        };
    }
}

