using Nest;

namespace QualiFlow.Application.Features.Search.Models;

/// <summary>
/// Elasticsearch document for Message entity.
/// </summary>
[ElasticsearchType(IdProperty = nameof(Id))]
public class MessageDocument
{
    [Keyword]
    public required string Id { get; init; }

    [Keyword]
    public required string BusinessId { get; init; }

    [Keyword]
    public required string ConversationId { get; init; }

    [Text(Analyzer = "standard")]
    public required string Content { get; init; }

    [Keyword]
    public required string Direction { get; init; }

    [Keyword]
    public required string Channel { get; init; }

    [Nest.Date]
    public required DateTime SentAt { get; init; }

    [Nest.Boolean]
    public required bool IsRead { get; init; }
}

