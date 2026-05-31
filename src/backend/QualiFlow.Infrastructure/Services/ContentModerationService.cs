// -----------------------------------------------------------------------
// <copyright file="ContentModerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for content moderation and safety checks.
/// </summary>
public sealed partial class ContentModerationService : IContentModerationService
{
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<ContentModerationService> _logger;

    // Patterns for detecting prompt injection attempts
    private static readonly string[] PromptInjectionPatterns =
    {
        @"ignore\s+(previous|above|all)\s+(instructions|prompts|rules)",
        @"disregard\s+(previous|above|all)\s+(instructions|prompts|rules)",
        @"forget\s+(previous|above|all)\s+(instructions|prompts|rules)",
        @"you\s+are\s+now\s+a",
        @"new\s+instructions?:",
        @"system\s*:\s*",
        @"<\s*system\s*>",
        @"pretend\s+you\s+are",
        @"act\s+as\s+(if\s+)?you\s+are",
        @"roleplay\s+as",
        @"\[SYSTEM\]",
        @"\[INST\]",
        @"<\|im_start\|>",
    };

    // Profanity and inappropriate content patterns (comprehensive list)
    private static readonly string[] ProfanityPatterns =
    {
        // Explicit profanity (with common obfuscations)
        @"\b(f+u+c+k+|f\*+ck|fuk|fck|sh[i1!]+t|sh\*t|b[i1!]+tch|b\*tch|a[s\$]{2}(hole)?|bastard|cunt|d[i1]ck|p[i1]ss)\b",

        // Slurs and hate speech
        @"\b(n[i1]gg[ae]r?|f[a@]gg?[o0]t|ret[a@]rd)\b",

        // Violence and threats
        @"\b(kill\s*(you|yourself|him|her|them|me)|murder|stab|shoot|attack)\b",
        @"\bi('ll|m\s+going\s+to)\s+(kill|hurt|find|get|murder)\b",

        // Harassment patterns
        @"\bi('ll|m\s+going\s+to)\s+(harass|stalk|abuse|hunt)\b",

        // Disrespectful language
        @"\b(idiot|stupid|moron|dumb(ass)?|loser|pathetic|worthless)\b",

        // Sexual harassment
        @"\b(send\s*(me\s*)?(nudes|pics)|horny|sexy\s+girl)\b",

        // Death wishes
        @"\b(go\s+die|hope\s+you\s+die|kys|kill\s+yourself)\b",
    };

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentModerationService"/> class.
    /// </summary>
    /// <param name="openAIService">The OpenAI service for advanced moderation.</param>
    /// <param name="logger">The logger.</param>
    public ContentModerationService(
        IOpenAIService openAIService,
        ILogger<ContentModerationService> logger)
    {
        _openAIService = openAIService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ContentModerationResult> CheckContentAsync(
        string content,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        var result = new ContentModerationResult
        {
            IsSafe = true,
            Confidence = 1.0f
        };

        // 1. Check for prompt injection
        if (DetectPromptInjection(content))
        {
            result.IsSafe = false;
            result.PromptInjectionDetected = true;
            result.Reason = "Potential prompt injection detected";
            result.DetectedCategories.Add("prompt_injection");
            LogPromptInjectionDetected(content);
            return result;
        }

        // 2. Check for profanity
        if (ContainsProfanity(content))
        {
            result.IsSafe = false;
            result.Reason = "Inappropriate language detected";
            result.DetectedCategories.Add("profanity");
            LogProfanityDetected(content);
            return result;
        }

        // 3. Use OpenAI Moderation API for advanced checks
        try
        {
            var moderationResult = await CheckWithOpenAIModerationAsync(content, cancellationToken);
            if (!moderationResult.IsSafe)
            {
                return moderationResult;
            }
        }
        catch (Exception ex)
        {
            LogModerationError(ex, content);

            // Continue with basic checks if OpenAI fails
        }

        return result;
    }

    /// <inheritdoc />
    public bool DetectPromptInjection(string content)
    {
        var lowerContent = content.ToLowerInvariant();

        return Array.Exists(
            PromptInjectionPatterns,
            pattern => Regex.IsMatch(lowerContent, pattern, RegexOptions.IgnoreCase, TimeSpan.FromSeconds(1)));
    }

    /// <inheritdoc />
    public string SanitizeContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return content;
        }

        // Remove potential HTML/script tags
        var sanitized = Regex.Replace(content, @"<[^>]*>", string.Empty, RegexOptions.None, TimeSpan.FromSeconds(1));

        // Remove excessive whitespace
        sanitized = Regex.Replace(sanitized, @"\s+", " ", RegexOptions.None, TimeSpan.FromSeconds(1));

        // Trim
        sanitized = sanitized.Trim();

        return sanitized;
    }

    private static bool ContainsProfanity(string content)
    {
        var lowerContent = content.ToLowerInvariant();

        return Array.Exists(
            ProfanityPatterns,
            pattern => Regex.IsMatch(lowerContent, pattern, RegexOptions.IgnoreCase, TimeSpan.FromSeconds(1)));
    }

#pragma warning disable IDE0060, S1172 // Remove unused parameter
    private static async Task<ContentModerationResult> CheckWithOpenAIModerationAsync(
        string content,
        CancellationToken cancellationToken)
#pragma warning restore IDE0060, S1172
    {
        // Note: OpenAI Moderation API would be called here
        // For now, returning safe result as placeholder
#pragma warning disable S1135, MA0026 // TODO comment
        // TODO: Implement actual OpenAI Moderation API call when available
#pragma warning restore S1135, MA0026
        await Task.CompletedTask;

        return new ContentModerationResult
        {
            IsSafe = true,
            Confidence = 0.95f
        };
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Prompt injection detected in content: {Content}")]
    private partial void LogPromptInjectionDetected(string content);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Profanity detected in content: {Content}")]
    private partial void LogProfanityDetected(string content);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error during content moderation for content: {Content}")]
    private partial void LogModerationError(Exception ex, string content);
}
