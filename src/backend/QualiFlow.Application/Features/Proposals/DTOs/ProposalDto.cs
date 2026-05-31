namespace QualiFlow.Application.Features.Proposals.DTOs;

/// <summary>
/// Data transfer object for proposals.
/// </summary>
public record ProposalDto
{
    public Guid Id { get; init; }
    public Guid? LeadId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ClientName { get; init; } = string.Empty;
    public string? ClientEmail { get; init; }
    public string? ClientCompany { get; init; }
    public string Status { get; init; } = "draft";
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Content { get; init; } = "{}";
    public string? TemplateId { get; init; }
    public DateTime? ValidUntil { get; init; }
    public DateTime? SentAt { get; init; }
    public DateTime? ViewedAt { get; init; }
    public int ViewCount { get; init; }
    public DateTime? AcceptedAt { get; init; }
    public DateTime? DeclinedAt { get; init; }
    public string? DeclineReason { get; init; }
    public bool IsSigned { get; init; }
    public string? SignerName { get; init; }
    public string? Notes { get; init; }
#pragma warning disable CA1056
    public string? PublicUrl { get; init; }
#pragma warning restore CA1056
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create a proposal.
/// </summary>
public record CreateProposalRequest
{
    public Guid? LeadId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ClientName { get; init; } = string.Empty;
    public string? ClientEmail { get; init; }
    public string? ClientCompany { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Content { get; init; } = "{}";
    public string? TemplateId { get; init; }
    public DateTime? ValidUntil { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Request to update a proposal.
/// </summary>
public record UpdateProposalRequest
{
    public string? Title { get; init; }
    public string? ClientName { get; init; }
    public string? ClientEmail { get; init; }
    public string? ClientCompany { get; init; }
    public string? Status { get; init; }
    public decimal? Amount { get; init; }
    public string? Currency { get; init; }
    public string? Content { get; init; }
    public DateTime? ValidUntil { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Request to accept a proposal (public).
/// </summary>
public record AcceptProposalRequest
{
    public string SignerName { get; init; } = string.Empty;
    public string? SignatureData { get; init; }
}

/// <summary>
/// Request to decline a proposal (public).
/// </summary>
public record DeclineProposalRequest
{
    public string? Reason { get; init; }
}

/// <summary>
/// Proposal statistics.
/// </summary>
public record ProposalStats
{
    public int TotalProposals { get; init; }
    public int DraftCount { get; init; }
    public int SentCount { get; init; }
    public int ViewedCount { get; init; }
    public int AcceptedCount { get; init; }
    public int DeclinedCount { get; init; }
    public decimal TotalValue { get; init; }
    public decimal AcceptedValue { get; init; }
    public decimal AcceptanceRate { get; init; }
}
