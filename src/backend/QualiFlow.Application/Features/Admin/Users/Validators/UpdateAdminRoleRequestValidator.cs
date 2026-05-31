using FluentValidation;
using QualiFlow.Application.Features.Admin.Users.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Admin.Users.Validators;

/// <summary>
/// Validator for UpdateAdminRoleRequest.
/// </summary>
public class UpdateAdminRoleRequestValidator : AbstractValidator<UpdateAdminRoleRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateAdminRoleRequestValidator"/> class.
    /// </summary>
    public UpdateAdminRoleRequestValidator()
    {
        RuleFor(x => x.Role)
            .NotEqual(AdminRole.None)
            .WithMessage("Admin role must be specified")
            .IsInEnum()
            .WithMessage("Invalid admin role");
    }
}

