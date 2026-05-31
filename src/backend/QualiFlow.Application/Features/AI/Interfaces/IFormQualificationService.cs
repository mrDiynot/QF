using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for qualifying leads from form submissions using BANT methodology.
/// Extracts qualification signals from form field data without requiring conversation context.
/// </summary>
public interface IFormQualificationService
{
    /// <summary>
    /// Qualifies a lead based on form submission data.
    /// Combines rule-based field mapping with optional AI analysis.
    /// </summary>
    /// <param name="request">The qualification request with form data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The qualification result with BANT scores.</returns>
    Task<FormQualificationResult> QualifyFormSubmissionAsync(
        FormQualificationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Qualifies a lead directly from a FormSubmission entity.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="submission">The form submission.</param>
    /// <param name="form">The form definition.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The qualification result with BANT scores.</returns>
    Task<FormQualificationResult> QualifyFormSubmissionAsync(
        Guid businessId,
        FormSubmission submission,
        Form form,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Qualifies a lead from raw form submission data (convenience method for controller use).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="submissionId">The form submission ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="submittedDataJson">The submitted form data as JSON.</param>
    /// <param name="formFieldsJson">The form field definitions as JSON.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The qualification result with BANT scores.</returns>
    Task<FormQualificationResult> QualifyFromSubmissionDataAsync(
        Guid businessId,
        Guid submissionId,
        Guid leadId,
        string submittedDataJson,
        string formFieldsJson,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts BANT signals from form field data using rule-based pattern matching.
    /// This is a fast, synchronous operation that doesn't call external APIs.
    /// </summary>
    /// <param name="submittedDataJson">The submitted form data as JSON.</param>
    /// <param name="formFieldsJson">The form field definitions as JSON.</param>
    /// <returns>List of extracted BANT signals from form fields.</returns>
    IReadOnlyList<FormFieldBantExtraction> ExtractBantFromFormFields(
        string submittedDataJson,
        string formFieldsJson);

    /// <summary>
    /// Gets suggested follow-up questions based on missing BANT data.
    /// </summary>
    /// <param name="result">The qualification result.</param>
    /// <returns>List of suggested questions to gather missing BANT data.</returns>
    IReadOnlyList<string> GetSuggestedFollowUpQuestions(FormQualificationResult result);
}

