using FluentValidation;
using QualiFlow.Application.Features.Channels.DTOs;

namespace QualiFlow.Application.Features.Channels.Validators;

/// <summary>
/// Validator for ActivateChannelRequest.
/// </summary>
public class ActivateChannelRequestValidator : AbstractValidator<ActivateChannelRequest>
{
    private static readonly string[] ValidChannelTypes = ["sms", "phone", "email", "web_chat", "web_forms", "social"];

    /// <summary>
    /// Initializes a new instance of the <see cref="ActivateChannelRequestValidator"/> class.
    /// </summary>
    public ActivateChannelRequestValidator()
    {
        RuleFor(x => x.ChannelType)
            .NotEmpty().WithMessage("Channel type is required")
            .Must(ct => ValidChannelTypes.Contains(ct, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Channel type must be one of: sms, phone, email, web_chat, web_forms, social");

        RuleFor(x => x.DisplayName)
            .MaximumLength(200).WithMessage("Display name must not exceed 200 characters")
            .When(x => x.DisplayName is not null);

        RuleFor(x => x.ExistingPhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be in E.164 format")
            .When(x => !string.IsNullOrEmpty(x.ExistingPhoneNumber));
    }
}

