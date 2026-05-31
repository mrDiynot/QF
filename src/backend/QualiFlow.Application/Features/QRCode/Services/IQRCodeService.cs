// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.QRCode.Services;

/// <summary>
/// Service for generating QR codes.
/// </summary>
public interface IQRCodeService
{
    /// <summary>
    /// Generates a QR code image as a base64 PNG string.
    /// </summary>
    /// <param name="content">The content to encode in the QR code.</param>
    /// <param name="size">The size of the QR code in pixels (default 256).</param>
    /// <returns>Base64-encoded PNG image.</returns>
    string GenerateQRCodeBase64(string content, int size = 256);

    /// <summary>
    /// Generates a QR code image as a byte array.
    /// </summary>
    /// <param name="content">The content to encode in the QR code.</param>
    /// <param name="size">The size of the QR code in pixels (default 256).</param>
    /// <returns>PNG image as byte array.</returns>
    byte[] GenerateQRCodeBytes(string content, int size = 256);

    /// <summary>
    /// Generates a QR code for a form URL.
    /// </summary>
    /// <param name="formSlug">The form's URL slug.</param>
    /// <param name="baseUrl">The base URL of the application.</param>
    /// <param name="size">The size of the QR code in pixels.</param>
    /// <returns>Base64-encoded PNG image.</returns>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1054:URI-like properties should not be strings", Justification = "String is more convenient for URL manipulation")]
    string GenerateFormQRCode(string formSlug, string baseUrl, int size = 256);

    /// <summary>
    /// Generates a QR code for a chat widget.
    /// </summary>
    /// <param name="widgetKey">The widget's unique key.</param>
    /// <param name="baseUrl">The base URL of the application.</param>
    /// <param name="size">The size of the QR code in pixels.</param>
    /// <returns>Base64-encoded PNG image.</returns>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1054:URI-like properties should not be strings", Justification = "String is more convenient for URL manipulation")]
    string GenerateWidgetQRCode(string widgetKey, string baseUrl, int size = 256);
}

