using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to mark inactive chat sessions as timed out.
/// Runs every 5 minutes to check for sessions with no activity beyond the timeout threshold.
/// </summary>
public sealed partial class ChatSessionTimeoutJob
{
    private const int TimeoutMinutes = 30;

    private readonly IChatSessionRepository _sessionRepository;
    private readonly ILogger<ChatSessionTimeoutJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ChatSessionTimeoutJob"/> class.
    /// </summary>
    public ChatSessionTimeoutJob(
        IChatSessionRepository sessionRepository,
        ILogger<ChatSessionTimeoutJob> logger)
    {
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    /// <summary>
    /// Executes the chat session timeout job.
    /// Finds all active sessions with no activity in the last 30 minutes and marks them as timed out.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        LogJobStarted(_logger);

        try
        {
            var timedOutSessions = await _sessionRepository.GetTimedOutSessionsAsync(
                TimeoutMinutes, CancellationToken.None);

            if (timedOutSessions.Count == 0)
            {
                LogNoTimedOutSessions(_logger);
                return;
            }

            LogTimedOutSessionsFound(_logger, timedOutSessions.Count);

            var updatedCount = 0;
            foreach (var session in timedOutSessions)
            {
                try
                {
                    session.Status = ChatSessionStatus.TimedOut;
                    session.EndedAt = DateTime.UtcNow;
                    await _sessionRepository.UpdateAsync(session, CancellationToken.None);
                    updatedCount++;

                    LogSessionTimedOut(_logger, session.Id, session.BusinessId);
                }
                catch (Exception ex)
                {
                    LogSessionUpdateError(_logger, ex, session.Id);
                }
            }

            LogJobCompleted(_logger, updatedCount, timedOutSessions.Count);
        }
        catch (Exception ex)
        {
            LogJobFailed(_logger, ex);
            throw;
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting chat session timeout job")]
    private static partial void LogJobStarted(ILogger logger);

    [LoggerMessage(Level = LogLevel.Debug, Message = "No timed-out chat sessions found")]
    private static partial void LogNoTimedOutSessions(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Found {Count} timed-out chat sessions")]
    private static partial void LogTimedOutSessionsFound(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Session {SessionId} for business {BusinessId} marked as timed out")]
    private static partial void LogSessionTimedOut(ILogger logger, Guid sessionId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to update session {SessionId} as timed out")]
    private static partial void LogSessionUpdateError(ILogger logger, Exception ex, Guid sessionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Chat session timeout job completed: {UpdatedCount}/{TotalCount} sessions updated")]
    private static partial void LogJobCompleted(ILogger logger, int updatedCount, int totalCount);

    [LoggerMessage(Level = LogLevel.Error, Message = "Chat session timeout job failed")]
    private static partial void LogJobFailed(ILogger logger, Exception ex);
}

