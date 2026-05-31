// -----------------------------------------------------------------------
// <copyright file="PiiRedactionResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Result of PII redaction operation.
/// </summary>
public sealed class PiiRedactionResult
{
    /// <summary>
    /// Gets or sets the redacted content with placeholders.
    /// </summary>
    public string RedactedContent { get; set; } = string.Empty;

    /// <summary>
    /// Gets the PII map for restoration (placeholder -> original value).
    /// </summary>
    public IDictionary<string, string> PiiMap { get; } = new Dictionary<string, string>();

    /// <summary>
    /// Gets the detected PII entities.
    /// </summary>
    public IList<PiiEntity> DetectedEntities { get; } = new List<PiiEntity>();

    /// <summary>
    /// Gets or sets a value indicating whether any PII was found.
    /// </summary>
    public bool ContainsPii { get; set; }
}

/// <summary>
/// Represents a detected PII entity.
/// </summary>
public sealed class PiiEntity
{
    /// <summary>
    /// Gets or sets the entity type (email, phone, ssn, credit_card, etc.).
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the detected value.
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the start position in the original text.
    /// </summary>
    public int StartIndex { get; set; }

    /// <summary>
    /// Gets or sets the end position in the original text.
    /// </summary>
    public int EndIndex { get; set; }

    /// <summary>
    /// Gets or sets the confidence score (0-1).
    /// </summary>
    public float Confidence { get; set; }
}
