namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Request DTO for creating a new form submission.
/// This is typically submitted by end-users filling out a form.
/// </summary>
public record CreateFormSubmissionRequest
{
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
}

