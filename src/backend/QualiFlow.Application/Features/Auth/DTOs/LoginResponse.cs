using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for successful user login.
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Gets or sets the user information.
    /// </summary>
    public required UserDto User { get; set; }

    /// <summary>
    /// Gets or sets the JWT access token.
    /// Valid for 15 minutes.
    /// </summary>
    /// <example>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....</example>
    public required string AccessToken { get; set; }

    /// <summary>
    /// Gets or sets the refresh token.
    /// Valid for 7 days. Used to obtain new access tokens.
    /// </summary>
    /// <example>a1b2c3d4e5f6g7h8i9j0....</example>
    public required string RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets the access token expiration time (UTC).
    /// </summary>
    /// <example>2025-12-03T18:00:00Z.</example>
    public required DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the token type.
    /// Always "Bearer" for JWT tokens.
    /// </summary>
    /// <example>Bearer.</example>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Gets or sets a value indicating whether this is a newly registered user.
    /// True for OAuth sign-ups (first time), false for existing user logins.
    /// Used by frontend to determine if payment/onboarding flow is needed.
    /// </summary>
    /// <example>true.</example>
    public bool IsNewUser { get; set; }

    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    /// <example>123e4567-e89b-12d3-a456-426614174000.</example>
    [Obsolete("Use User.Id instead. This property is kept for backward compatibility.")]
    [SuppressMessage("CodeQuality", "S1133:Deprecated code should be removed", Justification = "Kept for backward compatibility with existing API clients. Will be removed in v2.0.")]
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    [Obsolete("Use User.Email instead. This property is kept for backward compatibility.")]
    [SuppressMessage("CodeQuality", "S1133:Deprecated code should be removed", Justification = "Kept for backward compatibility with existing API clients. Will be removed in v2.0.")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    /// <example>John Doe.</example>
    [Obsolete("Use User.FirstName and User.LastName instead. This property is kept for backward compatibility.")]
    [SuppressMessage("CodeQuality", "S1133:Deprecated code should be removed", Justification = "Kept for backward compatibility with existing API clients. Will be removed in v2.0.")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the business (tenant) ID the user belongs to.
    /// </summary>
    /// <example>456e7890-e89b-12d3-a456-426614174111.</example>
    [Obsolete("Use User.BusinessId instead. This property is kept for backward compatibility.")]
    [SuppressMessage("CodeQuality", "S1133:Deprecated code should be removed", Justification = "Kept for backward compatibility with existing API clients. Will be removed in v2.0.")]
    public Guid BusinessId { get; set; }
}

