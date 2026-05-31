using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for AI Configuration operations.
/// </summary>
public interface IAIConfigurationRepository
{
    /// <summary>
    /// Gets the AI configuration for a specific business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The AI configuration, or null if not found.</returns>
    Task<AIConfiguration?> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new AI configuration.
    /// </summary>
    /// <param name="configuration">The AI configuration to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created AI configuration.</returns>
    Task<AIConfiguration> CreateAsync(AIConfiguration configuration, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing AI configuration.
    /// </summary>
    /// <param name="configuration">The AI configuration to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated AI configuration.</returns>
    Task<AIConfiguration> UpdateAsync(AIConfiguration configuration, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an AI configuration.
    /// </summary>
    /// <param name="id">The AI configuration ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
