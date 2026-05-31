using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Partial class for FormService logging methods using source generation.
/// </summary>
public partial class FormService
{
    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting forms for business {BusinessId}, page={Page}, pageSize={PageSize}, status={Status}, isActive={IsActive}")]
    private static partial void LogGettingForms(
        ILogger logger,
        Guid businessId,
        int page,
        int pageSize,
        FormStatus? status,
        bool? isActive);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting form {FormId} for business {BusinessId}")]
    private static partial void LogGettingFormById(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting form by slug {Slug} for business {BusinessId}")]
    private static partial void LogGettingFormBySlug(ILogger logger, string slug, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Creating form {FormName} for business {BusinessId}")]
    private static partial void LogCreatingForm(ILogger logger, string formName, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Form {FormId} created for business {BusinessId}")]
    private static partial void LogFormCreated(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Updating form {FormId} for business {BusinessId}")]
    private static partial void LogUpdatingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Form {FormId} updated for business {BusinessId}")]
    private static partial void LogFormUpdated(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Form {FormId} not found for business {BusinessId}")]
    private static partial void LogFormNotFound(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Deleting form {FormId} for business {BusinessId}")]
    private static partial void LogDeletingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Publishing form {FormId} for business {BusinessId}")]
    private static partial void LogPublishingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Form {FormId} published for business {BusinessId}")]
    private static partial void LogFormPublished(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Archiving form {FormId} for business {BusinessId}")]
    private static partial void LogArchivingForm(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Form {FormId} archived for business {BusinessId}")]
    private static partial void LogFormArchived(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Getting submissions for form {FormId}, business {BusinessId}, page={Page}, pageSize={PageSize}")]
    private static partial void LogGettingSubmissions(
        ILogger logger,
        Guid formId,
        Guid businessId,
        int page,
        int pageSize);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Creating submission for form {FormId}, business {BusinessId}")]
    private static partial void LogCreatingSubmission(ILogger logger, Guid formId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Submission {SubmissionId} created for form {FormId}, business {BusinessId}")]
    private static partial void LogSubmissionCreated(
        ILogger logger,
        Guid submissionId,
        Guid formId,
        Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Marking submission {SubmissionId} as processed for business {BusinessId}")]
    private static partial void LogMarkingSubmissionProcessed(
        ILogger logger,
        Guid submissionId,
        Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Failed to send notification for submission {SubmissionId} on form {FormId}")]
    private static partial void LogNotificationFailed(
        ILogger logger,
        Exception ex,
        Guid submissionId,
        Guid formId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Lead {LeadId} created/linked to submission {SubmissionId} for form {FormId}")]
    private static partial void LogLeadCreatedFromSubmission(
        ILogger logger,
        Guid leadId,
        Guid submissionId,
        Guid formId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "No contact info (email/phone) found in submission for business {BusinessId}, skipping lead creation")]
    private static partial void LogNoContactInfoForLead(ILogger logger, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Debug,
        Message = "Found existing lead {LeadId} for business {BusinessId}")]
    private static partial void LogExistingLeadFound(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Created new lead {LeadId} for business {BusinessId} from form submission, identifier={LeadIdentifier}")]
    private static partial void LogLeadCreated(ILogger logger, Guid leadId, Guid businessId, string leadIdentifier);

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Failed to send new lead notification for lead {LeadId}")]
    private static partial void LogNewLeadNotificationFailed(ILogger logger, Exception ex, Guid leadId);
}

