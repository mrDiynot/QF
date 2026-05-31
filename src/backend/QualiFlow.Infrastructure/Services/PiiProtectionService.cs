// -----------------------------------------------------------------------
// <copyright file="PiiProtectionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for PII detection and protection.
/// </summary>
public sealed partial class PiiProtectionService : IPiiProtectionService
{
    private readonly ILogger<PiiProtectionService> _logger;

    // Regex patterns for common PII types
    private static readonly Dictionary<string, string> PiiPatterns = new()
    {
        // Email addresses
        ["email"] = @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",

        // Phone numbers (US format)
        ["phone"] = @"\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b",

        // SSN (US Social Security Number)
        ["ssn"] = @"\b\d{3}-\d{2}-\d{4}\b",

        // Credit card numbers (basic pattern)
        ["credit_card"] = @"\b(?:\d{4}[-\s]?){3}\d{4}\b",

        // IP addresses
        ["ip_address"] = @"\b(?:\d{1,3}\.){3}\d{1,3}\b",

        // Dates of birth (various formats)
        ["date_of_birth"] = @"\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12][0-9]|3[01])[/-](?:19|20)\d{2}\b",
    };

    /// <summary>
    /// Initializes a new instance of the <see cref="PiiProtectionService"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    public PiiProtectionService(ILogger<PiiProtectionService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public PiiRedactionResult RedactPii(string content)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        var result = new PiiRedactionResult
        {
            RedactedContent = content,
            ContainsPii = false
        };

        var detectedEntities = DetectPii(content).ToList();

        if (detectedEntities.Count == 0)
        {
            return result;
        }

        result.ContainsPii = true;

        // Sort by start index descending to replace from end to start
        var sortedEntities = detectedEntities.OrderByDescending(e => e.StartIndex).ToList();

        var redactedContent = content;
        var placeholderIndex = 0;

        foreach (var entity in sortedEntities)
        {
            var placeholder = $"[{entity.Type.ToUpperInvariant()}_{placeholderIndex}]";
            result.PiiMap[placeholder] = entity.Value;
            result.DetectedEntities.Add(entity);

            // Replace the PII with placeholder
            redactedContent = redactedContent.Remove(entity.StartIndex, entity.EndIndex - entity.StartIndex)
                .Insert(entity.StartIndex, placeholder);

            placeholderIndex++;
        }

        result.RedactedContent = redactedContent;

        LogPiiRedacted(detectedEntities.Count);

        return result;
    }

    /// <inheritdoc />
    public string RestorePii(string content, IDictionary<string, string> piiMap)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);
        ArgumentNullException.ThrowIfNull(piiMap);

        var restoredContent = content;

        foreach (var (placeholder, originalValue) in piiMap)
        {
            restoredContent = restoredContent.Replace(placeholder, originalValue, StringComparison.Ordinal);
        }

        return restoredContent;
    }

    /// <inheritdoc />
    public IEnumerable<PiiEntity> DetectPii(string content)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        var entities = new List<PiiEntity>();

        foreach (var (type, pattern) in PiiPatterns)
        {
            var matches = Regex.Matches(content, pattern, RegexOptions.IgnoreCase, TimeSpan.FromSeconds(1));

            foreach (Match match in matches)
            {
                // Skip false positives
                if (ShouldSkipMatch(type, match.Value))
                {
                    continue;
                }

                entities.Add(new PiiEntity
                {
                    Type = type,
                    Value = match.Value,
                    StartIndex = match.Index,
                    EndIndex = match.Index + match.Length,
                    Confidence = CalculateConfidence(type, match.Value)
                });
            }
        }

        return entities;
    }

    private static bool ShouldSkipMatch(string type, string value)
    {
        // Skip common false positives
        if (type == "phone" && (value.StartsWith("19", StringComparison.Ordinal) || value.StartsWith("20", StringComparison.Ordinal)))
        {
            return true;
        }

        if (type == "ip_address" && (value.StartsWith("0.", StringComparison.Ordinal) || value.StartsWith("255.", StringComparison.Ordinal)))
        {
            return true;
        }

        return false;
    }

    private static float CalculateConfidence(string type, string value)
    {
        // Simple confidence calculation based on pattern complexity
        return type switch
        {
            "email" => value.Contains('@', StringComparison.Ordinal) && value.Contains('.', StringComparison.Ordinal) ? 0.95f : 0.7f,
            "ssn" => value.Contains('-', StringComparison.Ordinal) && value.Length == 11 ? 0.98f : 0.8f,
            "credit_card" => value.Replace(" ", string.Empty, StringComparison.Ordinal).Replace("-", string.Empty, StringComparison.Ordinal).Length == 16 ? 0.9f : 0.7f,
            "phone" => 0.85f,
            "ip_address" => 0.8f,
            "date_of_birth" => 0.75f,
            _ => 0.7f
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Redacted {Count} PII entities from content")]
    private partial void LogPiiRedacted(int count);
}
