// <copyright file="DelayActivity.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows.Activities;

/// <summary>
/// Workflow activity for introducing delays between workflow steps.
/// Supports delays in minutes, hours, or days.
/// </summary>
public class DelayActivity : StepBody
{
    private readonly ILogger<DelayActivity> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="DelayActivity"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    public DelayActivity(ILogger<DelayActivity> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets or sets the delay duration in minutes.
    /// </summary>
    public int DelayMinutes { get; set; }

    /// <summary>
    /// Gets or sets the delay duration in hours (converted to minutes internally).
    /// </summary>
    public int DelayHours { get; set; }

    /// <summary>
    /// Gets or sets the delay duration in days (converted to minutes internally).
    /// </summary>
    public int DelayDays { get; set; }

    /// <summary>
    /// Gets or sets the calculated resume time (output).
    /// </summary>
    public DateTime ResumeAt { get; set; }

    /// <summary>
    /// Executes the delay activity.
    /// </summary>
    /// <param name="context">The step execution context.</param>
    /// <returns>The execution result with sleep duration.</returns>
    public override ExecutionResult Run(IStepExecutionContext context)
    {
        var totalMinutes = DelayMinutes + (DelayHours * 60) + (DelayDays * 24 * 60);

        if (totalMinutes <= 0)
        {
            _logger.LogWarning("Delay activity called with zero or negative delay. Proceeding immediately.");
            return ExecutionResult.Next();
        }

        ResumeAt = DateTime.UtcNow.AddMinutes(totalMinutes);

        _logger.LogInformation(
            "Workflow pausing for {TotalMinutes} minutes. Will resume at {ResumeAt}",
            totalMinutes,
            ResumeAt);

        return ExecutionResult.Sleep(TimeSpan.FromMinutes(totalMinutes), context.PersistenceData);
    }
}
