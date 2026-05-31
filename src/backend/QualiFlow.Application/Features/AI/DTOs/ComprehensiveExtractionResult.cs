// -----------------------------------------------------------------------
// <copyright file="ComprehensiveExtractionResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Comprehensive extraction result containing all extracted information categories.
/// </summary>
public sealed record ComprehensiveExtractionResult
{
    /// <summary>Gets the extracted contact information.</summary>
    public ContactInfoDto? ContactInfo { get; init; }

    /// <summary>Gets the extracted company information.</summary>
    public CompanyInfoDto? CompanyInfo { get; init; }

    /// <summary>Gets the extracted budget information.</summary>
    public BudgetInfoDto? BudgetInfo { get; init; }

    /// <summary>Gets the extracted timeline information.</summary>
    public TimelineInfoDto? TimelineInfo { get; init; }

    /// <summary>Gets the list of extracted pain points.</summary>
    public IReadOnlyList<string> PainPoints { get; init; } = [];

    /// <summary>Gets the list of extracted requirements.</summary>
    public IReadOnlyList<string> Requirements { get; init; } = [];

    /// <summary>Gets the list of extracted fields with confidence scores.</summary>
    public IReadOnlyList<ExtractionFieldDto> ExtractedFields { get; init; } = [];

    /// <summary>Gets the custom extracted entities based on hints.</summary>
    public IReadOnlyDictionary<string, string> CustomEntities { get; init; } = new Dictionary<string, string>(StringComparer.Ordinal);

    /// <summary>Gets the overall extraction confidence (0-1).</summary>
    public double Confidence { get; init; }

    /// <summary>Gets the number of messages analyzed.</summary>
    public int MessagesAnalyzed { get; init; }

    /// <summary>Gets the extraction summary.</summary>
    public string? Summary { get; init; }
}

