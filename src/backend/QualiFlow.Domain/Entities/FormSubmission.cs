using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a submission of a form by a visitor/lead.
/// </summary>
public class FormSubmission : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the form ID this submission belongs to.
    /// </summary>
    public Guid FormId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID created from this submission (if any).
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the submitted data as JSON.
    /// Contains key-value pairs matching form field names.
    /// </summary>
    public string SubmittedData { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the IP address of the submitter.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the user agent string of the submitter.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the referring URI.
    /// </summary>
    public Uri? ReferrerUrl { get; set; }

    /// <summary>
    /// Gets or sets when the submission was made.
    /// </summary>
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether this submission has been processed.
    /// </summary>
    public bool IsProcessed { get; set; }

    /// <summary>
    /// Gets or sets when the submission was processed.
    /// </summary>
    public DateTime? ProcessedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this submission belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the form this submission is for.
    /// </summary>
    public Form Form { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lead created from this submission.
    /// </summary>
    public Lead? Lead { get; set; }
}

