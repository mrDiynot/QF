using QualiFlow.Application.Features.Forms.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Forms.Services;

/// <summary>
/// Service interface for form business logic operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IFormService
{
    /// <summary>
    /// Gets a paginated list of forms for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of forms.</returns>
    Task<PagedFormResponse> GetFormsAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 10,
        FormStatus? status = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a form by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found; otherwise, null.</returns>
    Task<FormResponse?> GetFormByIdAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a form by slug within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="slug">The form's unique slug.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found; otherwise, null.</returns>
    Task<FormResponse?> GetFormBySlugAsync(
        Guid businessId,
        string slug,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new form for the specified business.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="request">The form creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created form.</returns>
    Task<FormResponse> CreateFormAsync(
        Guid businessId,
        CreateFormRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing form.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID to update.</param>
    /// <param name="request">The form update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated form if found; otherwise, null.</returns>
    Task<FormResponse?> UpdateFormAsync(
        Guid businessId,
        Guid formId,
        UpdateFormRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a form (soft delete).
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the form was deleted; otherwise, false.</returns>
    Task<bool> DeleteFormAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Publishes a form, making it available for submissions.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID to publish.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The published form if found; otherwise, null.</returns>
    Task<FormResponse?> PublishFormAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Archives a form, making it unavailable for submissions.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID to archive.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The archived form if found; otherwise, null.</returns>
    Task<FormResponse?> ArchiveFormAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a paginated list of submissions for a form.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="isProcessed">Optional processed status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of form submissions.</returns>
    Task<PagedFormSubmissionResponse> GetFormSubmissionsAsync(
        Guid businessId,
        Guid formId,
        int page = 1,
        int pageSize = 10,
        bool? isProcessed = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new form submission.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="request">The submission request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created submission.</returns>
    Task<FormSubmissionResponse> CreateSubmissionAsync(
        Guid businessId,
        Guid formId,
        CreateFormSubmissionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a submission as processed.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="submissionId">The submission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the submission was marked as processed; otherwise, false.</returns>
    Task<bool> MarkSubmissionAsProcessedAsync(
        Guid businessId,
        Guid submissionId,
        CancellationToken cancellationToken = default);
}

