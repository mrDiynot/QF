namespace QualiFlow.Application.Features.Email.DTOs;

/// <summary>
/// Request DTO for sending bulk emails.
/// </summary>
public class SendBulkEmailRequest
{
    /// <summary>
    /// Gets or sets the list of recipient email addresses.
    /// </summary>
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for deserialization
#pragma warning disable CA1002 // Do not expose generic lists - DTOs use List for JSON serialization
#pragma warning disable MA0016 // Prefer using collection abstraction instead of implementation - List required for JSON serialization
    public required List<EmailRecipient> Recipients { get; set; }
#pragma warning restore MA0016
#pragma warning restore CA1002
#pragma warning restore CA2227

    /// <summary>
    /// Gets or sets the sender email address.
    /// </summary>
    public required string FromEmail { get; set; }

    /// <summary>
    /// Gets or sets the sender name.
    /// </summary>
    public string? FromName { get; set; }

    /// <summary>
    /// Gets or sets the email subject.
    /// </summary>
    public required string Subject { get; set; }

    /// <summary>
    /// Gets or sets the HTML email body.
    /// </summary>
    public required string HtmlBody { get; set; }

    /// <summary>
    /// Gets or sets the plain text email body (fallback).
    /// </summary>
    public string? TextBody { get; set; }
}

