using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Response DTO for form data.
/// </summary>
public record FormResponse
{
    /// <summary>
    /// Gets the form's unique identifier.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the business (tenant) ID.
    /// </summary>
    public required Guid BusinessId { get; init; }

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
    /// Gets the form status.
    /// </summary>
    public required FormStatus Status { get; init; }

    /// <summary>
    /// Gets a value indicating whether the form is active.
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Gets the form's unique slug for URL access.
    /// </summary>
    public required string Slug { get; init; }

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
    public required bool NotifyOnSubmission { get; init; }

    /// <summary>
    /// Gets the notification email addresses.
    /// </summary>
    public string? NotificationEmails { get; init; }

    /// <summary>
    /// Gets the total number of submissions.
    /// </summary>
    public int SubmissionCount { get; init; }

    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the last update timestamp.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }
}

