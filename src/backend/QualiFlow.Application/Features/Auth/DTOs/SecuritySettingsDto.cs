// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// DTO representing the user's security settings and status.
/// </summary>
public class SecuritySettingsDto
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether email is verified.
    /// </summary>
    public bool EmailVerified { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether two-factor auth is enabled.
    /// </summary>
    public bool TwoFactorEnabled { get; set; }

    /// <summary>
    /// Gets the OAuth providers connected to this account.
    /// </summary>
    public IReadOnlyList<string> ConnectedOAuthProviders { get; init; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether the user registered via OAuth.
    /// </summary>
    public bool IsOAuthUser { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user has a password set.
    /// OAuth users may not have a password.
    /// </summary>
    public bool HasPassword { get; set; }

    /// <summary>
    /// Gets or sets when the password was last changed.
    /// </summary>
    public DateTime? PasswordLastChangedAt { get; set; }

    /// <summary>
    /// Gets or sets the date/time of the last successful login.
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Gets or sets the number of active sessions.
    /// </summary>
    public int ActiveSessionCount { get; set; }

    /// <summary>
    /// Gets or sets when the account was created.
    /// </summary>
    public DateTime AccountCreatedAt { get; set; }
}

