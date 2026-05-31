namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Conversion funnel metrics showing lead progression through stages.
/// </summary>
public record ConversionFunnelDto
{
    /// <summary>
    /// Gets the number of leads that entered the funnel.
    /// </summary>
    public int TotalLeads { get; init; }

    /// <summary>
    /// Gets the number of leads that started a conversation.
    /// </summary>
    public int LeadsWithConversation { get; init; }

    /// <summary>
    /// Gets the number of leads that were qualified.
    /// </summary>
    public int QualifiedLeads { get; init; }

    /// <summary>
    /// Gets the number of leads that booked an appointment.
    /// </summary>
    public int LeadsWithBooking { get; init; }

    /// <summary>
    /// Gets the number of leads that converted to customers.
    /// </summary>
    public int ConvertedLeads { get; init; }

    /// <summary>
    /// Gets the conversion rate from leads to conversations (percentage).
    /// </summary>
    public decimal LeadToConversationRate { get; init; }

    /// <summary>
    /// Gets the conversion rate from conversations to qualified (percentage).
    /// </summary>
    public decimal ConversationToQualifiedRate { get; init; }

    /// <summary>
    /// Gets the conversion rate from qualified to booked (percentage).
    /// </summary>
    public decimal QualifiedToBookingRate { get; init; }

    /// <summary>
    /// Gets the overall conversion rate from leads to customers (percentage).
    /// </summary>
    public decimal OverallConversionRate { get; init; }

    /// <summary>
    /// Gets the date range for this funnel.
    /// </summary>
    public DateRange Period { get; init; } = null!;
}
