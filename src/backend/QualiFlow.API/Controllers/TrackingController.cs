// <copyright file="TrackingController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Infrastructure.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for email tracking (open pixels and click tracking).
/// These endpoints are public and don't require authentication.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/tracking")]
[AllowAnonymous]
public class TrackingController : ControllerBase
{
    private readonly EmailTrackingService _trackingService;
    private readonly ILogger<TrackingController> _logger;

    // 1x1 transparent GIF pixel
    private static readonly byte[] TransparentPixel =
    [
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
        0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x21,
        0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00,
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
        0x01, 0x00, 0x3B
    ];

    /// <summary>
    /// Initializes a new instance of the <see cref="TrackingController"/> class.
    /// </summary>
    public TrackingController(
        EmailTrackingService trackingService,
        ILogger<TrackingController> logger)
    {
        _trackingService = trackingService;
        _logger = logger;
    }

    /// <summary>
    /// Tracking pixel endpoint for email open tracking.
    /// Returns a 1x1 transparent GIF.
    /// </summary>
    /// <param name="emailId">The email ID to track.</param>
    /// <returns>A transparent 1x1 GIF image.</returns>
    [HttpGet("open/{emailId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> TrackOpenAsync(string emailId)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers.UserAgent.ToString();

            await _trackingService.RecordOpenAsync(emailId, ipAddress, userAgent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording email open for {EmailId}", emailId);
        }

        // Always return the tracking pixel, even if recording fails
        Response.Headers.CacheControl = "no-store, no-cache, must-revalidate, max-age=0";
        Response.Headers.Pragma = "no-cache";
        Response.Headers.Expires = "0";

        return File(TransparentPixel, "image/gif");
    }

    /// <summary>
    /// Link tracking endpoint for email click tracking.
    /// Redirects to the original URL after recording the click.
    /// </summary>
    /// <param name="emailId">The email ID to track.</param>
    /// <param name="url">The original URL to redirect to (URL encoded).</param>
    /// <returns>A redirect to the original URL.</returns>
    [HttpGet("click/{emailId}")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
#pragma warning disable CA1054 // URI parameters should not be strings - url comes from query string
    public async Task<IActionResult> TrackClickAsync(string emailId, [FromQuery] string url)
#pragma warning restore CA1054
    {
        if (string.IsNullOrEmpty(url))
        {
            return BadRequest("URL parameter is required");
        }

        // Validate URL first to prevent open redirects
        if (!Uri.TryCreate(url, UriKind.Absolute, out var validatedUri) ||
            (validatedUri.Scheme != "http" && validatedUri.Scheme != "https"))
        {
            return BadRequest("Invalid URL - must be absolute HTTP/HTTPS URL");
        }

        // Use the validated URI string for further processing
        var safeUrl = validatedUri.AbsoluteUri;

        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers.UserAgent.ToString();

            await _trackingService.RecordClickAsync(emailId, safeUrl, ipAddress, userAgent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording email click for {EmailId}", emailId);
        }

        // Redirect using the validated URI - this is safe because we validated above
#pragma warning disable SCS0027 // Open redirect - URL is validated above to be absolute HTTP/HTTPS
        return Redirect(safeUrl);
#pragma warning restore SCS0027
    }
}
