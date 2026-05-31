using System.Linq.Expressions;
using Hangfire;
using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Hangfire implementation of the background job service.
/// </summary>
/// <param name="backgroundJobClient">The Hangfire background job client.</param>
public class BackgroundJobService(IBackgroundJobClient backgroundJobClient) : IBackgroundJobService
{
    /// <inheritdoc />
    public string Enqueue<T>(Expression<Func<T, Task>> methodCall)
    {
        return backgroundJobClient.Enqueue(methodCall);
    }

    /// <inheritdoc />
    public string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay)
    {
        return backgroundJobClient.Schedule(methodCall, delay);
    }

    /// <inheritdoc />
    public string Schedule<T>(Expression<Func<T, Task>> methodCall, DateTimeOffset enqueueAt)
    {
        return backgroundJobClient.Schedule(methodCall, enqueueAt);
    }
}

