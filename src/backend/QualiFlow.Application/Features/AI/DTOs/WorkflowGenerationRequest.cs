// -----------------------------------------------------------------------
// <copyright file="WorkflowGenerationRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for generating a workflow using AI.
/// </summary>
public sealed record WorkflowGenerationRequest
{
    /// <summary>Gets the natural language goal description.</summary>
    [Required]
    [StringLength(1000, MinimumLength = 10)]
    public string GoalDescription { get; init; } = string.Empty;

    /// <summary>Gets the trigger type for the workflow.</summary>
    [Required]
    public string TriggerType { get; init; } = "lead_created";

    /// <summary>Gets optional specific actions to include.</summary>
    public IReadOnlyList<string>? DesiredActions { get; init; }

    /// <summary>Gets the workflow category.</summary>
    public string? Category { get; init; }

    /// <summary>Gets a value indicating whether to include delay steps.</summary>
    public bool IncludeDelays { get; init; } = true;

    /// <summary>Gets a value indicating whether to include conditional branches.</summary>
    public bool IncludeBranches { get; init; } = true;

    /// <summary>Gets the maximum number of steps to generate.</summary>
    [Range(2, 20)]
    public int MaxSteps { get; init; } = 10;
}

/// <summary>
/// Result of AI workflow generation.
/// </summary>
public sealed record WorkflowGenerationResult
{
    /// <summary>Gets a value indicating whether the generation was successful.</summary>
    public bool Success { get; init; }

    /// <summary>Gets the error message if generation failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets a value indicating whether the failure was due to usage limits.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>Gets the generated workflow name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the generated workflow description.</summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>Gets the workflow category.</summary>
    public string Category { get; init; } = string.Empty;

    /// <summary>Gets the trigger configuration.</summary>
    public WorkflowTriggerDto Trigger { get; init; } = new();

    /// <summary>Gets the workflow steps.</summary>
    public IReadOnlyList<WorkflowStepDto> Steps { get; init; } = [];

    /// <summary>Gets the estimated execution time in minutes.</summary>
    public int EstimatedTimeMinutes { get; init; }

    /// <summary>Gets the audit ID for feedback tracking.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets the generation timestamp.</summary>
    public DateTime GeneratedAt { get; init; }
}

/// <summary>
/// Workflow trigger configuration.
/// </summary>
public sealed record WorkflowTriggerDto
{
    /// <summary>Gets the trigger type.</summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>Gets the trigger description.</summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>Gets optional trigger conditions.</summary>
    public IReadOnlyDictionary<string, object>? Conditions { get; init; }
}

/// <summary>
/// Workflow step definition.
/// </summary>
public sealed record WorkflowStepDto
{
    /// <summary>Gets the step ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the step type (action, delay, condition, end).</summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>Gets the step name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the step description.</summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>Gets the step icon.</summary>
    public string Icon { get; init; } = "⚡";

    /// <summary>Gets the step configuration.</summary>
    public IReadOnlyDictionary<string, object>? Config { get; init; }

    /// <summary>Gets the next step ID (for linear flow).</summary>
    public string? NextStepId { get; init; }

    /// <summary>Gets conditional branches.</summary>
    public IReadOnlyList<WorkflowBranchDto>? Branches { get; init; }
}

/// <summary>
/// Workflow conditional branch.
/// </summary>
public sealed record WorkflowBranchDto
{
    /// <summary>Gets the branch condition.</summary>
    public string Condition { get; init; } = string.Empty;

    /// <summary>Gets the next step ID if condition is met.</summary>
    public string NextStepId { get; init; } = string.Empty;
}

