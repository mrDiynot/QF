using FluentValidation;
using QualiFlow.Application.Features.Channels.DTOs;

namespace QualiFlow.Application.Features.Channels.Validators;

/// <summary>
/// Validator for TwilioOutboundCallRequest.
/// </summary>
public class TwilioOutboundCallRequestValidator : AbstractValidator<TwilioOutboundCallRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TwilioOutboundCallRequestValidator"/> class.
    /// </summary>
    public TwilioOutboundCallRequestValidator()
    {
        RuleFor(x => x.ToPhoneNumber)
            .NotEmpty().WithMessage("To phone number is required")
            .Matches(@"^\+[1-9]\d{1,14}$").WithMessage("To phone number must be in E.164 format");

        RuleFor(x => x.FromPhoneNumber)
            .NotEmpty().WithMessage("From phone number is required")
            .Matches(@"^\+[1-9]\d{1,14}$").WithMessage("From phone number must be in E.164 format");

        RuleFor(x => x.TwimlUrl)
            .NotEmpty().WithMessage("TwiML URL is required")
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("TwiML URL must be a valid absolute URI");

        RuleFor(x => x.StatusCallbackUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Status callback URL must be a valid absolute URI")
            .When(x => !string.IsNullOrEmpty(x.StatusCallbackUrl));

        RuleFor(x => x.TimeoutSeconds)
            .InclusiveBetween(5, 600).WithMessage("Timeout must be between 5 and 600 seconds");
    }
}

