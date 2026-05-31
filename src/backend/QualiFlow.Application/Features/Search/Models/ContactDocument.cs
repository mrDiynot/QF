using Nest;

namespace QualiFlow.Application.Features.Search.Models;

/// <summary>
/// Elasticsearch document for Contact entity.
/// </summary>
[ElasticsearchType(IdProperty = nameof(Id))]
public class ContactDocument
{
    [Keyword]
    public required string Id { get; init; }

    [Keyword]
    public required string BusinessId { get; init; }

    [Text(Analyzer = "standard")]
    public required string FirstName { get; init; }

    [Text(Analyzer = "standard")]
    public required string LastName { get; init; }

    [Keyword]
    public required string Email { get; init; }

    [Keyword]
    public string? PhoneNumber { get; init; }

    [Text(Analyzer = "standard")]
    public string? Company { get; init; }

    [Keyword]
    public required string Status { get; init; }

    [Keyword]
    public string? AssignedToUserId { get; init; }

    [Nest.Date]
    public required DateTime CreatedAt { get; init; }

    [Nest.Date]
    public DateTime? UpdatedAt { get; init; }
}

