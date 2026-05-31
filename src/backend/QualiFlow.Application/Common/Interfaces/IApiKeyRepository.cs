using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for API key operations.
/// </summary>
public interface IApiKeyRepository
{
    /// <summary>
    /// Gets all API keys for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A list of API keys.</returns>
    Task<IReadOnlyList<ApiKey>> GetByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an API key by its ID.
    /// </summary>
    /// <param name="id">The API key ID.</param>
    /// <param name="businessId">The business ID (for multi-tenancy).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The API key, or null if not found.</returns>
    Task<ApiKey?> GetByIdAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an API key by its hash.
    /// </summary>
    /// <param name="keyHash">The hashed API key.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The API key, or null if not found.</returns>
    Task<ApiKey?> GetByKeyHashAsync(
        string keyHash,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new API key.
    /// </summary>
    /// <param name="apiKey">The API key to add.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The added API key.</returns>
    Task<ApiKey> AddAsync(
        ApiKey apiKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing API key.
    /// </summary>
    /// <param name="apiKey">The API key to update.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(
        ApiKey apiKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an API key.
    /// </summary>
    /// <param name="apiKey">The API key to delete.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(
        ApiKey apiKey,
        CancellationToken cancellationToken = default);
}

