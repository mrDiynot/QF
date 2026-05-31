using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Analytics.DTOs;
using QualiFlow.Application.Features.Analytics.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for calculating analytics and business intelligence metrics.
/// </summary>
public sealed partial class AnalyticsService(
    QualiFlowDbContext dbContext,
    ILogger<AnalyticsService> logger) : IAnalyticsService
{
    // Public interface methods

    /// <inheritdoc/>
    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingDashboardMetrics(logger, businessId, dateRange.Start, dateRange.End);

        var totalLeads = await CountLeadsAsync(businessId, dateRange, cancellationToken);
        var qualifiedLeads = await CountQualifiedLeadsAsync(businessId, dateRange, cancellationToken);
        var totalConversations = await CountConversationsAsync(businessId, dateRange, cancellationToken);
        var aiConversations = await CountAiConversationsAsync(businessId, dateRange, cancellationToken);
        var totalMessages = await CountMessagesAsync(businessId, dateRange, cancellationToken);
        var averageResponseTime = await CalculateAverageResponseTimeAsync(businessId, dateRange, cancellationToken);
        var activeChannels = await CountActiveChannelsAsync(businessId, cancellationToken);

        // New overview metrics
        var appointmentsBooked = await CountAppointmentsBookedAsync(businessId, dateRange, cancellationToken);
        var proposalsSent = await CountProposalsSentAsync(businessId, dateRange, cancellationToken);
        var proposalsAccepted = await CountProposalsAcceptedAsync(businessId, dateRange, cancellationToken);
        var reviewsCollected = await CountReviewsCollectedAsync(businessId, dateRange, cancellationToken);
        var missedCallsRecovered = await CountMissedCallsRecoveredAsync(businessId, dateRange, cancellationToken);
        var smsSent = await CountSmsSentAsync(businessId, dateRange, cancellationToken);
        var emailsSent = await CountEmailsSentAsync(businessId, dateRange, cancellationToken);
        var socialChats = await CountSocialChatsAsync(businessId, dateRange, cancellationToken);

        var conversionRate = totalLeads > 0
            ? (decimal)qualifiedLeads / totalLeads * 100
            : 0m;

        LogDashboardMetricsCalculated(logger, totalLeads, qualifiedLeads, conversionRate);

        return new DashboardMetricsDto
        {
            TotalLeads = totalLeads,
            QualifiedLeads = qualifiedLeads,
            TotalConversations = totalConversations,
            AiConversations = aiConversations,
            AverageResponseTimeSpan = averageResponseTime,
            ConversionRate = Math.Round(conversionRate, 2),
            Period = dateRange,
            TotalMessages = totalMessages,
            ActiveChannels = activeChannels,
            AppointmentsBooked = appointmentsBooked,
            ProposalsSent = proposalsSent,
            ProposalsAccepted = proposalsAccepted,
            ReviewsCollected = reviewsCollected,
            MissedCallsRecovered = missedCallsRecovered,
            SmsSent = smsSent,
            EmailsSent = emailsSent,
            SocialChats = socialChats
        };
    }

    /// <inheritdoc/>
    public async Task<ConversionFunnelDto> GetConversionFunnelAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingConversionFunnel(logger, businessId, dateRange.Start, dateRange.End);

        var leads = await GetLeadsWithNavigationAsync(businessId, dateRange, cancellationToken);
        var totalLeads = leads.Count;
        var leadsWithConversation = leads.Count(l => l.Conversations.Count > 0);
        var qualifiedLeads = leads.Count(l => l.Status == LeadStatus.Qualified);
        var leadsWithBooking = leads.Count(l => l.Bookings.Count > 0);
        var convertedLeads = leads.Count(l => l.Status == LeadStatus.Converted);

        var metrics = CalculateFunnelRates(totalLeads, leadsWithConversation, qualifiedLeads, convertedLeads);

        LogConversionFunnelCalculated(logger, totalLeads, leadsWithConversation, qualifiedLeads, convertedLeads);

        return new ConversionFunnelDto
        {
            TotalLeads = totalLeads,
            LeadsWithConversation = leadsWithConversation,
            QualifiedLeads = qualifiedLeads,
            LeadsWithBooking = leadsWithBooking,
            ConvertedLeads = convertedLeads,
            LeadToConversationRate = metrics.leadToConversation,
            ConversationToQualifiedRate = metrics.conversationToQualified,
            QualifiedToBookingRate = metrics.qualifiedToBooking,
            OverallConversionRate = metrics.overall,
            Period = dateRange
        };
    }

    /// <inheritdoc/>
    public async Task<ChannelPerformanceDto[]> GetChannelPerformanceAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingChannelPerformance(logger, businessId, dateRange.Start, dateRange.End);

        var channels = await GetActiveChannelsAsync(businessId, cancellationToken);
        var channelPerformance = new List<ChannelPerformanceDto>();

        foreach (var channel in channels)
        {
            var performance = await CalculateChannelMetricsAsync(
                businessId,
                channel.Id,
                channel.Type,
                channel.Name,
                dateRange,
                cancellationToken);

            channelPerformance.Add(performance);
        }

        LogChannelPerformanceCalculated(logger, channelPerformance.Count);

        return [.. channelPerformance];
    }

    /// <inheritdoc/>
    public Task<decimal> CalculateROIAsync(
        Guid businessId,
        Guid? campaignId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingROI(logger, businessId, campaignId, dateRange.Start, dateRange.End);

        // Note: ROI calculation requires campaign and revenue tracking features which are not yet available
        LogROINotImplemented(logger);

        return Task.FromResult(0m);
    }

    // Private static helper methods

    private static (decimal leadToConversation, decimal conversationToQualified, decimal qualifiedToBooking, decimal overall)
        CalculateFunnelRates(int totalLeads, int leadsWithConversation, int qualifiedLeads, int convertedLeads)
    {
        var leadToConversation = totalLeads > 0
            ? Math.Round((decimal)leadsWithConversation / totalLeads * 100, 2)
            : 0m;

        var conversationToQualified = leadsWithConversation > 0
            ? Math.Round((decimal)qualifiedLeads / leadsWithConversation * 100, 2)
            : 0m;

        var qualifiedToBooking = qualifiedLeads > 0
            ? Math.Round((decimal)qualifiedLeads / qualifiedLeads * 100, 2)
            : 0m;

        var overall = totalLeads > 0
            ? Math.Round((decimal)convertedLeads / totalLeads * 100, 2)
            : 0m;

        return (leadToConversation, conversationToQualified, qualifiedToBooking, overall);
    }

    [LoggerMessage(EventId = 1, Level = LogLevel.Information,
        Message = "Calculating dashboard metrics for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingDashboardMetrics(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information,
        Message = "Dashboard metrics calculated: {TotalLeads} leads, {QualifiedLeads} qualified, {ConversionRate}% conversion rate")]
    private static partial void LogDashboardMetricsCalculated(ILogger logger, int totalLeads, int qualifiedLeads, decimal conversionRate);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information,
        Message = "Calculating conversion funnel for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingConversionFunnel(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information,
        Message = "Conversion funnel calculated: {TotalLeads} → {LeadsWithConversation} → {QualifiedLeads} → {ConvertedLeads}")]
    private static partial void LogConversionFunnelCalculated(ILogger logger, int totalLeads, int leadsWithConversation, int qualifiedLeads, int convertedLeads);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information,
        Message = "Calculating channel performance for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingChannelPerformance(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 6, Level = LogLevel.Information,
        Message = "Channel performance calculated for {ChannelCount} channels")]
    private static partial void LogChannelPerformanceCalculated(ILogger logger, int channelCount);

    [LoggerMessage(EventId = 7, Level = LogLevel.Information,
        Message = "Calculating ROI for business {BusinessId}, campaign {CampaignId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingROI(ILogger logger, Guid businessId, Guid? campaignId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 8, Level = LogLevel.Warning,
        Message = "ROI calculation not yet implemented - campaigns feature pending")]
    private static partial void LogROINotImplemented(ILogger logger);

    [LoggerMessage(EventId = 9, Level = LogLevel.Information,
        Message = "Calculating lead source attribution for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingLeadSourceAttribution(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 10, Level = LogLevel.Information,
        Message = "Lead source attribution calculated for {SourceCount} sources")]
    private static partial void LogLeadSourceAttributionCalculated(ILogger logger, int sourceCount);

    [LoggerMessage(EventId = 11, Level = LogLevel.Information,
        Message = "Calculating conversion funnel by channel for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingConversionFunnelByChannel(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 12, Level = LogLevel.Information,
        Message = "Conversion funnel by channel calculated for {ChannelCount} channels")]
    private static partial void LogConversionFunnelByChannelCalculated(ILogger logger, int channelCount);

    [LoggerMessage(EventId = 13, Level = LogLevel.Information,
        Message = "Calculating time-to-conversion metrics for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingTimeToConversion(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 14, Level = LogLevel.Information,
        Message = "Time-to-conversion calculated: {TotalConversions} conversions, average time {AverageTime}")]
    private static partial void LogTimeToConversionCalculated(ILogger logger, int totalConversions, TimeSpan averageTime);

    [LoggerMessage(EventId = 15, Level = LogLevel.Information,
        Message = "Calculating agent performance for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingAgentPerformance(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(EventId = 16, Level = LogLevel.Information,
        Message = "Agent performance calculated for {AgentCount} agents")]
    private static partial void LogAgentPerformanceCalculated(ILogger logger, int agentCount);

    [LoggerMessage(EventId = 17, Level = LogLevel.Information,
        Message = "Calculating revenue forecast for business {BusinessId} for period {ForecastPeriod}")]
    private static partial void LogCalculatingRevenueForecast(ILogger logger, Guid businessId, string forecastPeriod);

    [LoggerMessage(EventId = 18, Level = LogLevel.Information,
        Message = "Revenue forecast calculated: {TotalDeals} deals, expected revenue {ExpectedRevenue}")]
    private static partial void LogRevenueForecastCalculated(ILogger logger, int totalDeals, decimal expectedRevenue);

    // Private helper methods

    private Task<int> CountLeadsAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountQualifiedLeadsAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End
                && l.Status == LeadStatus.Qualified)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountConversationsAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Conversations
            .Where(c => c.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    /// <summary>
    /// Counts AI-handled conversations: conversations not yet assigned to a human agent.
    /// When a human agent takes over, AssignedToUserId is set, so null means AI is handling it.
    /// </summary>
    private Task<int> CountAiConversationsAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Conversations
            .Where(c => c.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && c.AssignedToUserId == null)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountMessagesAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Messages
            .Where(m => m.Conversation!.BusinessId == businessId
                && m.SentAt >= dateRange.Start
                && m.SentAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private async Task<TimeSpan> CalculateAverageResponseTimeAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        var responseTimeData = await dbContext.Conversations
            .Where(c => c.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && c.Messages.Any(m => m.Direction == MessageDirection.Outbound))
            .Select(c => new
            {
                ConversationStart = c.StartedAt,
                FirstAgentResponse = c.Messages
                    .Where(m => m.Direction == MessageDirection.Outbound)
                    .Min(m => m.SentAt)
            })
            .ToListAsync(cancellationToken);

        if (responseTimeData.Count == 0)
        {
            return TimeSpan.Zero;
        }

        var averageTicks = responseTimeData
            .Where(x => x.FirstAgentResponse > x.ConversationStart)
            .Select(x => (x.FirstAgentResponse - x.ConversationStart).Ticks)
            .DefaultIfEmpty(0)
            .Average();

        return TimeSpan.FromTicks((long)averageTicks);
    }

    private Task<int> CountActiveChannelsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return dbContext.Channels
            .Where(c => c.BusinessId == businessId && c.IsActive)
            .CountAsync(cancellationToken);
    }

    // ── New Overview Metrics ────────────────────────────────────────────────

    private Task<int> CountAppointmentsBookedAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Bookings
            .Where(b => b.BusinessId == businessId
                && b.CreatedAt >= dateRange.Start
                && b.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountProposalsSentAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Proposals
            .Where(p => p.BusinessId == businessId
                && p.SentAt != null
                && p.SentAt >= dateRange.Start
                && p.SentAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountProposalsAcceptedAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Proposals
            .Where(p => p.BusinessId == businessId
                && p.AcceptedAt != null
                && p.AcceptedAt >= dateRange.Start
                && p.AcceptedAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountReviewsCollectedAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.SurveyResponses
            .Where(sr => sr.Survey!.BusinessId == businessId
                && sr.CreatedAt >= dateRange.Start
                && sr.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountMissedCallsRecoveredAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        // Missed calls recovered: inbound voice calls with status "no_answer" that have
        // a follow-up conversation or outbound call within the period
        return dbContext.VoiceCalls
            .Where(vc => vc.BusinessId == businessId
                && vc.Direction == "inbound"
                && vc.Status == "no_answer"
                && vc.CreatedAt >= dateRange.Start
                && vc.CreatedAt < dateRange.End
                && vc.ConversationId != null)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountSmsSentAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Messages
            .Where(m => m.Conversation!.BusinessId == businessId
                && m.Direction == MessageDirection.Outbound
                && m.Conversation!.Channel == "SMS"
                && m.SentAt >= dateRange.Start
                && m.SentAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountEmailsSentAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.EmailLogs
            .Where(e => e.BusinessId == businessId
                && e.CreatedAt >= dateRange.Start
                && e.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountSocialChatsAsync(Guid businessId, DateRange dateRange, CancellationToken cancellationToken)
    {
        return dbContext.Conversations
            .Where(c => c.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && (c.Channel == "Facebook" || c.Channel == "Instagram"
                    || c.Channel == "WhatsApp" || c.Channel == "SocialMessaging"))
            .CountAsync(cancellationToken);
    }

    // ────────────────────────────────────────────────────────────────────────

    private Task<List<Domain.Entities.Lead>> GetLeadsWithNavigationAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        return dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .Include(l => l.Conversations)
            .Include(l => l.Bookings)
            .ToListAsync(cancellationToken);
    }

    private Task<List<Domain.Entities.Channel>> GetActiveChannelsAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        return dbContext.Channels
            .Where(c => c.BusinessId == businessId && c.IsActive)
            .ToListAsync(cancellationToken);
    }

    private async Task<ChannelPerformanceDto> CalculateChannelMetricsAsync(
        Guid businessId,
        Guid channelId,
        ChannelType channelType,
        string channelName,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        var conversations = await GetChannelConversationsAsync(businessId, channelId, dateRange, cancellationToken);
        var totalConversations = conversations.Count;

        // Get leads from conversations (existing logic)
        var conversationLeadIds = conversations.Select(c => c.LeadId).Distinct().ToList();

        // ALSO get leads by SourceChannel field directly (fixes form submissions not being counted)
        // This captures leads created via web forms, QR codes, etc. that don't have conversations
        // Map ChannelType to actual SourceChannel values used when creating leads
        var sourceChannelValues = GetSourceChannelValues(channelType);
        var sourceChannelLeads = await dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && sourceChannelValues.Contains(l.SourceChannel)
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .Select(l => l.Id)
            .ToListAsync(cancellationToken);

        // Combine both sources and deduplicate
        var allLeadIds = conversationLeadIds.Union(sourceChannelLeads).Distinct().ToList();
        var totalLeads = allLeadIds.Count;

        var qualifiedLeads = await CountChannelQualifiedLeadsAsync(businessId, allLeadIds, cancellationToken);
        var totalMessages = await CountChannelMessagesAsync(businessId, channelId, dateRange, cancellationToken);
        var averageResponseTime = await CalculateChannelResponseTimeAsync(businessId, channelId, dateRange, cancellationToken);

        var conversionRate = totalLeads > 0
            ? Math.Round((decimal)qualifiedLeads / totalLeads * 100, 2)
            : 0m;

        return new ChannelPerformanceDto
        {
            ChannelType = channelType,
            ChannelName = channelName,
            TotalConversations = totalConversations,
            TotalLeads = totalLeads,
            TotalMessages = totalMessages,
            AverageResponseTimeSpan = averageResponseTime,
            ConversionRate = conversionRate,
            QualifiedLeads = qualifiedLeads,
            Period = dateRange
        };
    }

    private async Task<ChannelMetrics> CalculateChannelMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        // Get messages for this channel in the date range
        var messages = await dbContext.Messages
            .AsNoTracking()
            .Where(m => m.Conversation.ChannelId == channelId
                && m.Conversation.ChannelEntity!.BusinessId == businessId
                && m.CreatedAt >= dateRange.Start
                && m.CreatedAt < dateRange.End)
            .ToListAsync(cancellationToken);

        // Get conversations for this channel
        var conversations = await dbContext.Conversations
            .AsNoTracking()
            .Where(c => c.ChannelId == channelId
                && c.ChannelEntity!.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End)
            .ToListAsync(cancellationToken);

        // Get active conversations (not closed)
        var activeConversations = await dbContext.Conversations
            .AsNoTracking()
            .CountAsync(
                c => c.ChannelId == channelId
                    && c.ChannelEntity!.BusinessId == businessId
                    && c.Status != ConversationStatus.Closed
                    && c.DeletedAt == null,
                cancellationToken);

        // Calculate metrics
        var totalMessages = messages.Count;
        var totalConversations = conversations.Count;

        // Response rate: percentage of conversations that have at least one message
        var conversationsWithMessages = conversations.Count(c =>
            messages.Exists(m => m.ConversationId == c.Id));
        var responseRate = totalConversations > 0
            ? (decimal)conversationsWithMessages / totalConversations
            : 0m;

        // Average response time: average time from conversation start to first message
        var responseTimes = conversations
            .Select(c =>
            {
                var firstMessage = messages.Find(m => m.ConversationId == c.Id);
                if (firstMessage != null)
                {
                    return (int)(firstMessage.CreatedAt - c.StartedAt).TotalSeconds;
                }

                return 0;
            })
            .Where(t => t > 0)
            .ToList();

        var avgResponseTime = responseTimes.Count > 0
            ? (int)responseTimes.Average()
            : 0;

        // Conversion rate: percentage of conversations that led to qualified leads
        var qualifiedConversations = await dbContext.Conversations
            .AsNoTracking()
            .Where(c => c.ChannelId == channelId
                && c.ChannelEntity!.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && c.Lead != null
                && c.Lead.Status == LeadStatus.Qualified)
            .CountAsync(cancellationToken);

        var conversionRate = totalConversations > 0
            ? (decimal)qualifiedConversations / totalConversations
            : 0m;

        return new ChannelMetrics
        {
            TotalMessages = totalMessages,
            ResponseRate = responseRate,
            AvgResponseTime = avgResponseTime,
            ConversionRate = conversionRate,
            ActiveConversations = activeConversations
        };
    }

    private Task<List<Domain.Entities.Conversation>> GetChannelConversationsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        return dbContext.Conversations
            .Where(c => c.BusinessId == businessId
                && c.ChannelId == channelId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End)
            .Include(c => c.Lead)
            .ToListAsync(cancellationToken);
    }

    private Task<int> CountChannelQualifiedLeadsAsync(
        Guid businessId,
        List<Guid> leadIds,
        CancellationToken cancellationToken)
    {
        return dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && leadIds.Contains(l.Id)
                && l.Status == LeadStatus.Qualified)
            .CountAsync(cancellationToken);
    }

    private Task<int> CountChannelMessagesAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        return dbContext.Messages
            .Where(m => m.Conversation!.BusinessId == businessId
                && m.Conversation.ChannelId == channelId
                && m.SentAt >= dateRange.Start
                && m.SentAt < dateRange.End)
            .CountAsync(cancellationToken);
    }

    private async Task<TimeSpan> CalculateChannelResponseTimeAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken)
    {
        var responseTimeData = await dbContext.Conversations
            .Where(c => c.BusinessId == businessId
                && c.ChannelId == channelId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && c.Messages.Any(m => m.Direction == MessageDirection.Outbound))
            .Select(c => new
            {
                ConversationStart = c.StartedAt,
                FirstAgentResponse = c.Messages
                    .Where(m => m.Direction == MessageDirection.Outbound)
                    .Min(m => m.SentAt)
            })
            .ToListAsync(cancellationToken);

        if (responseTimeData.Count == 0)
        {
            return TimeSpan.Zero;
        }

        var averageTicks = responseTimeData
            .Where(x => x.FirstAgentResponse > x.ConversationStart)
            .Select(x => (x.FirstAgentResponse - x.ConversationStart).Ticks)
            .DefaultIfEmpty(0)
            .Average();

        return TimeSpan.FromTicks((long)averageTicks);
    }

    // ============================================================================
    // Advanced Analytics Methods (Sprint 13)
    // ============================================================================

    /// <inheritdoc/>
    public async Task<LeadSourceAttributionDto[]> GetLeadSourceAttributionAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingLeadSourceAttribution(logger, businessId, dateRange.Start, dateRange.End);

        var leads = await dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .Include(l => l.Conversations)
            .ToListAsync(cancellationToken);

        var deals = await dbContext.Deals
            .Where(d => d.BusinessId == businessId
                && d.CreatedAt >= dateRange.Start
                && d.CreatedAt < dateRange.End
                && d.Stage == DealStage.Won)
            .ToListAsync(cancellationToken);

        var sourceGroups = leads
            .GroupBy(l => l.SourceChannel)
            .Select(g => new LeadSourceAttributionDto
            {
                SourceChannel = g.Key,
                TotalLeads = g.Count(),
                QualifiedLeads = g.Count(l => l.Status == LeadStatus.Qualified),
                ConvertedLeads = g.Count(l => l.Status == LeadStatus.Converted),
                ConversionRate = g.Any()
                    ? Math.Round((decimal)g.Count(l => l.Status == LeadStatus.Converted) / g.Count() * 100, 2)
                    : 0m,
                AverageScore = g.Any() ? Math.Round((decimal)g.Average(l => l.Score), 2) : 0m,
                TotalRevenue = deals
                    .Where(d => g.Select(l => l.Email).Contains(d.Contact.Email))
                    .Sum(d => d.Value),
                CostPerLead = null, // Campaign cost tracking not yet implemented
                ROI = null // Campaign cost tracking not yet implemented
            })
            .OrderByDescending(s => s.TotalLeads)
            .ToArray();

        LogLeadSourceAttributionCalculated(logger, sourceGroups.Length);

        return sourceGroups;
    }

    /// <inheritdoc/>
    public async Task<ConversionFunnelByChannelDto[]> GetConversionFunnelByChannelAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingConversionFunnelByChannel(logger, businessId, dateRange.Start, dateRange.End);

        var leads = await dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .Include(l => l.Conversations)
            .Include(l => l.Bookings)
            .ToListAsync(cancellationToken);

        var channelGroups = leads
            .GroupBy(l => l.SourceChannel)
            .Select(g =>
            {
                var totalLeads = g.Count();
                var leadsWithConversation = g.Count(l => l.Conversations.Count > 0);
                var qualifiedLeads = g.Count(l => l.Status == LeadStatus.Qualified);
                var leadsWithBooking = g.Count(l => l.Bookings.Count > 0);
                var convertedLeads = g.Count(l => l.Status == LeadStatus.Converted);

                return new ConversionFunnelByChannelDto
                {
                    Channel = g.Key,
                    TotalLeads = totalLeads,
                    LeadsWithConversation = leadsWithConversation,
                    QualifiedLeads = qualifiedLeads,
                    LeadsWithBooking = leadsWithBooking,
                    ConvertedLeads = convertedLeads,
                    ConversationRate = totalLeads > 0
                        ? Math.Round((decimal)leadsWithConversation / totalLeads * 100, 2)
                        : 0m,
                    QualificationRate = leadsWithConversation > 0
                        ? Math.Round((decimal)qualifiedLeads / leadsWithConversation * 100, 2)
                        : 0m,
                    BookingRate = qualifiedLeads > 0
                        ? Math.Round((decimal)leadsWithBooking / qualifiedLeads * 100, 2)
                        : 0m,
                    ConversionRate = totalLeads > 0
                        ? Math.Round((decimal)convertedLeads / totalLeads * 100, 2)
                        : 0m
                };
            })
            .OrderByDescending(c => c.TotalLeads)
            .ToArray();

        LogConversionFunnelByChannelCalculated(logger, channelGroups.Length);

        return channelGroups;
    }

    /// <inheritdoc/>
    public async Task<TimeToConversionDto> GetTimeToConversionMetricsAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingTimeToConversion(logger, businessId, dateRange.Start, dateRange.End);

        var convertedLeads = await dbContext.Leads
            .Where(l => l.BusinessId == businessId
                && l.Status == LeadStatus.Converted
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .Include(l => l.Conversations)
            .Include(l => l.Bookings)
            .Include(l => l.Qualifications)
            .ToListAsync(cancellationToken);

        if (convertedLeads.Count == 0)
        {
            return new TimeToConversionDto
            {
                AverageTimeToFirstContact = TimeSpan.Zero,
                AverageTimeToQualification = TimeSpan.Zero,
                AverageTimeToBooking = TimeSpan.Zero,
                AverageTimeToConversion = TimeSpan.Zero,
                MedianTimeToConversion = TimeSpan.Zero,
                FastestConversion = TimeSpan.Zero,
                SlowestConversion = TimeSpan.Zero,
                TotalConversions = 0
            };
        }

        var conversionTimes = convertedLeads
            .Select(l => (l.UpdatedAt ?? l.CreatedAt) - l.CreatedAt)
            .OrderBy(t => t)
            .ToList();

        var firstContactTimes = convertedLeads
            .Where(l => l.Conversations.Count > 0)
            .Select(l => l.Conversations.Min(c => c.StartedAt) - l.CreatedAt)
            .ToList();

        var qualificationTimes = convertedLeads
            .Where(l => l.Qualifications.Count > 0)
            .Select(l => l.Qualifications.Min(q => q.CreatedAt) - l.CreatedAt)
            .ToList();

        var bookingTimes = convertedLeads
            .Where(l => l.Bookings.Count > 0)
            .Select(l => l.Bookings.Min(b => b.CreatedAt) - l.CreatedAt)
            .ToList();

        var result = new TimeToConversionDto
        {
            AverageTimeToFirstContact = firstContactTimes.Count > 0
                ? TimeSpan.FromTicks((long)firstContactTimes.Average(t => t.Ticks))
                : TimeSpan.Zero,
            AverageTimeToQualification = qualificationTimes.Count > 0
                ? TimeSpan.FromTicks((long)qualificationTimes.Average(t => t.Ticks))
                : TimeSpan.Zero,
            AverageTimeToBooking = bookingTimes.Count > 0
                ? TimeSpan.FromTicks((long)bookingTimes.Average(t => t.Ticks))
                : TimeSpan.Zero,
            AverageTimeToConversion = TimeSpan.FromTicks((long)conversionTimes.Average(t => t.Ticks)),
            MedianTimeToConversion = conversionTimes[conversionTimes.Count / 2],
            FastestConversion = conversionTimes[0],
            SlowestConversion = conversionTimes[conversionTimes.Count - 1],
            TotalConversions = convertedLeads.Count
        };

        LogTimeToConversionCalculated(logger, result.TotalConversions, result.AverageTimeToConversion);

        return result;
    }

    /// <inheritdoc/>
    public async Task<AgentPerformanceDto[]> GetAgentPerformanceAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingAgentPerformance(logger, businessId, dateRange.Start, dateRange.End);

        var agents = await dbContext.Users
            .Where(u => u.BusinessId == businessId && u.IsActive)
            .ToListAsync(cancellationToken);

        var agentPerformance = new List<AgentPerformanceDto>();

        foreach (var agent in agents)
        {
            var assignedLeads = await dbContext.Leads
                .Where(l => l.BusinessId == businessId
                    && l.AssignedToUserId == agent.Id
                    && l.AssignedAt >= dateRange.Start
                    && l.AssignedAt < dateRange.End)
                .ToListAsync(cancellationToken);

            var conversations = await dbContext.Conversations
                .Where(c => c.BusinessId == businessId
                    && c.AssignedToUserId == agent.Id
                    && c.AssignedAt >= dateRange.Start
                    && c.AssignedAt < dateRange.End)
                .Include(c => c.Messages)
                .ToListAsync(cancellationToken);

            var deals = await dbContext.Deals
                .Where(d => d.BusinessId == businessId
                    && d.AssignedToUserId == agent.Id
                    && d.Stage == DealStage.Won
                    && d.ActualCloseDate >= dateRange.Start
                    && d.ActualCloseDate < dateRange.End)
                .ToListAsync(cancellationToken);

            var messagesSent = conversations
                .SelectMany(c => c.Messages)
                .Count(m => m.Direction == MessageDirection.Outbound);

            var responseTimes = conversations
                .Where(c => c.Messages.Any(m => m.Direction == MessageDirection.Inbound)
                    && c.Messages.Any(m => m.Direction == MessageDirection.Outbound))
                .Select(c =>
                {
                    var firstInbound = c.Messages
                        .Where(m => m.Direction == MessageDirection.Inbound)
                        .Min(m => m.SentAt);
                    var firstOutbound = c.Messages
                        .Where(m => m.Direction == MessageDirection.Outbound && m.SentAt > firstInbound)
                        .Min(m => m.SentAt);
                    return firstOutbound - firstInbound;
                })
                .ToList();

            var performance = new AgentPerformanceDto
            {
                AgentId = agent.Id,
                AgentName = agent.FullName,
                TotalLeadsAssigned = assignedLeads.Count,
                QualifiedLeads = assignedLeads.Count(l => l.Status == LeadStatus.Qualified),
                ConvertedLeads = assignedLeads.Count(l => l.Status == LeadStatus.Converted),
                TotalConversations = conversations.Count,
                TotalMessagesSent = messagesSent,
                AverageResponseTime = responseTimes.Count > 0
                    ? TimeSpan.FromTicks((long)responseTimes.Average(t => t.Ticks))
                    : TimeSpan.Zero,
                ConversionRate = assignedLeads.Count > 0
                    ? Math.Round((decimal)assignedLeads.Count(l => l.Status == LeadStatus.Converted) / assignedLeads.Count * 100, 2)
                    : 0m,
                TotalRevenue = deals.Sum(d => d.Value),
                AverageDealValue = deals.Count > 0 ? Math.Round(deals.Average(d => d.Value), 2) : 0m
            };

            agentPerformance.Add(performance);
        }

        var result = agentPerformance
            .OrderByDescending(a => a.TotalRevenue)
            .ToArray();

        LogAgentPerformanceCalculated(logger, result.Length);

        return result;
    }

    /// <inheritdoc/>
    public async Task<RevenueForecastDto> GetRevenueForecastAsync(
        Guid businessId,
        string forecastPeriod,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingRevenueForecast(logger, businessId, forecastPeriod);

        // Get all open deals (pipeline)
        var openDeals = await dbContext.Deals
            .Where(d => d.BusinessId == businessId
                && d.Stage != DealStage.Won
                && d.Stage != DealStage.Lost)
            .ToListAsync(cancellationToken);

        // Get historical win rate (last 90 days)
        var historicalStartDate = DateTime.UtcNow.AddDays(-90);
        var closedDeals = await dbContext.Deals
            .Where(d => d.BusinessId == businessId
                && d.ActualCloseDate >= historicalStartDate
                && (d.Stage == DealStage.Won || d.Stage == DealStage.Lost))
            .ToListAsync(cancellationToken);

        var wonDeals = closedDeals.Where(d => d.Stage == DealStage.Won).ToList();
        var historicalWinRate = closedDeals.Count > 0
            ? Math.Round((decimal)wonDeals.Count / closedDeals.Count * 100, 2)
            : 50m; // Default to 50% if no historical data

        // Calculate forecast metrics
        var totalPipelineValue = openDeals.Sum(d => d.Value);
        var weightedPipelineValue = openDeals.Sum(d => d.WeightedValue);
        var committedRevenue = openDeals
            .Where(d => d.Probability >= 70)
            .Sum(d => d.Value);
        var bestCaseRevenue = totalPipelineValue;
        var worstCaseRevenue = committedRevenue;
        var expectedRevenue = weightedPipelineValue;

        // Confidence level based on data quality
        var confidenceLevel = closedDeals.Count >= 10 ? 85m : 60m;

        // Calculate current month revenue (deals won this month)
        var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var currentMonthRevenue = wonDeals
            .Where(d => d.ActualCloseDate >= currentMonthStart)
            .Sum(d => d.Value);

        // Calculate previous month revenue for growth rate
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddDays(-1);
        var previousMonthRevenue = wonDeals
            .Where(d => d.ActualCloseDate >= previousMonthStart && d.ActualCloseDate <= previousMonthEnd)
            .Sum(d => d.Value);

        // Projected monthly revenue based on pipeline and win rate
        var projectedMonthlyRevenue = weightedPipelineValue > 0
            ? Math.Round(weightedPipelineValue * (historicalWinRate / 100), 2)
            : currentMonthRevenue;

        // Revenue growth rate
        decimal revenueGrowthRate;
        if (previousMonthRevenue > 0)
        {
            revenueGrowthRate = Math.Round((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100, 2);
        }
        else
        {
            revenueGrowthRate = currentMonthRevenue > 0 ? 100m : 0m;
        }

        var result = new RevenueForecastDto
        {
            Period = forecastPeriod,
            TotalPipelineValue = Math.Round(totalPipelineValue, 2),
            WeightedPipelineValue = Math.Round(weightedPipelineValue, 2),
            CommittedRevenue = Math.Round(committedRevenue, 2),
            BestCaseRevenue = Math.Round(bestCaseRevenue, 2),
            WorstCaseRevenue = Math.Round(worstCaseRevenue, 2),
            ExpectedRevenue = Math.Round(expectedRevenue, 2),
            TotalDeals = openDeals.Count,
            AverageDealSize = openDeals.Count > 0 ? Math.Round(openDeals.Average(d => d.Value), 2) : 0m,
            HistoricalWinRate = historicalWinRate,
            ConfidenceLevel = confidenceLevel,
            CurrentMonthRevenue = Math.Round(currentMonthRevenue, 2),
            ProjectedMonthlyRevenue = projectedMonthlyRevenue,
            RevenueGrowthRate = revenueGrowthRate
        };

        LogRevenueForecastCalculated(logger, result.TotalDeals, result.ExpectedRevenue);

        return result;
    }

    /// <inheritdoc/>
    public async Task<SentimentAnalyticsDto> GetSentimentAnalyticsAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogCalculatingSentimentAnalytics(logger, businessId, dateRange.Start, dateRange.End);

        // Get chat messages with sentiment data (from chat widget sessions)
        var messages = await dbContext.ChatMessages
            .Where(m => m.BusinessId == businessId
                && m.CreatedAt >= dateRange.Start
                && m.CreatedAt <= dateRange.End
                && m.SentimentScore != null)
            .Select(m => new
            {
                m.CreatedAt,
                m.SentimentScore,
                Channel = "ChatWidget"
            })
            .ToListAsync(cancellationToken);

        if (messages.Count == 0)
        {
            return new SentimentAnalyticsDto
            {
                DateFrom = dateRange.Start,
                DateTo = dateRange.End,
                TotalMessagesAnalyzed = 0,
            };
        }

        // Calculate overall distribution
        var positive = messages.Count(m => m.SentimentScore > 0.3);
        var negative = messages.Count(m => m.SentimentScore < -0.3);
        var neutral = messages.Count - positive - negative;
        var total = messages.Count;

        var overallDistribution = new SentimentDistribution
        {
            Positive = positive,
            Neutral = neutral,
            Negative = negative,
            PositivePercent = Math.Round((double)positive / total * 100, 1),
            NeutralPercent = Math.Round((double)neutral / total * 100, 1),
            NegativePercent = Math.Round((double)negative / total * 100, 1),
        };

        // Calculate trend (group by day)
        var trend = messages
            .GroupBy(m => m.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new SentimentTrendPoint
            {
                Date = g.Key,
                AverageScore = Math.Round(g.Average(m => m.SentimentScore ?? 0), 2),
                PositiveCount = g.Count(m => m.SentimentScore > 0.3),
                NeutralCount = g.Count(m => m.SentimentScore >= -0.3 && m.SentimentScore <= 0.3),
                NegativeCount = g.Count(m => m.SentimentScore < -0.3),
                TotalCount = g.Count(),
            })
            .ToList();

        // Calculate by channel
        var byChannel = messages
            .GroupBy(m => m.Channel)
            .Select(g =>
            {
                var channelTotal = g.Count();
                var channelPositive = g.Count(m => m.SentimentScore > 0.3);
                var channelNegative = g.Count(m => m.SentimentScore < -0.3);
                var channelNeutral = channelTotal - channelPositive - channelNegative;

                return new ChannelSentiment
                {
                    Channel = g.Key,
                    AverageScore = Math.Round(g.Average(m => m.SentimentScore ?? 0), 2),
                    TotalMessages = channelTotal,
                    Distribution = new SentimentDistribution
                    {
                        Positive = channelPositive,
                        Neutral = channelNeutral,
                        Negative = channelNegative,
                        PositivePercent = Math.Round((double)channelPositive / channelTotal * 100, 1),
                        NeutralPercent = Math.Round((double)channelNeutral / channelTotal * 100, 1),
                        NegativePercent = Math.Round((double)channelNegative / channelTotal * 100, 1),
                    },
                };
            })
            .ToList();

        var averageScore = Math.Round(messages.Average(m => m.SentimentScore ?? 0), 2);

        LogSentimentAnalyticsCalculated(logger, total, averageScore);

        return new SentimentAnalyticsDto
        {
            Overall = overallDistribution,
            Trend = trend,
            ByChannel = byChannel,
            AverageScore = averageScore,
            TotalMessagesAnalyzed = total,
            DateFrom = dateRange.Start,
            DateTo = dateRange.End,
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Calculating sentiment analytics for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogCalculatingSentimentAnalytics(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(Level = LogLevel.Information, Message = "Sentiment analytics calculated: {TotalMessages} messages, average score {AverageScore}")]
    private static partial void LogSentimentAnalyticsCalculated(ILogger logger, int totalMessages, double averageScore);

    /// <inheritdoc/>
    public async Task<ChannelHealthDto> GetChannelHealthAsync(
        Guid businessId,
        Guid channelId,
        DateRange? dateRange = null,
        CancellationToken cancellationToken = default)
    {
        var range = dateRange ?? new DateRange
        {
            Start = DateTime.UtcNow.AddDays(-30),
            End = DateTime.UtcNow
        };

        LogCalculatingChannelHealth(logger, businessId, channelId);

        // Get channel details
        var channel = await dbContext.Channels
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == channelId && c.BusinessId == businessId && c.DeletedAt == null, cancellationToken);

        if (channel == null)
        {
            throw new InvalidOperationException($"Channel {channelId} not found for business {businessId}");
        }

        // Get performance metrics from database
        var metrics = await CalculateChannelMetricsAsync(businessId, channelId, range, cancellationToken);

        // Calculate health score based on real metrics
        var healthScore = CalculateHealthScore(channel, metrics);

        // Determine status based on health score
        ChannelHealthStatus status;
        if (healthScore >= 75)
        {
            status = ChannelHealthStatus.Healthy;
        }
        else if (healthScore >= 50)
        {
            status = ChannelHealthStatus.Warning;
        }
        else
        {
            status = ChannelHealthStatus.Critical;
        }

        // Generate AI-powered recommendations
        var recommendations = GenerateRecommendations(channel, metrics);

        // Calculate trends (compare current period to previous period)
        var previousRange = new DateRange
        {
            Start = range.Start.AddDays(-(range.End - range.Start).Days),
            End = range.Start
        };
        var previousMetrics = await CalculateChannelMetricsAsync(businessId, channelId, previousRange, cancellationToken);
        var trends = CalculateTrends(metrics, previousMetrics);

        LogChannelHealthCalculated(logger, channelId, healthScore, status.ToString());

        return new ChannelHealthDto
        {
            ChannelId = channelId,
            ChannelType = channel.Type.ToString(),
            HealthScore = healthScore,
            Status = status,
            Metrics = metrics,
            Recommendations = recommendations,
            Trends = trends
        };
    }

    /// <inheritdoc/>
    public async Task<ChannelHealthSummaryDto> GetChannelHealthSummaryAsync(
        Guid businessId,
        DateRange? dateRange = null,
        CancellationToken cancellationToken = default)
    {
        var range = dateRange ?? new DateRange
        {
            Start = DateTime.UtcNow.AddDays(-30),
            End = DateTime.UtcNow
        };

        LogCalculatingChannelHealthSummary(logger, businessId);

        // Get all channels for the business
        var channels = await dbContext.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null)
            .ToListAsync(cancellationToken);

        // Calculate health for each channel
        var insights = new List<ChannelHealthDto>();
        foreach (var channel in channels)
        {
            var health = await GetChannelHealthAsync(businessId, channel.Id, range, cancellationToken);
            insights.Add(health);
        }

        // Calculate summary statistics
        var overallScore = insights.Count > 0
            ? (int)Math.Round(insights.Average(i => i.HealthScore))
            : 0;

        var activeChannels = channels.Count(c => c.IsActive);
        var channelsNeedingAttention = insights.Count(i =>
            i.Status == ChannelHealthStatus.Warning || i.Status == ChannelHealthStatus.Critical);

        LogChannelHealthSummaryCalculated(logger, channels.Count, activeChannels, channelsNeedingAttention);

        return new ChannelHealthSummaryDto
        {
            OverallScore = overallScore,
            TotalChannels = channels.Count,
            ActiveChannels = activeChannels,
            ChannelsNeedingAttention = channelsNeedingAttention,
            Insights = insights
        };
    }

    // Helper methods for channel health calculation

    private static int CalculateHealthScore(Domain.Entities.Channel channel, ChannelMetrics metrics)
    {
        // Base score on verification status
        var baseScore = channel.VerificationStatus switch
        {
            "Verified" => 50,
            "Pending" => 25,
            "Failed" => 10,
            _ => 25
        };

        // Add points for activity (max 25 points)
        var activityScore = Math.Min(25, metrics.TotalMessages / 10);

        // Add points for response rate (max 15 points)
        var responseScore = (int)(metrics.ResponseRate * 15);

        // Add points for conversion rate (max 10 points)
        var conversionScore = (int)(metrics.ConversionRate * 10);

        var totalScore = baseScore + activityScore + responseScore + conversionScore;

        // Ensure score is between 0 and 100
        return Math.Clamp(totalScore, 0, 100);
    }

    private static List<RecommendationDto> GenerateRecommendations(Domain.Entities.Channel channel, ChannelMetrics metrics)
    {
        var recommendations = new List<RecommendationDto>();
        var idCounter = 1;

        // Check verification status
        if (channel.VerificationStatus == "Pending")
        {
            recommendations.Add(new RecommendationDto
            {
                Id = idCounter.ToString(System.Globalization.CultureInfo.InvariantCulture),
                Type = RecommendationType.Setup,
                Priority = RecommendationPriority.High,
                Title = "Complete Channel Verification",
                Description = "This channel needs to be verified to ensure reliable message delivery.",
                Action = "Verify Now",
                Impact = "Improves deliverability by 95%"
            });
            idCounter++;
        }
        else if (channel.VerificationStatus == "Failed")
        {
            recommendations.Add(new RecommendationDto
            {
                Id = idCounter.ToString(System.Globalization.CultureInfo.InvariantCulture),
                Type = RecommendationType.Setup,
                Priority = RecommendationPriority.High,
                Title = "Channel Setup Failed",
                Description = "Channel activation failed. Please retry setup or contact support.",
                Action = "Retry Setup",
                Impact = "Required to use this channel"
            });
            idCounter++;
        }

        // Check conversion rate
        if (metrics.ConversionRate < 0.3m && metrics.TotalMessages > 50)
        {
            recommendations.Add(new RecommendationDto
            {
                Id = idCounter.ToString(System.Globalization.CultureInfo.InvariantCulture),
                Type = RecommendationType.Optimization,
                Priority = RecommendationPriority.High,
                Title = "Low Conversion Rate",
                Description = "Enable AI-powered lead qualification to improve conversion rates.",
                Action = "Enable AI",
                Impact = "Can improve conversion by 40%"
            });
            idCounter++;
        }

        // Check response time
        if (metrics.AvgResponseTime > 300 && metrics.TotalMessages > 20)
        {
            recommendations.Add(new RecommendationDto
            {
                Id = idCounter.ToString(System.Globalization.CultureInfo.InvariantCulture),
                Type = RecommendationType.Optimization,
                Priority = RecommendationPriority.Medium,
                Title = "Slow Response Time",
                Description = "Average response time is over 5 minutes. Consider enabling auto-responses.",
                Impact = "Reduces response time by 70%"
            });
            idCounter++;
        }

        // If verified and active but no issues, add positive feedback
        if (channel.VerificationStatus == "Verified" && recommendations.Count == 0)
        {
            recommendations.Add(new RecommendationDto
            {
                Id = idCounter.ToString(System.Globalization.CultureInfo.InvariantCulture),
                Type = RecommendationType.Optimization,
                Priority = RecommendationPriority.Low,
                Title = "Channel Performing Well",
                Description = metrics.TotalMessages > 0
                    ? "Channel is performing well. Continue monitoring metrics for optimization opportunities."
                    : "Channel is verified and ready. Start engaging with customers to see performance metrics.",
                Impact = metrics.TotalMessages > 0 ? "Maintain current performance" : "Begin capturing leads"
            });
        }

        return recommendations;
    }

    private static ChannelTrends CalculateTrends(ChannelMetrics current, ChannelMetrics previous)
    {
        var messagesChange = previous.TotalMessages > 0
            ? (decimal)(current.TotalMessages - previous.TotalMessages) / previous.TotalMessages
            : 0m;

        var responseRateChange = previous.ResponseRate > 0
            ? (current.ResponseRate - previous.ResponseRate) / previous.ResponseRate
            : 0m;

        var conversionChange = previous.ConversionRate > 0
            ? (current.ConversionRate - previous.ConversionRate) / previous.ConversionRate
            : 0m;

        return new ChannelTrends
        {
            MessagesChange = messagesChange,
            ResponseRateChange = responseRateChange,
            ConversionChange = conversionChange
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Calculating channel health for business {BusinessId}, channel {ChannelId}")]
    private static partial void LogCalculatingChannelHealth(ILogger logger, Guid businessId, Guid channelId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Channel health calculated for {ChannelId}: score={HealthScore}, status={Status}")]
    private static partial void LogChannelHealthCalculated(ILogger logger, Guid channelId, int healthScore, string status);

    [LoggerMessage(Level = LogLevel.Information, Message = "Calculating channel health summary for business {BusinessId}")]
    private static partial void LogCalculatingChannelHealthSummary(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Channel health summary calculated: {TotalChannels} total, {ActiveChannels} active, {NeedingAttention} needing attention")]
    private static partial void LogChannelHealthSummaryCalculated(ILogger logger, int totalChannels, int activeChannels, int needingAttention);

    /// <summary>
    /// Maps ChannelType to the actual SourceChannel values used when creating leads.
    /// This handles the inconsistency between channel types and source channel strings.
    /// </summary>
    private static List<string> GetSourceChannelValues(ChannelType channelType)
    {
        return channelType switch
        {
            ChannelType.Voice => ["Voice", "AI Voice Call", "voice", "phone", "Phone"],
            ChannelType.SMS => ["SMS", "sms", "Text", "text"],
            ChannelType.Email => ["Email", "email", "EMAIL"],
            ChannelType.WhatsApp => ["WhatsApp", "whatsapp", "WHATSAPP"],
            ChannelType.WebForm => ["Form", "WebForm", "web_form", "form", "QRCode", "qr_code"],
            ChannelType.ChatWidget => ["ChatWidget", "chat_widget", "WebChat", "webchat", "Chat", "chat"],
            ChannelType.SocialMessaging => ["Instagram", "Facebook", "instagram", "facebook", "Social", "social"],
            _ => [channelType.ToString()]
        };
    }
}
