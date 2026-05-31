// -----------------------------------------------------------------------
// <copyright file="AdminForgotPasswordRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Admin.Auth.DTOs;

/// <summary>
/// Request to initiate admin password reset process.
/// </summary>
public class AdminForgotPasswordRequest
{
    /// <summary>
    /// Gets or sets the admin's email address.
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
