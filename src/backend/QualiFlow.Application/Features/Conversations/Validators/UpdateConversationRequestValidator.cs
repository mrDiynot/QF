using FluentValidation;
using QualiFlow.Application.Features.Conversations.DTOs;

namespace QualiFlow.Application.Features.Conversations.Validators;

/// <summary>
/// Validator for UpdateConversationRequest.
/// </summary>
public class UpdateConversationRequestValidator : AbstractValidator<UpdateConversationRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateConversationRequestValidator"/> class.
    /// </summary>
    public UpdateConversationRequestValidator()
    {
        // All fields are optional, but if EndedAt is provided, it should be a valid date
        RuleFor(x => x.EndedAt)
            .Must(BeValidEndDate).WithMessage("EndedAt must be a valid date and not in the future")
            .When(x => x.EndedAt.HasValue);
    }

    private static bool BeValidEndDate(DateTime? endedAt)
    {
        if (!endedAt.HasValue)
        {
            return true;
        }

        return endedAt.Value <= DateTime.UtcNow;
    }
}

