using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ApiKeys.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.ApiKeys.Services;

/// <summary>
/// Service implementation for API key operations.
/// </summary>
public partial class ApiKeyService(
    IApiKeyRepository repository,
    ILogger<ApiKeyService> logger) : IApiKeyService
{
    private const string KeyPrefix = "qf_live_";
    private const int KeyLength = 32; // 32 random bytes = 64 hex characters

    /// <inheritdoc />
    public async Task<GenerateApiKeyResponse> GenerateAsync(
        Guid businessId,
        CreateApiKeyRequest request,
        CancellationToken cancellationToken = default)
    {
        LogGeneratingApiKey(logger, businessId, request.Name);

        // Generate a cryptographically secure random API key
        var randomBytes = RandomNumberGenerator.GetBytes(KeyLength);
        var keyValue = Convert.ToHexString(randomBytes).ToLowerInvariant();
        var fullKey = $"{KeyPrefix}{keyValue}";

        // Hash the key for storage (HMAC-SHA256)
        var keyHash = HashApiKey(fullKey);

        // Extract prefix and suffix for display
        var suffix = fullKey[^4..]; // Last 4 characters

        // Calculate expiration date
        DateTime? expiresAt = request.ExpiresInDays.HasValue
            ? DateTime.UtcNow.AddDays(request.ExpiresInDays.Value)
            : null;

        // Create the API key entity
        var apiKey = new ApiKey
        {
            BusinessId = businessId,
            Name = request.Name,
            KeyHash = keyHash,
            KeyPrefix = KeyPrefix,
            KeySuffix = suffix,
            ExpiresAt = expiresAt,
            IsActive = true,
        };

        await repository.AddAsync(apiKey, cancellationToken);

        LogApiKeyGenerated(logger, apiKey.Id, businessId);

        return new GenerateApiKeyResponse
        {
            Id = apiKey.Id,
            Name = apiKey.Name,
            ApiKey = fullKey, // Only returned once!
            ExpiresAt = apiKey.ExpiresAt,
            CreatedAt = apiKey.CreatedAt,
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ApiKeyDto>> GetAllAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingApiKeys(logger, businessId);

        var apiKeys = await repository.GetByBusinessIdAsync(businessId, cancellationToken);

        return apiKeys.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task DeleteAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingApiKey(logger, id, businessId);

        var apiKey = await repository.GetByIdAsync(id, businessId, cancellationToken);

        if (apiKey == null)
        {
            throw new InvalidOperationException($"API key {id} not found for business {businessId}");
        }

        await repository.DeleteAsync(apiKey, cancellationToken);

        LogApiKeyDeleted(logger, id, businessId);
    }

    /// <inheritdoc />
    public async Task<Guid?> ValidateAsync(
        string apiKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return null;
        }

        var keyHash = HashApiKey(apiKey);
        var storedKey = await repository.GetByKeyHashAsync(keyHash, cancellationToken);

        if (storedKey == null)
        {
            LogApiKeyValidationFailed(logger);
            return null;
        }

        // Check if key is expired
        if (storedKey.ExpiresAt.HasValue && storedKey.ExpiresAt.Value < DateTime.UtcNow)
        {
            LogApiKeyExpired(logger, storedKey.Id);
            return null;
        }

        // Update last used timestamp
        storedKey.LastUsedAt = DateTime.UtcNow;
        await repository.UpdateAsync(storedKey, cancellationToken);

        LogApiKeyValidated(logger, storedKey.Id, storedKey.BusinessId);

        return storedKey.BusinessId;
    }

    private static string HashApiKey(string apiKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(apiKey);
        var hashBytes = SHA256.HashData(keyBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    private static ApiKeyDto MapToDto(ApiKey apiKey)
    {
        // Create masked key for display: "qf_live_****...****1234"
        var maskedKey = $"{apiKey.KeyPrefix}****...****{apiKey.KeySuffix}";

        return new ApiKeyDto
        {
            Id = apiKey.Id,
            Name = apiKey.Name,
            MaskedKey = maskedKey,
            LastUsedAt = apiKey.LastUsedAt,
            ExpiresAt = apiKey.ExpiresAt,
            IsActive = apiKey.IsActive,
            CreatedAt = apiKey.CreatedAt,
        };
    }

    // Logger message delegates

    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Generating API key '{Name}' for business {BusinessId}")]
    private static partial void LogGeneratingApiKey(ILogger logger, Guid businessId, string name);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "API key {ApiKeyId} generated for business {BusinessId}")]
    private static partial void LogApiKeyGenerated(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "Getting API keys for business {BusinessId}")]
    private static partial void LogGettingApiKeys(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "Deleting API key {ApiKeyId} for business {BusinessId}")]
    private static partial void LogDeletingApiKey(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information, Message = "API key {ApiKeyId} deleted for business {BusinessId}")]
    private static partial void LogApiKeyDeleted(ILogger logger, Guid apiKeyId, Guid businessId);

    [LoggerMessage(EventId = 6, Level = LogLevel.Warning, Message = "API key validation failed")]
    private static partial void LogApiKeyValidationFailed(ILogger logger);

    [LoggerMessage(EventId = 7, Level = LogLevel.Warning, Message = "API key {ApiKeyId} is expired")]
    private static partial void LogApiKeyExpired(ILogger logger, Guid apiKeyId);

    [LoggerMessage(EventId = 8, Level = LogLevel.Debug, Message = "API key {ApiKeyId} validated for business {BusinessId}")]
    private static partial void LogApiKeyValidated(ILogger logger, Guid apiKeyId, Guid businessId);
}

