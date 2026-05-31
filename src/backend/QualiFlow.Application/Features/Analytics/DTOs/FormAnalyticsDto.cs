namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// DTO for form-specific analytics.
/// </summary>
public record FormAnalyticsDto
{
    /// <summary>
    /// Gets the form ID.
    /// </summary>
    public Guid FormId { get; init; }

    /// <summary>
    /// Gets the form name.
    /// </summary>
    public string FormName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the total number of views.
    /// </summary>
    public int TotalViews { get; init; }

    /// <summary>
    /// Gets the total number of submissions.
    /// </summary>
    public int TotalSubmissions { get; init; }

    /// <summary>
    /// Gets the completion rate (0-1).
    /// </summary>
    public decimal CompletionRate { get; init; }

    /// <summary>
    /// Gets the average time to complete (in seconds).
    /// </summary>
    public int AvgCompletionTime { get; init; }

    /// <summary>
    /// Gets the bounce rate (0-1).
    /// </summary>
    public decimal BounceRate { get; init; }

    /// <summary>
    /// Gets the timestamp of the last submission.
    /// </summary>
    public DateTime? LastSubmissionAt { get; init; }
}

/// <summary>
/// DTO for A/B test results.
/// </summary>
public record AbTestResultDto
{
    /// <summary>
    /// Gets the test ID.
    /// </summary>
    public Guid TestId { get; init; }

    /// <summary>
    /// Gets the test name.
    /// </summary>
    public string TestName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the test status.
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Gets the variants in this test.
    /// </summary>
    public IReadOnlyList<AbTestVariantResultDto> Variants { get; init; } = Array.Empty<AbTestVariantResultDto>();

    /// <summary>
    /// Gets the winner variant identifier.
    /// </summary>
    public string? WinnerVariant { get; init; }

    /// <summary>
    /// Gets the confidence level (0-100).
    /// </summary>
    public decimal? ConfidenceLevel { get; init; }

    /// <summary>
    /// Gets when the test started.
    /// </summary>
    public DateTime? StartedAt { get; init; }

    /// <summary>
    /// Gets when the test ended.
    /// </summary>
    public DateTime? EndedAt { get; init; }
}

/// <summary>
/// DTO for A/B test variant results.
/// </summary>
public record AbTestVariantResultDto
{
    /// <summary>
    /// Gets the variant ID ('A' or 'B').
    /// </summary>
    public string VariantId { get; init; } = string.Empty;

    /// <summary>
    /// Gets the variant name.
    /// </summary>
    public string VariantName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the form ID for this variant.
    /// </summary>
    public Guid FormId { get; init; }

    /// <summary>
    /// Gets the number of views.
    /// </summary>
    public int Views { get; init; }

    /// <summary>
    /// Gets the number of conversions.
    /// </summary>
    public int Conversions { get; init; }

    /// <summary>
    /// Gets the conversion rate (0-1).
    /// </summary>
    public decimal ConversionRate { get; init; }

    /// <summary>
    /// Gets the average completion time (in seconds).
    /// </summary>
    public int? AvgCompletionTime { get; init; }

    /// <summary>
    /// Gets the bounce rate (0-1).
    /// </summary>
    public decimal? BounceRate { get; init; }
}

/// <summary>
/// DTO for form field drop-off analysis.
/// </summary>
public record FieldDropOffDto
{
    /// <summary>
    /// Gets the field identifier.
    /// </summary>
    public string FieldId { get; init; } = string.Empty;

    /// <summary>
    /// Gets the field label.
    /// </summary>
    public string FieldLabel { get; init; } = string.Empty;

    /// <summary>
    /// Gets the field type.
    /// </summary>
    public string FieldType { get; init; } = string.Empty;

    /// <summary>
    /// Gets the number of views that reached this field.
    /// </summary>
    public int ViewsReached { get; init; }

    /// <summary>
    /// Gets the number of abandons at this field.
    /// </summary>
    public int Abandons { get; init; }

    /// <summary>
    /// Gets the drop-off rate at this field (0-1).
    /// </summary>
    public decimal DropOffRate { get; init; }

    /// <summary>
    /// Gets the average time spent on this field (in seconds).
    /// </summary>
    public int? AvgTimeSpent { get; init; }

    /// <summary>
    /// Gets the number of validation errors at this field.
    /// </summary>
    public int ValidationErrors { get; init; }
}

/// <summary>
/// DTO for form submission timeline data point.
/// </summary>
public record FormSubmissionTimelineDto
{
    /// <summary>
    /// Gets the date.
    /// </summary>
    public DateTime Date { get; init; }

    /// <summary>
    /// Gets the number of views on this date.
    /// </summary>
    public int Views { get; init; }

    /// <summary>
    /// Gets the number of submissions on this date.
    /// </summary>
    public int Submissions { get; init; }

    /// <summary>
    /// Gets the completion rate for this date (0-1).
    /// </summary>
    public decimal CompletionRate { get; init; }
}
