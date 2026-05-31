using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for resending email OTP.
/// </summary>
public class ResendEmailOtpRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}

