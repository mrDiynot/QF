namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for user login.
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the user's password.
    /// </summary>
    /// <example>SecureP@ssw0rd!.</example>
    public required string Password { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to remember the user.
    /// When true, skips email OTP verification and issues a refresh token.
    /// When false or not provided, requires email OTP verification.
    /// </summary>
    /// <example>true.</example>
    public bool RememberMe { get; set; }
}

