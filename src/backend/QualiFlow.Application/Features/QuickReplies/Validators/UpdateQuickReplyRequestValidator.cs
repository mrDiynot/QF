using FluentValidation;
using QualiFlow.Application.Features.QuickReplies.DTOs;

namespace QualiFlow.Application.Features.QuickReplies.Validators;

/// <summary>
/// Validator for UpdateQuickReplyRequest.
/// </summary>
public class UpdateQuickReplyRequestValidator : AbstractValidator<UpdateQuickReplyRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateQuickReplyRequestValidator"/> class.
    /// </summary>
    public UpdateQuickReplyRequestValidator()
    {
        RuleFor(x => x.Shortcut)
            .MaximumLength(50).WithMessage("Shortcut must not exceed 50 characters")
            .Matches(@"^/[a-zA-Z0-9_-]+$").WithMessage("Shortcut must start with / and contain only letters, numbers, underscores, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.Shortcut));

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
            .When(x => x.Title is not null);

        RuleFor(x => x.Content)
            .MaximumLength(5000).WithMessage("Content must not exceed 5000 characters")
            .When(x => x.Content is not null);

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters")
            .When(x => x.Category is not null);
    }
}

