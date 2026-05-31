using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Channel entity operations.
/// </summary>
public interface IChannelRepository
{
    /// <summary>
    /// Gets a channel by ID.
    /// </summary>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The channel, or null if not found.</returns>
    Task<Channel?> GetByIdAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all channels for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of channels.</returns>
    Task<IReadOnlyList<Channel>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets channels by type for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="type">The channel type.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of channels of the specified type.</returns>
    Task<IReadOnlyList<Channel>> GetByTypeAsync(Guid businessId, ChannelType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active channels for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of active channels.</returns>
    Task<IReadOnlyList<Channel>> GetActiveChannelsAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new channel.
    /// </summary>
    /// <param name="channel">The channel to create.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created channel.</returns>
    Task<Channel> CreateAsync(Channel channel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing channel.
    /// </summary>
    /// <param name="channel">The channel to update.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated channel.</returns>
    Task<Channel> UpdateAsync(Channel channel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a channel.
    /// </summary>
    /// <param name="channelId">The channel ID to delete.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a channel exists.
    /// </summary>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the channel exists, false otherwise.</returns>
    Task<bool> ExistsAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a channel by phone number across all businesses.
    /// Used for inbound webhook processing to identify the owning business.
    /// </summary>
    /// <param name="phoneNumber">The phone number (E.164 format).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The channel if found, or null.</returns>
    Task<Channel?> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a channel by external account ID and channel type across all businesses.
    /// Used for Meta (Instagram/Facebook) webhook processing to identify the owning business.
    /// </summary>
    /// <param name="externalAccountId">The external account ID (e.g., Meta Page ID).</param>
    /// <param name="channelType">The channel type.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The channel if found, or null.</returns>
    Task<Channel?> GetByExternalAccountIdAsync(
        string externalAccountId,
        ChannelType channelType,
        CancellationToken cancellationToken = default);
}
