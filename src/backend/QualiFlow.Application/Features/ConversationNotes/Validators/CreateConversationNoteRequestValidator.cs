using FluentValidation;
using QualiFlow.Application.Features.ConversationNotes.DTOs;

namespace QualiFlow.Application.Features.ConversationNotes.Validators;

/// <summary>
/// Validator for CreateConversationNoteRequest.
/// </summary>
public class CreateConversationNoteRequestValidator : AbstractValidator<CreateConversationNoteRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateConversationNoteRequestValidator"/> class.
    /// </summary>
    public CreateConversationNoteRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Note content is required")
            .MaximumLength(10000).WithMessage("Note content must not exceed 10000 characters");
    }
}

