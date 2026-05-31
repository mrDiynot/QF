using FluentValidation;
using QualiFlow.Application.Features.Leads.DTOs;

namespace QualiFlow.Application.Features.Leads.Validators;

/// <summary>
/// Validator for UpdateLeadRequest.
/// </summary>
public class UpdateLeadRequestValidator : AbstractValidator<UpdateLeadRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateLeadRequestValidator"/> class.
    /// </summary>
    public UpdateLeadRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters")
            .Matches(@"^[a-zA-Z\s\-']+$").WithMessage("Name contains invalid characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Phone)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Score)
            .InclusiveBetween(0, 100).WithMessage("Score must be between 0 and 100")
            .When(x => x.Score.HasValue);
    }
}

