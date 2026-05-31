namespace QualiFlow.Application.Features.Email.DTOs;

/// <summary>
/// Response DTO for email status.
/// </summary>
public class EmailStatusResponse
{
    /// <summary>
    /// Gets or sets the Resend email ID.
    /// </summary>
    public required string ResendEmailId { get; set; }

    /// <summary>
    /// Gets or sets the email status.
    /// </summary>
    public required string Status { get; set; }

    /// <summary>
    /// Gets or sets when the email was sent.
    /// </summary>
    public DateTime? SentAt { get; set; }

    /// <summary>
    /// Gets or sets when the email was delivered.
    /// </summary>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Gets or sets when the email was opened.
    /// </summary>
    public DateTime? OpenedAt { get; set; }

    /// <summary>
    /// Gets or sets when the email was clicked.
    /// </summary>
    public DateTime? ClickedAt { get; set; }
}

