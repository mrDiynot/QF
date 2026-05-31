using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a workflow definition template that can be executed multiple times.
/// Stores the workflow structure, steps, and configuration.
/// </summary>
public class WorkflowDefinition : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the workflow name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the workflow description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the workflow version number.
    /// </summary>
    public int Version { get; set; } = 1;

    /// <summary>
    /// Gets or sets the workflow definition as JSON.
    /// Contains the workflow structure, steps, and configuration.
    /// </summary>
    public string DefinitionJson { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this workflow is active and can be executed.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the workflow trigger type (Manual, Scheduled, Event).
    /// </summary>
    public WorkflowTriggerType TriggerType { get; set; } = WorkflowTriggerType.Manual;

    /// <summary>
    /// Gets or sets the trigger configuration as JSON.
    /// For scheduled workflows: cron expression, timezone.
    /// For event workflows: event type, conditions.
    /// </summary>
    public string? TriggerConfig { get; set; }

    /// <summary>
    /// Gets or sets the workflow category (LeadQualification, EmailNurture, FollowUp, Custom).
    /// </summary>
    public WorkflowCategory Category { get; set; } = WorkflowCategory.Custom;

    /// <summary>
    /// Gets or sets the workflow tags (comma-separated).
    /// </summary>
    public string? Tags { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this workflow belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the workflow instances created from this definition.
    /// </summary>
    public ICollection<WorkflowInstance> Instances { get; } = [];
}

