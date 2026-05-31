using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Caching.Services;
using StackExchange.Redis;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Redis-based implementation of ICacheService for distributed caching.
/// Uses StackExchange.Redis for high-performance caching with automatic serialization.
/// </summary>
public sealed partial class RedisCacheService : ICacheService
{
    private const int DefaultExpirationMinutes = 15;
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _database;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    // Cache statistics (in-memory counters)
    private long _hits;
    private long _misses;

    public RedisCacheService(
        IConnectionMultiplexer redis,
        ILogger<RedisCacheService> logger)
    {
        _redis = redis ?? throw new ArgumentNullException(nameof(redis));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _database = _redis.GetDatabase();

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false,
        };
    }

    /// <inheritdoc />
    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        where T : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        try
        {
            var value = await _database.StringGetAsync(key);

            if (value.IsNullOrEmpty)
            {
                Interlocked.Increment(ref _misses);
                LogCacheMiss(key);
                return null;
            }

            Interlocked.Increment(ref _hits);
            LogCacheHit(key);

            var deserializedValue = JsonSerializer.Deserialize<T>(value.ToString(), _jsonOptions);
            return deserializedValue;
        }
        catch (Exception ex)
        {
            LogCacheGetError(key, ex);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<bool> SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
        where T : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentNullException.ThrowIfNull(value);

        try
        {
            var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);
            var expirationTime = expiration ?? TimeSpan.FromMinutes(DefaultExpirationMinutes);

            var success = await _database.StringSetAsync(key, serializedValue, expirationTime);

            if (success)
            {
                LogCacheSet(key, expirationTime);
            }
            else
            {
                LogCacheSetFailed(key);
            }

            return success;
        }
        catch (Exception ex)
        {
            LogCacheSetError(key, ex);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        try
        {
            var removed = await _database.KeyDeleteAsync(key);

            if (removed)
            {
                LogCacheRemove(key);
            }

            return removed;
        }
        catch (Exception ex)
        {
            LogCacheRemoveError(key, ex);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<long> RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prefix);

        try
        {
            var endpoints = _redis.GetEndPoints();
            var server = _redis.GetServer(endpoints[0]);

            // Use KeysAsync to avoid blocking
            var keys = new List<RedisKey>();
            await foreach (var key in server.KeysAsync(pattern: $"{prefix}*"))
            {
                keys.Add(key);
            }

            if (keys.Count == 0)
            {
                return 0;
            }

            var removed = await _database.KeyDeleteAsync(keys.ToArray());
            LogCacheRemoveByPrefix(prefix, removed);

            return removed;
        }
        catch (Exception ex)
        {
            LogCacheRemoveByPrefixError(prefix, ex);
            return 0;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        try
        {
            return await _database.KeyExistsAsync(key);
        }
        catch (Exception ex)
        {
            LogCacheExistsError(key, ex);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<TimeSpan?> GetTimeToLiveAsync(string key, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        try
        {
            var ttl = await _database.KeyTimeToLiveAsync(key);
            return ttl;
        }
        catch (Exception ex)
        {
            LogCacheGetTtlError(key, ex);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var endpoints = _redis.GetEndPoints();
            var server = _redis.GetServer(endpoints[0]);
            var info = await server.InfoAsync("memory");

            // Parse memory info from Redis INFO command
            var memoryUsedBytes = 0L;
            foreach (var group in info)
            {
                foreach (var item in group)
                {
                    if (item.Key == "used_memory")
                    {
                        memoryUsedBytes = long.Parse(item.Value, System.Globalization.CultureInfo.InvariantCulture);
                        break;
                    }
                }
            }

            var dbSize = await _database.ExecuteAsync("DBSIZE");
            var totalKeys = (long)dbSize;

            var hits = Interlocked.Read(ref _hits);
            var misses = Interlocked.Read(ref _misses);

            var statistics = new CacheStatistics
            {
                Hits = hits,
                Misses = misses,
                TotalKeys = totalKeys,
                MemoryUsedBytes = memoryUsedBytes,
            };

            LogCacheStatistics(hits, misses, statistics.HitRate, totalKeys, statistics.MemoryUsedMB);

            return statistics;
        }
        catch (Exception ex)
        {
            LogCacheStatisticsError(ex);

            var hits = Interlocked.Read(ref _hits);
            var misses = Interlocked.Read(ref _misses);

            return new CacheStatistics
            {
                Hits = hits,
                Misses = misses,
                TotalKeys = 0,
                MemoryUsedBytes = 0,
            };
        }
    }

    // ============================================================================
    // LOGGING
    // ============================================================================

    [LoggerMessage(EventId = 1, Level = LogLevel.Debug, Message = "Cache hit for key: {Key}")]
    private partial void LogCacheHit(string key);

    [LoggerMessage(EventId = 2, Level = LogLevel.Debug, Message = "Cache miss for key: {Key}")]
    private partial void LogCacheMiss(string key);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "Cache set for key: {Key}, expiration: {Expiration}")]
    private partial void LogCacheSet(string key, TimeSpan expiration);

    [LoggerMessage(EventId = 4, Level = LogLevel.Warning, Message = "Cache set failed for key: {Key}")]
    private partial void LogCacheSetFailed(string key);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information, Message = "Cache remove for key: {Key}")]
    private partial void LogCacheRemove(string key);

    [LoggerMessage(EventId = 6, Level = LogLevel.Information, Message = "Cache remove by prefix: {Prefix}, removed: {Count}")]
    private partial void LogCacheRemoveByPrefix(string prefix, long count);

    [LoggerMessage(EventId = 7, Level = LogLevel.Information, Message = "Cache statistics - Hits: {Hits}, Misses: {Misses}, Hit Rate: {HitRate}%, Total Keys: {TotalKeys}, Memory: {MemoryMB} MB")]
    private partial void LogCacheStatistics(long hits, long misses, decimal hitRate, long totalKeys, decimal memoryMB);

    [LoggerMessage(EventId = 8, Level = LogLevel.Error, Message = "Error getting cache value for key: {Key}")]
    private partial void LogCacheGetError(string key, Exception ex);

    [LoggerMessage(EventId = 9, Level = LogLevel.Error, Message = "Error setting cache value for key: {Key}")]
    private partial void LogCacheSetError(string key, Exception ex);

    [LoggerMessage(EventId = 10, Level = LogLevel.Error, Message = "Error removing cache value for key: {Key}")]
    private partial void LogCacheRemoveError(string key, Exception ex);

    [LoggerMessage(EventId = 11, Level = LogLevel.Error, Message = "Error removing cache values by prefix: {Prefix}")]
    private partial void LogCacheRemoveByPrefixError(string prefix, Exception ex);

    [LoggerMessage(EventId = 12, Level = LogLevel.Error, Message = "Error checking cache key exists: {Key}")]
    private partial void LogCacheExistsError(string key, Exception ex);

    [LoggerMessage(EventId = 13, Level = LogLevel.Error, Message = "Error getting cache TTL for key: {Key}")]
    private partial void LogCacheGetTtlError(string key, Exception ex);

    [LoggerMessage(EventId = 14, Level = LogLevel.Error, Message = "Error getting cache statistics")]
    private partial void LogCacheStatisticsError(Exception ex);
}

