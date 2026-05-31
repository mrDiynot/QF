using System.Linq.Expressions;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Abstraction for background job scheduling.
/// Implemented by Hangfire in the Infrastructure layer.
/// </summary>
public interface IBackgroundJobService
{
    /// <summary>
    /// Enqueues a background job to be executed immediately.
    /// </summary>
    /// <typeparam name="T">The type of the service containing the method to execute.</typeparam>
    /// <param name="methodCall">Expression representing the method to call.</param>
    /// <returns>The job ID.</returns>
    string Enqueue<T>(Expression<Func<T, Task>> methodCall);

    /// <summary>
    /// Schedules a background job to be executed after a delay.
    /// </summary>
    /// <typeparam name="T">The type of the service containing the method to execute.</typeparam>
    /// <param name="methodCall">Expression representing the method to call.</param>
    /// <param name="delay">The delay before execution.</param>
    /// <returns>The job ID.</returns>
    string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay);

    /// <summary>
    /// Schedules a background job to be executed at a specific time.
    /// </summary>
    /// <typeparam name="T">The type of the service containing the method to execute.</typeparam>
    /// <param name="methodCall">Expression representing the method to call.</param>
    /// <param name="enqueueAt">The time to execute the job.</param>
    /// <returns>The job ID.</returns>
    string Schedule<T>(Expression<Func<T, Task>> methodCall, DateTimeOffset enqueueAt);
}

