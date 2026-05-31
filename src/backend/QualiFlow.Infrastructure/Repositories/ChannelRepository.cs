using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Channel entity operations.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger instance.</param>
public partial class ChannelRepository(
    QualiFlowDbContext context,
    ILogger<ChannelRepository> logger) : IChannelRepository
{
    /// <inheritdoc />
    public Task<Channel?> GetByIdAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        LogGettingChannel(logger, channelId);

        // MULTI-TENANCY: Channel queries rely on EF Core global query filters for BusinessId
        // The global filter in QualiFlowDbContext ensures only channels for the current
        // user's business are returned. This supplements the filter for defense-in-depth.
        return context.Channels
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == channelId && c.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Channel>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGettingChannelsByBusiness(logger, businessId);

        var channels = await context.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null)
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return channels;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Channel>> GetByTypeAsync(
        Guid businessId,
        ChannelType type,
        CancellationToken cancellationToken = default)
    {
        LogGettingChannelsByType(logger, businessId, type);

        var channels = await context.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.Type == type && c.DeletedAt == null)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return channels;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Channel>> GetActiveChannelsAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGettingActiveChannels(logger, businessId);

        var channels = await context.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.IsActive && c.DeletedAt == null)
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return channels;
    }

    /// <inheritdoc />
    public async Task<Channel> CreateAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        LogCreatingChannel(logger, channel.Id, channel.Type);

        context.Channels.Add(channel);
        await context.SaveChangesAsync(cancellationToken);

        return channel;
    }

    /// <inheritdoc />
    public async Task<Channel> UpdateAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        LogUpdatingChannel(logger, channel.Id);

        context.Channels.Update(channel);
        await context.SaveChangesAsync(cancellationToken);

        return channel;
    }

    /// <inheritdoc />
    public Task DeleteAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        LogDeletingChannel(logger, channelId);

        return context.Channels
            .Where(c => c.Id == channelId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(c => c.DeletedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc />
    public Task<bool> ExistsAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        return context.Channels
            .AnyAsync(c => c.Id == channelId && c.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc />
    public Task<Channel?> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        LogGettingChannelByPhoneNumber(logger, phoneNumber);

        // Normalize phone number (remove any non-numeric characters except +)
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);

        return context.Channels
            .AsNoTracking()
            .Include(c => c.Business)
            .FirstOrDefaultAsync(
                c => c.PhoneNumber != null &&
                     c.PhoneNumber == normalizedPhone &&
                     c.IsActive &&
                     c.DeletedAt == null,
                cancellationToken);
    }

    /// <summary>
    /// Normalizes a phone number to E.164 format for consistent lookup.
    /// </summary>
    private static string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            return phoneNumber;
        }

        // Remove all non-numeric characters except the leading +
        var normalized = phoneNumber.Trim();
        if (normalized.StartsWith('+'))
        {
            return "+" + new string(normalized.Skip(1).Where(char.IsDigit).ToArray());
        }

        return new string(normalized.Where(char.IsDigit).ToArray());
    }

    // Logging methods

    [LoggerMessage(EventId = 8001, Level = LogLevel.Information, Message = "Getting channel {ChannelId}")]
    private static partial void LogGettingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 8002, Level = LogLevel.Information, Message = "Getting channels for business {BusinessId}")]
    private static partial void LogGettingChannelsByBusiness(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 8003, Level = LogLevel.Information, Message = "Getting channels of type {Type} for business {BusinessId}")]
    private static partial void LogGettingChannelsByType(ILogger logger, Guid businessId, ChannelType type);

    [LoggerMessage(EventId = 8004, Level = LogLevel.Information, Message = "Getting active channels for business {BusinessId}")]
    private static partial void LogGettingActiveChannels(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 8005, Level = LogLevel.Information, Message = "Creating channel {ChannelId} of type {Type}")]
    private static partial void LogCreatingChannel(ILogger logger, Guid channelId, ChannelType type);

    [LoggerMessage(EventId = 8006, Level = LogLevel.Information, Message = "Updating channel {ChannelId}")]
    private static partial void LogUpdatingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 8007, Level = LogLevel.Information, Message = "Deleting channel {ChannelId}")]
    private static partial void LogDeletingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 8008, Level = LogLevel.Information, Message = "Getting channel by phone number {PhoneNumber}")]
    private static partial void LogGettingChannelByPhoneNumber(ILogger logger, string phoneNumber);

    [LoggerMessage(EventId = 8009, Level = LogLevel.Information, Message = "Getting channel by external account ID {ExternalAccountId} and type {ChannelType}")]
    private static partial void LogGettingChannelByExternalAccountId(ILogger logger, string externalAccountId, ChannelType channelType);

    /// <inheritdoc />
    public Task<Channel?> GetByExternalAccountIdAsync(
        string externalAccountId,
        ChannelType channelType,
        CancellationToken cancellationToken = default)
    {
        LogGettingChannelByExternalAccountId(logger, externalAccountId, channelType);

        return context.Channels
            .AsNoTracking()
            .Include(c => c.Business)
            .FirstOrDefaultAsync(
                c => c.ExternalAccountId == externalAccountId &&
                     c.Type == channelType &&
                     c.IsActive &&
                     c.DeletedAt == null,
                cancellationToken);
    }
}
