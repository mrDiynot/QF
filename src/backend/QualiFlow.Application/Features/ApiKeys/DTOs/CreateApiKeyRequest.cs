namespace QualiFlow.Application.Features.ApiKeys.DTOs;

/// <summary>
/// Request DTO for creating a new API key.
/// </summary>
public class CreateApiKeyRequest
{
    /// <summary>
    /// Gets or sets the friendly name for this API key.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of days until the API key expires.
    /// Null means the key never expires.
    /// </summary>
    public int? ExpiresInDays { get; set; }
}

