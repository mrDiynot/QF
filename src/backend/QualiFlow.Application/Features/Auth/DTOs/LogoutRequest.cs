namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for user logout.
/// Revokes the refresh token to prevent further token refresh operations.
/// </summary>
public class LogoutRequest
{
    /// <summary>
    /// Gets or sets the refresh token to revoke.
    /// After logout, this token cannot be used to obtain new access tokens.
    /// </summary>
    /// <example>a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6.</example>
    public required string RefreshToken { get; set; }
}

