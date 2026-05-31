// <copyright file="EmailTrackingService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Text.RegularExpressions;
using System.Web;
using Microsoft.Extensions.Logging;
using QualiFlow.Infrastructure.Data.Repositories;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for email tracking - open tracking pixels and click tracking link rewrites.
/// </summary>
public partial class EmailTrackingService
{
    private readonly IEmailLogRepository _emailLogRepository;
    private readonly ILogger<EmailTrackingService> _logger;
    private readonly string _trackingBaseUrl;

    /// <summary>
    /// Initializes a new instance of the <see cref="EmailTrackingService"/> class.
    /// </summary>
    public EmailTrackingService(
        IEmailLogRepository emailLogRepository,
        ILogger<EmailTrackingService> logger)
    {
        _emailLogRepository = emailLogRepository;
        _logger = logger;
        _trackingBaseUrl = Environment.GetEnvironmentVariable("TRACKING_BASE_URL") ?? "https://api.qualiflow.ai";
    }

    /// <summary>
    /// Injects a tracking pixel into HTML email body for open tracking.
    /// </summary>
    /// <param name="htmlBody">The HTML email body.</param>
    /// <param name="emailId">The email ID for tracking.</param>
    /// <returns>The HTML body with tracking pixel injected.</returns>
    public string InjectTrackingPixel(string htmlBody, string emailId)
    {
        if (string.IsNullOrEmpty(htmlBody))
        {
            return htmlBody;
        }

        var trackingPixelUrl = $"{_trackingBaseUrl}/api/v1/tracking/open/{emailId}";
        var trackingPixel = $"<img src=\"{trackingPixelUrl}\" width=\"1\" height=\"1\" alt=\"\" style=\"display:none;\" />";

        // Insert before closing </body> tag if present, otherwise append
        if (htmlBody.Contains("</body>", StringComparison.OrdinalIgnoreCase))
        {
            return BodyTagRegex().Replace(htmlBody, $"{trackingPixel}</body>");
        }

        return htmlBody + trackingPixel;
    }

    /// <summary>
    /// Rewrites links in HTML email body for click tracking.
    /// </summary>
    /// <param name="htmlBody">The HTML email body.</param>
    /// <param name="emailId">The email ID for tracking.</param>
    /// <returns>The HTML body with tracked links.</returns>
    public string RewriteLinksForTracking(string htmlBody, string emailId)
    {
        if (string.IsNullOrEmpty(htmlBody))
        {
            return htmlBody;
        }

        return HrefRegex().Replace(htmlBody, match =>
        {
            var originalUrl = match.Groups[1].Value;

            // Skip tracking for special URLs
            if (originalUrl.StartsWith("mailto:", StringComparison.OrdinalIgnoreCase) ||
                originalUrl.StartsWith("tel:", StringComparison.OrdinalIgnoreCase) ||
                originalUrl.StartsWith('#') ||
                originalUrl.Contains("unsubscribe", StringComparison.OrdinalIgnoreCase))
            {
                return match.Value;
            }

            var encodedUrl = HttpUtility.UrlEncode(originalUrl);
            var trackedUrl = $"{_trackingBaseUrl}/api/v1/tracking/click/{emailId}?url={encodedUrl}";

            return $"href=\"{trackedUrl}\"";
        });
    }

    /// <summary>
    /// Records an email open event.
    /// </summary>
    /// <param name="emailId">The email ID.</param>
    /// <param name="ipAddress">The IP address of the opener.</param>
    /// <param name="userAgent">The user agent of the opener.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public async Task RecordOpenAsync(
        string emailId,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Recording email open for {EmailId}", emailId);

        var emailLog = await _emailLogRepository.GetByResendEmailIdAsync(emailId, cancellationToken);
        if (emailLog == null)
        {
            _logger.LogWarning("Email log not found for {EmailId}", emailId);
            return;
        }

        // Only record first open
        if (emailLog.OpenedAt == null)
        {
            emailLog.OpenedAt = DateTime.UtcNow;
            emailLog.OpenCount = 1;
        }
        else
        {
            emailLog.OpenCount++;
        }

        await _emailLogRepository.UpdateAsync(emailLog, cancellationToken);

        _logger.LogInformation(
            "Email open recorded for {EmailId}. Total opens: {OpenCount}",
            emailId,
            emailLog.OpenCount);
    }

    /// <summary>
    /// Records an email link click event.
    /// </summary>
    /// <param name="emailId">The email ID.</param>
    /// <param name="clickedUrl">The URL that was clicked (as string for URL-decoded input).</param>
    /// <param name="ipAddress">The IP address of the clicker.</param>
    /// <param name="userAgent">The user agent of the clicker.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The original URL to redirect to.</returns>
#pragma warning disable CA1054 // URI parameters should not be strings - clickedUrl comes URL-decoded from query string
    public async Task<string> RecordClickAsync(
        string emailId,
        string clickedUrl,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Recording email click for {EmailId}, URL: {Url}", emailId, clickedUrl);

        var emailLog = await _emailLogRepository.GetByResendEmailIdAsync(emailId, cancellationToken);
        if (emailLog == null)
        {
            _logger.LogWarning("Email log not found for {EmailId}", emailId);
            return clickedUrl;
        }

        // Only record first click timestamp
        if (emailLog.ClickedAt == null)
        {
            emailLog.ClickedAt = DateTime.UtcNow;
            emailLog.ClickCount = 1;
        }
        else
        {
            emailLog.ClickCount++;
        }

        await _emailLogRepository.UpdateAsync(emailLog, cancellationToken);

        _logger.LogInformation(
            "Email click recorded for {EmailId}. Total clicks: {ClickCount}",
            emailId,
            emailLog.ClickCount);

        return clickedUrl;
    }
#pragma warning restore CA1054

    [GeneratedRegex(@"</body>", RegexOptions.IgnoreCase | RegexOptions.NonBacktracking)]
    private static partial Regex BodyTagRegex();

    [GeneratedRegex(@"href=""([^""]+)""", RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture | RegexOptions.NonBacktracking)]
    private static partial Regex HrefRegex();
}
