using FluentValidation;
using QualiFlow.Application.Features.Channels.DTOs;

namespace QualiFlow.Application.Features.Channels.Validators;

/// <summary>
/// Validator for CreateChannelRequest.
/// </summary>
public class CreateChannelRequestValidator : AbstractValidator<CreateChannelRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateChannelRequestValidator"/> class.
    /// </summary>
    public CreateChannelRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Channel name is required")
            .MaximumLength(200).WithMessage("Channel name must not exceed 200 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid channel type");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be in E.164 format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.Configuration)
            .NotEmpty().WithMessage("Configuration is required")
            .MaximumLength(10000).WithMessage("Configuration must not exceed 10000 characters");

        RuleFor(x => x.WebhookUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Webhook URL must be a valid absolute URI")
            .When(x => !string.IsNullOrEmpty(x.WebhookUrl));
    }
}

