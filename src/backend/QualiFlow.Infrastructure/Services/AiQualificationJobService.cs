using Hangfire;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.InboundMessages.Services;
using QualiFlow.Application.Features.Scoring.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Background job service for AI qualification processing.
/// Uses OpenAI to score and qualify leads based on inbound messages.
/// </summary>
/// <param name="messageRepository">The message repository.</param>
/// <param name="leadScoringService">The lead scoring service.</param>
/// <param name="logger">The logger instance.</param>
public partial class AiQualificationJobService(
    IMessageRepository messageRepository,
    ILeadScoringService leadScoringService,
    ILogger<AiQualificationJobService> logger) : IAiQualificationJobService
{
    /// <inheritdoc />
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
    public async Task ProcessAiQualificationAsync(Guid businessId, Guid leadId, Guid triggerId)
    {
        LogAiQualificationStarted(logger, leadId, triggerId, businessId);

        try
        {
            // Try to get the message that triggered qualification (optional)
            // triggerId could be a message ID (SMS, Chat) or a form submission ID
            var message = await messageRepository.GetByIdAsync(businessId, triggerId, CancellationToken.None);

            // Determine the trigger source for scoring context
            string triggerSource;
            if (message != null)
            {
                // Message-based trigger (SMS, Voice, WhatsApp, Chat)
                triggerSource = $"InboundMessage:{triggerId}";
            }
            else
            {
                // Non-message trigger (Form submission, direct lead creation, etc.)
                // Still proceed with scoring - the lead exists and should be qualified
                LogTriggerNotMessage(logger, triggerId, businessId);
                triggerSource = $"LeadCreation:{triggerId}";
            }

            // Score the lead using the AI scoring service
            var scoringResult = await leadScoringService.RecalculateScoreAsync(
                leadId,
                businessId,
                triggerSource,
                CancellationToken.None);

            LogAiQualificationCompleted(logger, leadId, triggerId, scoringResult.FinalScore);
        }
        catch (Exception ex)
        {
            LogAiQualificationFailed(logger, ex, leadId, triggerId);
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "AI qualification started for lead {LeadId}, message {MessageId}, business {BusinessId}")]
    private static partial void LogAiQualificationStarted(ILogger logger, Guid leadId, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Lead {LeadId} not found for business {BusinessId}")]
    private static partial void LogLeadNotFound(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Message {MessageId} not found for business {BusinessId}")]
    private static partial void LogMessageNotFound(ILogger logger, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Trigger {TriggerId} is not a message for business {BusinessId}, processing as non-message trigger")]
    private static partial void LogTriggerNotMessage(ILogger logger, Guid triggerId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI qualification completed for lead {LeadId}, trigger {TriggerId}, score: {Score}")]
    private static partial void LogAiQualificationCompleted(ILogger logger, Guid leadId, Guid triggerId, int score);

    [LoggerMessage(Level = LogLevel.Error, Message = "AI qualification failed for lead {LeadId}, trigger {TriggerId}")]
    private static partial void LogAiQualificationFailed(ILogger logger, Exception ex, Guid leadId, Guid triggerId);
}

