using QualiFlow.Application.Features.ApiKeys.DTOs;

namespace QualiFlow.Application.Features.ApiKeys.Services;

/// <summary>
/// Service interface for API key operations.
/// </summary>
public interface IApiKeyService
{
    /// <summary>
    /// Generates a new API key for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The API key creation request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The generated API key response (includes plain text key - only shown once).</returns>
    Task<GenerateApiKeyResponse> GenerateAsync(
        Guid businessId,
        CreateApiKeyRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all API keys for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A list of API keys (without plain text values).</returns>
    Task<IReadOnlyList<ApiKeyDto>> GetAllAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an API key.
    /// </summary>
    /// <param name="id">The API key ID.</param>
    /// <param name="businessId">The business ID (for multi-tenancy).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates an API key and returns the associated business ID.
    /// </summary>
    /// <param name="apiKey">The plain text API key.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The business ID if valid, null otherwise.</returns>
    Task<Guid?> ValidateAsync(
        string apiKey,
        CancellationToken cancellationToken = default);
}

