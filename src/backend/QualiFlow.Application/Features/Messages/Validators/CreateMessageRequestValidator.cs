using FluentValidation;
using QualiFlow.Application.Features.Messages.DTOs;

namespace QualiFlow.Application.Features.Messages.Validators;

/// <summary>
/// Validator for CreateMessageRequest.
/// </summary>
public class CreateMessageRequestValidator : AbstractValidator<CreateMessageRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateMessageRequestValidator"/> class.
    /// </summary>
    public CreateMessageRequestValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty()
            .WithMessage("Conversation ID is required.");

        RuleFor(x => x.Content)
            .NotEmpty()
            .WithMessage("Message content is required.")
            .MaximumLength(10000)
            .WithMessage("Message content must not exceed 10,000 characters.");

        RuleFor(x => x.Direction)
            .IsInEnum()
            .WithMessage("Invalid message direction. Must be Inbound or Outbound.");
    }
}

