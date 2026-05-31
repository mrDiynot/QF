using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for FormSubmission entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IFormSubmissionRepository
{
    /// <summary>
    /// Gets a form submission by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="submissionId">The submission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The submission if found; otherwise, null.</returns>
    Task<FormSubmission?> GetByIdAsync(
        Guid businessId,
        Guid submissionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all submissions for a specific form with pagination.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="isProcessed">Optional filter for processed status.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of form submissions.</returns>
    Task<IReadOnlyList<FormSubmission>> GetByFormIdAsync(
        Guid businessId,
        Guid formId,
        bool? isProcessed = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of submissions for a form.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="isProcessed">Optional filter for processed status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of submissions.</returns>
    Task<int> GetCountByFormIdAsync(
        Guid businessId,
        Guid formId,
        bool? isProcessed = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all submissions for a business with optional filtering and pagination.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">Optional form ID filter.</param>
    /// <param name="isProcessed">Optional filter for processed status.</param>
    /// <param name="dateFrom">Optional start date filter.</param>
    /// <param name="dateTo">Optional end date filter.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of form submissions.</returns>
    Task<IReadOnlyList<FormSubmission>> GetAllAsync(
        Guid businessId,
        Guid? formId = null,
        bool? isProcessed = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of submissions for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">Optional form ID filter.</param>
    /// <param name="isProcessed">Optional filter for processed status.</param>
    /// <param name="dateFrom">Optional start date filter.</param>
    /// <param name="dateTo">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of submissions.</returns>
    Task<int> GetCountAsync(
        Guid businessId,
        Guid? formId = null,
        bool? isProcessed = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new form submission to the database.
    /// </summary>
    /// <param name="submission">The submission to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added submission with generated ID.</returns>
    Task<FormSubmission> AddAsync(FormSubmission submission, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing form submission in the database.
    /// </summary>
    /// <param name="submission">The submission to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(FormSubmission submission, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a submission as processed.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="submissionId">The submission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the submission was marked as processed; false if not found.</returns>
    Task<bool> MarkAsProcessedAsync(
        Guid businessId,
        Guid submissionId,
        CancellationToken cancellationToken = default);
}

