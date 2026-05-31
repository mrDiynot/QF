// -----------------------------------------------------------------------
// <copyright file="AIFeedbackType.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the type of feedback provided for AI-generated content.
/// Used for quality tracking and AI improvement.
/// </summary>
public enum AIFeedbackType
{
    /// <summary>User accepted the AI-generated content as-is.</summary>
    Accepted,

    /// <summary>User modified the AI-generated content before using.</summary>
    Modified,

    /// <summary>User rejected the AI-generated content completely.</summary>
    Rejected,

    /// <summary>User gave a thumbs up rating.</summary>
    ThumbsUp,

    /// <summary>User gave a thumbs down rating.</summary>
    ThumbsDown,
}

