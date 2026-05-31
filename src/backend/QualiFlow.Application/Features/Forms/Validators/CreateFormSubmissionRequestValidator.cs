using FluentValidation;
using QualiFlow.Application.Features.Forms.DTOs;

namespace QualiFlow.Application.Features.Forms.Validators;

/// <summary>
/// Validator for CreateFormSubmissionRequest.
/// </summary>
public class CreateFormSubmissionRequestValidator : AbstractValidator<CreateFormSubmissionRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateFormSubmissionRequestValidator"/> class.
    /// </summary>
    public CreateFormSubmissionRequestValidator()
    {
        RuleFor(x => x.SubmittedData)
            .NotEmpty().WithMessage("Submitted data is required")
            .MaximumLength(100000).WithMessage("Submitted data must not exceed 100000 characters");

        RuleFor(x => x.IpAddress)
            .MaximumLength(45).WithMessage("IP address must not exceed 45 characters")
            .When(x => x.IpAddress is not null);

        RuleFor(x => x.UserAgent)
            .MaximumLength(500).WithMessage("User agent must not exceed 500 characters")
            .When(x => x.UserAgent is not null);
    }
}

