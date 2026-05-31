using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an AI or manual qualification of a lead.
/// </summary>
public class Qualification : BaseEntity
{
    /// <summary>
    /// Gets or sets the lead ID this qualification is for.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the qualification score (0-100).
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Gets or sets the reasoning for the qualification score.
    /// </summary>
    public string Reasoning { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets when the qualification was performed.
    /// </summary>
    public DateTime QualifiedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets who performed the qualification ("AI" or user ID).
    /// </summary>
    public string QualifiedBy { get; set; } = "AI";

    // Navigation properties

    /// <summary>
    /// Gets or sets the lead this qualification is for.
    /// </summary>
    public Lead Lead { get; set; } = null!;
}

