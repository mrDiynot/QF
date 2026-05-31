namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Response DTO for channel activation.
/// </summary>
public record ActivateChannelResponse
{
    /// <summary>
    /// Gets a value indicating whether the activation was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the activated channel details.
    /// </summary>
    public ChannelDto? Channel { get; init; }

    /// <summary>
    /// Gets the provisioned phone number (for SMS/Voice channels).
    /// </summary>
    public string? ProvisionedPhoneNumber { get; init; }

    /// <summary>
    /// Gets any error message if activation failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Gets additional setup instructions or next steps.
    /// </summary>
    public string? NextSteps { get; init; }

    /// <summary>
    /// Gets a value indicating whether OAuth connection is required.
    /// When true, the frontend should redirect to the OAuth flow.
    /// </summary>
    public bool RequiresOAuth { get; init; }

    /// <summary>
    /// Gets the OAuth authorization URL to redirect the user to.
    /// Only set when RequiresOAuth is true.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? OAuthUrl { get; init; }
#pragma warning restore CA1056
}

