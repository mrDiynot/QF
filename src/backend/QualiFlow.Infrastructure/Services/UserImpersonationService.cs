using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using QualiFlow.Application.Features.Admin.UserManagement;
using QualiFlow.Application.Features.Admin.UserManagement.DTOs;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for admin user impersonation functionality.
/// </summary>
public class UserImpersonationService : IUserImpersonationService
{
    private readonly QualiFlowDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserImpersonationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserImpersonationService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="configuration">The configuration.</param>
    /// <param name="logger">The logger.</param>
    public UserImpersonationService(
        QualiFlowDbContext context,
        IConfiguration configuration,
        ILogger<UserImpersonationService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<ImpersonationTokenDto> StartImpersonationAsync(
        Guid adminUserId,
        Guid targetUserId,
        CancellationToken cancellationToken)
    {
        // Get target user with business
        var targetUser = await _context.Users
            .Include(u => u.Business)
            .FirstOrDefaultAsync(u => u.Id == targetUserId, cancellationToken)
            ?? throw new InvalidOperationException($"User {targetUserId} not found");

        _logger.LogWarning(
            "Admin {AdminUserId} started impersonation of user {TargetUserId} in business {BusinessId}",
            adminUserId,
            targetUserId,
            targetUser.BusinessId);

        // Generate impersonation token (1 hour expiry)
        var expiresAt = DateTime.UtcNow.AddHours(1);
        var token = GenerateImpersonationToken(adminUserId, targetUser, expiresAt);

        return new ImpersonationTokenDto
        {
            Token = token,
            ImpersonatedUserId = targetUser.Id,
            ImpersonatedUserEmail = targetUser.Email ?? string.Empty,
            BusinessId = targetUser.BusinessId,
            BusinessName = targetUser.Business.Name,
            ExpiresAt = expiresAt
        };
    }

    /// <inheritdoc/>
    public Task StopImpersonationAsync(
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Admin {AdminUserId} stopped impersonation session",
            adminUserId);

        // No server-side state to clean up (stateless JWT)
        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public async Task<bool> ValidateImpersonationTokenAsync(
        string token,
        CancellationToken cancellationToken)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]
                ?? throw new InvalidOperationException("JWT secret not configured"));

            var result = await tokenHandler.ValidateTokenAsync(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            });

            if (!result.IsValid)
            {
                return false;
            }

            // Check if token has impersonation claims
            var jwtToken = (JwtSecurityToken)result.SecurityToken;
            var hasImpersonationClaim = jwtToken.Claims.Any(c => c.Type == "impersonated_user_id");

            return hasImpersonationClaim;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Invalid impersonation token");
            return false;
        }
    }

    private string GenerateImpersonationToken(Guid adminUserId, Domain.Entities.ApplicationUser targetUser, DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, targetUser.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, targetUser.Email ?? string.Empty),
            new("user_id", targetUser.Id.ToString()),
            new("business_id", targetUser.BusinessId.ToString()),
            new("impersonated_user_id", targetUser.Id.ToString()),
            new("impersonator_admin_id", adminUserId.ToString()),
            new("impersonation_expires_at", expiresAt.ToString("O")),
            new("is_impersonation", "true")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

