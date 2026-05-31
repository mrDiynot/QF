using FluentValidation;
using QualiFlow.Application.Features.Auth.DTOs;

namespace QualiFlow.Application.Features.Auth.Validators;

/// <summary>
/// Validator for <see cref="RefreshTokenRequest"/>.
/// </summary>
public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="RefreshTokenRequestValidator"/> class.
    /// </summary>
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required")
            .MinimumLength(32).WithMessage("Refresh token must be at least 32 characters")
            .MaximumLength(256).WithMessage("Refresh token must not exceed 256 characters");
    }
}

