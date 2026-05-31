namespace QualiFlow.Application.Features.Auth.DTOs;

#pragma warning disable SA1649 // File name should match first type name - multiple related DTOs

/// <summary>
/// Response for 2FA setup initiation.
/// </summary>
public class TwoFactorSetupResponse
{
    /// <summary>
    /// Gets or sets the base32-encoded secret for manual entry.
    /// </summary>
    public string Secret { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the QR code URI (otpauth://) for authenticator apps.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings - otpauth:// is a custom scheme
    public string QrCodeUri { get; set; } = string.Empty;
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the base64-encoded QR code image.
    /// </summary>
    public string QrCodeImage { get; set; } = string.Empty;
}

/// <summary>
/// Request to enable 2FA after verifying the code.
/// </summary>
public class EnableTwoFactorRequest
{
    /// <summary>
    /// Gets or sets the 6-digit TOTP code from authenticator app.
    /// </summary>
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Request to verify 2FA code during login.
/// </summary>
public class VerifyTwoFactorRequest
{
    /// <summary>
    /// Gets or sets the user ID (from initial login response).
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the 6-digit TOTP code.
    /// </summary>
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Request to disable 2FA.
/// </summary>
public class DisableTwoFactorRequest
{
    /// <summary>
    /// Gets or sets the 6-digit TOTP code to confirm disable.
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the current password for additional verification.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Response containing recovery codes.
/// </summary>
public class RecoveryCodesResponse
{
    /// <summary>
    /// Gets the list of recovery codes.
    /// </summary>
    public IReadOnlyList<string> RecoveryCodes { get; init; } = [];

    /// <summary>
    /// Gets or sets a message about code usage.
    /// </summary>
    public string Message { get; set; } = "Store these codes securely. Each code can only be used once.";
}

/// <summary>
/// Login response when 2FA is required.
/// </summary>
public class TwoFactorRequiredResponse
{
    /// <summary>
    /// Gets or sets a value indicating whether 2FA is required.
    /// </summary>
    public bool Requires2FA { get; set; } = true;

    /// <summary>
    /// Gets or sets the user ID for the 2FA verification step.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets a message for the user.
    /// </summary>
    public string Message { get; set; } = "Two-factor authentication is required. Please enter your code.";
}
