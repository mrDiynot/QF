using FluentValidation;
using QualiFlow.Application.Features.Conversations.DTOs;

namespace QualiFlow.Application.Features.Conversations.Validators;

/// <summary>
/// Validator for CreateConversationRequest.
/// </summary>
public class CreateConversationRequestValidator : AbstractValidator<CreateConversationRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateConversationRequestValidator"/> class.
    /// </summary>
    public CreateConversationRequestValidator()
    {
        RuleFor(x => x.LeadId)
            .NotEmpty().WithMessage("Lead ID is required");

        RuleFor(x => x.Channel)
            .NotEmpty().WithMessage("Channel is required")
            .MaximumLength(50).WithMessage("Channel must not exceed 50 characters")
            .Must(BeValidChannel).WithMessage("Invalid channel. Valid channels are: chat_widget, sms, voice, whatsapp, instagram, facebook");
    }

    private static bool BeValidChannel(string channel)
    {
        var validChannels = new[] { "chat_widget", "sms", "voice", "whatsapp", "instagram", "facebook" };
        return validChannels.Contains(channel, StringComparer.OrdinalIgnoreCase);
    }
}

