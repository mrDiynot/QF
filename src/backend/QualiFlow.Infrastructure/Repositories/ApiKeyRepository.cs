using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for API key operations.
/// </summary>
public partial class ApiKeyRepository(
    QualiFlowDbContext context,
    ILogger<ApiKeyRepository> logger) : IApiKeyRepository
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<ApiKey>> GetByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingApiKeys(logger, businessId);

        return await context.ApiKeys
            .Where(k => k.BusinessId == businessId && k.DeletedAt == null)
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ApiKey?> GetByIdAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingApiKeyById(logger, id, businessId);

        return await context.ApiKeys
            .Where(k => k.Id == id && k.BusinessId == businessId && k.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ApiKey?> GetByKeyHashAsync(
        string keyHash,
        CancellationToken cancellationToken = default)
    {
        LogGettingApiKeyByHash(logger);

        return await context.ApiKeys
            .Where(k => k.KeyHash == keyHash && k.DeletedAt == null && k.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ApiKey> AddAsync(
        ApiKey apiKey,
        CancellationToken cancellationToken = default)
    {
        LogAddingApiKey(logger, apiKey.BusinessId);

        await context.ApiKeys.AddAsync(apiKey, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return apiKey;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(
        ApiKey apiKey,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingApiKey(logger, apiKey.Id, apiKey.BusinessId);

        apiKey.UpdatedAt = DateTime.UtcNow;
        context.ApiKeys.Update(apiKey);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(
        ApiKey apiKey,
        CancellationToken cancellationToken = default)
    {
        LogDeletingApiKey(logger, apiKey.Id, apiKey.BusinessId);

        context.ApiKeys.Remove(apiKey);
        await context.SaveChangesAsync(cancellationToken);
    }

    // Logger message delegates

    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Getting API keys for business {BusinessId}")]
    private static partial void LogGettingApiKeys(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Getting API key {ApiKeyId} for business {BusinessId}")]
    private static partial void LogGettingApiKeyById(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Debug, Message = "Getting API key by hash")]
    private static partial void LogGettingApiKeyByHash(ILogger logger);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "Adding API key for business {BusinessId}")]
    private static partial void LogAddingApiKey(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information, Message = "Updating API key {ApiKeyId} for business {BusinessId}")]
    private static partial void LogUpdatingApiKey(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 6, Level = LogLevel.Information, Message = "Deleting API key {ApiKeyId} for business {BusinessId}")]
    private static partial void LogDeletingApiKey(ILogger logger, Guid apiKeyId, Guid businessId);
}

