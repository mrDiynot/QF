using FluentValidation;
using QualiFlow.Application.Features.Users.DTOs;

namespace QualiFlow.Application.Features.Users.Validators;

/// <summary>
/// Validator for UpdateUserProfileRequest.
/// </summary>
public class UpdateUserProfileRequestValidator : AbstractValidator<UpdateUserProfileRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateUserProfileRequestValidator"/> class.
    /// </summary>
    public UpdateUserProfileRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters")
            .Matches(@"^[a-zA-Z\s\-']+$").WithMessage("First name contains invalid characters")
            .When(x => !string.IsNullOrEmpty(x.FirstName));

        RuleFor(x => x.LastName)
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters")
            .Matches(@"^[a-zA-Z\s\-']+$").WithMessage("Last name contains invalid characters")
            .When(x => !string.IsNullOrEmpty(x.LastName));

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be in E.164 format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.ProfilePictureUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Profile picture URL must be a valid absolute URI")
            .When(x => !string.IsNullOrEmpty(x.ProfilePictureUrl));
    }
}

