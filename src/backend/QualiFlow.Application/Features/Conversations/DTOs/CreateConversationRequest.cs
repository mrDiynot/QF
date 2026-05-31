using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Request DTO for creating a new conversation.
/// </summary>
public class CreateConversationRequest
{
    /// <summary>
    /// Gets or sets the lead ID this conversation belongs to.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the communication channel for this conversation.
    /// </summary>
    /// <example>chat_widget.</example>
    public required string Channel { get; set; }

    /// <summary>
    /// Gets or sets the conversation status (optional, defaults to Open).
    /// </summary>
    /// <example>Open.</example>
    public ConversationStatus? Status { get; set; }
}

