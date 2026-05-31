// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.AutoAssignment.Interfaces;

/// <summary>
/// Service for applying auto-assignment rules to leads.
/// </summary>
public interface IAutoAssignmentService
{
    /// <summary>
    /// Applies auto-assignment rules to a lead and assigns it to the appropriate user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">The lead ID to assign.</param>
    /// <param name="channel">The source channel of the lead (SMS, Chat, Form, etc.).</param>
    /// <param name="leadScore">The current lead score.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the auto-assignment operation.</returns>
    Task<AutoAssignmentResult> ApplyRulesAsync(
        Guid businessId,
        Guid leadId,
        string channel,
        int leadScore,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of an auto-assignment operation.
/// </summary>
public record AutoAssignmentResult
{
    /// <summary>
    /// Gets a value indicating whether the lead was assigned.
    /// </summary>
    public bool WasAssigned { get; init; }

    /// <summary>
    /// Gets the ID of the user the lead was assigned to.
    /// </summary>
    public Guid? AssignedToUserId { get; init; }

    /// <summary>
    /// Gets the name of the rule that was applied.
    /// </summary>
    public string? AppliedRuleName { get; init; }

    /// <summary>
    /// Gets the assignment type used (round_robin, least_busy, specific_user).
    /// </summary>
    public string? AssignmentType { get; init; }

    /// <summary>
    /// Gets the reason if no assignment was made.
    /// </summary>
    public string? Reason { get; init; }

    /// <summary>
    /// Creates a successful assignment result.
    /// </summary>
    /// <param name="userId">The ID of the user the lead was assigned to.</param>
    /// <param name="ruleName">The name of the rule that was applied.</param>
    /// <param name="assignmentType">The type of assignment used.</param>
    /// <returns>A successful auto-assignment result.</returns>
    public static AutoAssignmentResult Assigned(Guid userId, string ruleName, string assignmentType) =>
        new()
        {
            WasAssigned = true,
            AssignedToUserId = userId,
            AppliedRuleName = ruleName,
            AssignmentType = assignmentType,
        };

    /// <summary>
    /// Creates a result indicating no assignment was made.
    /// </summary>
    /// <param name="reason">The reason the assignment was not made.</param>
    /// <returns>An auto-assignment result indicating no assignment was made.</returns>
    public static AutoAssignmentResult NotAssigned(string reason) =>
        new()
        {
            WasAssigned = false,
            Reason = reason,
        };
}

