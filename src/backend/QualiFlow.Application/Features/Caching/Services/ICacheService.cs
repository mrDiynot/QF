namespace QualiFlow.Application.Features.Caching.Services;

/// <summary>
/// Service interface for distributed caching operations using Redis.
/// Provides methods for storing, retrieving, and invalidating cached data.
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Gets a cached value by key.
    /// </summary>
    /// <typeparam name="T">The type of the cached value.</typeparam>
    /// <param name="key">The cache key.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The cached value, or null if not found.</returns>
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Sets a value in the cache with optional expiration.
    /// </summary>
    /// <typeparam name="T">The type of the value to cache.</typeparam>
    /// <param name="key">The cache key.</param>
    /// <param name="value">The value to cache.</param>
    /// <param name="expiration">Optional expiration time. If null, uses default TTL (15 minutes).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the value was cached successfully, false otherwise.</returns>
    Task<bool> SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Removes a cached value by key.
    /// </summary>
    /// <param name="key">The cache key.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the value was removed, false if it didn't exist.</returns>
    Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes all cached values matching the given prefix.
    /// Useful for invalidating all cached entities of a specific type.
    /// </summary>
    /// <param name="prefix">The cache key prefix (e.g., "lead:", "conversation:").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of keys removed.</returns>
    Task<long> RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a key exists in the cache.
    /// </summary>
    /// <param name="key">The cache key.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the key exists, false otherwise.</returns>
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the remaining time-to-live for a cached key.
    /// </summary>
    /// <param name="key">The cache key.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The remaining TTL, or null if the key doesn't exist or has no expiration.</returns>
    Task<TimeSpan?> GetTimeToLiveAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cache statistics (hit rate, miss rate, total keys).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Cache statistics.</returns>
    Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Cache statistics for monitoring cache performance.
/// </summary>
public record CacheStatistics
{
    /// <summary>
    /// Gets the total number of cache hits.
    /// </summary>
    public required long Hits { get; init; }

    /// <summary>
    /// Gets the total number of cache misses.
    /// </summary>
    public required long Misses { get; init; }

    /// <summary>
    /// Gets the cache hit rate as a percentage (0-100).
    /// </summary>
    public decimal HitRate => Hits + Misses > 0
        ? Math.Round((decimal)Hits / (Hits + Misses) * 100, 2)
        : 0;

    /// <summary>
    /// Gets the total number of keys in the cache.
    /// </summary>
    public required long TotalKeys { get; init; }

    /// <summary>
    /// Gets the total memory used by the cache in bytes.
    /// </summary>
    public required long MemoryUsedBytes { get; init; }

    /// <summary>
    /// Gets the total memory used by the cache in megabytes.
    /// </summary>
    public decimal MemoryUsedMB => Math.Round((decimal)MemoryUsedBytes / (1024 * 1024), 2);
}

