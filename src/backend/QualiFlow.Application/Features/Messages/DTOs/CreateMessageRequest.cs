using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Messages.DTOs;

/// <summary>
/// Request DTO for creating a new message.
/// </summary>
public class CreateMessageRequest
{
    /// <summary>
    /// Gets or sets the conversation ID this message belongs to.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    /// <example>Hello, I'm interested in your product.</example>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the message direction (Inbound or Outbound).
    /// </summary>
    /// <example>Inbound.</example>
    public required MessageDirection Direction { get; set; }
}

