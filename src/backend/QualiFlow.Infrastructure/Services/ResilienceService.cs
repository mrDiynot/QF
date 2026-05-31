// -----------------------------------------------------------------------
// <copyright file="ResilienceService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.Extensions.Logging;
using Polly;
using Polly.CircuitBreaker;
using Polly.Timeout;
using Polly.Wrap;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Implementation of resilience patterns using Polly.
/// Provides circuit breaker, retry with exponential backoff, and timeout policies.
/// </summary>
public class ResilienceService : IResilienceService
{
    // Configuration constants
    private const int RetryCount = 3;
    private const int CircuitBreakerThreshold = 5;
    private const int CircuitBreakerDurationSeconds = 30;
    private const int TimeoutSeconds = 30;

    private readonly ILogger<ResilienceService> _logger;
    private readonly Dictionary<string, AsyncCircuitBreakerPolicy> _circuitBreakers = new();
    private readonly Dictionary<string, object> _policies = new();
    private readonly Lock _lock = new();

    /// <summary>
    /// Initializes a new instance of the <see cref="ResilienceService"/> class.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    public ResilienceService(ILogger<ResilienceService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<T> ExecuteAsync<T>(
        string serviceName,
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken = default)
    {
        var policy = GetOrCreatePolicy<T>(serviceName);

        try
        {
            return await policy.ExecuteAsync(action, cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogError(
                ex,
                "Circuit breaker is open for service {ServiceName}. Service is temporarily unavailable.",
                serviceName);
            throw ExternalServiceUnavailableException.ForService(serviceName, ex);
        }
        catch (TimeoutRejectedException ex)
        {
            _logger.LogError(
                ex,
                "Request to service {ServiceName} timed out after {Timeout} seconds.",
                serviceName,
                TimeoutSeconds);
            throw ExternalServiceTimeoutException.ForService(serviceName, TimeoutSeconds, ex);
        }
    }

    /// <inheritdoc/>
    public async Task ExecuteAsync(
        string serviceName,
        Func<CancellationToken, Task> action,
        CancellationToken cancellationToken = default)
    {
        await ExecuteAsync(serviceName, async ct =>
        {
            await action(ct);
            return true;
        }, cancellationToken);
    }

    /// <inheritdoc/>
    public CircuitState GetCircuitState(string serviceName)
    {
        lock (_lock)
        {
            if (_circuitBreakers.TryGetValue(serviceName, out var circuitBreaker))
            {
                return circuitBreaker.CircuitState;
            }

            return CircuitState.Closed; // Default state if not initialized
        }
    }

    /// <inheritdoc/>
    public void ResetCircuit(string serviceName)
    {
        lock (_lock)
        {
            if (_circuitBreakers.TryGetValue(serviceName, out var circuitBreaker))
            {
                circuitBreaker.Reset();
                _logger.LogInformation("Circuit breaker reset for service {ServiceName}", serviceName);
            }
        }
    }

    private AsyncPolicyWrap<T> GetOrCreatePolicy<T>(string serviceName)
    {
        lock (_lock)
        {
            var key = $"{serviceName}_{typeof(T).Name}";

            if (_policies.TryGetValue(key, out var existingPolicy))
            {
                return (AsyncPolicyWrap<T>)existingPolicy;
            }

            // Create timeout policy
            var timeoutPolicy = Policy.TimeoutAsync<T>(
                TimeSpan.FromSeconds(TimeoutSeconds),
                TimeoutStrategy.Pessimistic,
                onTimeoutAsync: (context, timespan, task) =>
                {
                    _logger.LogWarning(
                        "Timeout occurred for service {ServiceName} after {Timeout}s",
                        serviceName, timespan.TotalSeconds);
                    return Task.CompletedTask;
                });

            // Create retry policy with exponential backoff
            var retryPolicy = Policy<T>
                .Handle<HttpRequestException>()
                .Or<TaskCanceledException>(ex => !ex.CancellationToken.IsCancellationRequested)
                .Or<TimeoutException>()
                .WaitAndRetryAsync(
                    retryCount: RetryCount,
                    sleepDurationProvider: retryAttempt =>
                        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // 2s, 4s, 8s
                    onRetry: (outcome, timespan, retryCount, context) =>
                    {
                        _logger.LogWarning(
                            "Retry {RetryCount}/{MaxRetries} for service {ServiceName} after {Delay}s. Error: {Error}",
                            retryCount, RetryCount, serviceName, timespan.TotalSeconds,
                            outcome.Exception?.Message ?? "Unknown error");
                    });

            // Create circuit breaker policy
            var circuitBreakerPolicy = Policy<T>
                .Handle<HttpRequestException>()
                .Or<TaskCanceledException>(ex => !ex.CancellationToken.IsCancellationRequested)
                .Or<TimeoutException>()
                .CircuitBreakerAsync(
                    handledEventsAllowedBeforeBreaking: CircuitBreakerThreshold,
                    durationOfBreak: TimeSpan.FromSeconds(CircuitBreakerDurationSeconds),
                    onBreak: (outcome, breakDelay) =>
                    {
                        _logger.LogError(
                            "Circuit breaker OPENED for service {ServiceName}. Will remain open for {Duration}s. Last error: {Error}",
                            serviceName, breakDelay.TotalSeconds,
                            outcome.Exception?.Message ?? "Unknown error");
                    },
                    onReset: () =>
                    {
                        _logger.LogInformation(
                            "Circuit breaker CLOSED for service {ServiceName}. Service is healthy again.",
                            serviceName);
                    },
                    onHalfOpen: () =>
                    {
                        _logger.LogInformation(
                            "Circuit breaker HALF-OPEN for service {ServiceName}. Testing if service is healthy...",
                            serviceName);
                    });

            // Store circuit breaker reference for state queries (only if not already stored)
            if (!_circuitBreakers.ContainsKey(serviceName))
            {
                _circuitBreakers[serviceName] = Policy
                    .Handle<HttpRequestException>()
                    .Or<TaskCanceledException>(ex => !ex.CancellationToken.IsCancellationRequested)
                    .Or<TimeoutException>()
                    .AdvancedCircuitBreakerAsync(
                        failureThreshold: 0.5,
                        samplingDuration: TimeSpan.FromSeconds(10),
                        minimumThroughput: CircuitBreakerThreshold,
                        durationOfBreak: TimeSpan.FromSeconds(CircuitBreakerDurationSeconds));
            }

            // Wrap policies: Timeout -> Retry -> Circuit Breaker
            // Order matters: timeout is innermost, circuit breaker is outermost
            var wrappedPolicy = Policy.WrapAsync(circuitBreakerPolicy, retryPolicy, timeoutPolicy);

            _policies[key] = wrappedPolicy;

            _logger.LogInformation(
                "Created resilience policy for service {ServiceName} with {RetryCount} retries, " +
                "{CircuitThreshold} failure threshold, {CircuitDuration}s circuit break duration, " +
                "and {Timeout}s timeout",
                serviceName,
                RetryCount,
                CircuitBreakerThreshold,
                CircuitBreakerDurationSeconds,
                TimeoutSeconds);

            return wrappedPolicy;
        }
    }
}

/// <summary>
/// Exception thrown when an external service is unavailable due to circuit breaker being open.
/// </summary>
public class ExternalServiceUnavailableException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ExternalServiceUnavailableException"/> class.
    /// </summary>
    public ExternalServiceUnavailableException()
        : base("External service is temporarily unavailable.")
    {
        ServiceName = string.Empty;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ExternalServiceUnavailableException"/> class.
    /// </summary>
    /// <param name="message">The error message.</param>
    public ExternalServiceUnavailableException(string message)
        : base(message)
    {
        ServiceName = string.Empty;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ExternalServiceUnavailableException"/> class.
    /// </summary>
    /// <param name="message">The error message.</param>
    /// <param name="innerException">The inner exception.</param>
    public ExternalServiceUnavailableException(string message, Exception innerException)
        : base(message, innerException)
    {
        ServiceName = string.Empty;
    }

    /// <summary>
    /// Gets the name of the service that is unavailable.
    /// </summary>
    public string ServiceName { get; private set; }

    /// <summary>
    /// Creates an exception for a specific service that is unavailable.
    /// </summary>
    /// <param name="serviceName">The name of the unavailable service.</param>
    /// <param name="innerException">The inner exception.</param>
    /// <returns>A new exception instance.</returns>
    internal static ExternalServiceUnavailableException ForService(string serviceName, Exception innerException)
    {
        return new ExternalServiceUnavailableException(
            $"External service '{serviceName}' is temporarily unavailable. Please try again later.",
            innerException)
        {
            ServiceName = serviceName,
        };
    }
}

/// <summary>
/// Exception thrown when an external service request times out.
/// </summary>
public class ExternalServiceTimeoutException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ExternalServiceTimeoutException"/> class.
    /// </summary>
    public ExternalServiceTimeoutException()
        : base("External service request timed out.")
    {
        ServiceName = string.Empty;
        TimeoutSeconds = 0;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ExternalServiceTimeoutException"/> class.
    /// </summary>
    /// <param name="message">The error message.</param>
    public ExternalServiceTimeoutException(string message)
        : base(message)
    {
        ServiceName = string.Empty;
        TimeoutSeconds = 0;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ExternalServiceTimeoutException"/> class.
    /// </summary>
    /// <param name="message">The error message.</param>
    /// <param name="innerException">The inner exception.</param>
    public ExternalServiceTimeoutException(string message, Exception innerException)
        : base(message, innerException)
    {
        ServiceName = string.Empty;
        TimeoutSeconds = 0;
    }

    /// <summary>
    /// Gets the name of the service that timed out.
    /// </summary>
    public string ServiceName { get; private set; }

    /// <summary>
    /// Gets the timeout duration in seconds.
    /// </summary>
    public int TimeoutSeconds { get; private set; }

    /// <summary>
    /// Creates an exception for a specific service that timed out.
    /// </summary>
    /// <param name="serviceName">The name of the service that timed out.</param>
    /// <param name="timeoutSeconds">The timeout duration in seconds.</param>
    /// <param name="innerException">The inner exception.</param>
    /// <returns>A new exception instance.</returns>
    internal static ExternalServiceTimeoutException ForService(string serviceName, int timeoutSeconds, Exception innerException)
    {
        return new ExternalServiceTimeoutException(
            $"Request to external service '{serviceName}' timed out after {timeoutSeconds} seconds.",
            innerException)
        {
            ServiceName = serviceName,
            TimeoutSeconds = timeoutSeconds,
        };
    }
}

/// <summary>
/// Well-known service names for resilience policies.
/// </summary>
public static class ExternalServices
{
    public const string Stripe = "Stripe";
    public const string Twilio = "Twilio";
    public const string TwilioSms = "Twilio.SMS";
    public const string TwilioVoice = "Twilio.Voice";
    public const string TwilioWhatsApp = "Twilio.WhatsApp";
    public const string OpenAI = "OpenAI";
    public const string SendGrid = "SendGrid";
    public const string Elasticsearch = "Elasticsearch";
    public const string Redis = "Redis";
}
