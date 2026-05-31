using FluentValidation;
using QualiFlow.Application.Features.Forms.DTOs;

namespace QualiFlow.Application.Features.Forms.Validators;

/// <summary>
/// Validator for CreateFormRequest.
/// </summary>
public class CreateFormRequestValidator : AbstractValidator<CreateFormRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateFormRequestValidator"/> class.
    /// </summary>
    public CreateFormRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Form name is required")
            .MaximumLength(200).WithMessage("Form name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters")
            .When(x => x.Description is not null);

        RuleFor(x => x.Fields)
            .NotEmpty().WithMessage("Form fields are required")
            .MaximumLength(50000).WithMessage("Fields JSON must not exceed 50000 characters");

        RuleFor(x => x.Styling)
            .MaximumLength(10000).WithMessage("Styling JSON must not exceed 10000 characters")
            .When(x => x.Styling is not null);

        RuleFor(x => x.Slug)
            .MaximumLength(100).WithMessage("Slug must not exceed 100 characters")
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must contain only lowercase letters, numbers, and hyphens")
            .When(x => x.Slug is not null);

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000).WithMessage("Thank you message must not exceed 1000 characters")
            .When(x => x.ThankYouMessage is not null);

        RuleFor(x => x.NotificationEmails)
            .MaximumLength(1000).WithMessage("Notification emails must not exceed 1000 characters")
            .When(x => x.NotificationEmails is not null);
    }
}

