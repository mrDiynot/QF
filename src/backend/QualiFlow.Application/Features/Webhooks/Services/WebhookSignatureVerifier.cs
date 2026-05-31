using System.Security.Cryptography;
using System.Text;

namespace QualiFlow.Application.Features.Webhooks.Services;

/// <summary>
/// Utility class for generating and verifying HMAC-SHA256 webhook signatures.
/// Used to ensure webhook payloads are authentic and haven't been tampered with.
/// </summary>
public static class WebhookSignatureVerifier
{
    /// <summary>
    /// Generates an HMAC-SHA256 signature for the given payload and secret.
    /// </summary>
    /// <param name="payload">The webhook payload (JSON string).</param>
    /// <param name="secret">The webhook secret key.</param>
    /// <returns>The hexadecimal signature string (lowercase).</returns>
    public static string GenerateSignature(string payload, string secret)
    {
        ArgumentException.ThrowIfNullOrEmpty(payload);
        ArgumentException.ThrowIfNullOrEmpty(secret);

        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var hash = HMACSHA256.HashData(keyBytes, payloadBytes);

        // Use lowercase for consistency with common webhook implementations (GitHub, Stripe, etc.)
#pragma warning disable CA1308 // Normalize strings to uppercase
        return Convert.ToHexString(hash).ToLowerInvariant();
#pragma warning restore CA1308 // Normalize strings to uppercase
    }

    /// <summary>
    /// Verifies that the provided signature matches the expected signature for the payload.
    /// Uses constant-time comparison to prevent timing attacks.
    /// </summary>
    /// <param name="payload">The webhook payload (JSON string).</param>
    /// <param name="secret">The webhook secret key.</param>
    /// <param name="providedSignature">The signature provided in the X-Webhook-Signature header.</param>
    /// <returns>True if the signature is valid, false otherwise.</returns>
    public static bool VerifySignature(string payload, string secret, string providedSignature)
    {
        if (string.IsNullOrEmpty(payload) || string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(providedSignature))
        {
            return false;
        }

        var expectedSignature = GenerateSignature(payload, secret);

        // Use constant-time comparison to prevent timing attacks
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expectedSignature),
            Encoding.UTF8.GetBytes(providedSignature));
    }

    /// <summary>
    /// Extracts the signature from the X-Webhook-Signature header.
    /// Supports both "sha256=signature" and plain "signature" formats.
    /// </summary>
    /// <param name="signatureHeader">The X-Webhook-Signature header value.</param>
    /// <returns>The extracted signature, or null if invalid.</returns>
    public static string? ExtractSignature(string? signatureHeader)
    {
        if (string.IsNullOrEmpty(signatureHeader))
        {
            return null;
        }

        // Support "sha256=signature" format (GitHub style)
        if (signatureHeader.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase))
        {
            return signatureHeader["sha256=".Length..];
        }

        // Support plain signature format
        return signatureHeader;
    }

    /// <summary>
    /// Generates a cryptographically secure random secret for a new webhook.
    /// Returns a base64-encoded 32-byte (256-bit) secret.
    /// </summary>
    /// <returns>A base64-encoded secret string.</returns>
    public static string GenerateSecret()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    }
}

