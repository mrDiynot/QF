#pragma warning disable S3260 // Private record classes should be sealed
#pragma warning disable CA1812 // Internal class never instantiated
#pragma warning disable CA1852 // Type can be sealed
#pragma warning disable CA2234 // Pass System.Uri instead of string

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Retry;
using QualiFlow.Application.Features.Meta.Interfaces;

namespace QualiFlow.Infrastructure.ExternalServices.Meta;

/// <summary>
/// HTTP client for Meta Graph API operations.
/// Implements retry policies, rate limiting, and error handling for Meta API calls.
/// </summary>
public partial class MetaApiClient : IMetaApiClient
{
    private readonly HttpClient _httpClient;
    private readonly MetaOptions _options;
    private readonly ILogger<MetaApiClient> _logger;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;
    private readonly JsonSerializerOptions _jsonOptions;

    // Rate limit tracking per business/page
    private static readonly Dictionary<string, RateLimitState> _rateLimitStates = [];
    private static readonly Lock _rateLimitLock = new();

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaApiClient"/> class.
    /// </summary>
    public MetaApiClient(
        HttpClient httpClient,
        IOptions<MetaOptions> options,
        ILogger<MetaApiClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        // Configure retry policy with exponential backoff and rate limit awareness
        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => IsTransientError(r))
            .WaitAndRetryAsync(
                retryCount: 5,
                sleepDurationProvider: (attempt, result, context) =>
                {
                    // Check for Retry-After header
                    if (result.Result?.Headers.RetryAfter?.Delta is { } retryAfter)
                    {
                        return retryAfter;
                    }

                    // Use exponential backoff with jitter
                    var baseDelay = Math.Pow(2, attempt);
                    var jitter = System.Security.Cryptography.RandomNumberGenerator.GetInt32(0, 500) / 1000.0;
                    return TimeSpan.FromSeconds(baseDelay + jitter);
                },
                onRetryAsync: async (outcome, timespan, retryCount, context) =>
                {
                    LogRetry(_logger, retryCount, timespan.TotalSeconds, (int)outcome.Result.StatusCode);

                    // Track rate limit state if 429
                    if (outcome.Result.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        TrackRateLimitHit(context.TryGetValue("pageId", out var pageId) ? pageId?.ToString() : "global");
                    }

                    await Task.CompletedTask;
                });
    }

    private static void TrackRateLimitHit(string? key)
    {
        if (string.IsNullOrEmpty(key))
        {
            key = "global";
        }

        lock (_rateLimitLock)
        {
            if (!_rateLimitStates.TryGetValue(key, out var state))
            {
                state = new RateLimitState();
                _rateLimitStates[key] = state;
            }

            state.LastRateLimitHit = DateTime.UtcNow;
            state.ConsecutiveHits++;
        }
    }

    /// <inheritdoc />
    public async Task<T?> GetAsync<T>(string endpoint, string accessToken, CancellationToken cancellationToken = default)
        where T : class
    {
        var url = BuildUrl(endpoint, accessToken);
        LogApiRequest(_logger, "GET", endpoint);

        var response = await _retryPolicy.ExecuteAsync(async () =>
            await _httpClient.GetAsync(url, cancellationToken));

        return await HandleResponseAsync<T>(response, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<TResponse?> PostAsync<TRequest, TResponse>(
        string endpoint,
        string accessToken,
        TRequest body,
        CancellationToken cancellationToken = default)
        where TRequest : class
        where TResponse : class
    {
        var url = BuildUrl(endpoint, accessToken);
        LogApiRequest(_logger, "POST", endpoint);

        var response = await _retryPolicy.ExecuteAsync(async () =>
            await _httpClient.PostAsJsonAsync(url, body, _jsonOptions, cancellationToken));

        return await HandleResponseAsync<TResponse>(response, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<MetaTokenResponse?> ExchangeCodeForTokenAsync(
        string code,
        string redirectUri,
        CancellationToken cancellationToken = default)
    {
        var url = $"{_options.GraphApiBaseUrl}/oauth/access_token" +
                  $"?client_id={_options.AppId}" +
                  $"&client_secret={_options.AppSecret}" +
                  $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                  $"&code={Uri.EscapeDataString(code)}";

        LogApiRequest(_logger, "GET", "oauth/access_token");

        var response = await _httpClient.GetAsync(url, cancellationToken);
        return await HandleResponseAsync<MetaTokenResponse>(response, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<MetaTokenResponse?> GetLongLivedTokenAsync(
        string shortLivedToken,
        CancellationToken cancellationToken = default)
    {
        var url = $"{_options.GraphApiBaseUrl}/oauth/access_token" +
                  $"?grant_type=fb_exchange_token" +
                  $"&client_id={_options.AppId}" +
                  $"&client_secret={_options.AppSecret}" +
                  $"&fb_exchange_token={Uri.EscapeDataString(shortLivedToken)}";

        LogApiRequest(_logger, "GET", "oauth/access_token (long-lived)");

        var response = await _httpClient.GetAsync(url, cancellationToken);
        return await HandleResponseAsync<MetaTokenResponse>(response, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<MetaTokenDebugInfo?> DebugTokenAsync(
        string accessToken,
        CancellationToken cancellationToken = default)
    {
        var appToken = $"{_options.AppId}|{_options.AppSecret}";
        var url = $"{_options.GraphApiBaseUrl}/debug_token" +
                  $"?input_token={Uri.EscapeDataString(accessToken)}" +
                  $"&access_token={Uri.EscapeDataString(appToken)}";

        LogApiRequest(_logger, "GET", "debug_token");

        var response = await _httpClient.GetAsync(url, cancellationToken);
        var wrapper = await HandleResponseAsync<DebugTokenWrapper>(response, cancellationToken);
        return wrapper?.Data;
    }

    private string BuildUrl(string endpoint, string accessToken)
    {
        var separator = endpoint.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return $"{_options.GraphApiBaseUrl}/{endpoint.TrimStart('/')}{separator}access_token={Uri.EscapeDataString(accessToken)}";
    }

    private async Task<T?> HandleResponseAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken)
        where T : class
    {
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            LogApiError(_logger, (int)response.StatusCode, content);
            throw new MetaApiException((int)response.StatusCode, content);
        }

        return JsonSerializer.Deserialize<T>(content, _jsonOptions);
    }

    private static bool IsTransientError(HttpResponseMessage response) =>
        (int)response.StatusCode >= 500 ||
        response.StatusCode == System.Net.HttpStatusCode.TooManyRequests;

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Meta API {Method} {Endpoint}")]
    private static partial void LogApiRequest(ILogger logger, string method, string endpoint);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Meta API retry {RetryCount} after {Delay}s, status {StatusCode}")]
    private static partial void LogRetry(ILogger logger, int retryCount, double delay, int statusCode);

    [LoggerMessage(Level = LogLevel.Error, Message = "Meta API error {StatusCode}: {Content}")]
    private static partial void LogApiError(ILogger logger, int statusCode, string content);

    private record DebugTokenWrapper(MetaTokenDebugInfo Data);

    private sealed class RateLimitState
    {
        public DateTime LastRateLimitHit { get; set; }

        public int ConsecutiveHits { get; set; }
    }
}

