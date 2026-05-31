using OtpNet;
using QRCoder;
using QualiFlow.Application.Features.Admin.Auth;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for two-factor authentication (2FA) using TOTP.
/// </summary>
public class TwoFactorAuthService : ITwoFactorAuthService
{
    /// <inheritdoc/>
    public string GenerateSecret()
    {
        // Generate a random 20-byte secret (160 bits)
        var key = KeyGeneration.GenerateRandomKey(20);

        // Convert to base32 string
        return Base32Encoding.ToString(key);
    }

    /// <inheritdoc/>
#pragma warning disable CA1055 // URI return types should not be strings - otpauth:// is a custom scheme
    public string GenerateQrCodeUri(string email, string secret, string issuer = "QualiFlow", string? imageUrl = null)
#pragma warning restore CA1055
    {
        // Format: otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}
        var encodedIssuer = Uri.EscapeDataString(issuer);
        var encodedEmail = Uri.EscapeDataString(email);

        var uri = $"otpauth://totp/{encodedIssuer}:{encodedEmail}?secret={secret}&issuer={encodedIssuer}";

        // Append image parameter for authenticator apps that support custom logos
        // (e.g., Microsoft Authenticator, Authy — Google Authenticator does not support this)
        if (!string.IsNullOrEmpty(imageUrl))
        {
            uri += $"&image={Uri.EscapeDataString(imageUrl)}";
        }

        return uri;
    }

    /// <inheritdoc/>
    public bool VerifyCode(string secret, string code)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code))
        {
            return false;
        }

        try
        {
            var secretBytes = Base32Encoding.ToBytes(secret);
            var totp = new Totp(secretBytes);

            // Verify with a window of ±1 time step (30 seconds each)
            // This allows for slight clock drift
            return totp.VerifyTotp(code, out _, new VerificationWindow(1, 1));
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc/>
    public string GenerateQrCodeImage(string qrCodeUri)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(qrCodeUri, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);

        var qrCodeBytes = qrCode.GetGraphic(20);
        return Convert.ToBase64String(qrCodeBytes);
    }
}
