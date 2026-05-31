namespace QualiFlow.Domain.Entities;

/// <summary>
/// A/B test status enumeration.
/// </summary>
public enum AbTestStatus
{
    /// <summary>
    /// Test is in draft state.
    /// </summary>
    Draft,

    /// <summary>
    /// Test is active and collecting data.
    /// </summary>
    Active,

    /// <summary>
    /// Test is paused.
    /// </summary>
    Paused,

    /// <summary>
    /// Test has been completed.
    /// </summary>
    Completed,

    /// <summary>
    /// Test was cancelled without completion.
    /// </summary>
    Cancelled,

    /// <summary>
    /// Test has been archived.
    /// </summary>
    Archived
}

/// <summary>
/// Gets or Represents an A/B test for form optimization.
/// </summary>
public class AbTest
{
    /// <summary>
    /// Gets or sets the unique identifier for the A/B test.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the business ID that owns this test.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the test name.
    /// </summary>
    public string TestName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the test description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the hypothesis being tested.
    /// </summary>
    public string? Hypothesis { get; set; }

    /// <summary>
    /// Gets or sets the test status.
    /// </summary>
    public AbTestStatus Status { get; set; } = AbTestStatus.Draft;

    /// <summary>
    /// Gets or sets when the test started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the test ended.
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the winner variant ('A' or 'B', null if no winner yet).
    /// </summary>
    public string? WinnerVariant { get; set; }

    /// <summary>
    /// Gets or sets the confidence level (0-100) for the winner.
    /// </summary>
    public decimal? ConfidenceLevel { get; set; }

    /// <summary>
    /// Gets or sets the statistical significance level (0-1, e.g., 0.95 for 95%).
    /// </summary>
    public decimal? StatisticalSignificance { get; set; }

    /// <summary>
    /// Gets or sets the traffic split percentage for variant A (0-100).
    /// Variant B gets the remainder (100 - TrafficSplitPercentage).
    /// </summary>
    public int TrafficSplitPercentage { get; set; } = 50;

    /// <summary>
    /// Gets or sets the minimum sample size before declaring a winner.
    /// </summary>
    public int? MinimumSampleSize { get; set; }

    /// <summary>
    /// Gets or sets test configuration as JSON (custom settings, goals, etc.).
    /// </summary>
    public string? Configuration { get; set; }

    /// <summary>
    /// Gets or sets when the test was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the test was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the test was deleted (soft delete).
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business that owns this test.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the collection of test variants.
    /// </summary>
    public ICollection<AbTestVariant> Variants { get; init; } = new List<AbTestVariant>();
}
