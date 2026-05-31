using FluentValidation;
using QualiFlow.Application.Features.Webhooks.DTOs;

namespace QualiFlow.Application.Features.Webhooks.Validators;

/// <summary>
/// Validator for UpdateWebhookRequest.
/// </summary>
public class UpdateWebhookRequestValidator : AbstractValidator<UpdateWebhookRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateWebhookRequestValidator"/> class.
    /// </summary>
    public UpdateWebhookRequestValidator()
    {
        RuleFor(x => x.Url)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == "https" || uri.Scheme == "http"))
            .WithMessage("Webhook URL must be a valid HTTP or HTTPS URL")
            .MaximumLength(2000).WithMessage("Webhook URL must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Url));

        RuleFor(x => x.Events)
            .Must(e => e!.Count <= 50).WithMessage("Cannot subscribe to more than 50 event types")
            .When(x => x.Events is not null);

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => x.Description is not null);
    }
}

