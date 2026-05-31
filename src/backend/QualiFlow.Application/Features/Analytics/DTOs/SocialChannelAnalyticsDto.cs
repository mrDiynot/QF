namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Analytics data specific to social media channels (Instagram, Facebook, WhatsApp).
/// Extends standard channel metrics with social-specific engagement data.
/// </summary>
public record SocialChannelAnalyticsDto
{
    /// <summary>Gets the channel ID.</summary>
    public Guid ChannelId { get; init; }

    /// <summary>Gets the channel type (Instagram, Facebook, WhatsApp).</summary>
    public string ChannelType { get; init; } = string.Empty;

    /// <summary>Gets the connected page/account name.</summary>
    public string PageName { get; init; } = string.Empty;

    /// <summary>Gets the date range for these analytics.</summary>
    public DateRange Period { get; init; } = null!;

    /// <summary>Gets the core messaging metrics.</summary>
    public SocialMessagingMetrics Messaging { get; init; } = new();

    /// <summary>Gets the engagement metrics.</summary>
    public SocialEngagementMetrics Engagement { get; init; } = new();

    /// <summary>Gets the AI performance metrics for this channel.</summary>
    public SocialAIMetrics AIPerformance { get; init; } = new();

    /// <summary>Gets the response window compliance metrics.</summary>
    public ResponseWindowMetrics ResponseWindow { get; init; } = new();

    /// <summary>Gets the lead conversion metrics.</summary>
    public SocialConversionMetrics Conversion { get; init; } = new();

    /// <summary>Gets the trend data compared to previous period.</summary>
    public SocialTrends Trends { get; init; } = new();
}

/// <summary>
/// Messaging metrics for social channels.
/// </summary>
public record SocialMessagingMetrics
{
    /// <summary>Gets the total inbound messages received.</summary>
    public int InboundMessages { get; init; }

    /// <summary>Gets the total outbound messages sent.</summary>
    public int OutboundMessages { get; init; }

    /// <summary>Gets the total messages (inbound + outbound).</summary>
    public int TotalMessages => InboundMessages + OutboundMessages;

    /// <summary>Gets the number of unique conversations.</summary>
    public int UniqueConversations { get; init; }

    /// <summary>Gets the average messages per conversation.</summary>
    public decimal AvgMessagesPerConversation { get; init; }

    /// <summary>Gets the number of messages delivered successfully.</summary>
    public int DeliveredMessages { get; init; }

    /// <summary>Gets the number of messages read by recipients.</summary>
    public int ReadMessages { get; init; }

    /// <summary>Gets the delivery rate (0-1).</summary>
    public decimal DeliveryRate => OutboundMessages > 0
        ? (decimal)DeliveredMessages / OutboundMessages
        : 0m;

    /// <summary>Gets the read rate (0-1).</summary>
    public decimal ReadRate => DeliveredMessages > 0
        ? (decimal)ReadMessages / DeliveredMessages
        : 0m;
}

/// <summary>
/// Engagement metrics specific to social channels.
/// </summary>
public record SocialEngagementMetrics
{
    /// <summary>Gets the number of new conversations initiated by leads.</summary>
    public int NewConversationsInitiated { get; init; }

    /// <summary>Gets the number of conversations with lead responses.</summary>
    public int ConversationsWithResponses { get; init; }

    /// <summary>Gets the response rate from leads (0-1).</summary>
    public decimal LeadResponseRate => NewConversationsInitiated > 0
        ? (decimal)ConversationsWithResponses / NewConversationsInitiated
        : 0m;

    /// <summary>Gets the average conversation duration in minutes.</summary>
    public int AvgConversationDurationMinutes { get; init; }

    /// <summary>Gets the number of quick reply button clicks.</summary>
    public int QuickReplyClicks { get; init; }

    /// <summary>Gets the quick reply engagement rate (0-1).</summary>
    public decimal QuickReplyEngagementRate { get; init; }

    /// <summary>Gets the number of conversations with positive sentiment.</summary>
    public int PositiveSentimentConversations { get; init; }

    /// <summary>Gets the number of conversations with negative sentiment.</summary>
    public int NegativeSentimentConversations { get; init; }

    /// <summary>Gets the overall sentiment score (-1 to 1).</summary>
    public decimal OverallSentimentScore { get; init; }
}

/// <summary>
/// AI performance metrics for social channels.
/// </summary>
public record SocialAIMetrics
{
    /// <summary>Gets the number of AI-generated responses.</summary>
    public int AIResponses { get; init; }

    /// <summary>Gets the number of human agent responses.</summary>
    public int HumanResponses { get; init; }

    /// <summary>Gets the AI coverage rate (0-1).</summary>
    public decimal AICoverageRate => (AIResponses + HumanResponses) > 0
        ? (decimal)AIResponses / (AIResponses + HumanResponses)
        : 0m;

    /// <summary>Gets the number of AI-to-human handoffs.</summary>
    public int HandoffCount { get; init; }

    /// <summary>Gets the handoff rate (0-1).</summary>
    public decimal HandoffRate { get; init; }

    /// <summary>Gets the average AI response time in seconds.</summary>
    public int AvgAIResponseTimeSeconds { get; init; }

    /// <summary>Gets the number of successful AI qualifications.</summary>
    public int SuccessfulQualifications { get; init; }

    /// <summary>Gets the AI qualification rate (0-1).</summary>
    public decimal QualificationRate { get; init; }
}

/// <summary>
/// Response window compliance metrics (Meta 24-hour policy).
/// </summary>
public record ResponseWindowMetrics
{
    /// <summary>Gets the number of messages responded within 24 hours.</summary>
    public int WithinWindowResponses { get; init; }

    /// <summary>Gets the number of messages that exceeded 24-hour window.</summary>
    public int OutsideWindowResponses { get; init; }

    /// <summary>Gets the compliance rate (0-1).</summary>
    public decimal ComplianceRate => (WithinWindowResponses + OutsideWindowResponses) > 0
        ? (decimal)WithinWindowResponses / (WithinWindowResponses + OutsideWindowResponses)
        : 1m;

    /// <summary>Gets the average response time in minutes.</summary>
    public int AvgResponseTimeMinutes { get; init; }

    /// <summary>Gets the number of conversations at risk of expiring.</summary>
    public int ConversationsAtRisk { get; init; }
}

/// <summary>
/// Conversion metrics for social channels.
/// </summary>
public record SocialConversionMetrics
{
    /// <summary>Gets the total leads captured from this channel.</summary>
    public int TotalLeads { get; init; }

    /// <summary>Gets the number of qualified leads.</summary>
    public int QualifiedLeads { get; init; }

    /// <summary>Gets the number of converted leads.</summary>
    public int ConvertedLeads { get; init; }

    /// <summary>Gets the qualification rate (0-1).</summary>
    public decimal QualificationRate => TotalLeads > 0
        ? (decimal)QualifiedLeads / TotalLeads
        : 0m;

    /// <summary>Gets the conversion rate (0-1).</summary>
    public decimal ConversionRate => TotalLeads > 0
        ? (decimal)ConvertedLeads / TotalLeads
        : 0m;

    /// <summary>Gets the number of bookings made from this channel.</summary>
    public int BookingsMade { get; init; }

    /// <summary>Gets the booking rate (0-1).</summary>
    public decimal BookingRate => QualifiedLeads > 0
        ? (decimal)BookingsMade / QualifiedLeads
        : 0m;

    /// <summary>Gets the average lead score for this channel.</summary>
    public decimal AvgLeadScore { get; init; }
}

/// <summary>
/// Trend data comparing current period to previous period.
/// </summary>
public record SocialTrends
{
    /// <summary>Gets the percentage change in total messages.</summary>
    public decimal MessagesChange { get; init; }

    /// <summary>Gets the percentage change in new conversations.</summary>
    public decimal ConversationsChange { get; init; }

    /// <summary>Gets the percentage change in leads captured.</summary>
    public decimal LeadsChange { get; init; }

    /// <summary>Gets the percentage change in conversion rate.</summary>
    public decimal ConversionRateChange { get; init; }

    /// <summary>Gets the percentage change in response time.</summary>
    public decimal ResponseTimeChange { get; init; }

    /// <summary>Gets the percentage change in AI coverage.</summary>
    public decimal AICoverageChange { get; init; }

    /// <summary>Gets the percentage change in sentiment score.</summary>
    public decimal SentimentChange { get; init; }
}

/// <summary>
/// Summary analytics across all social channels.
/// </summary>
public record SocialChannelsSummaryDto
{
    /// <summary>Gets the date range for these analytics.</summary>
    public DateRange Period { get; init; } = null!;

    /// <summary>Gets the total connected social channels.</summary>
    public int TotalChannels { get; init; }

    /// <summary>Gets the number of active social channels.</summary>
    public int ActiveChannels { get; init; }

    /// <summary>Gets the aggregated messaging metrics.</summary>
    public SocialMessagingMetrics TotalMessaging { get; init; } = new();

    /// <summary>Gets the aggregated conversion metrics.</summary>
    public SocialConversionMetrics TotalConversion { get; init; } = new();

    /// <summary>Gets the overall AI coverage rate across all social channels.</summary>
    public decimal OverallAICoverage { get; init; }

    /// <summary>Gets the overall response window compliance rate.</summary>
    public decimal OverallComplianceRate { get; init; }

    /// <summary>Gets analytics for each individual social channel.</summary>
    public IReadOnlyList<SocialChannelAnalyticsDto> ChannelBreakdown { get; init; } = [];
}

