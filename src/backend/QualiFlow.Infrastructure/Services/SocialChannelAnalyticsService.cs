using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Analytics.DTOs;
using QualiFlow.Application.Features.Analytics.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for calculating analytics specific to social media channels (Instagram, Facebook, WhatsApp).
/// </summary>
public sealed partial class SocialChannelAnalyticsService(
    QualiFlowDbContext dbContext,
    ILogger<SocialChannelAnalyticsService> logger) : ISocialChannelAnalyticsService
{
    private static readonly ChannelType[] SocialChannelTypes =
        [ChannelType.Instagram, ChannelType.Facebook, ChannelType.WhatsApp];

    /// <inheritdoc/>
    public async Task<SocialChannelAnalyticsDto> GetChannelAnalyticsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogGettingChannelAnalytics(businessId, channelId, dateRange.Start, dateRange.End);

        var channel = await dbContext.Channels
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == channelId && c.BusinessId == businessId, cancellationToken);

        if (channel == null)
        {
            LogChannelNotFound(channelId);
            return new SocialChannelAnalyticsDto { ChannelId = channelId, Period = dateRange };
        }

        var messaging = await GetMessagingMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var engagement = await GetEngagementMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var aiMetrics = await GetAIMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var responseWindow = await GetResponseWindowMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var conversion = await GetConversionMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var trends = await GetTrendsAsync(businessId, channelId, dateRange, cancellationToken);

        return new SocialChannelAnalyticsDto
        {
            ChannelId = channelId,
            ChannelType = channel.Type.ToString(),
            PageName = channel.Name,
            Period = dateRange,
            Messaging = messaging,
            Engagement = engagement,
            AIPerformance = aiMetrics,
            ResponseWindow = responseWindow,
            Conversion = conversion,
            Trends = trends
        };
    }

    /// <inheritdoc/>
    public async Task<SocialChannelsSummaryDto> GetSocialChannelsSummaryAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        LogGettingSocialSummary(businessId, dateRange.Start, dateRange.End);

        var socialChannels = await dbContext.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && SocialChannelTypes.Contains(c.Type))
            .ToListAsync(cancellationToken);

        var channelBreakdown = new List<SocialChannelAnalyticsDto>();
        foreach (var channel in socialChannels)
        {
            var analytics = await GetChannelAnalyticsAsync(businessId, channel.Id, dateRange, cancellationToken);
            channelBreakdown.Add(analytics);
        }

        var totalMessaging = AggregateMessagingMetrics(channelBreakdown);
        var totalConversion = AggregateConversionMetrics(channelBreakdown);

        var overallAICoverage = channelBreakdown.Count > 0
            ? channelBreakdown.Average(c => c.AIPerformance.AICoverageRate)
            : 0m;

        var overallCompliance = channelBreakdown.Count > 0
            ? channelBreakdown.Average(c => c.ResponseWindow.ComplianceRate)
            : 1m;

        return new SocialChannelsSummaryDto
        {
            Period = dateRange,
            TotalChannels = socialChannels.Count,
            ActiveChannels = socialChannels.Count(c => c.IsActive),
            TotalMessaging = totalMessaging,
            TotalConversion = totalConversion,
            OverallAICoverage = overallAICoverage,
            OverallComplianceRate = overallCompliance,
            ChannelBreakdown = channelBreakdown
        };
    }

    /// <inheritdoc/>
    public async Task<SocialMessagingMetrics> GetMessagingMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        var messages = await dbContext.Messages
            .AsNoTracking()
            .Where(m => m.Conversation.ChannelId == channelId
                && m.Conversation.BusinessId == businessId
                && m.SentAt >= dateRange.Start
                && m.SentAt < dateRange.End
                && !m.IsSimulated)
            .Select(m => new { m.Direction, m.DeliveredAt, m.ReadAt, m.ConversationId })
            .ToListAsync(cancellationToken);

        var inbound = messages.Count(m => m.Direction == MessageDirection.Inbound);
        var outbound = messages.Count(m => m.Direction == MessageDirection.Outbound);
        var delivered = messages.Count(m => m.DeliveredAt.HasValue);
        var read = messages.Count(m => m.ReadAt.HasValue);
        var uniqueConversations = messages.Select(m => m.ConversationId).Distinct().Count();

        return new SocialMessagingMetrics
        {
            InboundMessages = inbound,
            OutboundMessages = outbound,
            UniqueConversations = uniqueConversations,
            AvgMessagesPerConversation = uniqueConversations > 0
                ? Math.Round((decimal)messages.Count / uniqueConversations, 2)
                : 0m,
            DeliveredMessages = delivered,
            ReadMessages = read
        };
    }

    /// <inheritdoc/>
    public async Task<SocialEngagementMetrics> GetEngagementMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        var conversations = await dbContext.Conversations
            .AsNoTracking()
            .Where(c => c.ChannelId == channelId
                && c.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && !c.IsSimulated)
            .Include(c => c.Messages)
            .ToListAsync(cancellationToken);

        var newConversations = conversations.Count;
        var withResponses = conversations.Count(c =>
            c.Messages.Any(m => m.Direction == MessageDirection.Outbound));

        var avgDuration = conversations.Count > 0
            ? (int)conversations
                .Where(c => c.EndedAt.HasValue)
                .Select(c => (c.EndedAt!.Value - c.StartedAt).TotalMinutes)
                .DefaultIfEmpty(0)
                .Average()
            : 0;

        return new SocialEngagementMetrics
        {
            NewConversationsInitiated = newConversations,
            ConversationsWithResponses = withResponses,
            AvgConversationDurationMinutes = avgDuration,
            QuickReplyClicks = 0, // Placeholder - track quick reply clicks when implemented
            QuickReplyEngagementRate = 0m,
            PositiveSentimentConversations = 0, // Placeholder - aggregate from message sentiment
            NegativeSentimentConversations = 0,
            OverallSentimentScore = 0m,
        };
    }

    /// <inheritdoc/>
    public async Task<SocialAIMetrics> GetAIMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        // Get AI usage logs for this channel
        var aiLogs = await dbContext.Set<Domain.Entities.ExternalUsageLog>()
            .AsNoTracking()
            .Where(u => u.BusinessId == businessId
                && u.ServiceType == "openai"
                && u.CreatedAt >= dateRange.Start
                && u.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);

        // Get outbound messages to calculate AI vs human ratio
        var outboundMessages = await dbContext.Messages
            .AsNoTracking()
            .Where(m => m.Conversation.ChannelId == channelId
                && m.Conversation.BusinessId == businessId
                && m.Direction == MessageDirection.Outbound
                && m.SentAt >= dateRange.Start
                && m.SentAt < dateRange.End
                && !m.IsSimulated)
            .CountAsync(cancellationToken);

        // Get qualifications for this channel
        var qualifications = await dbContext.Qualifications
            .AsNoTracking()
            .Where(q => q.Lead.Conversations.Any(c => c.ChannelId == channelId)
                && q.Lead.BusinessId == businessId
                && q.CreatedAt >= dateRange.Start
                && q.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);

        // Estimate AI responses (simplified - in production, track sender type)
        var aiResponses = Math.Min(aiLogs, outboundMessages);
        var humanResponses = outboundMessages - aiResponses;

        return new SocialAIMetrics
        {
            AIResponses = aiResponses,
            HumanResponses = humanResponses,
            HandoffCount = 0, // Placeholder - track handoffs when implemented
            HandoffRate = 0m,
            AvgAIResponseTimeSeconds = 2, // AI typically responds in ~2 seconds
            SuccessfulQualifications = qualifications,
            QualificationRate = outboundMessages > 0
                ? Math.Round((decimal)qualifications / outboundMessages, 2)
                : 0m,
        };
    }

    /// <inheritdoc/>
    public async Task<ResponseWindowMetrics> GetResponseWindowMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        // Get conversations with their first inbound and first outbound messages
        var conversations = await dbContext.Conversations
            .AsNoTracking()
            .Where(c => c.ChannelId == channelId
                && c.BusinessId == businessId
                && c.StartedAt >= dateRange.Start
                && c.StartedAt < dateRange.End
                && !c.IsSimulated)
            .Select(c => new
            {
                c.Id,
                FirstInbound = c.Messages
                    .Where(m => m.Direction == MessageDirection.Inbound)
                    .OrderBy(m => m.SentAt)
                    .Select(m => m.SentAt)
                    .FirstOrDefault(),
                FirstOutbound = c.Messages
                    .Where(m => m.Direction == MessageDirection.Outbound)
                    .OrderBy(m => m.SentAt)
                    .Select(m => m.SentAt)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var responseTimes = conversations
            .Where(c => c.FirstInbound != default && c.FirstOutbound != default)
            .Select(c => (c.FirstOutbound - c.FirstInbound).TotalMinutes)
            .ToList();

        var withinWindow = responseTimes.Count(t => t <= 24 * 60); // 24 hours
        var outsideWindow = responseTimes.Count(t => t > 24 * 60);
        var avgResponseTime = responseTimes.Count > 0 ? (int)responseTimes.Average() : 0;

        // Get conversations at risk (last inbound > 20 hours ago, no response)
        var atRiskResult = await GetAtRiskConversationsAsync(businessId, channelId, cancellationToken);

        return new ResponseWindowMetrics
        {
            WithinWindowResponses = withinWindow,
            OutsideWindowResponses = outsideWindow,
            AvgResponseTimeMinutes = avgResponseTime,
            ConversationsAtRisk = atRiskResult.riskCount,
        };
    }

    /// <inheritdoc/>
    public async Task<SocialConversionMetrics> GetConversionMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        var leads = await dbContext.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId
                && l.Conversations.Any(c => c.ChannelId == channelId)
                && l.CreatedAt >= dateRange.Start
                && l.CreatedAt < dateRange.End)
            .Select(l => new { l.Status, l.Score })
            .ToListAsync(cancellationToken);

        var totalLeads = leads.Count;
        var qualifiedLeads = leads.Count(l => l.Status == LeadStatus.Qualified || l.Status == LeadStatus.Converted);
        var convertedLeads = leads.Count(l => l.Status == LeadStatus.Converted);
        var avgScore = leads.Count > 0 ? (decimal)leads.Average(l => l.Score) : 0m;

        var bookings = await dbContext.Bookings
            .AsNoTracking()
            .Where(b => b.Lead.BusinessId == businessId
                && b.Lead.Conversations.Any(c => c.ChannelId == channelId)
                && b.CreatedAt >= dateRange.Start
                && b.CreatedAt < dateRange.End)
            .CountAsync(cancellationToken);

        return new SocialConversionMetrics
        {
            TotalLeads = totalLeads,
            QualifiedLeads = qualifiedLeads,
            ConvertedLeads = convertedLeads,
            BookingsMade = bookings,
            AvgLeadScore = Math.Round(avgScore, 2)
        };
    }

    /// <inheritdoc/>
    public async Task<SocialTrends> GetTrendsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default)
    {
        var periodLength = dateRange.End - dateRange.Start;
        var previousRange = new DateRange
        {
            Start = dateRange.Start - periodLength,
            End = dateRange.Start
        };

        var currentMessaging = await GetMessagingMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var previousMessaging = await GetMessagingMetricsAsync(businessId, channelId, previousRange, cancellationToken);

        var currentConversion = await GetConversionMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var previousConversion = await GetConversionMetricsAsync(businessId, channelId, previousRange, cancellationToken);

        var currentAI = await GetAIMetricsAsync(businessId, channelId, dateRange, cancellationToken);
        var previousAI = await GetAIMetricsAsync(businessId, channelId, previousRange, cancellationToken);

        return new SocialTrends
        {
            MessagesChange = CalculatePercentChange(previousMessaging.TotalMessages, currentMessaging.TotalMessages),
            ConversationsChange = CalculatePercentChange(previousMessaging.UniqueConversations, currentMessaging.UniqueConversations),
            LeadsChange = CalculatePercentChange(previousConversion.TotalLeads, currentConversion.TotalLeads),
            ConversionRateChange = currentConversion.ConversionRate - previousConversion.ConversionRate,
            ResponseTimeChange = 0m, // Placeholder - calculate response time change when implemented
            AICoverageChange = currentAI.AICoverageRate - previousAI.AICoverageRate,
            SentimentChange = 0m, // Placeholder - calculate sentiment change when implemented
        };
    }

    /// <inheritdoc/>
    public async Task<(int riskCount, IReadOnlyList<Guid> riskConversationIds)> GetAtRiskConversationsAsync(
        Guid businessId,
        Guid? channelId = null,
        CancellationToken cancellationToken = default)
    {
        var twentyHoursAgo = DateTime.UtcNow.AddHours(-20);
        var twentyFourHoursAgo = DateTime.UtcNow.AddHours(-24);

        var query = dbContext.Conversations
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId
                && c.Status != ConversationStatus.Closed
                && !c.IsSimulated
                && SocialChannelTypes.Contains(c.ChannelEntity!.Type));

        if (channelId.HasValue)
        {
            query = query.Where(c => c.ChannelId == channelId.Value);
        }

        // Find conversations where last inbound message is between 20-24 hours ago
        // and there's no outbound message after it
        var atRiskConversations = await query
            .Where(c => c.Messages
                .Where(m => m.Direction == MessageDirection.Inbound)
                .OrderByDescending(m => m.SentAt)
                .Select(m => m.SentAt)
                .FirstOrDefault() <= twentyHoursAgo
                && c.Messages
                    .Where(m => m.Direction == MessageDirection.Inbound)
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => m.SentAt)
                    .FirstOrDefault() > twentyFourHoursAgo)
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        return (riskCount: atRiskConversations.Count, riskConversationIds: atRiskConversations);
    }

    // Private helper methods

    private static decimal CalculatePercentChange(int previous, int current)
    {
        if (previous == 0)
        {
            return current > 0 ? 1m : 0m;
        }

        return Math.Round((decimal)(current - previous) / previous, 2);
    }

    private static SocialMessagingMetrics AggregateMessagingMetrics(List<SocialChannelAnalyticsDto> channels)
    {
        return new SocialMessagingMetrics
        {
            InboundMessages = channels.Sum(c => c.Messaging.InboundMessages),
            OutboundMessages = channels.Sum(c => c.Messaging.OutboundMessages),
            UniqueConversations = channels.Sum(c => c.Messaging.UniqueConversations),
            AvgMessagesPerConversation = channels.Count > 0
                ? Math.Round(channels.Average(c => c.Messaging.AvgMessagesPerConversation), 2)
                : 0m,
            DeliveredMessages = channels.Sum(c => c.Messaging.DeliveredMessages),
            ReadMessages = channels.Sum(c => c.Messaging.ReadMessages)
        };
    }

    private static SocialConversionMetrics AggregateConversionMetrics(List<SocialChannelAnalyticsDto> channels)
    {
        var totalLeads = channels.Sum(c => c.Conversion.TotalLeads);
        var qualifiedLeads = channels.Sum(c => c.Conversion.QualifiedLeads);
        var convertedLeads = channels.Sum(c => c.Conversion.ConvertedLeads);
        var bookings = channels.Sum(c => c.Conversion.BookingsMade);

        return new SocialConversionMetrics
        {
            TotalLeads = totalLeads,
            QualifiedLeads = qualifiedLeads,
            ConvertedLeads = convertedLeads,
            BookingsMade = bookings,
            AvgLeadScore = channels.Count > 0
                ? Math.Round(channels.Average(c => c.Conversion.AvgLeadScore), 2)
                : 0m
        };
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Getting social channel analytics for business {BusinessId}, channel {ChannelId}, from {Start} to {End}")]
    private partial void LogGettingChannelAnalytics(Guid businessId, Guid channelId, DateTime start, DateTime end);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Channel {ChannelId} not found")]
    private partial void LogChannelNotFound(Guid channelId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Getting social channels summary for business {BusinessId}, from {Start} to {End}")]
    private partial void LogGettingSocialSummary(Guid businessId, DateTime start, DateTime end);
}

