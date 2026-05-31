using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service for generating and validating JWT tokens.
/// Handles access token generation, refresh token management, and token validation.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generate an access token for the given user.
    /// Access tokens are short-lived (15 minutes) and contain user claims.
    /// </summary>
    /// <param name="user">The user to generate the token for.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The JWT access token string.</returns>
    Task<string> GenerateAccessTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generate a refresh token for the given user.
    /// Refresh tokens are long-lived (7 days) and stored in the database.
    /// </summary>
    /// <param name="userId">The user ID to generate the refresh token for.</param>
    /// <param name="ipAddress">The IP address creating the token (for audit trail).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The refresh token entity.</returns>
    Task<RefreshToken> GenerateRefreshTokenAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate a refresh token.
    /// Checks if the token exists, is not expired, and is not revoked.
    /// </summary>
    /// <param name="token">The refresh token to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The refresh token entity if valid, null otherwise.</returns>
    Task<RefreshToken?> ValidateRefreshTokenAsync(
        string token,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Revoke a refresh token.
    /// Marks the token as revoked and records the IP address for audit trail.
    /// </summary>
    /// <param name="token">The refresh token to revoke.</param>
    /// <param name="ipAddress">The IP address revoking the token (for audit trail).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RevokeRefreshTokenAsync(
        string token,
        string? ipAddress,
        CancellationToken cancellationToken = default);
}

