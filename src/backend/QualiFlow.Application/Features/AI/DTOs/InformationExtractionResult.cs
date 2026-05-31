// -----------------------------------------------------------------------
// <copyright file="InformationExtractionResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result of information extraction from a message.
/// </summary>
public sealed record InformationExtractionResult
{
    /// <summary>Gets extracted contact information.</summary>
    public ContactInfoDto? ContactInfo { get; init; }

    /// <summary>Gets extracted company information.</summary>
    public CompanyInfoDto? CompanyInfo { get; init; }

    /// <summary>Gets extracted budget information.</summary>
    public BudgetInfoDto? BudgetInfo { get; init; }

    /// <summary>Gets extracted timeline information.</summary>
    public TimelineInfoDto? TimelineInfo { get; init; }

    /// <summary>Gets extracted pain points.</summary>
    public IReadOnlyList<string>? PainPoints { get; init; }

    /// <summary>Gets extracted requirements.</summary>
    public IReadOnlyList<string>? Requirements { get; init; }

    /// <summary>Gets custom extracted entities.</summary>
    public IReadOnlyDictionary<string, string>? CustomEntities { get; init; }

    /// <summary>Gets the extraction confidence (0-1).</summary>
    public required float Confidence { get; init; }
}

