using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Channels.Services;

/// <summary>
/// Service interface for channel management operations.
/// </summary>
public interface IChannelService
{
    /// <summary>
    /// Gets a channel by ID.
    /// </summary>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The channel DTO.</returns>
    Task<ChannelDto?> GetByIdAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all channels for the current business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of channel DTOs.</returns>
    Task<IReadOnlyList<ChannelDto>> GetAllAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets channels by type.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="type">The channel type.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of channel DTOs.</returns>
    Task<IReadOnlyList<ChannelDto>> GetByTypeAsync(Guid businessId, ChannelType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active channels for the current business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of active channel DTOs.</returns>
    Task<IReadOnlyList<ChannelDto>> GetActiveAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The create channel request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created channel DTO.</returns>
    Task<ChannelDto> CreateAsync(Guid businessId, CreateChannelRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing channel.
    /// </summary>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="request">The update channel request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated channel DTO.</returns>
    Task<ChannelDto> UpdateAsync(Guid channelId, UpdateChannelRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a channel.
    /// </summary>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies a channel configuration and connectivity.
    /// </summary>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The verification result.</returns>
    Task<ChannelDto> VerifyAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending channels from onboarding that haven't been activated yet.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of pending channel configurations.</returns>
    Task<IReadOnlyList<PendingChannelDto>> GetPendingChannelsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates a channel from onboarding preferences, provisioning resources as needed.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The activation request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The activation result with channel details.</returns>
    Task<ActivateChannelResponse> ActivateChannelAsync(
        Guid businessId,
        ActivateChannelRequest request,
        CancellationToken cancellationToken = default);
}
