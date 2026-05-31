// -----------------------------------------------------------------------
// <copyright file="ContentModerationResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Result of content moderation check.
/// </summary>
public sealed class ContentModerationResult
{
    /// <summary>
    /// Gets or sets a value indicating whether the content is safe.
    /// </summary>
    public bool IsSafe { get; set; }

    /// <summary>
    /// Gets or sets the reason if content is not safe.
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Gets the detected categories.
    /// </summary>
    public IList<string> DetectedCategories { get; } = new List<string>();

    /// <summary>
    /// Gets or sets the confidence score (0-1).
    /// </summary>
    public float Confidence { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether prompt injection was detected.
    /// </summary>
    public bool PromptInjectionDetected { get; set; }
}
