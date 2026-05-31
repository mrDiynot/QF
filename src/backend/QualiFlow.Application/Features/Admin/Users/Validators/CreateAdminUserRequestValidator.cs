// -----------------------------------------------------------------------
// <copyright file="CreateAdminUserRequestValidator.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using FluentValidation;

using QualiFlow.Application.Features.Admin.Users.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Admin.Users.Validators;

/// <summary>
/// Validator for CreateAdminUserRequest.
/// Admin users are now created independently with their own credentials.
/// </summary>
public class CreateAdminUserRequestValidator : AbstractValidator<CreateAdminUserRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateAdminUserRequestValidator"/> class.
    /// </summary>
    public CreateAdminUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(256)
            .WithMessage("Email must not exceed 256 characters");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required")
            .MaximumLength(100)
            .WithMessage("First name must not exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required")
            .MaximumLength(100)
            .WithMessage("Last name must not exceed 100 characters");

        RuleFor(x => x.Role)
            .NotEqual(AdminRole.None)
            .WithMessage("Admin role must be specified")
            .IsInEnum()
            .WithMessage("Invalid admin role");

        RuleForEach(x => x.IpWhitelist)
            .Must(BeValidIpAddress)
            .WithMessage("Invalid IP address format")
            .When(x => x.IpWhitelist != null && x.IpWhitelist.Count > 0);
    }

    private static bool BeValidIpAddress(string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            return false;
        }

        // Simple IP address validation (IPv4 and IPv6)
        return System.Net.IPAddress.TryParse(ipAddress, out _);
    }
}
