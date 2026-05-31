using FluentValidation;
using QualiFlow.Application.Features.Messages.DTOs;

namespace QualiFlow.Application.Features.Messages.Validators;

/// <summary>
/// Validator for UpdateMessageRequest.
/// </summary>
public class UpdateMessageRequestValidator : AbstractValidator<UpdateMessageRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateMessageRequestValidator"/> class.
    /// </summary>
    public UpdateMessageRequestValidator()
    {
        RuleFor(x => x.Content)
            .MaximumLength(10000)
            .WithMessage("Message content must not exceed 10,000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Content));

        RuleFor(x => x.DeliveredAt)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Delivered date cannot be in the future.")
            .When(x => x.DeliveredAt.HasValue);

        RuleFor(x => x.ReadAt)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Read date cannot be in the future.")
            .When(x => x.ReadAt.HasValue);
    }
}

