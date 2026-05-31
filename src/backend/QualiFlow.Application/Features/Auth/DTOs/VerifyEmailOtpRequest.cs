using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for email OTP verification.
/// </summary>
public class VerifyEmailOtpRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the 6-digit OTP code.
    /// </summary>
    [Required]
    [StringLength(6, MinimumLength = 6)]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be a 6-digit number.")]
    public required string OtpCode { get; set; }
}

