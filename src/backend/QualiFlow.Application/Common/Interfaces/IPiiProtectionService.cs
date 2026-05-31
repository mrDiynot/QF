// -----------------------------------------------------------------------
// <copyright file="IPiiProtectionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Common.Models;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for PII (Personally Identifiable Information) detection and protection.
/// </summary>
public interface IPiiProtectionService
{
    /// <summary>
    /// Redacts PII from content and returns a map for restoration.
    /// </summary>
    /// <param name="content">The content to redact.</param>
    /// <returns>Redacted content and PII map for restoration.</returns>
    PiiRedactionResult RedactPii(string content);

    /// <summary>
    /// Restores PII in content using the provided map.
    /// </summary>
    /// <param name="content">The content with placeholders.</param>
    /// <param name="piiMap">The PII map from redaction.</param>
    /// <returns>Content with PII restored.</returns>
    string RestorePii(string content, IDictionary<string, string> piiMap);

    /// <summary>
    /// Detects PII entities in content.
    /// </summary>
    /// <param name="content">The content to analyze.</param>
    /// <returns>List of detected PII entities.</returns>
    IEnumerable<PiiEntity> DetectPii(string content);
}
