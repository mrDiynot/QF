using FluentValidation;
using QualiFlow.Application.Features.Admin.Users.DTOs;

namespace QualiFlow.Application.Features.Admin.Users.Validators;

/// <summary>
/// Validator for UpdateIpWhitelistRequest.
/// </summary>
public class UpdateIpWhitelistRequestValidator : AbstractValidator<UpdateIpWhitelistRequest>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateIpWhitelistRequestValidator"/> class.
    /// </summary>
    public UpdateIpWhitelistRequestValidator()
    {
        RuleFor(x => x.IpWhitelist)
            .NotNull()
            .WithMessage("IP whitelist is required");

        RuleForEach(x => x.IpWhitelist)
            .Must(BeValidIpAddress)
            .WithMessage("Invalid IP address format");
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

