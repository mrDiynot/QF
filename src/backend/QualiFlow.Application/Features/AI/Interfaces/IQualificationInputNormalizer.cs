using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for normalizing inputs from various channels into a unified qualification format.
/// This enables consistent AI qualification across SMS, Voice, Forms, Chat, and QR codes.
/// </summary>
public interface IQualificationInputNormalizer
{
    /// <summary>
    /// Normalizes a message and its conversation context into a qualification input.
    /// </summary>
    /// <param name="message">The message to normalize.</param>
    /// <param name="conversation">The conversation context.</param>
    /// <param name="conversationHistory">Optional conversation history.</param>
    /// <returns>Normalized qualification input.</returns>
    QualificationInput NormalizeFromMessage(
        Message message,
        Conversation conversation,
        IReadOnlyList<Message>? conversationHistory = null);

    /// <summary>
    /// Normalizes a form submission into a qualification input.
    /// </summary>
    /// <param name="submission">The form submission.</param>
    /// <param name="form">The form definition.</param>
    /// <returns>Normalized qualification input with pre-extracted BANT signals.</returns>
    QualificationInput NormalizeFromFormSubmission(
        FormSubmission submission,
        Form form);

    /// <summary>
    /// Normalizes a voice call transcript into a qualification input.
    /// </summary>
    /// <param name="transcript">The call transcript text.</param>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="sessionId">The voice session ID.</param>
    /// <param name="durationSeconds">The call duration in seconds.</param>
    /// <returns>Normalized qualification input.</returns>
    QualificationInput NormalizeFromVoiceTranscript(
        string transcript,
        Guid businessId,
        Guid leadId,
        Guid sessionId,
        int durationSeconds);

    /// <summary>
    /// Normalizes a QR code scan submission into a qualification input.
    /// </summary>
    /// <param name="submission">The form submission from QR code.</param>
    /// <param name="form">The form definition.</param>
    /// <param name="qrCodeId">The QR code ID.</param>
    /// <returns>Normalized qualification input.</returns>
    QualificationInput NormalizeFromQrCodeScan(
        FormSubmission submission,
        Form form,
        Guid qrCodeId);

    /// <summary>
    /// Extracts structured data from submitted form JSON.
    /// </summary>
    /// <param name="submittedDataJson">The submitted data as JSON.</param>
    /// <returns>Dictionary of field names to values.</returns>
    IReadOnlyDictionary<string, string> ExtractStructuredData(string submittedDataJson);

    /// <summary>
    /// Converts structured data to a text summary for AI analysis.
    /// </summary>
    /// <param name="structuredData">The structured data dictionary.</param>
    /// <param name="formFieldsJson">The form field definitions for context.</param>
    /// <returns>Text summary of the form data.</returns>
    string ConvertToTextSummary(
        IReadOnlyDictionary<string, string> structuredData,
        string? formFieldsJson = null);
}

