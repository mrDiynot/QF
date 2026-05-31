// <copyright file="WorkflowApprovalRequestDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Workflows.Admin.DTOs;

/// <summary>
/// DTO for workflow approval request information.
/// </summary>
public class WorkflowApprovalRequestDto
{
    /// <summary>
    /// Gets or sets the request ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string BusinessName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the workflow template ID.
    /// </summary>
    public Guid WorkflowTemplateId { get; set; }

    /// <summary>
    /// Gets or sets the workflow name.
    /// </summary>
    public string WorkflowName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user ID who requested.
    /// </summary>
    public Guid RequestedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the email of the requester.
    /// </summary>
    public string RequestedByEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the request reason.
    /// </summary>
    public string? RequestReason { get; set; }

    /// <summary>
    /// Gets or sets the custom configuration requested.
    /// </summary>
    public object? CustomConfiguration { get; set; }

    /// <summary>
    /// Gets or sets the approval status.
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Gets or sets who reviewed the request.
    /// </summary>
    public string? ReviewedBy { get; set; }

    /// <summary>
    /// Gets or sets when the request was reviewed.
    /// </summary>
    public DateTime? ReviewedAt { get; set; }

    /// <summary>
    /// Gets or sets the review notes.
    /// </summary>
    public string? ReviewNotes { get; set; }

    /// <summary>
    /// Gets or sets when the request was submitted.
    /// </summary>
    public DateTime RequestedAt { get; set; }

    /// <summary>
    /// Gets or sets when the request expires.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}
