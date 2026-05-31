// -----------------------------------------------------------------------
// <copyright file="AdminResetPasswordRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Admin.Auth.DTOs;

/// <summary>
/// Request to reset admin password using a reset token.
/// </summary>
public class AdminResetPasswordRequest
{
    /// <summary>
    /// Gets or sets the password reset token from email.
    /// </summary>
    [Required]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the new password.
    /// Must meet security requirements: min 8 chars, uppercase, lowercase, digit, special char.
    /// </summary>
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
