using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.DTOs;

/// <summary>
/// Request DTO for updating an existing lead.
/// All properties are optional - only provided properties will be updated.
/// </summary>
public class UpdateLeadRequest
{
    /// <summary>
    /// Gets or sets the lead's name.
    /// </summary>
    /// <example>John Doe.</example>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the lead's email address.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the lead's phone number.
    /// </summary>
    /// <example>+1234567890.</example>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the lead's status.
    /// </summary>
    /// <example>Qualified.</example>
    public LeadStatus? Status { get; set; }

    /// <summary>
    /// Gets or sets the lead's qualification score (0-100).
    /// </summary>
    /// <example>85.</example>
    public int? Score { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON string.
    /// </summary>
    /// <example>{"notes": "Follow up next week"}.</example>
    public string? Metadata { get; set; }
}

