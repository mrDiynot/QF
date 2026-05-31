namespace QualiFlow.Application.Features.Email.DTOs;

/// <summary>
/// Request DTO for sending a single email.
/// </summary>
public class SendEmailRequest
{
    /// <summary>
    /// Gets or sets the optional business ID for system emails (e.g., verification emails).
    /// When provided, bypasses the current user service for tenant context.
    /// When null, the current user's business ID is used.
    /// </summary>
    public Guid? BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the recipient email address.
    /// </summary>
    public required string ToEmail { get; set; }

    /// <summary>
    /// Gets or sets the recipient name.
    /// </summary>
    public string? ToName { get; set; }

    /// <summary>
    /// Gets or sets the sender email address.
    /// Must be a verified domain in Resend.
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

    /// <summary>
    /// Gets or sets the reply-to email address.
    /// </summary>
    public string? ReplyTo { get; set; }

    /// <summary>
    /// Gets or sets the CC email addresses (comma-separated for multiple).
    /// </summary>
    public string? CcEmail { get; set; }

    /// <summary>
    /// Gets or sets custom tags for tracking.
    /// </summary>
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for deserialization
#pragma warning disable MA0016 // Prefer using collection abstraction instead of implementation - Dictionary required for JSON serialization
    public Dictionary<string, string>? Tags { get; set; }
#pragma warning restore MA0016
#pragma warning restore CA2227
}

