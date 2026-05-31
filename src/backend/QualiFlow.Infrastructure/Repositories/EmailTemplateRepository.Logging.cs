using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for EmailTemplateRepository.
/// </summary>
public partial class EmailTemplateRepository
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Getting email template {TemplateId} for business {BusinessId}")]
    private static partial void LogGettingEmailTemplate(ILogger logger, Guid templateId, Guid businessId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Getting all email templates for business {BusinessId} with type {Type} and isActive {IsActive}")]
    private static partial void LogGettingAllEmailTemplates(ILogger logger, Guid businessId, EmailTemplateType? type, bool? isActive);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Creating email template {TemplateId} for business {BusinessId}")]
    private static partial void LogCreatingEmailTemplate(ILogger logger, Guid templateId, Guid businessId);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Updating email template {TemplateId} for business {BusinessId}")]
    private static partial void LogUpdatingEmailTemplate(ILogger logger, Guid templateId, Guid businessId);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Information,
        Message = "Deleting email template {TemplateId} for business {BusinessId}")]
    private static partial void LogDeletingEmailTemplate(ILogger logger, Guid templateId, Guid businessId);
}

