// -----------------------------------------------------------------------
// <copyright file="MLScorePrediction.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Machine learning score prediction for a lead.
/// Stores predictions from ML models trained on historical conversion data.
/// </summary>
public class MLScorePrediction : BaseEntity
{
    /// <summary>Gets or sets the lead ID this prediction belongs to.</summary>
    public Guid LeadId { get; set; }

    /// <summary>Gets or sets the business ID (tenant).</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the ML model version used for prediction.</summary>
    public string ModelVersion { get; set; } = string.Empty;

    /// <summary>Gets or sets the predicted conversion probability (0.0-1.0).</summary>
    public decimal ConversionProbability { get; set; }

    /// <summary>Gets or sets the predicted score (0-100).</summary>
    public int PredictedScore { get; set; }

    /// <summary>Gets or sets the confidence interval lower bound.</summary>
    public decimal ConfidenceLower { get; set; }

    /// <summary>Gets or sets the confidence interval upper bound.</summary>
    public decimal ConfidenceUpper { get; set; }

    /// <summary>Gets or sets the top feature contributions as JSON.</summary>
    public string? FeatureImportanceJson { get; set; }

    /// <summary>Gets or sets the feature vector used as JSON.</summary>
    public string? FeatureVectorJson { get; set; }

    /// <summary>Gets or sets whether the prediction was correct (set after conversion outcome known).</summary>
    public bool? WasAccurate { get; set; }

    /// <summary>Gets or sets the actual outcome if known.</summary>
    public string? ActualOutcome { get; set; }

    /// <summary>Gets or sets when the prediction was made.</summary>
    public DateTime PredictedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties

    /// <summary>Gets or sets the lead this prediction belongs to.</summary>
    public Lead Lead { get; set; } = null!;
}
