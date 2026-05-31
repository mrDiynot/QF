// -----------------------------------------------------------------------
// <copyright file="IResilienceService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Polly.CircuitBreaker;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Provides resilience patterns (retry, circuit breaker, timeout) for external service calls.
/// This is an enterprise-grade implementation following best practices for distributed systems.
/// </summary>
public interface IResilienceService
{
    /// <summary>
    /// Executes an action with retry, circuit breaker, and timeout policies.
    /// </summary>
    /// <typeparam name="T">The return type of the action.</typeparam>
    /// <param name="serviceName">The name of the external service.</param>
    /// <param name="action">The action to execute.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of the action.</returns>
    Task<T> ExecuteAsync<T>(
        string serviceName,
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes an action with retry, circuit breaker, and timeout policies (no return value).
    /// </summary>
    /// <param name="serviceName">The name of the external service.</param>
    /// <param name="action">The action to execute.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ExecuteAsync(
        string serviceName,
        Func<CancellationToken, Task> action,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current circuit breaker state for a service.
    /// </summary>
    /// <param name="serviceName">The name of the external service.</param>
    /// <returns>The current circuit state.</returns>
    CircuitState GetCircuitState(string serviceName);

    /// <summary>
    /// Manually resets the circuit breaker for a service.
    /// </summary>
    /// <param name="serviceName">The name of the external service.</param>
    void ResetCircuit(string serviceName);
}
