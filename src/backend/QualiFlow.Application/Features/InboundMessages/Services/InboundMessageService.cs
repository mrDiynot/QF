using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AutoAssignment.Interfaces;
using QualiFlow.Application.Features.InboundMessages.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.InboundMessages.Services;

/// <summary>
/// Service for processing inbound messages from all channels.
/// Handles lead creation, conversation management, and AI qualification triggering.
/// </summary>
/// <param name="channelRepository">The channel repository.</param>
/// <param name="leadRepository">The lead repository.</param>
/// <param name="conversationRepository">The conversation repository.</param>
/// <param name="messageRepository">The message repository.</param>
/// <param name="notificationService">The in-app notification service.</param>
/// <param name="backgroundJobService">The background job service for async processing.</param>
/// <param name="autoAssignmentService">The auto-assignment service for lead routing.</param>
/// <param name="logger">The logger instance.</param>
public partial class InboundMessageService(
    IChannelRepository channelRepository,
    ILeadRepository leadRepository,
    IConversationRepository conversationRepository,
    IMessageRepository messageRepository,
    INotificationService notificationService,
    IBackgroundJobService backgroundJobService,
    IAutoAssignmentService? autoAssignmentService,
    ILogger<InboundMessageService> logger) : IInboundMessageService
{
    /// <inheritdoc />
    public async Task<InboundMessageResult> ProcessInboundSmsAsync(
        TwilioSmsWebhookPayload payload,
        CancellationToken cancellationToken = default)
    {
        LogProcessingInboundSms(logger, payload.From, payload.To, payload.MessageSid);

        // Step 1: Identify the business by the receiving phone number
        var channel = await channelRepository.GetByPhoneNumberAsync(payload.To, cancellationToken);
        if (channel == null)
        {
            LogChannelNotFound(logger, payload.To);
            return InboundMessageResult.FailureResult($"No channel found for phone number: {payload.To}");
        }

        var businessId = channel.BusinessId;
        LogBusinessIdentified(logger, businessId, payload.To);

        // Step 2: Find or create lead by sender phone number
        var (lead, isNewLead) = await FindOrCreateLeadAsync(
            businessId, payload.From, null, cancellationToken);

        // Step 3: Find or create conversation (linked to SMS channel)
        var (conversation, isNewConversation) = await FindOrCreateConversationAsync(
            businessId, lead.Id, "SMS", channel.Id, cancellationToken);

        // Step 4: Store the message
        var message = await StoreMessageAsync(
            conversation.Id, payload.Body, MessageDirection.Inbound, cancellationToken);

        // Step 5: Enqueue AI qualification job
        EnqueueAiQualificationJob(businessId, lead.Id, message.Id);

        // Step 6: Enqueue AI auto-response job (Sprint 35)
        EnqueueAiAutoResponseJob(businessId, conversation.Id, message.Id, "SMS");

        // Step 7: Broadcast to business users via SignalR
        await BroadcastNewMessageAsync(businessId, conversation.Id, message);

        LogInboundSmsProcessed(logger, message.Id, lead.Id, conversation.Id);

        return InboundMessageResult.SuccessResult(
            lead.Id, conversation.Id, message.Id, isNewLead, isNewConversation);
    }

    /// <inheritdoc />
    public async Task<InboundMessageResult> ProcessInboundVoiceAsync(
        TwilioVoiceWebhookPayload payload,
        CancellationToken cancellationToken = default)
    {
        LogProcessingInboundVoice(logger, payload.From, payload.To, payload.CallSid);

        // Step 1: Identify the business by the receiving phone number
        var channel = await channelRepository.GetByPhoneNumberAsync(payload.To, cancellationToken);
        if (channel == null)
        {
            LogChannelNotFound(logger, payload.To);
            return InboundMessageResult.FailureResult($"No channel found for phone number: {payload.To}");
        }

        var businessId = channel.BusinessId;

        // Step 2: Find or create lead by caller phone number
        var (lead, isNewLead) = await FindOrCreateLeadAsync(
            businessId, payload.From, null, cancellationToken);

        // Step 3: Find or create conversation (linked to Voice channel)
        var (conversation, isNewConversation) = await FindOrCreateConversationAsync(
            businessId, lead.Id, "Voice", channel.Id, cancellationToken);

        // Step 4: Store initial call message (recording will be added later)
        var message = await StoreMessageAsync(
            conversation.Id,
            $"[Incoming call from {payload.From}]",
            MessageDirection.Inbound,
            cancellationToken);

        // Step 5: Generate TwiML to record the call
        var recordingCallbackUrl = $"/api/v1/webhooks/twilio/voice/recording?callSid={payload.CallSid}";
        var twiml = InboundMessageResult.GenerateVoiceRecordTwiml(recordingCallbackUrl);

        LogInboundVoiceProcessed(logger, message.Id, lead.Id, conversation.Id);

        return InboundMessageResult.SuccessResult(
            lead.Id, conversation.Id, message.Id, isNewLead, isNewConversation, twiml);
    }

    /// <inheritdoc />
    public Task ProcessVoiceRecordingAsync(
        TwilioRecordingPayload payload,
        CancellationToken cancellationToken = default)
    {
        LogProcessingVoiceRecording(logger, payload.RecordingSid, payload.CallSid);

        // Enqueue Whisper transcription job via background job service
        backgroundJobService.Enqueue<IVoiceTranscriptionJobService>(
            service => service.TranscribeVoiceRecordingAsync(
                payload.RecordingSid,
                payload.RecordingUrl,
                payload.CallSid));

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public async Task<InboundMessageResult> ProcessInboundWhatsAppAsync(
        TwilioWhatsAppWebhookPayload payload,
        CancellationToken cancellationToken = default)
    {
        LogProcessingInboundWhatsApp(logger, payload.From, payload.To, payload.MessageSid);

        // Extract raw phone numbers (remove whatsapp: prefix)
        var fromPhone = payload.GetRawFromNumber();
        var toPhone = payload.GetRawToNumber();

        // Step 1: Identify the business by the receiving phone number
        var channel = await channelRepository.GetByPhoneNumberAsync(toPhone, cancellationToken);
        if (channel == null)
        {
            LogChannelNotFound(logger, toPhone);
            return InboundMessageResult.FailureResult($"No channel found for phone number: {toPhone}");
        }

        var businessId = channel.BusinessId;

        // Step 2: Find or create lead
        var (lead, isNewLead) = await FindOrCreateLeadAsync(
            businessId, fromPhone, payload.ProfileName, cancellationToken);

        // Step 3: Find or create conversation (linked to WhatsApp channel)
        var (conversation, isNewConversation) = await FindOrCreateConversationAsync(
            businessId, lead.Id, "WhatsApp", channel.Id, cancellationToken);

        // Step 4: Store the message
        var message = await StoreMessageAsync(
            conversation.Id, payload.Body, MessageDirection.Inbound, cancellationToken);

        // Step 5: Enqueue AI qualification job
        EnqueueAiQualificationJob(businessId, lead.Id, message.Id);

        // Step 6: Enqueue AI auto-response job (Sprint 35)
        EnqueueAiAutoResponseJob(businessId, conversation.Id, message.Id, "WhatsApp");

        // Step 7: Broadcast to business users via SignalR
        await BroadcastNewMessageAsync(businessId, conversation.Id, message);

        LogInboundWhatsAppProcessed(logger, message.Id, lead.Id, conversation.Id);

        return InboundMessageResult.SuccessResult(
            lead.Id, conversation.Id, message.Id, isNewLead, isNewConversation);
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    private async Task<(Lead lead, bool isNew)> FindOrCreateLeadAsync(
        Guid businessId,
        string phoneNumber,
        string? displayName,
        CancellationToken cancellationToken)
    {
        var existingLead = await leadRepository.GetByPhoneNumberAsync(
            businessId, phoneNumber, cancellationToken);

        if (existingLead != null)
        {
            return (existingLead, false);
        }

        // Create new lead
        var newLead = new Lead
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Name = displayName ?? $"Lead from {phoneNumber}",
            Phone = phoneNumber,
            Email = string.Empty, // Will be captured during qualification
            Status = LeadStatus.New,
            Score = 0,
            SourceChannel = "Inbound",
            CreatedAt = DateTime.UtcNow,
        };

        var createdLead = await leadRepository.AddForBusinessAsync(newLead, cancellationToken);
        LogLeadCreated(logger, createdLead.Id, businessId, phoneNumber);

        // Apply auto-assignment rules for new lead
        await ApplyAutoAssignmentAsync(businessId, createdLead.Id, "Inbound", createdLead.Score, cancellationToken);

        // Send in-app notification for new lead
        try
        {
            await notificationService.NotifyNewLeadAsync(
                businessId,
                createdLead.Id,
                createdLead.Name,
                "Inbound",
                cancellationToken);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(logger, ex, createdLead.Id, businessId);
        }

        return (createdLead, true);
    }

    private async Task<(Conversation conversation, bool isNew)> FindOrCreateConversationAsync(
        Guid businessId,
        Guid leadId,
        string channel,
        Guid? channelId,
        CancellationToken cancellationToken)
    {
        var existingConversation = await conversationRepository.GetOpenConversationAsync(
            businessId, leadId, channel, cancellationToken);

        if (existingConversation != null)
        {
            // Update channel ID if not set (for legacy conversations)
            if (existingConversation.ChannelId == null && channelId.HasValue)
            {
                existingConversation.ChannelId = channelId;
                await conversationRepository.UpdateAsync(existingConversation, cancellationToken);
            }

            return (existingConversation, false);
        }

        // Create new conversation with channel ID linked
        var newConversation = new Conversation
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            LeadId = leadId,
            Channel = channel,
            ChannelId = channelId,
            Status = ConversationStatus.Open,
            StartedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        var createdConversation = await conversationRepository.AddAsync(newConversation, cancellationToken);
        LogConversationCreated(logger, createdConversation.Id, businessId, leadId, channel);

        return (createdConversation, true);
    }

    private async Task<Message> StoreMessageAsync(
        Guid conversationId,
        string content,
        MessageDirection direction,
        CancellationToken cancellationToken)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Content = content,
            Direction = direction,
            SentAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        // Note: MessageRepository.AddAsync doesn't require businessId as it's inferred from conversation
        return await messageRepository.AddAsync(message, cancellationToken);
    }

    private void EnqueueAiQualificationJob(Guid businessId, Guid leadId, Guid messageId)
    {
        // Enqueue AI qualification job via background job service
        backgroundJobService.Enqueue<IAiQualificationJobService>(
            service => service.ProcessAiQualificationAsync(businessId, leadId, messageId));

        LogAiQualificationEnqueued(logger, leadId, messageId);
    }

    private void EnqueueAiAutoResponseJob(Guid businessId, Guid conversationId, Guid messageId, string channel)
    {
        // Enqueue AI auto-response job via background job service (critical queue)
        backgroundJobService.Enqueue<QualiFlow.Application.Features.AI.Interfaces.IAIAutoResponseJobService>(
            service => service.ProcessAiAutoResponseAsync(businessId, conversationId, messageId, channel));

        LogAiAutoResponseEnqueued(logger, businessId, conversationId, messageId, channel);
    }

    private async Task BroadcastNewMessageAsync(Guid businessId, Guid conversationId, Message message)
    {
        try
        {
            // Broadcast to all users in the business via SignalR
            // This will be picked up by the RealTimeBroadcastService
            await Task.CompletedTask; // Placeholder - actual SignalR broadcast handled by hub
            LogMessageBroadcast(logger, message.Id, conversationId, businessId);
        }
        catch (Exception ex)
        {
            LogBroadcastError(logger, ex, message.Id, conversationId);
        }
    }

    /// <inheritdoc />
    public async Task<InboundMessageResult> ProcessInboundInstagramAsync(
        string pageId,
        string senderId,
        string messageId,
        string? messageText,
        long timestamp,
        CancellationToken cancellationToken = default)
    {
        LogProcessingInboundInstagram(logger, senderId, pageId, messageId);

        // Step 1: Identify the business by the Instagram page ID
        var channel = await channelRepository.GetByExternalAccountIdAsync(
            pageId, ChannelType.Instagram, cancellationToken);
        if (channel == null)
        {
            LogMetaChannelNotFound(logger, pageId, "Instagram");
            return InboundMessageResult.FailureResult($"No Instagram channel found for page ID: {pageId}");
        }

        var businessId = channel.BusinessId;
        LogMetaBusinessIdentified(logger, businessId, pageId, "Instagram");

        // Step 2: Find or create lead by Instagram sender ID
        var (lead, isNewLead) = await FindOrCreateLeadByExternalIdAsync(
            businessId, senderId, "Instagram", cancellationToken);

        // Step 3: Find or create conversation (linked to Instagram channel)
        var (conversation, _) = await FindOrCreateConversationAsync(
            businessId, lead.Id, "Instagram", channel.Id, cancellationToken);

        // Step 4: Store the message
        var message = await StoreMessageAsync(
            conversation.Id, messageText ?? string.Empty, MessageDirection.Inbound, cancellationToken);

        // Step 5: Enqueue AI qualification job
        EnqueueAiQualificationJob(businessId, lead.Id, message.Id);

        // Step 6: Enqueue AI auto-response job
        EnqueueAiAutoResponseJob(businessId, conversation.Id, message.Id, "Instagram");

        // Step 7: Broadcast to business users via SignalR
        await BroadcastNewMessageAsync(businessId, conversation.Id, message);

        LogInboundInstagramProcessed(logger, message.Id, lead.Id, conversation.Id);

        return InboundMessageResult.SuccessResult(message.Id, lead.Id, conversation.Id, isNewLead);
    }

    /// <inheritdoc />
    public async Task<InboundMessageResult> ProcessInboundFacebookAsync(
        string pageId,
        string senderId,
        string messageId,
        string? messageText,
        long timestamp,
        CancellationToken cancellationToken = default)
    {
        LogProcessingInboundFacebook(logger, senderId, pageId, messageId);

        // Step 1: Identify the business by the Facebook page ID
        var channel = await channelRepository.GetByExternalAccountIdAsync(
            pageId, ChannelType.Facebook, cancellationToken);
        if (channel == null)
        {
            LogMetaChannelNotFound(logger, pageId, "Facebook");
            return InboundMessageResult.FailureResult($"No Facebook channel found for page ID: {pageId}");
        }

        var businessId = channel.BusinessId;
        LogMetaBusinessIdentified(logger, businessId, pageId, "Facebook");

        // Step 2: Find or create lead by Facebook sender ID (PSID)
        var (lead, isNewLead) = await FindOrCreateLeadByExternalIdAsync(
            businessId, senderId, "Facebook", cancellationToken);

        // Step 3: Find or create conversation (linked to Facebook channel)
        var (conversation, _) = await FindOrCreateConversationAsync(
            businessId, lead.Id, "Facebook", channel.Id, cancellationToken);

        // Step 4: Store the message
        var message = await StoreMessageAsync(
            conversation.Id, messageText ?? string.Empty, MessageDirection.Inbound, cancellationToken);

        // Step 5: Enqueue AI qualification job
        EnqueueAiQualificationJob(businessId, lead.Id, message.Id);

        // Step 6: Enqueue AI auto-response job
        EnqueueAiAutoResponseJob(businessId, conversation.Id, message.Id, "Facebook");

        // Step 7: Broadcast to business users via SignalR
        await BroadcastNewMessageAsync(businessId, conversation.Id, message);

        LogInboundFacebookProcessed(logger, message.Id, lead.Id, conversation.Id);

        return InboundMessageResult.SuccessResult(message.Id, lead.Id, conversation.Id, isNewLead);
    }

    private async Task<(Lead lead, bool isNew)> FindOrCreateLeadByExternalIdAsync(
        Guid businessId,
        string externalId,
        string source,
        CancellationToken cancellationToken)
    {
        // For Meta channels, we use the external ID (PSID/IGSID) as a unique identifier
        // We store it in the Phone field with a prefix to distinguish from phone numbers
        var externalIdAsPhone = $"{source}:{externalId}";

        var existingLead = await leadRepository.GetByPhoneNumberAsync(
            businessId, externalIdAsPhone, cancellationToken);

        if (existingLead != null)
        {
            return (existingLead, false);
        }

        // Create new lead
        var newLead = new Lead
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Name = $"Lead from {source}",
            Phone = externalIdAsPhone,
            Email = string.Empty, // Will be captured during qualification
            Status = LeadStatus.New,
            Score = 0,
            SourceChannel = source,
            CreatedAt = DateTime.UtcNow,
        };

        var createdLead = await leadRepository.AddForBusinessAsync(newLead, cancellationToken);
        LogLeadCreatedFromMeta(logger, createdLead.Id, businessId, source, externalId);

        // Apply auto-assignment rules for new lead
        await ApplyAutoAssignmentAsync(businessId, createdLead.Id, source, createdLead.Score, cancellationToken);

        // Send in-app notification for new lead
        try
        {
            await notificationService.NotifyNewLeadAsync(
                businessId,
                createdLead.Id,
                createdLead.Name,
                source,
                cancellationToken);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(logger, ex, createdLead.Id, businessId);
        }

        return (createdLead, true);
    }

    /// <summary>
    /// Applies auto-assignment rules to assign the lead to a user.
    /// </summary>
    private async Task ApplyAutoAssignmentAsync(
        Guid businessId,
        Guid leadId,
        string channel,
        int score,
        CancellationToken cancellationToken)
    {
        if (autoAssignmentService == null)
        {
            return;
        }

        try
        {
            var result = await autoAssignmentService.ApplyRulesAsync(
                businessId, leadId, channel, score, cancellationToken);

            if (result.WasAssigned)
            {
                logger.LogInformation(
                    "Lead {LeadId} auto-assigned to user {UserId} by rule '{RuleName}'",
                    leadId, result.AssignedToUserId, result.AppliedRuleName);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to apply auto-assignment rules for lead {LeadId}", leadId);
        }
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing inbound SMS from {From} to {To}, MessageSid: {MessageSid}")]
    private static partial void LogProcessingInboundSms(ILogger logger, string from, string to, string messageSid);

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing inbound voice call from {From} to {To}, CallSid: {CallSid}")]
    private static partial void LogProcessingInboundVoice(ILogger logger, string from, string to, string callSid);

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing inbound WhatsApp from {From} to {To}, MessageSid: {MessageSid}")]
    private static partial void LogProcessingInboundWhatsApp(ILogger logger, string from, string to, string messageSid);

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing voice recording {RecordingSid} for call {CallSid}")]
    private static partial void LogProcessingVoiceRecording(ILogger logger, string recordingSid, string callSid);

    [LoggerMessage(Level = LogLevel.Warning, Message = "No channel found for phone number: {PhoneNumber}")]
    private static partial void LogChannelNotFound(ILogger logger, string phoneNumber);

    [LoggerMessage(Level = LogLevel.Information, Message = "Business {BusinessId} identified for phone number {PhoneNumber}")]
    private static partial void LogBusinessIdentified(ILogger logger, Guid businessId, string phoneNumber);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created new lead {LeadId} for business {BusinessId} from phone {Phone}")]
    private static partial void LogLeadCreated(ILogger logger, Guid leadId, Guid businessId, string phone);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created new conversation {ConversationId} for business {BusinessId}, lead {LeadId}, channel {Channel}")]
    private static partial void LogConversationCreated(ILogger logger, Guid conversationId, Guid businessId, Guid leadId, string channel);

    [LoggerMessage(Level = LogLevel.Information, Message = "Inbound SMS processed: Message {MessageId}, Lead {LeadId}, Conversation {ConversationId}")]
    private static partial void LogInboundSmsProcessed(ILogger logger, Guid messageId, Guid leadId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Inbound voice call processed: Message {MessageId}, Lead {LeadId}, Conversation {ConversationId}")]
    private static partial void LogInboundVoiceProcessed(ILogger logger, Guid messageId, Guid leadId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Inbound WhatsApp processed: Message {MessageId}, Lead {LeadId}, Conversation {ConversationId}")]
    private static partial void LogInboundWhatsAppProcessed(ILogger logger, Guid messageId, Guid leadId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI qualification job enqueued for lead {LeadId}, message {MessageId}")]
    private static partial void LogAiQualificationEnqueued(ILogger logger, Guid leadId, Guid messageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI auto-response job enqueued for business {BusinessId}, conversation {ConversationId}, message {MessageId}, channel {Channel}")]
    private static partial void LogAiAutoResponseEnqueued(ILogger logger, Guid businessId, Guid conversationId, Guid messageId, string channel);

    [LoggerMessage(Level = LogLevel.Information, Message = "Message {MessageId} broadcast to conversation {ConversationId} for business {BusinessId}")]
    private static partial void LogMessageBroadcast(ILogger logger, Guid messageId, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to broadcast message {MessageId} to conversation {ConversationId}")]
    private static partial void LogBroadcastError(ILogger logger, Exception ex, Guid messageId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI qualification started for lead {LeadId}, message {MessageId}")]
    private static partial void LogAiQualificationStarted(ILogger logger, Guid leadId, Guid messageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI qualification completed for lead {LeadId}, message {MessageId}")]
    private static partial void LogAiQualificationCompleted(ILogger logger, Guid leadId, Guid messageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Transcription started for recording {RecordingSid}, call {CallSid}")]
    private static partial void LogTranscriptionStarted(ILogger logger, string recordingSid, string callSid);

    [LoggerMessage(Level = LogLevel.Information, Message = "Transcription completed for recording {RecordingSid}, call {CallSid}")]
    private static partial void LogTranscriptionCompleted(ILogger logger, string recordingSid, string callSid);

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing inbound Instagram from {SenderId} to page {PageId}, MessageId: {MessageId}")]
    private static partial void LogProcessingInboundInstagram(ILogger logger, string senderId, string pageId, string messageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing inbound Facebook from {SenderId} to page {PageId}, MessageId: {MessageId}")]
    private static partial void LogProcessingInboundFacebook(ILogger logger, string senderId, string pageId, string messageId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "No {ChannelType} channel found for page ID: {PageId}")]
    private static partial void LogMetaChannelNotFound(ILogger logger, string pageId, string channelType);

    [LoggerMessage(Level = LogLevel.Information, Message = "Business {BusinessId} identified for {ChannelType} page {PageId}")]
    private static partial void LogMetaBusinessIdentified(ILogger logger, Guid businessId, string pageId, string channelType);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created new lead {LeadId} for business {BusinessId} from {Source} ID {ExternalId}")]
    private static partial void LogLeadCreatedFromMeta(ILogger logger, Guid leadId, Guid businessId, string source, string externalId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Inbound Instagram processed: Message {MessageId}, Lead {LeadId}, Conversation {ConversationId}")]
    private static partial void LogInboundInstagramProcessed(ILogger logger, Guid messageId, Guid leadId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Inbound Facebook processed: Message {MessageId}, Lead {LeadId}, Conversation {ConversationId}")]
    private static partial void LogInboundFacebookProcessed(ILogger logger, Guid messageId, Guid leadId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send new lead notification for lead {LeadId} in business {BusinessId}")]
    private static partial void LogNotificationFailed(ILogger logger, Exception ex, Guid leadId, Guid businessId);
}
