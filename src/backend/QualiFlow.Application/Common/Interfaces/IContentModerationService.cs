// -----------------------------------------------------------------------
// <copyright file="IContentModerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Common.Models;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for content moderation and safety checks.
/// </summary>
public interface IContentModerationService
{
    /// <summary>
    /// Checks if content is safe and appropriate.
    /// </summary>
    /// <param name="content">The content to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Moderation result with safety status and details.</returns>
    Task<ContentModerationResult> CheckContentAsync(
        string content,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if content contains prompt injection attempts.
    /// </summary>
    /// <param name="content">The content to check.</param>
    /// <returns>True if prompt injection detected.</returns>
    bool DetectPromptInjection(string content);

    /// <summary>
    /// Sanitizes content by removing potentially harmful elements.
    /// </summary>
    /// <param name="content">The content to sanitize.</param>
    /// <returns>Sanitized content.</returns>
    string SanitizeContent(string content);
}
