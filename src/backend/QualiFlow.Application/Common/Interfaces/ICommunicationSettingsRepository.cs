using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for CommunicationSettings entity operations.
/// </summary>
public interface ICommunicationSettingsRepository
{
    /// <summary>
    /// Gets communication settings for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The communication settings if found, otherwise null.</returns>
    Task<CommunicationSettings?> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates or updates communication settings for a business.
    /// </summary>
    /// <param name="settings">The communication settings to save.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The saved communication settings.</returns>
    Task<CommunicationSettings> UpsertAsync(CommunicationSettings settings, CancellationToken cancellationToken = default);
}

