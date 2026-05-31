// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ComingSoonAnalytics.Dtos;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for Coming Soon page analytics.
/// </summary>
public sealed class ComingSoonAnalyticsService : IComingSoonAnalyticsService
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ILogger<ComingSoonAnalyticsService> _logger;

    public ComingSoonAnalyticsService(
        QualiFlowDbContext dbContext,
        ILogger<ComingSoonAnalyticsService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<ComingSoonOverviewDto> GetOverviewAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var startOffset = startDate ?? DateTimeOffset.UtcNow.AddDays(-30);
        var endOffset = endDate ?? DateTimeOffset.UtcNow;
        var start = startOffset.UtcDateTime;
        var end = endOffset.UtcDateTime;

        var sessionsQuery = _dbContext.ChatSessions
            .Where(s => s.BusinessId == businessId && s.StartedAt >= start && s.StartedAt <= end);

        var messagesQuery = _dbContext.ChatMessages
            .Where(m => m.BusinessId == businessId && m.SentAt >= start && m.SentAt <= end);

        var waitlistQuery = _dbContext.WaitlistEntries
            .Where(w => w.BusinessId == businessId && w.SignedUpAt >= start && w.SignedUpAt <= end);

        // Admin analytics: bypass the global multi-tenancy filter so we see ALL
        // AI audit records regardless of which business generated them.
        var aiAuditQuery = _dbContext.AIGenerationAudits
            .IgnoreQueryFilters()
            .Where(a => a.DeletedAt == null)
            .Where(a => a.CreatedAt >= start && a.CreatedAt <= end);

        var totalSessions = await sessionsQuery.CountAsync(cancellationToken);
        var totalMessages = await messagesQuery.CountAsync(cancellationToken);
        var uniqueVisitors = await sessionsQuery
            .Where(s => !string.IsNullOrEmpty(s.SessionToken))
            .Select(s => s.SessionToken)
            .Distinct()
            .CountAsync(cancellationToken);
        var emailsCaptured = await sessionsQuery
            .Where(s => !string.IsNullOrEmpty(s.VisitorEmail))
            .CountAsync(cancellationToken);
        var waitlistSignups = await waitlistQuery.CountAsync(cancellationToken);

        var completedSessions = await sessionsQuery
            .Where(s => s.EndedAt != null)
            .Select(s => new { s.StartedAt, EndedAt = s.EndedAt!.Value })
            .ToListAsync(cancellationToken);
        var avgDuration = completedSessions.Count > 0
            ? completedSessions.Average(s => (s.EndedAt - s.StartedAt).TotalSeconds)
            : 0;

        var avgSentiment = await messagesQuery
            .Where(m => m.SentimentScore != null)
            .AverageAsync(m => (double?)m.SentimentScore, cancellationToken) ?? 0;

        var aiCount = await aiAuditQuery.CountAsync(cancellationToken);
        var aiTotalCost = aiCount > 0
            ? await aiAuditQuery.SumAsync(a => a.EstimatedCostUsd, cancellationToken)
            : 0m;
        var aiTotalTokens = aiCount > 0
            ? await aiAuditQuery.SumAsync(a => a.InputTokens + a.OutputTokens, cancellationToken)
            : 0;

        return new ComingSoonOverviewDto
        {
            TotalChatSessions = totalSessions,
            TotalMessages = totalMessages,
            UniqueVisitors = uniqueVisitors,
            EmailsCaptured = emailsCaptured,
            WaitlistSignups = waitlistSignups,
            AverageSessionDuration = (decimal)avgDuration,
            AverageSentiment = (decimal)avgSentiment,
            TotalAIResponses = aiCount,
            TotalAICostUsd = aiTotalCost,
            TotalTokensUsed = aiTotalTokens,
            PeriodStart = startOffset,
            PeriodEnd = endOffset,
        };
    }

    public async Task<(IReadOnlyList<ChatSessionSummaryDto> sessions, int totalCount)> GetChatSessionsAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? searchTerm = null,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.ChatSessions
            .Where(s => s.BusinessId == businessId)
            .Where(s => s.Messages.Count > 0); // Only sessions with at least one message

        if (startDate.HasValue)
        {
            var startUtc = startDate.Value.UtcDateTime;
            query = query.Where(s => s.StartedAt >= startUtc);
        }

        if (endDate.HasValue)
        {
            var endUtc = endDate.Value.UtcDateTime;
            query = query.Where(s => s.StartedAt <= endUtc);
        }

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<Domain.Enums.ChatSessionStatus>(status, true, out var statusEnum))
        {
            query = query.Where(s => s.Status == statusEnum);
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(s =>
                (s.VisitorEmail != null && s.VisitorEmail.Contains(searchTerm)) ||
                (s.VisitorName != null && s.VisitorName.Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sessions = await query
            .OrderByDescending(s => s.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new ChatSessionSummaryDto
            {
                Id = s.Id,
                VisitorEmail = s.VisitorEmail,
                VisitorName = s.VisitorName,
                MessageCount = s.Messages.Count,
                Status = s.Status.ToString(),
                SentimentScore = s.Messages.Where(m => m.SentimentScore != null).Average(m => (decimal?)m.SentimentScore),
                DetectedIntent = s.Messages
                    .Where(m => m.DetectedIntent != null)
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => m.DetectedIntent)
                    .FirstOrDefault(),
                QualificationScore = s.AIQualificationScore,
                PageUrl = s.PageUrl,
                ReferrerUrl = s.ReferrerUrl,
                StartedAt = new DateTimeOffset(s.StartedAt, TimeSpan.Zero),
                EndedAt = s.EndedAt != null ? new DateTimeOffset(s.EndedAt.Value, TimeSpan.Zero) : null,
                Duration = s.EndedAt != null ? s.EndedAt - s.StartedAt : null,
            })
            .ToListAsync(cancellationToken);

        return (sessions, totalCount);
    }

    public async Task<ChatSessionDetailDto?> GetChatSessionDetailAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var session = await _dbContext.ChatSessions
            .Where(s => s.BusinessId == businessId && s.Id == sessionId)
            .Select(s => new ChatSessionDetailDto
            {
                Id = s.Id,
                VisitorEmail = s.VisitorEmail,
                VisitorName = s.VisitorName,
                Status = s.Status.ToString(),
                QualificationScore = s.AIQualificationScore,
                PageUrl = s.PageUrl,
                ReferrerUrl = s.ReferrerUrl,
                IpAddress = s.IpAddress,
                UserAgent = s.UserAgent,
                StartedAt = new DateTimeOffset(s.StartedAt, TimeSpan.Zero),
                EndedAt = s.EndedAt != null ? new DateTimeOffset(s.EndedAt.Value, TimeSpan.Zero) : null,
                Messages = s.Messages
                    .OrderBy(m => m.SentAt)
                    .Select(m => new ChatMessageDto
                    {
                        Id = m.Id,
                        Content = m.Content,
                        Type = m.Type.ToString(),
                        SenderName = m.SenderName,
                        DetectedIntent = m.DetectedIntent,
                        SentimentScore = m.SentimentScore,
                        SentAt = new DateTimeOffset(m.SentAt, TimeSpan.Zero),
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken);

        return session;
    }

    public async Task<AIUsageSummaryDto> GetAIUsageSummaryAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var startOffset = startDate ?? DateTimeOffset.UtcNow.AddDays(-30);
        var endOffset = endDate ?? DateTimeOffset.UtcNow;
        var start = startOffset.UtcDateTime;
        var end = endOffset.UtcDateTime;

        // Admin analytics: bypass the global multi-tenancy filter so we see ALL
        // AI audit records regardless of which business generated them.
        var query = _dbContext.AIGenerationAudits
            .IgnoreQueryFilters()
            .Where(a => a.DeletedAt == null)
            .Where(a => a.CreatedAt >= start && a.CreatedAt <= end);

        var totalRequests = await query.CountAsync(cancellationToken);
        int successfulRequests = 0, failedRequests = 0, totalInputTokens = 0, totalOutputTokens = 0, totalTokens = 0, avgLatencyMs = 0;
        decimal totalCostUsd = 0;
        if (totalRequests > 0)
        {
            successfulRequests = await query.CountAsync(a => a.IsSuccess, cancellationToken);
            failedRequests = totalRequests - successfulRequests;
            totalInputTokens = await query.SumAsync(a => a.InputTokens, cancellationToken);
            totalOutputTokens = await query.SumAsync(a => a.OutputTokens, cancellationToken);
            totalTokens = await query.SumAsync(a => a.InputTokens + a.OutputTokens, cancellationToken);
            totalCostUsd = await query.SumAsync(a => a.EstimatedCostUsd, cancellationToken);
            avgLatencyMs = (int)await query.AverageAsync(a => (double)a.DurationMs, cancellationToken);
        }

        var byTaskType = await query
            .GroupBy(a => a.TaskType)
            .Select(g => new AIUsageByTaskTypeDto
            {
                TaskType = g.Key,
                Count = g.Count(),
                TotalTokens = g.Sum(a => a.InputTokens + a.OutputTokens),
                TotalCostUsd = g.Sum(a => a.EstimatedCostUsd),
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync(cancellationToken);

        var byModel = await query
            .GroupBy(a => a.ModelUsed)
            .Select(g => new AIUsageByModelDto
            {
                Model = g.Key,
                Count = g.Count(),
                TotalTokens = g.Sum(a => a.InputTokens + a.OutputTokens),
                TotalCostUsd = g.Sum(a => a.EstimatedCostUsd),
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync(cancellationToken);

        var dailyUsage = await query
            .GroupBy(a => a.CreatedAt.Date)
            .Select(g => new DailyAIUsageDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Requests = g.Count(),
                Tokens = g.Sum(a => a.InputTokens + a.OutputTokens),
                CostUsd = g.Sum(a => a.EstimatedCostUsd),
            })
            .OrderBy(x => x.Date)
            .ToListAsync(cancellationToken);

        return new AIUsageSummaryDto
        {
            TotalRequests = totalRequests,
            SuccessfulRequests = successfulRequests,
            FailedRequests = failedRequests,
            TotalInputTokens = totalInputTokens,
            TotalOutputTokens = totalOutputTokens,
            TotalTokens = totalTokens,
            TotalCostUsd = totalCostUsd,
            AverageCostPerRequest = totalRequests > 0
                ? (totalCostUsd / totalRequests)
                : 0,
            AverageLatencyMs = avgLatencyMs,
            ByTaskType = byTaskType,
            ByModel = byModel,
            DailyUsage = dailyUsage,
            PeriodStart = startOffset,
            PeriodEnd = endOffset,
        };
    }

    public async Task<WaitlistSummaryDto> GetWaitlistSummaryAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekAgo = today.AddDays(-7);
        var monthAgo = today.AddMonths(-1);

        var query = _dbContext.WaitlistEntries
            .Where(w => w.BusinessId == businessId);

        var totalSignups = await query.CountAsync(cancellationToken);
        var signupsToday = await query
            .Where(w => DateOnly.FromDateTime(w.SignedUpAt) == today)
            .CountAsync(cancellationToken);
        var signupsThisWeek = await query
            .Where(w => DateOnly.FromDateTime(w.SignedUpAt) >= weekAgo)
            .CountAsync(cancellationToken);
        var signupsThisMonth = await query
            .Where(w => DateOnly.FromDateTime(w.SignedUpAt) >= monthAgo)
            .CountAsync(cancellationToken);

        var fromChatWidget = await query
            .Where(w => w.Source == "chat-widget")
            .CountAsync(cancellationToken);
        var syncedToBrevo = await query
            .Where(w => w.SyncedToBrevo)
            .CountAsync(cancellationToken);

        var bySource = await query
            .GroupBy(w => w.Source ?? "unknown")
            .Select(g => new WaitlistBySourceDto
            {
                Source = g.Key,
                Count = g.Count(),
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync(cancellationToken);

        var startDt = startDate?.UtcDateTime ?? DateTime.MinValue;
        var endDt = endDate?.UtcDateTime ?? DateTime.UtcNow;

        var dailySignups = await query
            .Where(w => w.SignedUpAt >= startDt && w.SignedUpAt <= endDt)
            .GroupBy(w => w.SignedUpAt.Date)
            .Select(g => new DailyWaitlistDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Count = g.Count(),
            })
            .OrderBy(x => x.Date)
            .ToListAsync(cancellationToken);

        return new WaitlistSummaryDto
        {
            TotalSignups = totalSignups,
            SignupsToday = signupsToday,
            SignupsThisWeek = signupsThisWeek,
            SignupsThisMonth = signupsThisMonth,
            FromChatWidget = fromChatWidget,
            FromOtherSources = totalSignups - fromChatWidget,
            SyncedToBrevo = syncedToBrevo,
            PendingSync = totalSignups - syncedToBrevo,
            BySource = bySource,
            DailySignups = dailySignups,
        };
    }

    public async Task<(IReadOnlyList<WaitlistEntryDto> entries, int totalCount)> GetWaitlistEntriesAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        string? source = null,
        string? searchTerm = null,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.WaitlistEntries
            .Where(w => w.BusinessId == businessId);

        if (startDate.HasValue)
        {
            var startUtc = startDate.Value.UtcDateTime;
            query = query.Where(w => w.SignedUpAt >= startUtc);
        }

        if (endDate.HasValue)
        {
            var endUtc = endDate.Value.UtcDateTime;
            query = query.Where(w => w.SignedUpAt <= endUtc);
        }

        if (!string.IsNullOrEmpty(source))
        {
            query = query.Where(w => w.Source == source);
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(w => w.Email.Contains(searchTerm));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var entries = await query
            .OrderByDescending(w => w.SignedUpAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new WaitlistEntryDto
            {
                Id = w.Id,
                Email = w.Email,
                Source = w.Source,
                PageUrl = w.PageUrl,
                ReferrerUrl = w.ReferrerUrl,
                SyncedToBrevo = w.SyncedToBrevo,
                SignedUpAt = new DateTimeOffset(w.SignedUpAt, TimeSpan.Zero),
            })
            .ToListAsync(cancellationToken);

        return (entries, totalCount);
    }

    public async Task<IReadOnlyList<IntentDistributionDto>> GetIntentDistributionAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var start = (startDate ?? DateTimeOffset.UtcNow.AddDays(-30)).UtcDateTime;
        var end = (endDate ?? DateTimeOffset.UtcNow).UtcDateTime;

        var intents = await _dbContext.ChatMessages
            .Where(m => m.BusinessId == businessId &&
                       m.SentAt >= start &&
                       m.SentAt <= end &&
                       m.DetectedIntent != null)
            .GroupBy(m => m.DetectedIntent!)
            .Select(g => new { Intent = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var total = intents.Sum(i => i.Count);

        return intents
            .Select(i => new IntentDistributionDto
            {
                Intent = i.Intent,
                Count = i.Count,
                Percentage = total > 0 ? Math.Round((decimal)i.Count / total * 100, 2) : 0,
            })
            .OrderByDescending(i => i.Count)
            .ToList();
    }

    public async Task<ConversionFunnelDto> GetConversionFunnelAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var start = (startDate ?? DateTimeOffset.UtcNow.AddDays(-30)).UtcDateTime;
        var end = (endDate ?? DateTimeOffset.UtcNow).UtcDateTime;

        var eventsQuery = _dbContext.ChatWidgetEvents
            .Where(e => e.BusinessId == businessId && e.OccurredAt >= start && e.OccurredAt <= end);

        var widgetOpened = await eventsQuery
            .Where(e => e.EventType == "widget_opened")
            .CountAsync(cancellationToken);

        var conversationStarted = await _dbContext.ChatSessions
            .Where(s => s.BusinessId == businessId && s.StartedAt >= start && s.StartedAt <= end)
            .CountAsync(cancellationToken);

        var emailCaptured = await _dbContext.ChatSessions
            .Where(s => s.BusinessId == businessId &&
                       s.StartedAt >= start &&
                       s.StartedAt <= end &&
                       !string.IsNullOrEmpty(s.VisitorEmail))
            .CountAsync(cancellationToken);

        var waitlistJoined = await _dbContext.WaitlistEntries
            .Where(w => w.BusinessId == businessId && w.SignedUpAt >= start && w.SignedUpAt <= end)
            .CountAsync(cancellationToken);

        return new ConversionFunnelDto
        {
            WidgetOpened = widgetOpened,
            ConversationStarted = conversationStarted,
            EmailCaptured = emailCaptured,
            WaitlistJoined = waitlistJoined,
            WidgetToConversationRate = widgetOpened > 0
                ? Math.Round((decimal)conversationStarted / widgetOpened * 100, 2)
                : 0,
            ConversationToEmailRate = conversationStarted > 0
                ? Math.Round((decimal)emailCaptured / conversationStarted * 100, 2)
                : 0,
            EmailToWaitlistRate = emailCaptured > 0
                ? Math.Round((decimal)waitlistJoined / emailCaptured * 100, 2)
                : 0,
            OverallConversionRate = widgetOpened > 0
                ? Math.Round((decimal)waitlistJoined / widgetOpened * 100, 2)
                : 0,
        };
    }

    public async Task<byte[]> ExportWaitlistToCsvAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.WaitlistEntries
            .Where(w => w.BusinessId == businessId);

        if (startDate.HasValue)
        {
            var startUtc = startDate.Value.UtcDateTime;
            query = query.Where(w => w.SignedUpAt >= startUtc);
        }

        if (endDate.HasValue)
        {
            var endUtc = endDate.Value.UtcDateTime;
            query = query.Where(w => w.SignedUpAt <= endUtc);
        }

        var entries = await query
            .OrderByDescending(w => w.SignedUpAt)
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Email,Source,PageUrl,ReferrerUrl,SyncedToBrevo,SignedUpAt");

        foreach (var entry in entries)
        {
            sb.AppendLine(string.Format(
                CultureInfo.InvariantCulture,
                "\"{0}\",\"{1}\",\"{2}\",\"{3}\",{4},{5:O}",
                EscapeCsvField(entry.Email),
                EscapeCsvField(entry.Source ?? string.Empty),
                EscapeCsvField(entry.PageUrl ?? string.Empty),
                EscapeCsvField(entry.ReferrerUrl ?? string.Empty),
                entry.SyncedToBrevo,
                entry.SignedUpAt));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeCsvField(string field)
    {
        return field.Replace("\"", "\"\"", StringComparison.Ordinal);
    }
}
