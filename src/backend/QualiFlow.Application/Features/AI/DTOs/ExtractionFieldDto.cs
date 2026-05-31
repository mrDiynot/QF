// -----------------------------------------------------------------------
// <copyright file="ExtractionFieldDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Represents an extracted field with its value and confidence.
/// </summary>
public sealed record ExtractionFieldDto
{
    /// <summary>Gets the field name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the extracted value.</summary>
    public string? Value { get; init; }

    /// <summary>Gets the confidence score (0-1).</summary>
    public double Confidence { get; init; }

    /// <summary>Gets the source text from which this was extracted.</summary>
    public string? SourceText { get; init; }

    /// <summary>Gets a value indicating whether this field was explicitly stated or inferred.</summary>
    public bool IsExplicit { get; init; }
}

