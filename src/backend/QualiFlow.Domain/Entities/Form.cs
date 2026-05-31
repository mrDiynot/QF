using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a customizable form for lead capture.
/// Forms can be embedded on websites or shared via link.
/// </summary>
public class Form : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the form name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the form description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the form fields as JSON.
    /// Contains field definitions: type, label, required, options, validation rules.
    /// </summary>
    public string Fields { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the form styling configuration as JSON.
    /// Contains colors, fonts, layout settings.
    /// </summary>
    public string? Styling { get; set; }

    /// <summary>
    /// Gets or sets the form status.
    /// </summary>
    public FormStatus Status { get; set; } = FormStatus.Draft;

    /// <summary>
    /// Gets or sets a value indicating whether the form is active and accepting submissions.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the unique slug for the form URL.
    /// </summary>
    public string? Slug { get; set; }

    /// <summary>
    /// Gets or sets the thank you message shown after submission.
    /// </summary>
    public string? ThankYouMessage { get; set; }

    /// <summary>
    /// Gets or sets the redirect URI after submission.
    /// </summary>
    public Uri? RedirectUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to send email notification on submission.
    /// </summary>
    public bool NotifyOnSubmission { get; set; }

    /// <summary>
    /// Gets or sets the email addresses to notify (comma-separated).
    /// </summary>
    public string? NotificationEmails { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this form belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the submissions for this form.
    /// </summary>
    public ICollection<FormSubmission> Submissions { get; } = [];
}

