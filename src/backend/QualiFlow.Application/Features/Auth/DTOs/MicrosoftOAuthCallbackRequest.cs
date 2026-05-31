namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for handling Microsoft OAuth callback.
/// </summary>
public class MicrosoftOAuthCallbackRequest
{
    /// <summary>
    /// Gets or sets the authorization code from Microsoft.
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the state parameter for CSRF protection.
    /// </summary>
    public string? State { get; set; }

    /// <summary>
    /// Gets or sets the error code if authentication failed.
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// Gets or sets the error description if authentication failed.
    /// </summary>
    public string? ErrorDescription { get; set; }
}

