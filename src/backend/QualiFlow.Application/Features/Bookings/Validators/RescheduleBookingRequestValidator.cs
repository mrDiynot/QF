using FluentValidation;
using QualiFlow.Application.Features.Bookings.DTOs;

namespace QualiFlow.Application.Features.Bookings.Validators;

/// <summary>
/// Validator for RescheduleBookingRequest.
/// </summary>
public class RescheduleBookingRequestValidator : AbstractValidator<RescheduleBookingRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="RescheduleBookingRequestValidator"/> class.
    /// </summary>
    public RescheduleBookingRequestValidator()
    {
        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow).WithMessage("Rescheduled date must be in the future");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(5, 480).WithMessage("Duration must be between 5 and 480 minutes")
            .When(x => x.DurationMinutes.HasValue);

        RuleFor(x => x.Reason)
            .MaximumLength(1000).WithMessage("Reason must not exceed 1000 characters")
            .When(x => x.Reason is not null);
    }
}

