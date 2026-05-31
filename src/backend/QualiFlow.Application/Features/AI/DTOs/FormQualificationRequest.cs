namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for form-based BANT qualification.
/// </summary>
public record FormQualificationRequest
{
    /// <summary>
    /// Gets the business ID for multi-tenancy.
    /// </summary>
    public required Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the form submission ID.
    /// </summary>
    public required Guid SubmissionId { get; init; }

    /// <summary>
    /// Gets the lead ID associated with the submission.
    /// </summary>
    public required Guid LeadId { get; init; }

    /// <summary>
    /// Gets the submitted form data as JSON string.
    /// </summary>
    public required string SubmittedDataJson { get; init; }

    /// <summary>
    /// Gets the form field definitions as JSON string.
    /// </summary>
    public required string FormFieldsJson { get; init; }
}

/// <summary>
/// Result of form-based BANT qualification.
/// </summary>
public record FormQualificationResult
{
    /// <summary>
    /// Gets the overall qualification score (0-100).
    /// </summary>
    public int OverallScore { get; init; }

    /// <summary>
    /// Gets budget score (0-100).
    /// </summary>
    public int BudgetScore { get; init; }

    /// <summary>
    /// Gets budget signals extracted from form fields.
    /// </summary>
    public IReadOnlyList<string> BudgetSignals { get; init; } = [];

    /// <summary>
    /// Gets authority score (0-100).
    /// </summary>
    public int AuthorityScore { get; init; }

    /// <summary>
    /// Gets authority signals extracted from form fields.
    /// </summary>
    public IReadOnlyList<string> AuthoritySignals { get; init; } = [];

    /// <summary>
    /// Gets need score (0-100).
    /// </summary>
    public int NeedScore { get; init; }

    /// <summary>
    /// Gets need signals extracted from form fields.
    /// </summary>
    public IReadOnlyList<string> NeedSignals { get; init; } = [];

    /// <summary>
    /// Gets timeline score (0-100).
    /// </summary>
    public int TimelineScore { get; init; }

    /// <summary>
    /// Gets timeline signals extracted from form fields.
    /// </summary>
    public IReadOnlyList<string> TimelineSignals { get; init; } = [];

    /// <summary>
    /// Gets confidence level of the qualification (0.0-1.0).
    /// </summary>
    public float Confidence { get; init; }

    /// <summary>
    /// Gets a value indicating whether whether the lead is qualified based on threshold.
    /// </summary>
    public bool IsQualified { get; init; }

    /// <summary>
    /// Gets reasoning for the qualification result.
    /// </summary>
    public string Reasoning { get; init; } = string.Empty;

    /// <summary>
    /// Gets list of BANT categories that are missing data.
    /// </summary>
    public IReadOnlyList<string> MissingBantCategories { get; init; } = [];

    /// <summary>
    /// Gets suggested follow-up questions to gather missing BANT data.
    /// </summary>
    public IReadOnlyList<string> SuggestedFollowUpQuestions { get; init; } = [];
}

/// <summary>
/// Represents a single form field extraction result.
/// </summary>
public record FormFieldBantExtraction
{
    /// <summary>
    /// Gets the form field key/name.
    /// </summary>
    public required string FieldKey { get; init; }

    /// <summary>
    /// Gets the submitted value.
    /// </summary>
    public required string Value { get; init; }

    /// <summary>
    /// Gets the BANT category this field maps to (Budget, Authority, Need, Timeline).
    /// </summary>
    public required string BantCategory { get; init; }

    /// <summary>
    /// Gets the score contribution from this field (0-100).
    /// </summary>
    public int ScoreContribution { get; init; }

    /// <summary>
    /// Gets the matching pattern that triggered the mapping.
    /// </summary>
    public string? MatchedPattern { get; init; }
}

