using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for successful user registration.
/// Includes JWT tokens and user/business information.
/// </summary>
public class RegisterResponse
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
    /// Gets or sets the access token expiration time in UTC.
    /// </summary>
    /// <example>2025-12-03T18:00:00Z.</example>
    public required DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the token type.
    /// </summary>
    /// <example>Bearer.</example>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Gets or sets the newly created user's unique identifier.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
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
    /// Gets or sets the newly created business's unique identifier.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    [Obsolete("Use User.BusinessId instead. This property is kept for backward compatibility.")]
    [SuppressMessage("CodeQuality", "S1133:Deprecated code should be removed", Justification = "Kept for backward compatibility with existing API clients. Will be removed in v2.0.")]
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    /// <example>Acme Corporation.</example>
    public required string BusinessName { get; set; }
}

