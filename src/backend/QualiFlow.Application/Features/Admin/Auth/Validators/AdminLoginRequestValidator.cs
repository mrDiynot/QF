using FluentValidation;
using QualiFlow.Application.Features.Admin.Auth.DTOs;

namespace QualiFlow.Application.Features.Admin.Auth.Validators;

/// <summary>
/// Validator for AdminLoginRequest.
/// </summary>
public class AdminLoginRequestValidator : AbstractValidator<AdminLoginRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AdminLoginRequestValidator"/> class.
    /// </summary>
    public AdminLoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(255)
            .WithMessage("Email cannot exceed 255 characters");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters");

        RuleFor(x => x.TwoFactorCode)
            .Length(6)
            .WithMessage("2FA code must be 6 digits")
            .Matches(@"^\d{6}$")
            .WithMessage("2FA code must contain only digits")
            .When(x => !string.IsNullOrWhiteSpace(x.TwoFactorCode));
    }
}

