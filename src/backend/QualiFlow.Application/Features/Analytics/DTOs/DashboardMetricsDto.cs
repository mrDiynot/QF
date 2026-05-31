using System.Text.Json.Serialization;

namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Dashboard metrics for business intelligence.
/// </summary>
public record DashboardMetricsDto
{
    /// <summary>
    /// Gets the total number of leads in the period.
    /// </summary>
    public int TotalLeads { get; init; }

    /// <summary>
    /// Gets the number of qualified leads in the period.
    /// </summary>
    public int QualifiedLeads { get; init; }

    /// <summary>
    /// Gets the total number of conversations in the period.
    /// </summary>
    public int TotalConversations { get; init; }

    /// <summary>
    /// Gets the average response time from lead creation to first agent response.
    /// Serialized as total seconds for frontend consumption.
    /// </summary>
    [JsonIgnore]
    public TimeSpan AverageResponseTimeSpan { get; init; }

    /// <summary>
    /// Gets the average response time in seconds (for JSON serialization).
    /// </summary>
    public double AverageResponseTime => AverageResponseTimeSpan.TotalSeconds;

    /// <summary>
    /// Gets the conversion rate from leads to qualified leads (percentage).
    /// </summary>
    public decimal ConversionRate { get; init; }

    /// <summary>
    /// Gets the date range for these metrics.
    /// </summary>
    public DateRange Period { get; init; } = null!;

    /// <summary>
    /// Gets the total number of messages sent/received in the period.
    /// </summary>
    public int TotalMessages { get; init; }

    /// <summary>
    /// Gets the number of active channels.
    /// </summary>
    public int ActiveChannels { get; init; }

    /// <summary>
    /// Gets the number of AI-handled conversations in the period.
    /// Computed as conversations where no human agent has been assigned (AssignedToUserId is null).
    /// </summary>
    public int AiConversations { get; init; }

    /// <summary>
    /// Gets the number of appointments/bookings created in the period.
    /// </summary>
    public int AppointmentsBooked { get; init; }

    /// <summary>
    /// Gets the number of proposals sent (SentAt is not null) in the period.
    /// </summary>
    public int ProposalsSent { get; init; }

    /// <summary>
    /// Gets the number of proposals accepted (AcceptedAt is not null) in the period.
    /// </summary>
    public int ProposalsAccepted { get; init; }

    /// <summary>
    /// Gets the number of survey responses (reviews) collected in the period.
    /// </summary>
    public int ReviewsCollected { get; init; }

    /// <summary>
    /// Gets the number of missed inbound voice calls that were subsequently recovered
    /// (a follow-up outbound conversation was created).
    /// </summary>
    public int MissedCallsRecovered { get; init; }

    /// <summary>
    /// Gets the number of outbound SMS messages sent in the period.
    /// </summary>
    public int SmsSent { get; init; }

    /// <summary>
    /// Gets the number of outbound emails sent in the period.
    /// </summary>
    public int EmailsSent { get; init; }

    /// <summary>
    /// Gets the number of social chat conversations (Facebook, Instagram, WhatsApp) in the period.
    /// </summary>
    public int SocialChats { get; init; }
}
