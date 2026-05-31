using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for EmailLogRepository.
/// </summary>
public partial class EmailLogRepository
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Getting email log by Resend email ID {ResendEmailId}")]
    private static partial void LogGettingEmailLogByResendId(ILogger logger, string resendEmailId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Getting all email logs for business {BusinessId} with status {Status}, templateId {TemplateId}, limit {Limit}")]
    private static partial void LogGettingAllEmailLogs(ILogger logger, Guid businessId, EmailStatus? status, Guid? templateId, int limit);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Creating email log {EmailLogId} for business {BusinessId}")]
    private static partial void LogCreatingEmailLog(ILogger logger, Guid emailLogId, Guid businessId);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Updating email log {EmailLogId} for business {BusinessId}")]
    private static partial void LogUpdatingEmailLog(ILogger logger, Guid emailLogId, Guid businessId);
}

