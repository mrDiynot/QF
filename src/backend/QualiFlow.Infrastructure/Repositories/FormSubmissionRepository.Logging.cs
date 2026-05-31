using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Partial class for FormSubmissionRepository logging methods using source generation.
/// </summary>
public partial class FormSubmissionRepository
{
    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting submission {SubmissionId} for business {BusinessId}")]
    private static partial void LogGettingSubmission(ILogger logger, Guid submissionId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting submissions for form {FormId}, business {BusinessId}, isProcessed={IsProcessed}, skip={Skip}, take={Take}")]
    private static partial void LogGettingSubmissionsByForm(
        ILogger logger,
        Guid formId,
        Guid businessId,
        bool? isProcessed,
        int skip,
        int take);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting submission count for form {FormId}, business {BusinessId}, isProcessed={IsProcessed}")]
    private static partial void LogGettingSubmissionCountByForm(
        ILogger logger,
        Guid formId,
        Guid businessId,
        bool? isProcessed);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting submissions for business {BusinessId}, formId={FormId}, isProcessed={IsProcessed}, dateFrom={DateFrom}, dateTo={DateTo}, skip={Skip}, take={Take}")]
    private static partial void LogGettingSubmissions(
        ILogger logger,
        Guid businessId,
        Guid? formId,
        bool? isProcessed,
        DateTime? dateFrom,
        DateTime? dateTo,
        int skip,
        int take);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting submission count for business {BusinessId}, formId={FormId}, isProcessed={IsProcessed}, dateFrom={DateFrom}, dateTo={DateTo}")]
    private static partial void LogGettingSubmissionCount(
        ILogger logger,
        Guid businessId,
        Guid? formId,
        bool? isProcessed,
        DateTime? dateFrom,
        DateTime? dateTo);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Adding submission for form {FormId}, business {BusinessId}")]
    private static partial void LogAddingSubmission(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Updating submission {SubmissionId} for business {BusinessId}")]
    private static partial void LogUpdatingSubmission(ILogger logger, Guid submissionId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Marking submission {SubmissionId} as processed for business {BusinessId}")]
    private static partial void LogMarkingAsProcessed(ILogger logger, Guid submissionId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Submission {SubmissionId} not found for business {BusinessId}")]
    private static partial void LogSubmissionNotFound(ILogger logger, Guid submissionId, Guid businessId);
}

