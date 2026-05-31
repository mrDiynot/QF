namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Request DTO for creating a new form.
/// </summary>
public record CreateFormRequest
{
    /// <summary>
    /// Gets the form name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the form description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the form fields as JSON.
    /// </summary>
    public required string Fields { get; init; }

    /// <summary>
    /// Gets the form styling as JSON.
    /// </summary>
    public string? Styling { get; init; }

    /// <summary>
    /// Gets the form's unique slug for URL access.
    /// If not provided, will be generated from the name.
    /// </summary>
    public string? Slug { get; init; }

    /// <summary>
    /// Gets the thank you message shown after submission.
    /// </summary>
    public string? ThankYouMessage { get; init; }

    /// <summary>
    /// Gets the redirect URI after submission.
    /// </summary>
    public Uri? RedirectUrl { get; init; }

    /// <summary>
    /// Gets a value indicating whether to notify on submission.
    /// </summary>
    public bool NotifyOnSubmission { get; init; }

    /// <summary>
    /// Gets the notification email addresses (comma-separated).
    /// </summary>
    public string? NotificationEmails { get; init; }
}

