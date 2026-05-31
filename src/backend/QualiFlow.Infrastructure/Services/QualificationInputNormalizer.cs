using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Normalizes input from various channels into a unified format for AI qualification.
/// </summary>
/// <param name="logger">The logger instance.</param>
public partial class QualificationInputNormalizer(
    ILogger<QualificationInputNormalizer> logger) : IQualificationInputNormalizer
{
    /// <inheritdoc />
    public QualificationInput NormalizeFromMessage(
        Message message,
        Conversation conversation,
        IReadOnlyList<Message>? conversationHistory = null)
    {
        LogNormalizingMessage(message.Id, conversation.Id);

        var messagesToUse = conversationHistory ?? conversation.Messages?.ToList() ?? [];
        var history = messagesToUse
            .OrderBy(m => m.CreatedAt)
            .Select(m => new ConversationMessageContext
            {
                Content = m.Content,
                IsFromLead = m.Direction == Domain.Enums.MessageDirection.Inbound,
                Timestamp = m.CreatedAt,
                SenderRole = m.Direction == Domain.Enums.MessageDirection.Inbound ? "Lead" : "Agent",
            })
            .ToList();

        return new QualificationInput
        {
            BusinessId = conversation.BusinessId,
            LeadId = conversation.LeadId,
            Channel = conversation.Channel,
            TriggerId = message.Id,
            ConversationId = conversation.Id,
            TextContent = message.Content,
            StructuredData = new Dictionary<string, string>(),
            ConversationHistory = history,
            UseAIAnalysis = true,
            Metadata = null,
        };
    }

    /// <inheritdoc />
    public QualificationInput NormalizeFromFormSubmission(
        FormSubmission submission,
        Form form)
    {
        LogNormalizingFormSubmission(submission.Id, form.Id);

        var structuredData = ExtractStructuredData(submission.SubmittedData);
        var textContent = ConvertToTextSummary(structuredData, form.Fields);

        return new QualificationInput
        {
            BusinessId = submission.BusinessId,
            LeadId = submission.LeadId ?? Guid.Empty,
            Channel = "Form",
            TriggerId = submission.Id,
            ConversationId = null,
            TextContent = textContent,
            StructuredData = structuredData,
            PreExtractedBantSignals = null,
            ConversationHistory = null,
            UseAIAnalysis = true,
            Metadata = new QualificationInputMetadata
            {
                FormId = form.Id,
                FormName = form.Name,
                IpAddress = submission.IpAddress,
                UserAgent = submission.UserAgent,
                ReferrerUrl = submission.ReferrerUrl,
            },
        };
    }

    /// <inheritdoc />
    public QualificationInput NormalizeFromVoiceTranscript(
        string transcript,
        Guid businessId,
        Guid leadId,
        Guid sessionId,
        int durationSeconds)
    {
        LogNormalizingVoiceTranscript(sessionId, businessId);

        return new QualificationInput
        {
            BusinessId = businessId,
            LeadId = leadId,
            Channel = "Voice",
            TriggerId = sessionId,
            ConversationId = null,
            TextContent = transcript,
            StructuredData = new Dictionary<string, string>(),
            PreExtractedBantSignals = null,
            ConversationHistory = null,
            UseAIAnalysis = true,
            Metadata = new QualificationInputMetadata
            {
                VoiceSessionId = sessionId,
                CallDurationSeconds = durationSeconds,
            },
        };
    }

    /// <inheritdoc />
    public QualificationInput NormalizeFromQrCodeScan(
        FormSubmission submission,
        Form form,
        Guid qrCodeId)
    {
        LogNormalizingQrCodeScan(qrCodeId, submission.BusinessId);

        var structuredData = ExtractStructuredData(submission.SubmittedData);
        var textContent = ConvertToTextSummary(structuredData, form.Fields);

        return new QualificationInput
        {
            BusinessId = submission.BusinessId,
            LeadId = submission.LeadId ?? Guid.Empty,
            Channel = "QRCode",
            TriggerId = submission.Id,
            ConversationId = null,
            TextContent = textContent,
            StructuredData = structuredData,
            PreExtractedBantSignals = null,
            ConversationHistory = null,
            UseAIAnalysis = true,
            Metadata = new QualificationInputMetadata
            {
                FormId = form.Id,
                FormName = form.Name,
                QrCodeId = qrCodeId,
                IpAddress = submission.IpAddress,
                UserAgent = submission.UserAgent,
                ReferrerUrl = submission.ReferrerUrl,
            },
        };
    }

    /// <inheritdoc />
    public IReadOnlyDictionary<string, string> ExtractStructuredData(string submittedDataJson)
    {
        var structuredData = new Dictionary<string, string>();

        try
        {
            using var submittedData = JsonDocument.Parse(submittedDataJson);
            foreach (var property in submittedData.RootElement.EnumerateObject())
            {
                structuredData[property.Name] = property.Value.ToString();
            }
        }
        catch (JsonException ex)
        {
            LogJsonParseError(ex.Message);
        }

        return structuredData;
    }

    /// <inheritdoc />
    public string ConvertToTextSummary(
        IReadOnlyDictionary<string, string> structuredData,
        string? formFieldsJson = null)
    {
        var sb = new System.Text.StringBuilder();

        foreach (var kvp in structuredData)
        {
            sb.AppendLine($"{kvp.Key}: {kvp.Value}");
        }

        return sb.ToString();
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "Normalizing message {MessageId} from conversation {ConversationId}")]
    private partial void LogNormalizingMessage(Guid messageId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Normalizing form submission {SubmissionId} from form {FormId}")]
    private partial void LogNormalizingFormSubmission(Guid submissionId, Guid formId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Normalizing voice transcript for session {SessionId} in business {BusinessId}")]
    private partial void LogNormalizingVoiceTranscript(Guid sessionId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Normalizing QR code scan {QrCodeId} for business {BusinessId}")]
    private partial void LogNormalizingQrCodeScan(Guid qrCodeId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse JSON data: {Error}")]
    private partial void LogJsonParseError(string error);
}
