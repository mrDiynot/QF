using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Partial class for FormRepository logging methods using source generation.
/// </summary>
public partial class FormRepository
{
    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting form {FormId} for business {BusinessId}")]
    private static partial void LogGettingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting form by slug {Slug} for business {BusinessId}")]
    private static partial void LogGettingFormBySlug(ILogger logger, string slug, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting forms for business {BusinessId}, status={Status}, isActive={IsActive}, skip={Skip}, take={Take}")]
    private static partial void LogGettingForms(
        ILogger logger,
        Guid businessId,
        FormStatus? status,
        bool? isActive,
        int skip,
        int take);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting form count for business {BusinessId}, status={Status}, isActive={IsActive}")]
    private static partial void LogGettingFormCount(
        ILogger logger,
        Guid businessId,
        FormStatus? status,
        bool? isActive);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Adding form {FormName} for business {BusinessId}")]
    private static partial void LogAddingForm(ILogger logger, string formName, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Updating form {FormId} for business {BusinessId}")]
    private static partial void LogUpdatingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Deleting form {FormId} for business {BusinessId}")]
    private static partial void LogDeletingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Form {FormId} not found for business {BusinessId}")]
    private static partial void LogFormNotFound(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Checking if slug {Slug} exists for business {BusinessId}")]
    private static partial void LogCheckingSlugExists(ILogger logger, string slug, Guid businessId);
}

