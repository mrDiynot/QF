// <copyright file="WorkflowAnalyticsDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Workflows.Admin.DTOs;

/// <summary>
/// DTO for workflow analytics data.
/// </summary>
public class WorkflowAnalyticsDto
{
    /// <summary>
    /// Gets or sets the total number of templates.
    /// </summary>
    public int TotalTemplates { get; set; }

    /// <summary>
    /// Gets or sets the number of active templates.
    /// </summary>
    public int ActiveTemplates { get; set; }

    /// <summary>
    /// Gets or sets the total number of business workflows.
    /// </summary>
    public int TotalBusinessWorkflows { get; set; }

    /// <summary>
    /// Gets or sets the number of active business workflows.
    /// </summary>
    public int ActiveBusinessWorkflows { get; set; }

    /// <summary>
    /// Gets or sets the total number of executions.
    /// </summary>
    public int TotalExecutions { get; set; }

    /// <summary>
    /// Gets or sets the number of successful executions.
    /// </summary>
    public int SuccessfulExecutions { get; set; }

    /// <summary>
    /// Gets or sets the number of failed executions.
    /// </summary>
    public int FailedExecutions { get; set; }

    /// <summary>
    /// Gets or sets the overall success rate.
    /// </summary>
    public double OverallSuccessRate { get; set; }

    /// <summary>
    /// Gets or sets the average execution time in seconds.
    /// </summary>
    public double AverageExecutionTime { get; set; }

    /// <summary>
    /// Gets the top templates by usage.
    /// </summary>
    public IReadOnlyCollection<TemplateUsageDto> TopTemplates { get; init; } = [];

    /// <summary>
    /// Gets the execution trend data.
    /// </summary>
    public IReadOnlyCollection<ExecutionTrendDto> ExecutionTrend { get; init; } = [];
}

/// <summary>
/// DTO for template usage statistics.
/// </summary>
public class TemplateUsageDto
{
    /// <summary>
    /// Gets or sets the template ID.
    /// </summary>
    public Guid TemplateId { get; set; }

    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of executions.
    /// </summary>
    public int Executions { get; set; }

    /// <summary>
    /// Gets or sets the success rate.
    /// </summary>
    public double SuccessRate { get; set; }
}

/// <summary>
/// DTO for execution trend data.
/// </summary>
public class ExecutionTrendDto
{
    /// <summary>
    /// Gets or sets the date.
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Gets or sets the number of executions.
    /// </summary>
    public int Executions { get; set; }

    /// <summary>
    /// Gets or sets the number of successes.
    /// </summary>
    public int Successes { get; set; }

    /// <summary>
    /// Gets or sets the number of failures.
    /// </summary>
    public int Failures { get; set; }
}
