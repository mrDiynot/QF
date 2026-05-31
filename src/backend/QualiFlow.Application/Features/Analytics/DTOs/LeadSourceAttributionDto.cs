namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Represents lead source attribution analytics.
/// </summary>
public record LeadSourceAttributionDto
{
    /// <summary>
    /// Gets the source channel name.
    /// </summary>
    public required string SourceChannel { get; init; }

    /// <summary>
    /// Gets the total number of leads from this source.
    /// </summary>
    public required int TotalLeads { get; init; }

    /// <summary>
    /// Gets the number of qualified leads from this source.
    /// </summary>
    public required int QualifiedLeads { get; init; }

    /// <summary>
    /// Gets the number of converted leads from this source.
    /// </summary>
    public required int ConvertedLeads { get; init; }

    /// <summary>
    /// Gets the conversion rate (percentage).
    /// </summary>
    public required decimal ConversionRate { get; init; }

    /// <summary>
    /// Gets the average lead score from this source.
    /// </summary>
    public required decimal AverageScore { get; init; }

    /// <summary>
    /// Gets the total revenue generated from this source.
    /// </summary>
    public required decimal TotalRevenue { get; init; }

    /// <summary>
    /// Gets the cost per lead (if available).
    /// </summary>
    public decimal? CostPerLead { get; init; }

    /// <summary>
    /// Gets the return on investment (ROI) percentage.
    /// </summary>
    public decimal? ROI { get; init; }
}

