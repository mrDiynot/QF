using QualiFlow.Application.Features.Analytics.DTOs;

namespace QualiFlow.Application.Features.Analytics.Services;

/// <summary>
/// Service interface for form analytics operations.
/// </summary>
public interface IFormAnalyticsService
{
    /// <summary>
    /// Gets analytics for a specific form.
    /// </summary>
    /// <param name="formId">Form identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Form analytics data.</returns>
    Task<FormAnalyticsDto?> GetFormAnalyticsAsync(
        Guid formId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all A/B test results for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of A/B test results.</returns>
    Task<IReadOnlyList<AbTestResultDto>> GetAbTestResultsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets field drop-off analysis for a specific form.
    /// </summary>
    /// <param name="formId">Form identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of field drop-off data.</returns>
    Task<IReadOnlyList<FieldDropOffDto>> GetFieldDropOffAnalysisAsync(
        Guid formId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets submission timeline for a specific form.
    /// </summary>
    /// <param name="formId">Form identifier.</param>
    /// <param name="startDate">Start date for timeline.</param>
    /// <param name="endDate">End date for timeline.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of timeline data points.</returns>
    Task<IReadOnlyList<FormSubmissionTimelineDto>> GetFormSubmissionTimelineAsync(
        Guid formId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets QR-to-Form attribution data for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of attribution data.</returns>
    Task<IReadOnlyList<QrToFormAttributionDto>> GetQrToFormAttributionAsync(
        CancellationToken cancellationToken = default);
}
