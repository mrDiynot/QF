using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Request DTO for updating an existing form.
/// </summary>
public record UpdateFormRequest
{
    /// <summary>
    /// Gets the form name.
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// Gets the form description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the form fields as JSON.
    /// </summary>
    public string? Fields { get; init; }

    /// <summary>
    /// Gets the form styling as JSON.
    /// </summary>
    public string? Styling { get; init; }

    /// <summary>
    /// Gets the form status.
    /// </summary>
    public FormStatus? Status { get; init; }

    /// <summary>
    /// Gets a value indicating whether the form is active.
    /// </summary>
    public bool? IsActive { get; init; }

    /// <summary>
    /// Gets the form's unique slug for URL access.
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
    public bool? NotifyOnSubmission { get; init; }

    /// <summary>
    /// Gets the notification email addresses (comma-separated).
    /// </summary>
    public string? NotificationEmails { get; init; }
}

