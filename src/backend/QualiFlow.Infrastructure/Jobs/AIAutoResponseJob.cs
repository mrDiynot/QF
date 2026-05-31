using Hangfire;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Hangfire job for processing AI auto-responses to inbound messages.
/// This job is enqueued when an inbound message is received and triggers
/// the AI to generate and send a response.
/// </summary>
public sealed partial class AIAutoResponseJob : IAIAutoResponseJobService
{
    private readonly IAIAutoResponseService _autoResponseService;
    private readonly ILogger<AIAutoResponseJob> _logger;

    public AIAutoResponseJob(
        IAIAutoResponseService autoResponseService,
        ILogger<AIAutoResponseJob> logger)
    {
        _autoResponseService = autoResponseService;
        _logger = logger;
    }

    /// <inheritdoc />
    [AutomaticRetry]
    [Queue("critical")]
    public async Task ProcessAiAutoResponseAsync(
        Guid businessId,
        Guid conversationId,
        Guid messageId,
        string channel)
    {
        LogJobStarted(businessId, conversationId, messageId, channel);

        try
        {
            var result = await _autoResponseService.ProcessAndRespondAsync(
                businessId,
                conversationId,
                messageId,
                channel,
                CancellationToken.None);

            if (result.Success)
            {
                LogJobCompleted(businessId, conversationId, result.ResponseMessageId ?? Guid.Empty);
            }
            else if (result.LimitExceeded)
            {
                LogLimitExceeded(businessId, conversationId, result.FailureReason ?? "Unknown limit");
            }
            else if (result.HandledByHuman)
            {
                LogHumanHandoff(businessId, conversationId);
            }
            else
            {
                LogJobFailed(businessId, conversationId, result.FailureReason ?? "Unknown error");
            }
        }
        catch (Exception ex)
        {
            LogJobError(businessId, conversationId, ex.Message, ex);
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "AI auto-response job started for business {BusinessId}, conversation {ConversationId}, message {MessageId}, channel {Channel}")]
    private partial void LogJobStarted(Guid businessId, Guid conversationId, Guid messageId, string channel);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI auto-response job completed for business {BusinessId}, conversation {ConversationId}, response {ResponseMessageId}")]
    private partial void LogJobCompleted(Guid businessId, Guid conversationId, Guid responseMessageId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI auto-response job skipped for business {BusinessId}, conversation {ConversationId}: limit exceeded ({LimitType})")]
    private partial void LogLimitExceeded(Guid businessId, Guid conversationId, string limitType);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI auto-response job skipped for business {BusinessId}, conversation {ConversationId}: human handoff active")]
    private partial void LogHumanHandoff(Guid businessId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI auto-response job failed for business {BusinessId}, conversation {ConversationId}: {Error}")]
    private partial void LogJobFailed(Guid businessId, Guid conversationId, string error);

    [LoggerMessage(Level = LogLevel.Error, Message = "AI auto-response job error for business {BusinessId}, conversation {ConversationId}: {Error}")]
    private partial void LogJobError(Guid businessId, Guid conversationId, string error, Exception ex);
}
