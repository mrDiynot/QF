using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for generating and validating JWT tokens.
/// Implements token generation, refresh token management, and validation logic.
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly QualiFlowDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    /// <summary>
    /// Initializes a new instance of the <see cref="JwtTokenService"/> class.
    /// </summary>
    /// <param name="configuration">Application configuration.</param>
    /// <param name="context">Database context.</param>
    /// <param name="userManager">User manager for role retrieval.</param>
    public JwtTokenService(
        IConfiguration configuration,
        QualiFlowDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _configuration = configuration;
        _context = context;
        _userManager = userManager;
    }

    /// <inheritdoc />
    public async Task<string> GenerateAccessTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new("user_id", user.Id.ToString()),
            new("business_id", user.BusinessId.ToString()),
            new("businessId", user.BusinessId.ToString()), // Keep for backward compatibility
        };

        // Add role claim (Sprint 17 - RBAC implementation)
        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault() ?? ApplicationRole.Viewer;
        claims.Add(new Claim(ClaimTypes.Role, userRole));

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), // 15 minutes
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <inheritdoc />
    public async Task<RefreshToken> GenerateRefreshTokenAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = GenerateRefreshTokenString(),
            ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 days
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.UtcNow,
        };

        await _context.Set<RefreshToken>().AddAsync(refreshToken, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return refreshToken;
    }

    /// <inheritdoc />
    public async Task<RefreshToken?> ValidateRefreshTokenAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var refreshToken = await _context.Set<RefreshToken>()
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            return null;
        }

        return refreshToken;
    }

    /// <inheritdoc />
    public async Task RevokeRefreshTokenAsync(
        string token,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var refreshToken = await _context.Set<RefreshToken>()
            .FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);

        if (refreshToken == null)
        {
            return;
        }

        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;

        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Generate a cryptographically secure random refresh token string.
    /// Uses 64 bytes of random data encoded as Base64.
    /// </summary>
    /// <returns>A secure random token string.</returns>
    private static string GenerateRefreshTokenString()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}

