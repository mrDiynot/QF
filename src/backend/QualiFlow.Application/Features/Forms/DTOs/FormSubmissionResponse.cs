namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Response DTO for form submission data.
/// </summary>
public record FormSubmissionResponse
{
    /// <summary>
    /// Gets the submission's unique identifier.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the business (tenant) ID.
    /// </summary>
    public required Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the form ID.
    /// </summary>
    public required Guid FormId { get; init; }

    /// <summary>
    /// Gets the form name.
    /// </summary>
    public string? FormName { get; init; }

    /// <summary>
    /// Gets the lead ID if a lead was created.
    /// </summary>
    public Guid? LeadId { get; init; }

    /// <summary>
    /// Gets the lead name if a lead was created.
    /// </summary>
    public string? LeadName { get; init; }

    /// <summary>
    /// Gets the submitted data as JSON.
    /// </summary>
    public required string SubmittedData { get; init; }

    /// <summary>
    /// Gets the submitter's IP address.
    /// </summary>
    public string? IpAddress { get; init; }

    /// <summary>
    /// Gets the submitter's user agent.
    /// </summary>
    public string? UserAgent { get; init; }

    /// <summary>
    /// Gets the referrer URI.
    /// </summary>
    public Uri? ReferrerUrl { get; init; }

    /// <summary>
    /// Gets the submission timestamp.
    /// </summary>
    public required DateTime SubmittedAt { get; init; }

    /// <summary>
    /// Gets a value indicating whether the submission has been processed.
    /// </summary>
    public required bool IsProcessed { get; init; }

    /// <summary>
    /// Gets the processing timestamp.
    /// </summary>
    public DateTime? ProcessedAt { get; init; }
}

