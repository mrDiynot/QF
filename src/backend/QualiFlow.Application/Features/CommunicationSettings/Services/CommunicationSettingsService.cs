using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.CommunicationSettings.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.CommunicationSettings.Services;

/// <summary>
/// Service implementation for communication settings operations.
/// </summary>
public partial class CommunicationSettingsService(
    ICommunicationSettingsRepository repository,
    ILogger<CommunicationSettingsService> logger) : ICommunicationSettingsService
{
    /// <inheritdoc />
    public async Task<CommunicationSettingsDto> GetAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingSettings(logger, businessId);

        var settings = await repository.GetByBusinessIdAsync(businessId, cancellationToken);

        if (settings == null)
        {
            // Return default settings if none exist
            return new CommunicationSettingsDto
            {
                Email = new EmailSettingsDto(),
                Sms = new SmsSettingsDto(),
                Voice = new VoiceSettingsDto(),
            };
        }

        return MapToDto(settings);
    }

    /// <inheritdoc />
    public async Task<CommunicationSettingsDto> UpdateAsync(
        Guid businessId,
        UpdateCommunicationSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingSettings(logger, businessId);

        var existing = await repository.GetByBusinessIdAsync(businessId, cancellationToken);

        var settings = existing ?? new Domain.Entities.CommunicationSettings
        {
            BusinessId = businessId,
        };

        // Update email settings
        if (request.Email != null)
        {
            settings.EmailSenderName = request.Email.SenderName;
            settings.EmailReplyTo = request.Email.ReplyToEmail;
            settings.EmailSignature = request.Email.Signature;
        }

        // Update SMS settings
        if (request.Sms != null)
        {
            settings.SmsDefaultSender = request.Sms.DefaultSender;
            settings.SmsOptOutMessage = request.Sms.OptOutMessage;
            settings.SmsEnableAutoReply = request.Sms.EnableAutoReply;
        }

        // Update voice settings
        if (request.Voice != null)
        {
            settings.VoiceBusinessHours = request.Voice.BusinessHours;
            settings.VoiceVoicemailEnabled = request.Voice.VoicemailEnabled;
            settings.VoiceCallForwardingNumber = request.Voice.CallForwardingNumber;
        }

        var saved = await repository.UpsertAsync(settings, cancellationToken);
        return MapToDto(saved);
    }

    private static CommunicationSettingsDto MapToDto(Domain.Entities.CommunicationSettings settings)
    {
        return new CommunicationSettingsDto
        {
            Email = new EmailSettingsDto
            {
                SenderName = settings.EmailSenderName ?? string.Empty,
                ReplyToEmail = settings.EmailReplyTo ?? string.Empty,
                Signature = settings.EmailSignature ?? string.Empty,
            },
            Sms = new SmsSettingsDto
            {
                DefaultSender = settings.SmsDefaultSender ?? string.Empty,
                OptOutMessage = settings.SmsOptOutMessage ?? "Reply STOP to unsubscribe",
                EnableAutoReply = settings.SmsEnableAutoReply,
            },
            Voice = new VoiceSettingsDto
            {
                BusinessHours = settings.VoiceBusinessHours ?? string.Empty,
                VoicemailEnabled = settings.VoiceVoicemailEnabled,
                CallForwardingNumber = settings.VoiceCallForwardingNumber,
            },
            UpdatedAt = settings.UpdatedAt,
        };
    }

    // ============================================================================
    // Logger Message Delegates
    // ============================================================================

    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Getting communication settings for business {BusinessId}")]
    private static partial void LogGettingSettings(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Updating communication settings for business {BusinessId}")]
    private static partial void LogUpdatingSettings(ILogger logger, Guid businessId);
}

