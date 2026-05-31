// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using FluentValidation;
using QualiFlow.Application.Features.OutboundCalls.DTOs;

namespace QualiFlow.Application.Features.OutboundCalls.Validators;

/// <summary>
/// Validator for ScheduleFollowUpCallRequest.
/// </summary>
public class ScheduleFollowUpCallRequestValidator : AbstractValidator<ScheduleFollowUpCallRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ScheduleFollowUpCallRequestValidator"/> class.
    /// </summary>
    public ScheduleFollowUpCallRequestValidator()
    {
        RuleFor(x => x.LeadId)
            .NotEmpty()
            .WithMessage("Lead ID is required.");

        RuleFor(x => x.ScheduledAt)
            .NotEmpty()
            .WithMessage("Scheduled time is required.")
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Scheduled time must be in the future.");

        RuleFor(x => x.MaxRetries)
            .InclusiveBetween(0, 10)
            .WithMessage("Max retries must be between 0 and 10.");
    }
}

