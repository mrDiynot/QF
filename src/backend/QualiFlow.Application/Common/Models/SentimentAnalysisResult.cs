// -----------------------------------------------------------------------
// <copyright file="SentimentAnalysisResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Result of sentiment analysis.
/// </summary>
public sealed record SentimentAnalysisResult
{
    /// <summary>Gets the overall sentiment (Positive, Negative, Neutral, Mixed).</summary>
    public required string Sentiment { get; init; }

    /// <summary>Gets the sentiment score (-1 to 1, negative to positive).</summary>
    public required float Score { get; init; }

    /// <summary>Gets the confidence of the analysis (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets detected emotions.</summary>
    public IReadOnlyList<DetectedEmotion>? Emotions { get; init; }
}

