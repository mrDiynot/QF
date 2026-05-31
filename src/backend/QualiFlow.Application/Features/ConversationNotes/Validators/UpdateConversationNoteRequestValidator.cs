using FluentValidation;
using QualiFlow.Application.Features.ConversationNotes.DTOs;

namespace QualiFlow.Application.Features.ConversationNotes.Validators;

/// <summary>
/// Validator for UpdateConversationNoteRequest.
/// </summary>
public class UpdateConversationNoteRequestValidator : AbstractValidator<UpdateConversationNoteRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateConversationNoteRequestValidator"/> class.
    /// </summary>
    public UpdateConversationNoteRequestValidator()
    {
        RuleFor(x => x.Content)
            .MaximumLength(10000).WithMessage("Note content must not exceed 10000 characters")
            .When(x => x.Content is not null);
    }
}

