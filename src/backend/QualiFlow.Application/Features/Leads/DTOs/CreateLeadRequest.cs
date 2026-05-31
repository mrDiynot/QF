using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.DTOs;

/// <summary>
/// Request DTO for creating a new lead.
/// </summary>
public class CreateLeadRequest
{
    /// <summary>
    /// Gets or sets the lead's name.
    /// </summary>
    /// <example>John Doe.</example>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the lead's email address.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the lead's phone number (optional).
    /// </summary>
    /// <example>+1234567890.</example>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the source channel where the lead was captured.
    /// </summary>
    /// <example>chat_widget.</example>
    public required string SourceChannel { get; set; }

    /// <summary>
    /// Gets or sets the lead's initial status (optional, defaults to New).
    /// </summary>
    /// <example>New.</example>
    public LeadStatus? Status { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON string (optional).
    /// </summary>
    /// <example>{"utm_source": "google", "utm_campaign": "summer_sale"}.</example>
    public string? Metadata { get; set; }
}

