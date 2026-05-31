using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an auto-assignment rule for conversations.
/// </summary>
public class AutoAssignmentRule : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the rule name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the rule description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the priority (lower = higher priority).
    /// </summary>
    public int Priority { get; set; } = 100;

    /// <summary>
    /// Gets or sets a value indicating whether the rule is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the channel filter (null = all channels).
    /// </summary>
    public string? Channel { get; set; }

    /// <summary>
    /// Gets or sets the lead score minimum threshold.
    /// </summary>
    public int? MinLeadScore { get; set; }

    /// <summary>
    /// Gets or sets the lead score maximum threshold.
    /// </summary>
    public int? MaxLeadScore { get; set; }

    /// <summary>
    /// Gets or sets the assignment type (round_robin, least_busy, specific_user).
    /// </summary>
    public string AssignmentType { get; set; } = "round_robin";

    /// <summary>
    /// Gets or sets the specific user ID for specific_user assignment type.
    /// </summary>
    public Guid? AssignToUserId { get; set; }

    /// <summary>
    /// Gets or sets the user IDs for round-robin pool (JSON array).
    /// </summary>
    public string? UserPoolJson { get; set; }

    /// <summary>
    /// Gets or sets the last assigned user index for round-robin.
    /// </summary>
    public int LastAssignedIndex { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this rule belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the specific user to assign to.
    /// </summary>
    public ApplicationUser? AssignToUser { get; set; }
}

