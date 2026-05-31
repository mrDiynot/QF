// -----------------------------------------------------------------------
// <copyright file="AdminAuthDTOs.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Admin.Auth.DTOs;

/// <summary>
/// Request DTO for admin login.
/// </summary>
public sealed record AdminLoginRequest
{
    /// <summary>
    /// Gets the admin's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the admin's password.
    /// </summary>
    public required string Password { get; init; }

    /// <summary>
    /// Gets the optional TOTP code if 2FA is enabled.
    /// </summary>
    public string? TwoFactorCode { get; init; }
}

/// <summary>
/// Response DTO for admin login.
/// </summary>
public sealed record AdminLoginResponse
{
    /// <summary>
    /// Gets a value indicating whether 2FA verification is required.
    /// </summary>
    public bool Requires2FA { get; init; }

    /// <summary>
    /// Gets a value indicating whether MFA setup is required (enforced for all admins).
    /// </summary>
    public bool RequiresMfaSetup { get; init; }

    /// <summary>
    /// Gets the admin ID (only provided when 2FA is required for the next step).
    /// </summary>
    public Guid? AdminId { get; init; }

    /// <summary>
    /// Gets the session token for MFA setup (only provided when RequiresMfaSetup is true).
    /// </summary>
    public string? MfaSetupToken { get; init; }

    /// <summary>
    /// Gets a value indicating whether password change is required.
    /// </summary>
    public bool RequiresPasswordChange { get; init; }

    /// <summary>
    /// Gets the tokens (null if 2FA verification or password change is required).
    /// </summary>
    public AdminTokenResponse? Tokens { get; init; }

    /// <summary>
    /// Gets the admin profile (null if 2FA verification or password change is required).
    /// </summary>
    public AdminProfileResponse? Profile { get; init; }
}

/// <summary>
/// Response DTO containing access and refresh tokens.
/// </summary>
public sealed record AdminTokenResponse
{
    /// <summary>
    /// Gets the JWT access token.
    /// </summary>
    public required string AccessToken { get; init; }

    /// <summary>
    /// Gets the refresh token.
    /// </summary>
    public required string RefreshToken { get; init; }

    /// <summary>
    /// Gets the access token expiration time in UTC.
    /// </summary>
    public required DateTime ExpiresAt { get; init; }

    /// <summary>
    /// Gets or sets the admin profile (optional, included in MFA verification response).
    /// </summary>
    public AdminProfileResponse? Profile { get; set; }
}

/// <summary>
/// Response DTO for admin profile.
/// </summary>
public sealed record AdminProfileResponse
{
    /// <summary>
    /// Gets the admin ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the admin's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the admin's first name.
    /// </summary>
    public required string FirstName { get; init; }

    /// <summary>
    /// Gets the admin's last name.
    /// </summary>
    public required string LastName { get; init; }

    /// <summary>
    /// Gets the admin's full name.
    /// </summary>
    public required string FullName { get; init; }

    /// <summary>
    /// Gets the admin's role.
    /// </summary>
    public required AdminRole Role { get; init; }

    /// <summary>
    /// Gets a value indicating whether 2FA is enabled.
    /// </summary>
    public required bool TwoFactorEnabled { get; init; }

    /// <summary>
    /// Gets the last login time in UTC.
    /// </summary>
    public DateTime? LastLoginAt { get; init; }

    /// <summary>
    /// Gets the last login IP address.
    /// </summary>
    public string? LastLoginIp { get; init; }
}

/// <summary>
/// Request DTO for changing admin password.
/// </summary>
public sealed record AdminChangePasswordRequest
{
    /// <summary>
    /// Gets the current password.
    /// </summary>
    public required string CurrentPassword { get; init; }

    /// <summary>
    /// Gets the new password.
    /// </summary>
    public required string NewPassword { get; init; }

    /// <summary>
    /// Gets the new password confirmation.
    /// </summary>
    public required string ConfirmNewPassword { get; init; }
}

/// <summary>
/// Request DTO for creating a new admin user.
/// </summary>
public sealed record CreateAdminUserRequest
{
    /// <summary>
    /// Gets the admin's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the admin's first name.
    /// </summary>
    public required string FirstName { get; init; }

    /// <summary>
    /// Gets the admin's last name.
    /// </summary>
    public required string LastName { get; init; }

    /// <summary>
    /// Gets the admin's role.
    /// </summary>
    public required AdminRole Role { get; init; }
}

/// <summary>
/// Response DTO for creating a new admin user.
/// </summary>
public sealed record CreateAdminUserResponse
{
    /// <summary>
    /// Gets the admin ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the admin's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the temporary password (only returned once on creation).
    /// </summary>
    public required string TemporaryPassword { get; init; }

    /// <summary>
    /// Gets a message indicating that the admin must change their password on first login.
    /// </summary>
    public static string Message => "Admin user created. They must change their password on first login.";
}

/// <summary>
/// Request DTO for updating an admin user.
/// </summary>
public sealed record UpdateAdminUserRequest
{
    /// <summary>
    /// Gets the admin's first name.
    /// </summary>
    public string? FirstName { get; init; }

    /// <summary>
    /// Gets the admin's last name.
    /// </summary>
    public string? LastName { get; init; }

    /// <summary>
    /// Gets the admin's role.
    /// </summary>
    public AdminRole? Role { get; init; }

    /// <summary>
    /// Gets a value indicating whether the admin is active.
    /// </summary>
    public bool? IsActive { get; init; }
}

/// <summary>
/// Request DTO for 2FA verification.
/// </summary>
public sealed record AdminVerify2FARequest
{
    /// <summary>
    /// Gets the admin ID.
    /// </summary>
    public required Guid AdminId { get; init; }

    /// <summary>
    /// Gets the TOTP code.
    /// </summary>
    public required string Code { get; init; }
}

/// <summary>
/// Response from enabling 2FA.
/// </summary>
public sealed record Enable2FAResponse
{
    /// <summary>
    /// Gets the TOTP secret (base32-encoded).
    /// </summary>
    public required string Secret { get; init; }

    /// <summary>
    /// Gets the QR code URI (otpauth://).
    /// </summary>
#pragma warning disable CA1056 // URI properties should not be strings - otpauth:// is a custom scheme
    public required string QrCodeUri { get; init; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets the QR code image (base64-encoded PNG).
    /// </summary>
    public required string QrCodeImage { get; init; }
}

/// <summary>
/// Request to verify 2FA setup.
/// </summary>
public sealed record Verify2FARequest
{
    /// <summary>
    /// Gets the TOTP code.
    /// </summary>
    public required string Code { get; init; }
}
