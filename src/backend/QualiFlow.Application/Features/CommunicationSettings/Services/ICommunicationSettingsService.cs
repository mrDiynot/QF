using QualiFlow.Application.Features.CommunicationSettings.DTOs;

namespace QualiFlow.Application.Features.CommunicationSettings.Services;

/// <summary>
/// Service interface for communication settings operations.
/// </summary>
public interface ICommunicationSettingsService
{
    /// <summary>
    /// Gets communication settings for the current business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The communication settings DTO.</returns>
    Task<CommunicationSettingsDto> GetAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates communication settings for the current business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated communication settings DTO.</returns>
    Task<CommunicationSettingsDto> UpdateAsync(
        Guid businessId,
        UpdateCommunicationSettingsRequest request,
        CancellationToken cancellationToken = default);
}

