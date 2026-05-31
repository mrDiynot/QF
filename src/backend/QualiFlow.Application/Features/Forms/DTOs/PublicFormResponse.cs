namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Response DTO for public form retrieval (anonymous access).
/// Contains only the information needed to render the form.
/// </summary>
public record PublicFormResponse
{
    /// <summary>
    /// Gets the form ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the form name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the form description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the form fields as JSON.
    /// </summary>
    public string Fields { get; init; } = "[]";

    /// <summary>
    /// Gets the form styling as JSON.
    /// </summary>
    public string? Styling { get; init; }

    /// <summary>
    /// Gets the thank you message shown after submission.
    /// </summary>
    public string? ThankYouMessage { get; init; }

    /// <summary>
    /// Gets the redirect URL after submission.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? RedirectUrl { get; init; }
#pragma warning restore CA1056
}

/// <summary>
/// Request DTO for public form submission (anonymous access).
/// </summary>
public record PublicFormSubmissionRequest
{
    /// <summary>
    /// Gets the submitted form data as JSON.
    /// </summary>
    public required string Data { get; init; }
}

/// <summary>
/// Response DTO for public form submission confirmation.
/// </summary>
public record PublicFormSubmissionResponse
{
    /// <summary>
    /// Gets a value indicating whether the submission was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the submission ID.
    /// </summary>
    public Guid SubmissionId { get; init; }

    /// <summary>
    /// Gets the thank you message to display.
    /// </summary>
    public string? ThankYouMessage { get; init; }

    /// <summary>
    /// Gets the redirect URL (if configured).
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? RedirectUrl { get; init; }
#pragma warning restore CA1056
}

