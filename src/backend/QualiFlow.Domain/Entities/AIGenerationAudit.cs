// -----------------------------------------------------------------------
// <copyright file="AIGenerationAudit.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an audit record for AI-generated content.
/// Tracks all AI generation requests, outputs, token usage, costs, and user feedback.
/// Used for quality monitoring, cost tracking, and AI improvement.
/// </summary>
public class AIGenerationAudit : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who requested the AI generation.
    /// Null if triggered by system/automation.
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Gets or sets the type of AI task performed.
    /// Stored as string for flexibility; maps to AITaskType enum in Application layer.
    /// </summary>
    public string TaskType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the input prompt sent to the AI model.
    /// </summary>
    public string InputPrompt { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the AI-generated output as JSON.
    /// </summary>
    public string OutputJson { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of input tokens used.
    /// </summary>
    public int InputTokens { get; set; }

    /// <summary>
    /// Gets or sets the number of output tokens generated.
    /// </summary>
    public int OutputTokens { get; set; }

    /// <summary>
    /// Gets the total tokens used (input + output).
    /// </summary>
    public int TotalTokens => InputTokens + OutputTokens;

    /// <summary>
    /// Gets or sets the AI model used for generation.
    /// </summary>
    public string ModelUsed { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the duration of the AI request in milliseconds.
    /// </summary>
    public int DurationMs { get; set; }

    /// <summary>
    /// Gets or sets the estimated cost in USD for this generation.
    /// </summary>
    public decimal EstimatedCostUsd { get; set; }

    /// <summary>
    /// Gets or sets the user feedback type for this generation.
    /// Null if no feedback provided yet.
    /// </summary>
    public AIFeedbackType? Feedback { get; set; }

    /// <summary>
    /// Gets or sets the user's feedback comment.
    /// Null if no comment provided.
    /// </summary>
    public string? FeedbackComment { get; set; }

    /// <summary>
    /// Gets or sets when feedback was provided.
    /// </summary>
    public DateTime? FeedbackAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the generation was successful.
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// Gets or sets the error message if generation failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON.
    /// Can store context-specific information like form ID, workflow ID, etc.
    /// </summary>
    public string? Metadata { get; set; }

    // ========================================
    // Navigation Properties
    // ========================================

    /// <summary>
    /// Gets or sets the business this audit belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who requested the generation.
    /// </summary>
    public ApplicationUser? User { get; set; }
}

