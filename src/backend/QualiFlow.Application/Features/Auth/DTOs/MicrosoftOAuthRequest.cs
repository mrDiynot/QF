namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for initiating Microsoft OAuth authentication.
/// </summary>
public class MicrosoftOAuthRequest
{
    /// <summary>
    /// Gets or sets the URL to redirect to after authentication.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Used for JSON serialization")]
    public string? ReturnUrl { get; set; }

    /// <summary>
    /// Gets or sets the optional business ID for account linking.
    /// </summary>
    public Guid? BusinessId { get; set; }
}

