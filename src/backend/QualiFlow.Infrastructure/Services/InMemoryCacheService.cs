using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Caching.Services;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// In-memory implementation of ICacheService as a fallback when Redis is unavailable.
/// Uses IMemoryCache for local caching (not distributed).
/// </summary>
public sealed partial class InMemoryCacheService : ICacheService
{
    private const int DefaultExpirationMinutes = 15;
    private readonly IMemoryCache _cache;
    private readonly ILogger<InMemoryCacheService> _logger;

    // Cache statistics (in-memory counters)
    private long _hits;
    private long _misses;
    private long _totalKeys;

    public InMemoryCacheService(
        IMemoryCache cache,
        ILogger<InMemoryCacheService> logger)
    {
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        where T : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        if (_cache.TryGetValue(key, out T? value))
        {
            Interlocked.Increment(ref _hits);
            LogCacheHit(key);
            return Task.FromResult(value);
        }

        Interlocked.Increment(ref _misses);
        LogCacheMiss(key);
        return Task.FromResult<T?>(null);
    }

    /// <inheritdoc />
    public Task<bool> SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
        where T : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentNullException.ThrowIfNull(value);

        var expirationTime = expiration ?? TimeSpan.FromMinutes(DefaultExpirationMinutes);

        _cache.Set(key, value, expirationTime);
        Interlocked.Increment(ref _totalKeys);

        LogCacheSet(key, expirationTime);

        return Task.FromResult(true);
    }

    /// <inheritdoc />
    public Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        _cache.Remove(key);
        Interlocked.Decrement(ref _totalKeys);

        LogCacheRemove(key);

        return Task.FromResult(true);
    }

    /// <inheritdoc />
    public Task<long> RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prefix);

        // Note: IMemoryCache doesn't support prefix-based removal
        // This is a limitation of the in-memory fallback
        LogCacheRemoveByPrefixNotSupported(prefix);

        return Task.FromResult(0L);
    }

    /// <inheritdoc />
    public Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        var exists = _cache.TryGetValue(key, out _);
        return Task.FromResult(exists);
    }

    /// <inheritdoc />
    public Task<TimeSpan?> GetTimeToLiveAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        // Note: IMemoryCache doesn't expose TTL information
        // This is a limitation of the in-memory fallback
        return Task.FromResult<TimeSpan?>(null);
    }

    /// <inheritdoc />
    public Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var hits = Interlocked.Read(ref _hits);
        var misses = Interlocked.Read(ref _misses);
        var totalKeys = Interlocked.Read(ref _totalKeys);

        var statistics = new CacheStatistics
        {
            Hits = hits,
            Misses = misses,
            TotalKeys = totalKeys,
            MemoryUsedBytes = 0, // Not available for IMemoryCache
        };

        LogCacheStatistics(hits, misses, statistics.HitRate, totalKeys);

        return Task.FromResult(statistics);
    }

    // ============================================================================
    // LOGGING
    // ============================================================================

    [LoggerMessage(EventId = 1, Level = LogLevel.Debug, Message = "In-memory cache hit for key: {Key}")]
    private partial void LogCacheHit(string key);

    [LoggerMessage(EventId = 2, Level = LogLevel.Debug, Message = "In-memory cache miss for key: {Key}")]
    private partial void LogCacheMiss(string key);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "In-memory cache set for key: {Key}, expiration: {Expiration}")]
    private partial void LogCacheSet(string key, TimeSpan expiration);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "In-memory cache remove for key: {Key}")]
    private partial void LogCacheRemove(string key);

    [LoggerMessage(EventId = 5, Level = LogLevel.Warning, Message = "In-memory cache does not support prefix-based removal: {Prefix}")]
    private partial void LogCacheRemoveByPrefixNotSupported(string prefix);

    [LoggerMessage(EventId = 6, Level = LogLevel.Information, Message = "In-memory cache statistics - Hits: {Hits}, Misses: {Misses}, Hit Rate: {HitRate}%, Total Keys: {TotalKeys}")]
    private partial void LogCacheStatistics(long hits, long misses, decimal hitRate, long totalKeys);
}

