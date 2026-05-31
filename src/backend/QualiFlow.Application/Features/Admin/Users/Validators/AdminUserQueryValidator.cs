using FluentValidation;
using QualiFlow.Application.Features.Admin.Users.DTOs;

namespace QualiFlow.Application.Features.Admin.Users.Validators;

/// <summary>
/// Validator for AdminUserQuery.
/// </summary>
public class AdminUserQueryValidator : AbstractValidator<AdminUserQuery>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AdminUserQueryValidator"/> class.
    /// </summary>
    public AdminUserQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0)
            .WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Page size cannot exceed 100");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(200)
            .WithMessage("Search term cannot exceed 200 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.SearchTerm));

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Invalid admin role")
            .When(x => x.Role.HasValue);
    }
}

