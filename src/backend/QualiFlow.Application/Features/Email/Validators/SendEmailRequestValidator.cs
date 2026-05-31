using FluentValidation;
using QualiFlow.Application.Features.Email.DTOs;

namespace QualiFlow.Application.Features.Email.Validators;

/// <summary>
/// Validator for SendEmailRequest.
/// </summary>
public class SendEmailRequestValidator : AbstractValidator<SendEmailRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SendEmailRequestValidator"/> class.
    /// </summary>
    public SendEmailRequestValidator()
    {
        RuleFor(x => x.ToEmail)
            .NotEmpty().WithMessage("Recipient email is required")
            .EmailAddress().WithMessage("Invalid recipient email format")
            .MaximumLength(255).WithMessage("Recipient email must not exceed 255 characters");

        RuleFor(x => x.FromEmail)
            .NotEmpty().WithMessage("Sender email is required")
            .EmailAddress().WithMessage("Invalid sender email format")
            .MaximumLength(255).WithMessage("Sender email must not exceed 255 characters");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required")
            .MaximumLength(500).WithMessage("Subject must not exceed 500 characters");

        RuleFor(x => x.HtmlBody)
            .NotEmpty().WithMessage("Email body is required")
            .MaximumLength(500000).WithMessage("Email body must not exceed 500000 characters");

        RuleFor(x => x.ToName)
            .MaximumLength(200).WithMessage("Recipient name must not exceed 200 characters")
            .When(x => x.ToName is not null);

        RuleFor(x => x.FromName)
            .MaximumLength(200).WithMessage("Sender name must not exceed 200 characters")
            .When(x => x.FromName is not null);

        RuleFor(x => x.ReplyTo)
            .EmailAddress().WithMessage("Invalid reply-to email format")
            .MaximumLength(255).WithMessage("Reply-to email must not exceed 255 characters")
            .When(x => !string.IsNullOrEmpty(x.ReplyTo));

        RuleFor(x => x.CcEmail)
            .MaximumLength(1000).WithMessage("CC emails must not exceed 1000 characters")
            .When(x => x.CcEmail is not null);
    }
}

