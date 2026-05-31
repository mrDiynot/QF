using Nest;

namespace QualiFlow.Application.Features.Search.Models;

/// <summary>
/// Elasticsearch document for Lead entity.
/// Optimized for full-text search and filtering.
/// </summary>
[ElasticsearchType(IdProperty = nameof(Id))]
public class LeadDocument
{
    [Keyword]
    public required string Id { get; init; }

    [Keyword]
    public required string BusinessId { get; init; }

    [Text(Analyzer = "standard")]
    public required string Name { get; init; }

    [Keyword]
    public required string Email { get; init; }

    [Keyword]
    public string? Phone { get; init; }

    [Keyword]
    public required string Status { get; init; }

    [Number(NumberType.Integer)]
    public required int Score { get; init; }

    [Keyword]
    public string? AssignedToUserId { get; init; }

    [Text(Analyzer = "standard")]
    public string? AssignedToUserName { get; init; }

    [Nest.Date]
    public required DateTime CreatedAt { get; init; }

    [Nest.Date]
    public DateTime? UpdatedAt { get; init; }
}

