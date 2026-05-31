namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO representing Twilio configuration status.
/// </summary>
public record TwilioStatusDto
{
    /// <summary>
    /// Gets a value indicating whether Twilio is running in test mode.
    /// </summary>
    public bool IsTestMode { get; init; }

    /// <summary>
    /// Gets the test phone number when in test mode.
    /// </summary>
    public string? TestPhoneNumber { get; init; }

    /// <summary>
    /// Gets a value indicating whether provisioning is skipped in development mode.
    /// When true, all businesses share a single development phone number.
    /// </summary>
    public bool IsDevelopmentMode { get; init; }

    /// <summary>
    /// Gets a value indicating whether provisioning will be skipped.
    /// True when in development mode AND skip provisioning is enabled.
    /// </summary>
    public bool SkipProvisioning { get; init; }

    /// <summary>
    /// Gets the shared development phone number when skip provisioning is enabled.
    /// </summary>
    public string? DevelopmentPhoneNumber { get; init; }
}
