using FluentValidation;
using QualiFlow.Application.Features.Bookings.DTOs;

namespace QualiFlow.Application.Features.Bookings.Validators;

/// <summary>
/// Validator for CreateBookingRequest.
/// </summary>
public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateBookingRequestValidator"/> class.
    /// </summary>
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.LeadId)
            .NotEmpty().WithMessage("Lead ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Booking title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters")
            .When(x => x.Description is not null);

        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow).WithMessage("Scheduled date must be in the future");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(5, 480).WithMessage("Duration must be between 5 and 480 minutes");

        RuleFor(x => x.Timezone)
            .NotEmpty().WithMessage("Timezone is required")
            .MaximumLength(100).WithMessage("Timezone must not exceed 100 characters");
    }
}

