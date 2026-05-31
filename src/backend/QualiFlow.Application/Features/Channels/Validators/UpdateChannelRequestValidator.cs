using FluentValidation;
using QualiFlow.Application.Features.Channels.DTOs;

namespace QualiFlow.Application.Features.Channels.Validators;

/// <summary>
/// Validator for UpdateChannelRequest.
/// </summary>
public class UpdateChannelRequestValidator : AbstractValidator<UpdateChannelRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateChannelRequestValidator"/> class.
    /// </summary>
    public UpdateChannelRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("Channel name must not exceed 200 characters")
            .When(x => x.Name is not null);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be in E.164 format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.Configuration)
            .MaximumLength(10000).WithMessage("Configuration must not exceed 10000 characters")
            .When(x => x.Configuration is not null);

        RuleFor(x => x.WebhookUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Webhook URL must be a valid absolute URI")
            .When(x => !string.IsNullOrEmpty(x.WebhookUrl));
    }
}

