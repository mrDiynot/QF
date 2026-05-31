namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO representing a channel selected during onboarding that hasn't been activated yet.
/// </summary>
public record PendingChannelDto
{
    /// <summary>
    /// Gets the channel type identifier from onboarding selection.
    /// Example: "sms", "phone", "email", "web_chat", "web_forms", "social".
    /// </summary>
    public required string ChannelType { get; init; }

    /// <summary>
    /// Gets the display name for the channel.
    /// </summary>
    public required string DisplayName { get; init; }

    /// <summary>
    /// Gets a description of the channel.
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Gets the icon name for the channel (for frontend display).
    /// </summary>
    public required string IconName { get; init; }

    /// <summary>
    /// Gets a value indicating whether this channel requires phone number provisioning.
    /// </summary>
    public bool RequiresPhoneNumber { get; init; }

    /// <summary>
    /// Gets a value indicating whether this channel requires external OAuth connection.
    /// </summary>
    public bool RequiresOAuthConnection { get; init; }

    /// <summary>
    /// Gets the minimum subscription tier required for this channel.
    /// </summary>
    public required string MinimumPlan { get; init; }

    /// <summary>
    /// Gets a value indicating whether the user's current plan supports this channel.
    /// </summary>
    public bool IsAvailableOnCurrentPlan { get; init; }

    /// <summary>
    /// Gets a value indicating whether this channel has already been activated.
    /// </summary>
    public bool IsActivated { get; init; }
}

