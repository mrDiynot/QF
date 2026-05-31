namespace QualiFlow.Application.Features.Admin.Auth;

/// <summary>
/// Service interface for two-factor authentication (2FA) using TOTP.
/// </summary>
public interface ITwoFactorAuthService
{
    /// <summary>
    /// Generates a new TOTP secret for a user.
    /// </summary>
    /// <returns>The base32-encoded secret.</returns>
    string GenerateSecret();

    /// <summary>
    /// Generates a QR code URI for TOTP setup.
    /// </summary>
    /// <param name="email">The user's email address.</param>
    /// <param name="secret">The TOTP secret.</param>
    /// <param name="issuer">The issuer name (default: "QualiFlow").</param>
    /// <param name="imageUrl">Optional logo URL to display in authenticator apps that support it.</param>
    /// <returns>The QR code URI (otpauth://).</returns>
#pragma warning disable CA1055, CA1054 // URI return/parameter types should not be strings - otpauth:// is a custom scheme
    string GenerateQrCodeUri(string email, string secret, string issuer = "QualiFlow", string? imageUrl = null);
#pragma warning restore CA1055, CA1054

    /// <summary>
    /// Verifies a TOTP code against a secret.
    /// </summary>
    /// <param name="secret">The TOTP secret.</param>
    /// <param name="code">The 6-digit TOTP code.</param>
    /// <returns>True if the code is valid, false otherwise.</returns>
    bool VerifyCode(string secret, string code);

    /// <summary>
    /// Generates a QR code image as a base64-encoded PNG.
    /// </summary>
    /// <param name="qrCodeUri">The QR code URI.</param>
    /// <returns>Base64-encoded PNG image.</returns>
#pragma warning disable CA1054 // URI parameters should not be strings - otpauth:// is a custom scheme
    string GenerateQrCodeImage(string qrCodeUri);
#pragma warning restore CA1054
}

