using FluentValidation;
using QualiFlow.Application.Features.QuickReplies.DTOs;

namespace QualiFlow.Application.Features.QuickReplies.Validators;

/// <summary>
/// Validator for CreateQuickReplyRequest.
/// </summary>
public class CreateQuickReplyRequestValidator : AbstractValidator<CreateQuickReplyRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateQuickReplyRequestValidator"/> class.
    /// </summary>
    public CreateQuickReplyRequestValidator()
    {
        RuleFor(x => x.Shortcut)
            .NotEmpty().WithMessage("Shortcut is required")
            .MaximumLength(50).WithMessage("Shortcut must not exceed 50 characters")
            .Matches(@"^/[a-zA-Z0-9_-]+$").WithMessage("Shortcut must start with / and contain only letters, numbers, underscores, and hyphens");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MaximumLength(5000).WithMessage("Content must not exceed 5000 characters");

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters")
            .When(x => x.Category is not null);
    }
}

