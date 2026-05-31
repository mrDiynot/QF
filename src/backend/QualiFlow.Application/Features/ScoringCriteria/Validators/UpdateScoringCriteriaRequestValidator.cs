// -----------------------------------------------------------------------
// <copyright file="UpdateScoringCriteriaRequestValidator.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using FluentValidation;
using QualiFlow.Application.Features.ScoringCriteria.DTOs;

namespace QualiFlow.Application.Features.ScoringCriteria.Validators;

/// <summary>
/// Validator for UpdateScoringCriteriaRequest.
/// </summary>
public class UpdateScoringCriteriaRequestValidator : AbstractValidator<UpdateScoringCriteriaRequest>
{
    /// <summary>Initializes a new instance of the <see cref="UpdateScoringCriteriaRequestValidator"/> class.</summary>
    public UpdateScoringCriteriaRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Weight)
            .InclusiveBetween(0, 100).WithMessage("Weight must be between 0 and 100")
            .When(x => x.Weight.HasValue);

        RuleFor(x => x.ExtractionHint)
            .MaximumLength(500).WithMessage("Extraction hint must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.ExtractionHint));

        RuleFor(x => x.MinimumScore)
            .InclusiveBetween(0, 100).WithMessage("Minimum score must be between 0 and 100")
            .When(x => x.MinimumScore.HasValue);

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.AiQuestions)
            .MaximumLength(2000).WithMessage("AI questions must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.AiQuestions));

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order must be non-negative")
            .When(x => x.DisplayOrder.HasValue);
    }
}

