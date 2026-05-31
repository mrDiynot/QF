namespace QualiFlow.Application.Features.ApiKeys.DTOs;

/// <summary>
/// Response DTO for API key generation (includes the plain text key - only shown once).
/// </summary>
public class GenerateApiKeyResponse
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
    /// Gets or sets the plain text API key value.
    /// WARNING: This is only returned once during creation. Store it securely.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date and time when this API key expires.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this API key was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

