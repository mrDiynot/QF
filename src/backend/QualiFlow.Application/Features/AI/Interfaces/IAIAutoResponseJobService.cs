namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Interface for the AI auto-response background job service.
/// Processed via Hangfire when inbound messages are received.
/// </summary>
public interface IAIAutoResponseJobService
{
    /// <summary>
    /// Processes an inbound message and generates an AI auto-response.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="messageId">The inbound message ID.</param>
    /// <param name="channel">The communication channel (SMS, WhatsApp, etc.).</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ProcessAiAutoResponseAsync(Guid businessId, Guid conversationId, Guid messageId, string channel);
}
