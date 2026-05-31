using FluentValidation;
using QualiFlow.Application.Features.Webhooks.DTOs;

namespace QualiFlow.Application.Features.Webhooks.Validators;

/// <summary>
/// Validator for CreateWebhookRequest.
/// </summary>
public class CreateWebhookRequestValidator : AbstractValidator<CreateWebhookRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateWebhookRequestValidator"/> class.
    /// </summary>
    public CreateWebhookRequestValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("Webhook URL is required")
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == "https" || uri.Scheme == "http"))
            .WithMessage("Webhook URL must be a valid HTTP or HTTPS URL")
            .MaximumLength(2000).WithMessage("Webhook URL must not exceed 2000 characters");

        RuleFor(x => x.Events)
            .NotEmpty().WithMessage("At least one event type is required")
            .Must(e => e.Count <= 50).WithMessage("Cannot subscribe to more than 50 event types");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => x.Description is not null);
    }
}

