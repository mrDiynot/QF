namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO for Twilio connectivity verification result.
/// </summary>
public record TwilioVerificationResultDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the verification was successful.
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Gets or sets the verification status.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the verification message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets when the verification was performed.
    /// </summary>
    public DateTime VerifiedAt { get; set; }

    /// <summary>
    /// Gets additional verification details.
    /// </summary>
    public IReadOnlyDictionary<string, string> Details { get; init; } = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
}
