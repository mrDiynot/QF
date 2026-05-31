using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.DTOs;

/// <summary>
/// Response DTO for lead data.
/// </summary>
public class LeadResponse
{
    /// <summary>
    /// Gets or sets the lead's unique identifier.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant ID).
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead's name.
    /// </summary>
    /// <example>John Doe.</example>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the lead's email address.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the lead's phone number.
    /// </summary>
    /// <example>+1234567890.</example>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the lead's current status.
    /// </summary>
    /// <example>Qualified.</example>
    public required LeadStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the lead's qualification score (0-100).
    /// </summary>
    /// <example>85.</example>
    public required int Score { get; set; }

    /// <summary>
    /// Gets or sets the Budget score from BANT qualification (0-100).
    /// </summary>
    public int? BudgetScore { get; set; }

    /// <summary>
    /// Gets or sets the Authority score from BANT qualification (0-100).
    /// </summary>
    public int? AuthorityScore { get; set; }

    /// <summary>
    /// Gets or sets the Need score from BANT qualification (0-100).
    /// </summary>
    public int? NeedScore { get; set; }

    /// <summary>
    /// Gets or sets the Timeline score from BANT qualification (0-100).
    /// </summary>
    public int? TimelineScore { get; set; }

    /// <summary>
    /// Gets or sets the source channel where the lead was captured.
    /// </summary>
    /// <example>chat_widget.</example>
    public required string SourceChannel { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON string.
    /// </summary>
    /// <example>{"utm_source": "google"}.</example>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the lead was created (UTC).
    /// </summary>
    /// <example>2025-12-03T10:30:00Z.</example>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the lead was last updated (UTC).
    /// </summary>
    /// <example>2025-12-03T14:45:00Z.</example>
    public DateTime? UpdatedAt { get; set; }
}

