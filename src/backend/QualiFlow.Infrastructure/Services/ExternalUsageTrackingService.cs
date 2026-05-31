using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for tracking external service usage (OpenAI, Twilio) per business.
/// </summary>
public sealed partial class ExternalUsageTrackingService : IExternalUsageTrackingService
{
    // Cost estimates per unit (USD)
    private const decimal TwilioSmsCost = 0.0079m;             // Average SMS cost
    private const decimal TwilioVoiceCostPerMinute = 0.014m;   // Average voice cost

    private readonly QualiFlowDbContext _context;
    private readonly ILogger<ExternalUsageTrackingService> _logger;

    public ExternalUsageTrackingService(
        QualiFlowDbContext context,
        ILogger<ExternalUsageTrackingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task TrackOpenAIUsageAsync(
        Guid businessId,
        int inputTokens,
        int outputTokens,
        string model,
        string operationType,
        Guid? conversationId = null,
        Guid? messageId = null,
        double? durationMs = null,
        CancellationToken cancellationToken = default)
    {
        var estimatedCost = CalculateOpenAICost(inputTokens, outputTokens, model);

        var usageLog = new ExternalUsageLog
        {
            BusinessId = businessId,
            ServiceType = "openai",
            OperationType = operationType,
            InputTokens = inputTokens,
            OutputTokens = outputTokens,
            Model = model,
            EstimatedCost = estimatedCost,
            ConversationId = conversationId,
            MessageId = messageId,
            DurationSeconds = durationMs.HasValue ? (int)(durationMs.Value / 1000) : null,
        };

        _context.Set<ExternalUsageLog>().Add(usageLog);
        await _context.SaveChangesAsync(cancellationToken);

        LogOpenAIUsageTracked(businessId, inputTokens, outputTokens, model, operationType, estimatedCost);
    }

    /// <inheritdoc/>
    public async Task TrackTwilioSmsAsync(
        Guid businessId,
        string direction,
        decimal estimatedCost,
        Guid? conversationId = null,
        Guid? messageId = null,
        CancellationToken cancellationToken = default)
    {
        var usageLog = new ExternalUsageLog
        {
            BusinessId = businessId,
            ServiceType = "twilio_sms",
            OperationType = direction,
            Direction = direction,
            EstimatedCost = estimatedCost > 0 ? estimatedCost : TwilioSmsCost,
            ConversationId = conversationId,
            MessageId = messageId,
        };

        _context.Set<ExternalUsageLog>().Add(usageLog);
        await _context.SaveChangesAsync(cancellationToken);

        LogTwilioSmsTracked(businessId, direction, usageLog.EstimatedCost);
    }

    /// <inheritdoc/>
    public async Task TrackTwilioVoiceAsync(
        Guid businessId,
        int durationSeconds,
        string direction,
        decimal estimatedCost,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default)
    {
        var minutes = (int)Math.Ceiling(durationSeconds / 60.0);
        var cost = estimatedCost > 0 ? estimatedCost : minutes * TwilioVoiceCostPerMinute;

        var usageLog = new ExternalUsageLog
        {
            BusinessId = businessId,
            ServiceType = "twilio_voice",
            OperationType = direction,
            Direction = direction,
            DurationSeconds = durationSeconds,
            EstimatedCost = cost,
            ConversationId = conversationId,
        };

        _context.Set<ExternalUsageLog>().Add(usageLog);
        await _context.SaveChangesAsync(cancellationToken);

        LogTwilioVoiceTracked(businessId, direction, durationSeconds, cost);
    }

    /// <inheritdoc/>
    public async Task<ExternalUsageSummary> GetUsageSummaryAsync(
        Guid businessId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
    {
        var logs = await _context.Set<ExternalUsageLog>()
            .Where(l => l.DeletedAt == null && l.BusinessId == businessId && l.CreatedAt >= from && l.CreatedAt <= to)
            .ToListAsync(cancellationToken);

        return BuildUsageSummary(logs);
    }

    /// <inheritdoc/>
    public async Task<ExternalUsageSummary> GetPlatformUsageSummaryAsync(
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
    {
        var logs = await _context.Set<ExternalUsageLog>()
            .Where(l => l.DeletedAt == null && l.CreatedAt >= from && l.CreatedAt <= to)
            .ToListAsync(cancellationToken);

        return BuildUsageSummary(logs);
    }

    /// <inheritdoc/>
    public async Task<ExternalUsageSummary> GetBusinessUsageSummaryAsync(
        Guid businessId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
    {
        // Same as GetUsageSummaryAsync but named for admin context
        return await GetUsageSummaryAsync(businessId, from, to, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<BusinessUsageInfo>> GetTopBusinessesByUsageAsync(
        DateTime from,
        DateTime to,
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var usageByBusiness = await _context.ExternalUsageLogs
            .Where(l => l.DeletedAt == null && l.CreatedAt >= from && l.CreatedAt <= to)
            .GroupBy(l => l.BusinessId)
            .Select(g => new
            {
                BusinessId = g.Key,
                TotalCost = g.Sum(l => l.EstimatedCost),
                OpenAIRequests = g.Count(l => l.ServiceType == "openai"),
                SmsMessages = g.Count(l => l.ServiceType == "twilio_sms"),
                VoiceSeconds = g.Where(l => l.ServiceType == "twilio_voice").Sum(l => l.DurationSeconds ?? 0),
            })
            .OrderByDescending(x => x.TotalCost)
            .Take(limit)
            .ToListAsync(cancellationToken);

        var businessIds = usageByBusiness.Select(u => u.BusinessId).ToList();
        var businesses = await _context.Businesses
            .Where(b => businessIds.Contains(b.Id))
            .ToDictionaryAsync(b => b.Id, b => b.Name, cancellationToken);

        return usageByBusiness.Select(u => new BusinessUsageInfo
        {
            BusinessId = u.BusinessId,
            BusinessName = businesses.TryGetValue(u.BusinessId, out var name) ? name : "Unknown",
            TotalEstimatedCost = u.TotalCost,
            TotalOpenAIRequests = u.OpenAIRequests,
            TotalSmsMessages = u.SmsMessages,
            TotalVoiceMinutes = (int)Math.Ceiling(u.VoiceSeconds / 60.0),
        }).ToList();
    }

    private static ExternalUsageSummary BuildUsageSummary(List<ExternalUsageLog> logs)
    {
        var openAILogs = logs.Where(l => l.ServiceType == "openai").ToList();
        var smsLogs = logs.Where(l => l.ServiceType == "twilio_sms").ToList();
        var voiceLogs = logs.Where(l => l.ServiceType == "twilio_voice").ToList();

        var operationBreakdown = logs
            .GroupBy(l => l.OperationType)
            .ToDictionary(g => g.Key, g => g.Count());

        return new ExternalUsageSummary
        {
            TotalOpenAIRequests = openAILogs.Count,
            TotalInputTokens = openAILogs.Sum(l => l.InputTokens ?? 0),
            TotalOutputTokens = openAILogs.Sum(l => l.OutputTokens ?? 0),
            EstimatedOpenAICost = openAILogs.Sum(l => l.EstimatedCost),
            TotalSmsInbound = smsLogs.Count(l => l.Direction == "inbound"),
            TotalSmsOutbound = smsLogs.Count(l => l.Direction == "outbound"),
            TotalVoiceMinutes = (int)Math.Ceiling(voiceLogs.Sum(l => l.DurationSeconds ?? 0) / 60.0),
            EstimatedTwilioCost = smsLogs.Sum(l => l.EstimatedCost) + voiceLogs.Sum(l => l.EstimatedCost),
            OperationBreakdown = operationBreakdown,
        };
    }

    private static decimal CalculateOpenAICost(int inputTokens, int outputTokens, string model)
    {
        // Adjust costs based on model (2026 pricing)
        // See: https://platform.openai.com/docs/models
        var inputCostPer1K = model switch
        {
            // GPT-5 family (latest 2026)
            "gpt-5.2" => 0.005m,          // Flagship - best for coding/agentic tasks
            "gpt-5-mini" => 0.0003m,      // Balanced cost/performance
            "gpt-5-nano" => 0.0001m,      // Fastest, most cost-effective
            _ => 0.0003m,                 // Default to gpt-5-mini pricing
        };

        var outputCostPer1K = model switch
        {
            // GPT-5 family (latest 2026)
            "gpt-5.2" => 0.015m,          // Flagship output
            "gpt-5-mini" => 0.0012m,      // Mini output
            "gpt-5-nano" => 0.0004m,      // Nano output
            _ => 0.0012m,                 // Default to gpt-5-mini pricing
        };

        return (inputTokens / 1000m * inputCostPer1K) + (outputTokens / 1000m * outputCostPer1K);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Tracked OpenAI usage for business {BusinessId}: {InputTokens} input, {OutputTokens} output tokens, model={Model}, operation={OperationType}, cost=${EstimatedCost:F6}")]
    private partial void LogOpenAIUsageTracked(Guid businessId, int inputTokens, int outputTokens, string model, string operationType, decimal estimatedCost);

    [LoggerMessage(Level = LogLevel.Information, Message = "Tracked Twilio SMS for business {BusinessId}: direction={Direction}, cost=${EstimatedCost:F4}")]
    private partial void LogTwilioSmsTracked(Guid businessId, string direction, decimal estimatedCost);

    [LoggerMessage(Level = LogLevel.Information, Message = "Tracked Twilio Voice for business {BusinessId}: direction={Direction}, duration={DurationSeconds}s, cost=${EstimatedCost:F4}")]
    private partial void LogTwilioVoiceTracked(Guid businessId, string direction, int durationSeconds, decimal estimatedCost);
}
