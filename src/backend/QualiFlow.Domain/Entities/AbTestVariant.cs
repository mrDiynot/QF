namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a variant (A or B) in an A/B test.
/// </summary>
public class AbTestVariant
{
    /// <summary>
    /// Gets or sets the unique identifier for the variant.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the A/B test ID this variant belongs to.
    /// </summary>
    public Guid AbTestId { get; set; }

    /// <summary>
    /// Gets or sets the variant identifier ('A' or 'B').
    /// </summary>
    public string VariantId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the variant name.
    /// </summary>
    public string VariantName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the form ID for this variant.
    /// </summary>
    public Guid FormId { get; set; }

    /// <summary>
    /// Gets or sets the number of views this variant received.
    /// </summary>
    public int Views { get; set; }

    /// <summary>
    /// Gets or sets the number of submissions/conversions for this variant.
    /// </summary>
    public int Conversions { get; set; }

    /// <summary>
    /// Gets or sets the conversion rate (0-1, e.g., 0.25 = 25%).
    /// </summary>
    public decimal ConversionRate { get; set; }

    /// <summary>
    /// Gets or sets the average time to complete (in seconds).
    /// </summary>
    public int? AvgCompletionTime { get; set; }

    /// <summary>
    /// Gets or sets the bounce rate (0-1).
    /// </summary>
    public decimal? BounceRate { get; set; }

    /// <summary>
    /// Gets or sets variant-specific configuration as JSON.
    /// </summary>
    public string? Configuration { get; set; }

    /// <summary>
    /// Gets or sets when the variant was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the variant was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the A/B test this variant belongs to.
    /// </summary>
    public AbTest AbTest { get; set; } = null!;

    /// <summary>
    /// Gets or sets the form for this variant.
    /// </summary>
    public Form Form { get; set; } = null!;
}
