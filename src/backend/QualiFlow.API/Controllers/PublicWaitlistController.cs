// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Public API endpoints for waitlist signups (coming soon page).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/public/waitlist")]
[AllowAnonymous]
[EnableRateLimiting("fixed")]
public class PublicWaitlistController : ControllerBase
{
    private readonly ILogger<PublicWaitlistController> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly QualiFlowDbContext _dbContext;

    private static readonly Guid ComingSoonBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

    public PublicWaitlistController(
        ILogger<PublicWaitlistController> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        QualiFlowDbContext dbContext)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Submit an email to the waitlist.
    /// </summary>
    /// <param name="request">The waitlist signup request.</param>
    /// <returns>Success or error response.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> SubmitWaitlist([FromBody] WaitlistSignupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { success = false, error = "Email is required" });
        }

        if (!IsValidEmail(request.Email))
        {
            return BadRequest(new { success = false, error = "Invalid email format" });
        }

        _logger.LogInformation(
            "Waitlist signup received from {Email}, source: {Source}",
            MaskEmail(request.Email),
            request.Source ?? "unknown");

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var syncedToBrevo = false;

        var existingEntry = await _dbContext.WaitlistEntries
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.BusinessId == ComingSoonBusinessId && e.Email == normalizedEmail);

        if (existingEntry != null)
        {
            _logger.LogInformation("Email {Email} already on waitlist", MaskEmail(request.Email));
            return Ok(new
            {
                success = true,
                message = "You're already on the waitlist!",
            });
        }

        var brevoFormUrl = _configuration["Brevo:FormUrl"];
        if (!string.IsNullOrEmpty(brevoFormUrl))
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var formContent = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "EMAIL", request.Email },
                    { "email_address_check", string.Empty },
                    { "locale", "en" },
                });

                var response = await client.PostAsync(new Uri(brevoFormUrl), formContent);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successfully submitted to Brevo for {Email}", MaskEmail(request.Email));
                    syncedToBrevo = true;
                }
                else
                {
                    _logger.LogWarning(
                        "Brevo submission returned {StatusCode} for {Email}",
                        response.StatusCode,
                        MaskEmail(request.Email));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to submit to Brevo for {Email}", MaskEmail(request.Email));
            }
        }
        else
        {
            _logger.LogWarning("Brevo:FormUrl not configured, waitlist signup stored locally only");
        }

        var waitlistEntry = new WaitlistEntry
        {
            Id = Guid.NewGuid(),
            BusinessId = ComingSoonBusinessId,
            Email = normalizedEmail,
            Source = request.Source,
            IpAddress = GetClientIpAddress(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            PageUrl = Request.Headers.Referer.ToString(),
            SignedUpAt = DateTime.UtcNow,
            SyncedToBrevo = syncedToBrevo,
            SyncedAt = syncedToBrevo ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.WaitlistEntries.Add(waitlistEntry);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Waitlist entry saved locally for {Email}, ID: {Id}",
            MaskEmail(request.Email),
            waitlistEntry.Id);

        return Ok(new
        {
            success = true,
            message = "Successfully joined the waitlist!",
        });
    }

    private string? GetClientIpAddress()
    {
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2)
        {
            return "***";
        }

        var local = parts[0];
        var masked = local.Length > 2
            ? local[0] + new string('*', Math.Min(local.Length - 2, 5)) + local[^1]
            : "**";
        return $"{masked}@{parts[1]}";
    }
}

/// <summary>
/// Request model for waitlist signup.
/// </summary>
public class WaitlistSignupRequest
{
    /// <summary>
    /// Gets or sets the email address to add to the waitlist.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the source of the signup (e.g., "chat-widget", "newsletter", "homepage").
    /// </summary>
    public string? Source { get; set; }
}
