using FluentValidation;
using QualiFlow.Application.Features.Email.DTOs;

namespace QualiFlow.Application.Features.Email.Validators;

/// <summary>
/// Validator for SendBulkEmailRequest.
/// </summary>
public class SendBulkEmailRequestValidator : AbstractValidator<SendBulkEmailRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SendBulkEmailRequestValidator"/> class.
    /// </summary>
    public SendBulkEmailRequestValidator()
    {
        RuleFor(x => x.Recipients)
            .NotEmpty().WithMessage("At least one recipient is required")
            .Must(r => r.Count <= 1000).WithMessage("Cannot send to more than 1000 recipients at once");

        RuleFor(x => x.FromEmail)
            .NotEmpty().WithMessage("Sender email is required")
            .EmailAddress().WithMessage("Invalid sender email format")
            .MaximumLength(255).WithMessage("Sender email must not exceed 255 characters");

        RuleFor(x => x.FromName)
            .MaximumLength(200).WithMessage("Sender name must not exceed 200 characters")
            .When(x => x.FromName is not null);

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required")
            .MaximumLength(500).WithMessage("Subject must not exceed 500 characters");

        RuleFor(x => x.HtmlBody)
            .NotEmpty().WithMessage("Email body is required")
            .MaximumLength(500000).WithMessage("Email body must not exceed 500000 characters");
    }
}

