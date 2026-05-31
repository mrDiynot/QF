using Hangfire.Common;
using Hangfire.States;
using Hangfire.Storage;
using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Automatic retry attribute for Hangfire jobs with exponential backoff.
/// Implements S14-BE-005 retry policy: 3 attempts with exponential backoff.
/// </summary>
public class AutomaticRetryAttribute : JobFilterAttribute, IElectStateFilter, IApplyStateFilter
{
    private const int MaxRetryAttempts = 3;
    private static readonly TimeSpan[] RetryDelays = new[]
    {
        TimeSpan.FromSeconds(30),  // 1st retry: 30 seconds
        TimeSpan.FromMinutes(5),   // 2nd retry: 5 minutes
        TimeSpan.FromMinutes(30),  // 3rd retry: 30 minutes
    };

    /// <summary>
    /// Called when a state is being elected.
    /// </summary>
    /// <param name="context">The elect state context.</param>
    public void OnStateElection(ElectStateContext context)
    {
        var failedState = context.CandidateState as FailedState;
        if (failedState == null)
        {
            return;
        }

        var retryAttempt = context.GetJobParameter<int>("RetryCount") + 1;

        if (retryAttempt <= MaxRetryAttempts)
        {
            var delay = retryAttempt <= RetryDelays.Length
                ? RetryDelays[retryAttempt - 1]
                : RetryDelays[^1];

            context.SetJobParameter("RetryCount", retryAttempt);

            // Schedule retry with exponential backoff
            context.CandidateState = new ScheduledState(delay)
            {
                Reason = $"Retry attempt {retryAttempt} of {MaxRetryAttempts} after {delay.TotalSeconds}s delay. " +
                        $"Error: {failedState.Exception.Message}",
            };
        }
        else
        {
            // Max retries exceeded, move to failed state
            context.CandidateState = new FailedState(failedState.Exception)
            {
                Reason = $"Job failed after {MaxRetryAttempts} retry attempts. " +
                        $"Last error: {failedState.Exception.Message}",
            };
        }
    }

    /// <summary>
    /// Called when a state has been applied.
    /// </summary>
    /// <param name="context">The apply state context.</param>
    /// <param name="transaction">The write-only transaction.</param>
    public void OnStateApplied(ApplyStateContext context, IWriteOnlyTransaction transaction)
    {
        // Reset retry count on successful completion
        if (context.NewState is SucceededState)
        {
            transaction.SetRangeInHash(
                $"job:{context.BackgroundJob.Id}",
                new Dictionary<string, string> { { "RetryCount", "0" } });
        }
    }

    /// <summary>
    /// Called when a state is being unapplied.
    /// </summary>
    /// <param name="context">The apply state context.</param>
    /// <param name="transaction">The write-only transaction.</param>
    public void OnStateUnapplied(ApplyStateContext context, IWriteOnlyTransaction transaction)
    {
        // No action needed
    }
}

