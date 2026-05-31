using Nest;

namespace QualiFlow.Application.Features.Search.Models;

/// <summary>
/// Elasticsearch document for Conversation entity.
/// </summary>
[ElasticsearchType(IdProperty = nameof(Id))]
public class ConversationDocument
{
    [Keyword]
    public required string Id { get; init; }

    [Keyword]
    public required string BusinessId { get; init; }

    [Keyword]
    public required string LeadId { get; init; }

    [Text(Analyzer = "standard")]
    public required string LeadName { get; init; }

    [Keyword]
    public required string Channel { get; init; }

    [Keyword]
    public required string Status { get; init; }

    [Keyword]
    public string? AssignedToUserId { get; init; }

    [Text(Analyzer = "standard")]
    public string? AssignedToUserName { get; init; }

    [Nest.Date]
    public required DateTime CreatedAt { get; init; }

    [Nest.Date]
    public DateTime? UpdatedAt { get; init; }
}

