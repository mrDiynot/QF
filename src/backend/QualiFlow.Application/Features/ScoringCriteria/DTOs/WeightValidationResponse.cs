// -----------------------------------------------------------------------
// <copyright file="WeightValidationResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.ScoringCriteria.DTOs;

/// <summary>
/// Response for weight validation.
/// </summary>
/// <param name="IsValid">Indicates whether weights sum to 100.</param>
public record WeightValidationResponse(bool IsValid);

