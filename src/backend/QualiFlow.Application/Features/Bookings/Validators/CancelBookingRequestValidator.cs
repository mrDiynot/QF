using FluentValidation;
using QualiFlow.Application.Features.Bookings.DTOs;

namespace QualiFlow.Application.Features.Bookings.Validators;

/// <summary>
/// Validator for CancelBookingRequest.
/// </summary>
public class CancelBookingRequestValidator : AbstractValidator<CancelBookingRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CancelBookingRequestValidator"/> class.
    /// </summary>
    public CancelBookingRequestValidator()
    {
        RuleFor(x => x.Reason)
            .MaximumLength(1000).WithMessage("Cancellation reason must not exceed 1000 characters")
            .When(x => x.Reason is not null);
    }
}

