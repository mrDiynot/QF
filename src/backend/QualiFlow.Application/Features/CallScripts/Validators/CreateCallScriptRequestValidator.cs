// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using FluentValidation;
using QualiFlow.Application.Features.CallScripts.DTOs;

namespace QualiFlow.Application.Features.CallScripts.Validators;

/// <summary>
/// Validator for CreateCallScriptRequest.
/// </summary>
public class CreateCallScriptRequestValidator : AbstractValidator<CreateCallScriptRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateCallScriptRequestValidator"/> class.
    /// </summary>
    public CreateCallScriptRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Script name is required.")
            .MaximumLength(200)
            .WithMessage("Script name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => x.Description != null)
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.GreetingMessage)
            .NotEmpty()
            .WithMessage("Greeting message is required.")
            .MaximumLength(2000)
            .WithMessage("Greeting message cannot exceed 2000 characters.");

        RuleFor(x => x.VoicemailMessage)
            .NotEmpty()
            .WithMessage("Voicemail message is required.")
            .MaximumLength(2000)
            .WithMessage("Voicemail message cannot exceed 2000 characters.");

        RuleFor(x => x.ClosingMessage)
            .NotEmpty()
            .WithMessage("Closing message is required.")
            .MaximumLength(2000)
            .WithMessage("Closing message cannot exceed 2000 characters.");

        RuleFor(x => x.Questions)
            .Must(q => q == null || q.Count <= 20)
            .WithMessage("Cannot have more than 20 questions.");

        RuleForEach(x => x.Questions)
            .MaximumLength(500)
            .WithMessage("Each question cannot exceed 500 characters.");

        When(x => x.VoiceSettings != null, () =>
        {
            RuleFor(x => x.VoiceSettings!.VoiceId)
                .NotEmpty()
                .WithMessage("Voice ID is required when voice settings are provided.")
                .Must(v => new[] { "alloy", "echo", "fable", "onyx", "nova", "shimmer" }.Contains(v))
                .WithMessage("Voice ID must be one of: alloy, echo, fable, onyx, nova, shimmer.");

            RuleFor(x => x.VoiceSettings!.Speed)
                .InclusiveBetween(0.25, 4.0)
                .WithMessage("Speed must be between 0.25 and 4.0.");

            RuleFor(x => x.VoiceSettings!.Pitch)
                .InclusiveBetween(0.5, 2.0)
                .WithMessage("Pitch must be between 0.5 and 2.0.");
        });
    }
}

