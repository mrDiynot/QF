namespace QualiFlow.Application.Features.ApiKeys.DTOs;

/// <summary>
/// DTO for API key information (without the actual key value).
/// </summary>
public class ApiKeyDto
{
    /// <summary>
    /// Gets or sets the API key ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the friendly name for this API key.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the masked API key for display (e.g., "qf_live_****...****1234").
    /// </summary>
    public string MaskedKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date and time when this API key was last used.
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this API key expires.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this API key is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this API key was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

