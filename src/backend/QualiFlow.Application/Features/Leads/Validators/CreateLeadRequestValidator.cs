using FluentValidation;
using QualiFlow.Application.Features.Leads.DTOs;

namespace QualiFlow.Application.Features.Leads.Validators;

/// <summary>
/// Validator for CreateLeadRequest.
/// </summary>
public class CreateLeadRequestValidator : AbstractValidator<CreateLeadRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateLeadRequestValidator"/> class.
    /// </summary>
    public CreateLeadRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters")
            .Matches(@"^[a-zA-Z\s\-']+$").WithMessage("Name contains invalid characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

        RuleFor(x => x.Phone)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.SourceChannel)
            .NotEmpty().WithMessage("Source channel is required")
            .MaximumLength(50).WithMessage("Source channel must not exceed 50 characters")
            .Must(BeValidChannel).WithMessage("Invalid source channel");
    }

    private static bool BeValidChannel(string channel)
    {
        var validChannels = new[]
        {
            "chat_widget",
            "sms",
            "voice",
            "whatsapp",
            "instagram",
            "facebook",
            "email",
            "web_form",
        };

        return validChannels.Contains(channel, StringComparer.OrdinalIgnoreCase);
    }
}

