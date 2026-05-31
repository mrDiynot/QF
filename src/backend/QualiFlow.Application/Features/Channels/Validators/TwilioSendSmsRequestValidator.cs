using FluentValidation;
using QualiFlow.Application.Features.Channels.DTOs;

namespace QualiFlow.Application.Features.Channels.Validators;

/// <summary>
/// Validator for TwilioSendSmsRequest.
/// </summary>
public class TwilioSendSmsRequestValidator : AbstractValidator<TwilioSendSmsRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TwilioSendSmsRequestValidator"/> class.
    /// </summary>
    public TwilioSendSmsRequestValidator()
    {
        RuleFor(x => x.ToPhoneNumber)
            .NotEmpty().WithMessage("To phone number is required")
            .Matches(@"^\+[1-9]\d{1,14}$").WithMessage("To phone number must be in E.164 format");

        RuleFor(x => x.FromPhoneNumber)
            .NotEmpty().WithMessage("From phone number is required")
            .Matches(@"^\+[1-9]\d{1,14}$").WithMessage("From phone number must be in E.164 format");

        RuleFor(x => x.Body)
            .NotEmpty().WithMessage("Message body is required")
            .MaximumLength(1600).WithMessage("Message body must not exceed 1600 characters");
    }
}

