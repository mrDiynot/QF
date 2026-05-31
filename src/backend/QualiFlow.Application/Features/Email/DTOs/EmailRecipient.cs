namespace QualiFlow.Application.Features.Email.DTOs;

/// <summary>
/// Email recipient information.
/// </summary>
public class EmailRecipient
{
    /// <summary>
    /// Gets or sets the recipient email address.
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the recipient name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets custom variables for this recipient (for personalization).
    /// </summary>
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for deserialization
#pragma warning disable MA0016 // Prefer using collection abstraction instead of implementation - Dictionary required for JSON serialization
    public Dictionary<string, string>? Variables { get; set; }
#pragma warning restore MA0016
#pragma warning restore CA2227
}

