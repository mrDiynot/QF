// -----------------------------------------------------------------------
// <copyright file="DetectedEmotion.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// A detected emotion with intensity.
/// </summary>
public sealed record DetectedEmotion
{
    /// <summary>Gets the emotion name (e.g., "frustration", "excitement", "concern").</summary>
    public required string Emotion { get; init; }

    /// <summary>Gets the intensity (0-1).</summary>
    public required float Intensity { get; init; }
}

