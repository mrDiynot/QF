using System.Diagnostics;
using Hangfire.Common;
using Hangfire.Server;
using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Performance logging filter for Hangfire jobs.
/// Logs job execution time and performance metrics (S14-BE-005).
/// </summary>
public partial class JobPerformanceLoggerAttribute : JobFilterAttribute, IServerFilter
{
    private static readonly ILogger Logger = LoggerFactory.Create(builder =>
    {
        builder.AddConsole();
    }).CreateLogger<JobPerformanceLoggerAttribute>();

    /// <summary>
    /// Called before a job is performed.
    /// </summary>
    /// <param name="context">The performing context.</param>
    public void OnPerforming(PerformingContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        context.Items["Stopwatch"] = stopwatch;

        LogJobStarting(
            Logger,
            context.BackgroundJob.Id,
            context.BackgroundJob.Job.Type.Name,
            context.BackgroundJob.Job.Method.Name);
    }

    /// <summary>
    /// Called after a job has been performed.
    /// </summary>
    /// <param name="context">The performed context.</param>
    public void OnPerformed(PerformedContext context)
    {
        if (context.Items.TryGetValue("Stopwatch", out var value) && value is Stopwatch stopwatch)
        {
            stopwatch.Stop();

            var executionTimeMs = stopwatch.ElapsedMilliseconds;
            var jobId = context.BackgroundJob.Id;
            var jobType = context.BackgroundJob.Job.Type.Name;
            var jobMethod = context.BackgroundJob.Job.Method.Name;

            if (context.Exception != null)
            {
                LogJobFailed(
                    Logger,
                    jobId,
                    jobType,
                    jobMethod,
                    executionTimeMs,
                    context.Exception.Message);
            }
            else
            {
                LogJobCompleted(
                    Logger,
                    jobId,
                    jobType,
                    jobMethod,
                    executionTimeMs);
            }

            // Log warning if job execution time exceeds 5 minutes
            if (executionTimeMs > 300000)
            {
                LogSlowJob(
                    Logger,
                    jobId,
                    jobType,
                    jobMethod,
                    executionTimeMs);
            }
        }
    }

    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Hangfire job starting - JobId: {JobId}, Type: {JobType}, Method: {JobMethod}")]
    private static partial void LogJobStarting(ILogger logger, string jobId, string jobType, string jobMethod);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Hangfire job completed - JobId: {JobId}, Type: {JobType}, Method: {JobMethod}, ExecutionTime: {ExecutionTimeMs}ms")]
    private static partial void LogJobCompleted(ILogger logger, string jobId, string jobType, string jobMethod, long executionTimeMs);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Error,
        Message = "Hangfire job failed - JobId: {JobId}, Type: {JobType}, Method: {JobMethod}, ExecutionTime: {ExecutionTimeMs}ms, Error: {ErrorMessage}")]
    private static partial void LogJobFailed(ILogger logger, string jobId, string jobType, string jobMethod, long executionTimeMs, string errorMessage);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Warning,
        Message = "Hangfire job slow execution - JobId: {JobId}, Type: {JobType}, Method: {JobMethod}, ExecutionTime: {ExecutionTimeMs}ms (threshold: 300000ms)")]
    private static partial void LogSlowJob(ILogger logger, string jobId, string jobType, string jobMethod, long executionTimeMs);
}

