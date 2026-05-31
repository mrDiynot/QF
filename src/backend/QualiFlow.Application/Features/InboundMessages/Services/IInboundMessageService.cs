using QualiFlow.Application.Features.InboundMessages.DTOs;

namespace QualiFlow.Application.Features.InboundMessages.Services;

/// <summary>
/// Service interface for processing inbound messages from all channels.
/// This is the central service that handles lead creation, conversation management,
/// and AI qualification triggering for all inbound interactions.
/// </summary>
public interface IInboundMessageService
{
    /// <summary>
    /// Processes an inbound SMS message from Twilio webhook.
    /// </summary>
    /// <param name="payload">The Twilio SMS webhook payload.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of processing the inbound message.</returns>
    /// <remarks>
    /// This method:
    /// 1. Identifies the Business by the receiving phone number.
    /// 2. Looks up or creates a Lead by the sender phone number.
    /// 3. Looks up or creates a Conversation for the Lead + Channel.
    /// 4. Stores the Message with all metadata.
    /// 5. Enqueues AI qualification via Hangfire.
    /// 6. Broadcasts to Business users via SignalR.
    /// </remarks>
    Task<InboundMessageResult> ProcessInboundSmsAsync(
        TwilioSmsWebhookPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes an inbound voice call initiation from Twilio webhook.
    /// </summary>
    /// <param name="payload">The Twilio Voice webhook payload.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result containing TwiML to record the call.</returns>
    Task<InboundMessageResult> ProcessInboundVoiceAsync(
        TwilioVoiceWebhookPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes a voice recording completion from Twilio webhook.
    /// </summary>
    /// <param name="payload">The Twilio recording payload.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    /// <remarks>
    /// This method:
    /// 1. Stores the recording URL in the Message entity.
    /// 2. Enqueues a Hangfire job for Whisper transcription.
    /// </remarks>
    Task ProcessVoiceRecordingAsync(
        TwilioRecordingPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes an inbound WhatsApp message from Twilio webhook.
    /// </summary>
    /// <param name="payload">The Twilio WhatsApp webhook payload.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of processing the inbound message.</returns>
    Task<InboundMessageResult> ProcessInboundWhatsAppAsync(
        TwilioWhatsAppWebhookPayload payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes an inbound Instagram message from Meta webhook.
    /// </summary>
    /// <param name="pageId">The Instagram page/account ID.</param>
    /// <param name="senderId">The sender's Instagram scoped ID (IGSID).</param>
    /// <param name="messageId">The unique message ID.</param>
    /// <param name="messageText">The message text content.</param>
    /// <param name="timestamp">The message timestamp.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of processing the inbound message.</returns>
    Task<InboundMessageResult> ProcessInboundInstagramAsync(
        string pageId,
        string senderId,
        string messageId,
        string? messageText,
        long timestamp,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes an inbound Facebook Messenger message from Meta webhook.
    /// </summary>
    /// <param name="pageId">The Facebook page ID.</param>
    /// <param name="senderId">The sender's page-scoped ID (PSID).</param>
    /// <param name="messageId">The unique message ID.</param>
    /// <param name="messageText">The message text content.</param>
    /// <param name="timestamp">The message timestamp.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of processing the inbound message.</returns>
    Task<InboundMessageResult> ProcessInboundFacebookAsync(
        string pageId,
        string senderId,
        string messageId,
        string? messageText,
        long timestamp,
        CancellationToken cancellationToken = default);
}

