using FluentValidation;
using QualiFlow.Application.Features.Admin.Auth.DTOs;

namespace QualiFlow.Application.Features.Admin.Auth.Validators;

/// <summary>
/// Validator for Verify2FARequest.
/// </summary>
public class Verify2FARequestValidator : AbstractValidator<Verify2FARequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="Verify2FARequestValidator"/> class.
    /// </summary>
    public Verify2FARequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("2FA code is required")
            .Length(6)
            .WithMessage("2FA code must be 6 digits")
            .Matches(@"^\d{6}$")
            .WithMessage("2FA code must contain only digits");
    }
}

