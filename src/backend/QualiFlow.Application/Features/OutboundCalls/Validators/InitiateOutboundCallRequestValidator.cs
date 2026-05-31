// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using FluentValidation;
using QualiFlow.Application.Features.OutboundCalls.DTOs;

namespace QualiFlow.Application.Features.OutboundCalls.Validators;

/// <summary>
/// Validator for InitiateOutboundCallRequest.
/// </summary>
public class InitiateOutboundCallRequestValidator : AbstractValidator<InitiateOutboundCallRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="InitiateOutboundCallRequestValidator"/> class.
    /// </summary>
    public InitiateOutboundCallRequestValidator()
    {
        RuleFor(x => x.LeadId)
            .NotEmpty()
            .WithMessage("Lead ID is required.");

        RuleFor(x => x.FromPhoneNumber)
            .Matches(@"^\+[1-9]\d{1,14}$")
            .When(x => !string.IsNullOrEmpty(x.FromPhoneNumber))
            .WithMessage("From phone number must be in E.164 format (e.g., +14155551234).");

        RuleFor(x => x.ToPhoneNumber)
            .Matches(@"^\+[1-9]\d{1,14}$")
            .When(x => !string.IsNullOrEmpty(x.ToPhoneNumber))
            .WithMessage("To phone number must be in E.164 format (e.g., +14155551234).");

        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow)
            .When(x => x.ScheduledAt.HasValue)
            .WithMessage("Scheduled time must be in the future.");

        RuleFor(x => x.MaxRetries)
            .InclusiveBetween(0, 10)
            .WithMessage("Max retries must be between 0 and 10.");
    }
}

