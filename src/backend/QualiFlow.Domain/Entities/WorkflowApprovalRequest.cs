// <copyright file="WorkflowApprovalRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a request from a business to activate a workflow that requires approval.
/// Used for premium workflows or workflows outside the business's plan tier.
/// </summary>
public class WorkflowApprovalRequest : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID requesting approval.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the workflow template ID being requested.
    /// </summary>
    public Guid WorkflowTemplateId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who submitted the request.
    /// </summary>
    public Guid RequestedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the email of the user who submitted the request.
    /// </summary>
    public string RequestedByEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the reason for the request.
    /// </summary>
    public string? RequestReason { get; set; }

    /// <summary>
    /// Gets or sets the custom configuration requested as JSON.
    /// </summary>
    public string CustomConfiguration { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the approval status (Pending, Approved, Rejected).
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Gets or sets the admin user who reviewed the request.
    /// </summary>
    public string? ReviewedBy { get; set; }

    /// <summary>
    /// Gets or sets when the request was reviewed.
    /// </summary>
    public DateTime? ReviewedAt { get; set; }

    /// <summary>
    /// Gets or sets the review notes from the admin.
    /// </summary>
    public string? ReviewNotes { get; set; }

    /// <summary>
    /// Gets or sets when the request was submitted.
    /// </summary>
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the request expires (if not reviewed).
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business making the request.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the workflow template being requested.
    /// </summary>
    public WorkflowTemplate WorkflowTemplate { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who submitted the request.
    /// </summary>
    public ApplicationUser RequestedByUser { get; set; } = null!;
}
