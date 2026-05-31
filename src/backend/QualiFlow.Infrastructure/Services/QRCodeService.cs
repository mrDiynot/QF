// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.Extensions.Logging;
using QRCoder;
using QualiFlow.Application.Features.QRCode.Services;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for generating QR codes using QRCoder library.
/// </summary>
public partial class QRCodeService : IQRCodeService
{
    private readonly ILogger<QRCodeService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="QRCodeService"/> class.
    /// </summary>
    /// <param name="logger">Logger instance.</param>
    public QRCodeService(ILogger<QRCodeService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public string GenerateQRCodeBase64(string content, int size = 256)
    {
        var bytes = GenerateQRCodeBytes(content, size);
        return Convert.ToBase64String(bytes);
    }

    /// <inheritdoc />
    public byte[] GenerateQRCodeBytes(string content, int size = 256)
    {
        LogGeneratingQRCode(_logger, content.Length, size);

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);

        return qrCode.GetGraphic(size / 25); // Approximate pixels per module
    }

    /// <inheritdoc />
    public string GenerateFormQRCode(string formSlug, string baseUrl, int size = 256)
    {
        var formUrl = $"{baseUrl.TrimEnd('/')}/forms/{formSlug}";
        LogGeneratingFormQRCode(_logger, formSlug, formUrl);
        return GenerateQRCodeBase64(formUrl, size);
    }

    /// <inheritdoc />
    public string GenerateWidgetQRCode(string widgetKey, string baseUrl, int size = 256)
    {
        var widgetUrl = $"{baseUrl.TrimEnd('/')}/chat/{widgetKey}";
        LogGeneratingWidgetQRCode(_logger, widgetKey, widgetUrl);
        return GenerateQRCodeBase64(widgetUrl, size);
    }

    [LoggerMessage(EventId = 26001, Level = LogLevel.Debug, Message = "Generating QR code: ContentLength={ContentLength}, Size={Size}")]
    private static partial void LogGeneratingQRCode(ILogger logger, int contentLength, int size);

    [LoggerMessage(EventId = 26002, Level = LogLevel.Information, Message = "Generating form QR code: FormSlug={FormSlug}, URL={Url}")]
    private static partial void LogGeneratingFormQRCode(ILogger logger, string formSlug, string url);

    [LoggerMessage(EventId = 26003, Level = LogLevel.Information, Message = "Generating widget QR code: WidgetKey={WidgetKey}, URL={Url}")]
    private static partial void LogGeneratingWidgetQRCode(ILogger logger, string widgetKey, string url);
}

