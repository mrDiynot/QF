using FluentValidation;
using QualiFlow.Application.Features.Business.DTOs;

namespace QualiFlow.Application.Features.Business.Validators;

/// <summary>
/// Validator for UpdateBusinessSettingsRequest.
/// </summary>
public class UpdateBusinessSettingsRequestValidator : AbstractValidator<UpdateBusinessSettingsRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateBusinessSettingsRequestValidator"/> class.
    /// </summary>
    public UpdateBusinessSettingsRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("Business name must not exceed 200 characters")
            .When(x => x.Name is not null);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid business email format")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters")
            .When(x => x.Phone is not null);

        RuleFor(x => x.Website)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Website must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.Website));

        RuleFor(x => x.Industry)
            .MaximumLength(100).WithMessage("Industry must not exceed 100 characters")
            .When(x => x.Industry is not null);

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters")
            .When(x => x.Description is not null);

        RuleFor(x => x.QualificationThreshold)
            .InclusiveBetween(0, 100).WithMessage("Qualification threshold must be between 0 and 100")
            .When(x => x.QualificationThreshold.HasValue);

        RuleFor(x => x.PrimaryColor)
            .Matches(@"^#[0-9A-Fa-f]{6}$").WithMessage("Primary color must be a valid hex color (e.g., #FF5733)")
            .When(x => !string.IsNullOrEmpty(x.PrimaryColor));

        RuleFor(x => x.ZipCode)
            .MaximumLength(20).WithMessage("Zip code must not exceed 20 characters")
            .When(x => x.ZipCode is not null);

        RuleFor(x => x.Country)
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters")
            .When(x => x.Country is not null);
    }
}

