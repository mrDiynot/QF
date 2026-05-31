using Microsoft.AspNetCore.Mvc;

namespace QualiFlow.API.Attributes;

/// <summary>
/// Controls response caching with a specified duration.
/// </summary>
public sealed class CacheControlAttribute : ResponseCacheAttribute
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CacheControlAttribute"/> class.
    /// </summary>
    /// <param name="durationSeconds">Cache duration in seconds.</param>
    /// <param name="varyByHeaders">Headers that affect cache key.</param>
    public CacheControlAttribute(int durationSeconds, string? varyByHeaders = null)
    {
        DurationSeconds = durationSeconds;
        VaryByHeaders = varyByHeaders;
        Duration = durationSeconds;
        Location = ResponseCacheLocation.Any;
        NoStore = false;

        if (varyByHeaders != null)
        {
            VaryByHeader = varyByHeaders;
        }
    }

    /// <summary>
    /// Gets the cache duration in seconds.
    /// </summary>
    public int DurationSeconds { get; }

    /// <summary>
    /// Gets the headers that affect cache key.
    /// </summary>
    public string? VaryByHeaders { get; }
}

/// <summary>
/// Disables all response caching for the endpoint.
/// </summary>
/// <remarks>
/// Use this attribute for authentication, user-specific, and real-time data.
/// </remarks>
public sealed class NoCacheAttribute : ResponseCacheAttribute
{
    /// <summary>
    /// Initializes a new instance of the <see cref="NoCacheAttribute"/> class.
    /// </summary>
    public NoCacheAttribute()
    {
        Duration = 0;
        Location = ResponseCacheLocation.None;
        NoStore = true;
        VaryByHeader = "Authorization";
    }
}

/// <summary>
/// Predefined cache duration constants for common scenarios.
/// </summary>
public static class CacheStrategies
{
    /// <summary>
    /// No caching (0 seconds).
    /// </summary>
    public const int NoCache = 0;

    /// <summary>
    /// Short-term cache (5 minutes).
    /// </summary>
    public const int ShortTerm = 300;

    /// <summary>
    /// Medium-term cache (15 minutes).
    /// </summary>
    public const int MediumTerm = 900;

    /// <summary>
    /// Long-term cache (1 hour).
    /// </summary>
    public const int LongTerm = 3600;

    /// <summary>
    /// Very long-term cache (24 hours).
    /// </summary>
    public const int VeryLongTerm = 86400;
}
