namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Represents conversion funnel metrics by channel.
/// </summary>
public record ConversionFunnelByChannelDto
{
    /// <summary>
    /// Gets the channel name.
    /// </summary>
    public required string Channel { get; init; }

    /// <summary>
    /// Gets the total leads captured.
    /// </summary>
    public required int TotalLeads { get; init; }

    /// <summary>
    /// Gets the number of leads with conversations.
    /// </summary>
    public required int LeadsWithConversation { get; init; }

    /// <summary>
    /// Gets the number of qualified leads.
    /// </summary>
    public required int QualifiedLeads { get; init; }

    /// <summary>
    /// Gets the number of leads with bookings.
    /// </summary>
    public required int LeadsWithBooking { get; init; }

    /// <summary>
    /// Gets the number of converted leads.
    /// </summary>
    public required int ConvertedLeads { get; init; }

    /// <summary>
    /// Gets the conversation rate (percentage).
    /// </summary>
    public required decimal ConversationRate { get; init; }

    /// <summary>
    /// Gets the qualification rate (percentage).
    /// </summary>
    public required decimal QualificationRate { get; init; }

    /// <summary>
    /// Gets the booking rate (percentage).
    /// </summary>
    public required decimal BookingRate { get; init; }

    /// <summary>
    /// Gets the conversion rate (percentage).
    /// </summary>
    public required decimal ConversionRate { get; init; }
}

