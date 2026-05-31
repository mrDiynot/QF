namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for refreshing access tokens using a refresh token.
/// </summary>
public class RefreshTokenRequest
{
    /// <summary>
    /// Gets or sets the refresh token.
    /// Used to obtain a new access token without re-authenticating.
    /// </summary>
    /// <example>a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6.</example>
    public required string RefreshToken { get; set; }
}

