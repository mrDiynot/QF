// -----------------------------------------------------------------------
// <copyright file="ScoringConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Scoring configuration for a business.
/// </summary>
public sealed record ScoringConfiguration
{
    /// <summary>Gets the business ID this configuration belongs to.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the minimum score threshold for qualification (0-100).</summary>
    public int QualificationThreshold { get; init; } = 70;

    /// <summary>Gets the weight for AI-based scoring (0-100).</summary>
    public int AIWeight { get; init; } = 60;

    /// <summary>Gets the weight for business rules scoring (0-100).</summary>
    public int RulesWeight { get; init; } = 40;

    /// <summary>Gets the BANT scoring weights.</summary>
    public BantWeights BantWeights { get; init; } = new();

    /// <summary>Gets the AI factor weights.</summary>
    public AIFactorWeights AIFactorWeights { get; init; } = new();

    /// <summary>Gets a value indicating whether to auto-transition lead status based on score.</summary>
    public bool AutoTransitionStatus { get; init; } = true;

    /// <summary>Gets the score thresholds for status transitions.</summary>
    public StatusThresholds Thresholds { get; init; } = new();
}

