using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for CommunicationSettings entity operations.
/// Multi-tenancy is enforced via businessId parameter.
/// </summary>
public partial class CommunicationSettingsRepository(
    QualiFlowDbContext context,
    ILogger<CommunicationSettingsRepository> logger) : ICommunicationSettingsRepository
{
    /// <inheritdoc />
    public Task<CommunicationSettings?> GetByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingSettings(logger, businessId);

        return context.CommunicationSettings
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId && s.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<CommunicationSettings> UpsertAsync(
        CommunicationSettings settings,
        CancellationToken cancellationToken = default)
    {
        var existing = await context.CommunicationSettings
            .Where(s => s.BusinessId == settings.BusinessId && s.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null)
        {
            LogCreatingSettings(logger, settings.BusinessId);
            await context.CommunicationSettings.AddAsync(settings, cancellationToken);
        }
        else
        {
            LogUpdatingSettings(logger, settings.BusinessId);
            existing.EmailSenderName = settings.EmailSenderName;
            existing.EmailReplyTo = settings.EmailReplyTo;
            existing.EmailSignature = settings.EmailSignature;
            existing.SmsDefaultSender = settings.SmsDefaultSender;
            existing.SmsOptOutMessage = settings.SmsOptOutMessage;
            existing.SmsEnableAutoReply = settings.SmsEnableAutoReply;
            existing.VoiceBusinessHours = settings.VoiceBusinessHours;
            existing.VoiceVoicemailEnabled = settings.VoiceVoicemailEnabled;
            existing.VoiceCallForwardingNumber = settings.VoiceCallForwardingNumber;
            existing.UpdatedAt = DateTime.UtcNow;
            context.CommunicationSettings.Update(existing);
            settings = existing;
        }

        await context.SaveChangesAsync(cancellationToken);
        return settings;
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
        Message = "Creating communication settings for business {BusinessId}")]
    private static partial void LogCreatingSettings(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Updating communication settings for business {BusinessId}")]
    private static partial void LogUpdatingSettings(ILogger logger, Guid businessId);
}

