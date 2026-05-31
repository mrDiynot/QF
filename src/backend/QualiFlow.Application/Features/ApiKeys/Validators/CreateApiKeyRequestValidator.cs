using FluentValidation;
using QualiFlow.Application.Features.ApiKeys.DTOs;

namespace QualiFlow.Application.Features.ApiKeys.Validators;

/// <summary>
/// Validator for CreateApiKeyRequest.
/// </summary>
public class CreateApiKeyRequestValidator : AbstractValidator<CreateApiKeyRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateApiKeyRequestValidator"/> class.
    /// </summary>
    public CreateApiKeyRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("API key name is required")
            .MaximumLength(100).WithMessage("API key name must not exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9\s\-_]+$").WithMessage("API key name must contain only letters, numbers, spaces, hyphens, and underscores");

        RuleFor(x => x.ExpiresInDays)
            .InclusiveBetween(1, 365).WithMessage("Expiration must be between 1 and 365 days")
            .When(x => x.ExpiresInDays.HasValue);
    }
}

