// <copyright file="GoogleCalendarService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Integrations.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for Google Calendar integration.
/// </summary>
#pragma warning disable S1075 // Hardcoded URIs are intentional for Google API endpoints
public partial class GoogleCalendarService : IGoogleCalendarService
{
    private const string GoogleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GoogleTokenUrl = "https://oauth2.googleapis.com/token";
    private const string GoogleCalendarApiUrl = "https://www.googleapis.com/calendar/v3";
    private const string GoogleUserInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
#pragma warning restore S1075

    private readonly QualiFlowDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleCalendarService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="GoogleCalendarService"/> class.
    /// </summary>
    public GoogleCalendarService(
        QualiFlowDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GoogleCalendarService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task<string> InitiateOAuthAsync(
        Guid businessId,
        Guid userId,
        string redirectUri,
        CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["Google:ClientId"]
            ?? throw new InvalidOperationException("Google:ClientId not configured");

        var scope = Uri.EscapeDataString("https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events");
        var state = Convert.ToBase64String(
            JsonSerializer.SerializeToUtf8Bytes(new { businessId, userId }));

        var authUrl = $"{GoogleAuthUrl}?" +
            $"client_id={clientId}&" +
            $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
            $"response_type=code&" +
            $"scope={scope}&" +
            $"access_type=offline&" +
            $"prompt=consent&" +
            $"state={Uri.EscapeDataString(state)}";

        _logger.LogInformation(
            "Initiated Google Calendar OAuth for business {BusinessId} user {UserId}",
            businessId, userId);

        return Task.FromResult(authUrl);
    }

    /// <inheritdoc />
    public async Task<CalendarIntegrationDto> HandleCallbackAsync(
        Guid businessId,
        Guid userId,
        string code,
        string redirectUri,
        CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["Google:ClientId"]
            ?? throw new InvalidOperationException("Google:ClientId not configured");
        var clientSecret = _configuration["Google:ClientSecret"]
            ?? throw new InvalidOperationException("Google:ClientSecret not configured");

        // Exchange code for tokens
        var client = _httpClientFactory.CreateClient();
        var tokenRequest = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["redirect_uri"] = redirectUri,
            ["grant_type"] = "authorization_code",
        });

        var tokenResponse = await client.PostAsync(new Uri(GoogleTokenUrl), tokenRequest, cancellationToken);
        tokenResponse.EnsureSuccessStatusCode();

        var tokenJson = await tokenResponse.Content.ReadAsStringAsync(cancellationToken);
        var tokens = JsonSerializer.Deserialize<GoogleTokenResponse>(tokenJson)
            ?? throw new InvalidOperationException("Failed to parse token response");

        // Get user email from Google
        var userEmail = await GetUserEmailAsync(tokens.AccessToken, cancellationToken);

        // Save or update integration
        var integration = await _context.Set<CalendarIntegration>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.UserId == userId && c.Provider == "Google", cancellationToken);

        if (integration == null)
        {
            integration = new CalendarIntegration
            {
                BusinessId = businessId,
                UserId = userId,
                Provider = "Google",
            };
            _context.Set<CalendarIntegration>().Add(integration);
        }

        integration.ExternalEmail = userEmail;
        integration.AccessToken = tokens.AccessToken;
        integration.RefreshToken = tokens.RefreshToken;
        integration.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokens.ExpiresIn);
        integration.Status = "Active";
        integration.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Connected Google Calendar for business {BusinessId} user {UserId} email {Email}",
            businessId, userId, userEmail);

        return MapToDto(integration);
    }

    /// <inheritdoc />
    public async Task<CalendarIntegrationDto?> GetIntegrationAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var integration = await _context.Set<CalendarIntegration>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.UserId == userId && c.Provider == "Google", cancellationToken);

        return integration == null ? null : MapToDto(integration);
    }

    /// <inheritdoc />
    public async Task<bool> DisconnectAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var integration = await _context.Set<CalendarIntegration>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.UserId == userId && c.Provider == "Google", cancellationToken);

        if (integration == null)
        {
            return false;
        }

        integration.DeletedAt = DateTime.UtcNow;
        integration.Status = "Disconnected";
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Disconnected Google Calendar for business {BusinessId} user {UserId}",
            businessId, userId);

        return true;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CalendarDto>> GetCalendarsAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var integration = await GetValidIntegrationAsync(businessId, userId, cancellationToken);
        if (integration == null)
        {
            return [];
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", integration.AccessToken);

        var response = await client.GetAsync(new Uri($"{GoogleCalendarApiUrl}/users/me/calendarList"), cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var calendarList = JsonSerializer.Deserialize<GoogleCalendarListResponse>(json);

        return calendarList?.Items?.Select(c => new CalendarDto
        {
            Id = c.Id,
            Name = c.Summary,
            IsPrimary = c.Primary ?? false,
            AccessRole = c.AccessRole ?? "reader",
        }).ToList() ?? [];
    }

    /// <inheritdoc />
    public async Task<CalendarIntegrationDto> UpdateSettingsAsync(
        Guid businessId,
        Guid userId,
        UpdateCalendarSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var integration = await _context.Set<CalendarIntegration>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.UserId == userId && c.Provider == "Google", cancellationToken)
            ?? throw new InvalidOperationException("Integration not found");

        if (request.SelectedCalendarId != null)
        {
            integration.SelectedCalendarId = request.SelectedCalendarId;
        }

        if (request.IsSyncEnabled.HasValue)
        {
            integration.IsSyncEnabled = request.IsSyncEnabled.Value;
        }

        if (request.SyncBookingsToCalendar.HasValue)
        {
            integration.SyncBookingsToCalendar = request.SyncBookingsToCalendar.Value;
        }

        if (request.BlockBusyTimes.HasValue)
        {
            integration.BlockBusyTimes = request.BlockBusyTimes.Value;
        }

        integration.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Updated Google Calendar settings for business {BusinessId} user {UserId}",
            businessId, userId);

        return MapToDto(integration);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<BusyTimeSlot>> GetBusyTimesAsync(
        Guid businessId,
        Guid userId,
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken = default)
    {
        var integration = await GetValidIntegrationAsync(businessId, userId, cancellationToken);
        if (integration == null || string.IsNullOrEmpty(integration.SelectedCalendarId))
        {
            return [];
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", integration.AccessToken);

        var freeBusyRequest = new
        {
            timeMin = startTime.ToString("o"),
            timeMax = endTime.ToString("o"),
            items = new[] { new { id = integration.SelectedCalendarId } },
        };

        var response = await client.PostAsJsonAsync($"{GoogleCalendarApiUrl}/freeBusy", freeBusyRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var freeBusy = JsonSerializer.Deserialize<GoogleFreeBusyResponse>(json);

        var busyTimes = new List<BusyTimeSlot>();
        if (freeBusy?.Calendars?.TryGetValue(integration.SelectedCalendarId, out var calendar) == true)
        {
            foreach (var busy in calendar.Busy ?? [])
            {
                if (DateTime.TryParse(busy.Start, System.Globalization.CultureInfo.InvariantCulture, out var start) && DateTime.TryParse(busy.End, System.Globalization.CultureInfo.InvariantCulture, out var end))
                {
                    busyTimes.Add(new BusyTimeSlot { Start = start, End = end });
                }
            }
        }

        return busyTimes;
    }

    /// <inheritdoc />
    public async Task<string> CreateEventAsync(
        Guid businessId,
        Guid userId,
        CreateCalendarEventRequest request,
        CancellationToken cancellationToken = default)
    {
        var integration = await GetValidIntegrationAsync(businessId, userId, cancellationToken)
            ?? throw new InvalidOperationException("No valid calendar integration found");

        var calendarId = integration.SelectedCalendarId ?? "primary";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", integration.AccessToken);

        var eventRequest = new
        {
            summary = request.Summary,
            description = request.Description,
            start = new { dateTime = request.StartTime.ToString("o") },
            end = new { dateTime = request.EndTime.ToString("o") },
            location = request.Location,
            attendees = request.Attendees?.Select(e => new { email = e }).ToArray(),
        };

        var response = await client.PostAsJsonAsync(
            $"{GoogleCalendarApiUrl}/calendars/{Uri.EscapeDataString(calendarId)}/events",
            eventRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var createdEvent = JsonSerializer.Deserialize<GoogleEventResponse>(json);

        _logger.LogInformation(
            "Created Google Calendar event {EventId} for business {BusinessId}",
            createdEvent?.Id, businessId);

        return createdEvent?.Id ?? string.Empty;
    }

    private async Task<CalendarIntegration?> GetValidIntegrationAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var integration = await _context.Set<CalendarIntegration>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.UserId == userId && c.Provider == "Google" && c.DeletedAt == null, cancellationToken);

        if (integration == null)
        {
            return null;
        }

        // Refresh token if expired
        if (integration.TokenExpiresAt <= DateTime.UtcNow.AddMinutes(5))
        {
            await RefreshTokenAsync(integration, cancellationToken);
        }

        return integration;
    }

    private async Task RefreshTokenAsync(CalendarIntegration integration, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(integration.RefreshToken))
        {
            integration.Status = "TokenExpired";
            await _context.SaveChangesAsync(cancellationToken);
            throw new InvalidOperationException("Refresh token not available");
        }

        var clientId = _configuration["Google:ClientId"]!;
        var clientSecret = _configuration["Google:ClientSecret"]!;

        var client = _httpClientFactory.CreateClient();
        var tokenRequest = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["refresh_token"] = integration.RefreshToken,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["grant_type"] = "refresh_token",
        });

        var response = await client.PostAsync(new Uri(GoogleTokenUrl), tokenRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        var tokenJson = await response.Content.ReadAsStringAsync(cancellationToken);
        var tokens = JsonSerializer.Deserialize<GoogleTokenResponse>(tokenJson)!;

        integration.AccessToken = tokens.AccessToken;
        integration.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokens.ExpiresIn);
        integration.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> GetUserEmailAsync(string accessToken, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(new Uri(GoogleUserInfoUrl), cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var userInfo = JsonSerializer.Deserialize<GoogleUserInfo>(json);

        return userInfo?.Email ?? "unknown";
    }

    private static CalendarIntegrationDto MapToDto(CalendarIntegration integration)
    {
        return new CalendarIntegrationDto
        {
            Id = integration.Id,
            Provider = integration.Provider,
            ExternalEmail = integration.ExternalEmail,
            SelectedCalendarId = integration.SelectedCalendarId,
            IsSyncEnabled = integration.IsSyncEnabled,
            SyncBookingsToCalendar = integration.SyncBookingsToCalendar,
            BlockBusyTimes = integration.BlockBusyTimes,
            LastSyncAt = integration.LastSyncAt,
            Status = integration.Status,
        };
    }

    // Google API response models - used by JSON deserialization
#pragma warning disable CA1812 // Internal types are instantiated via JSON deserialization
    private sealed record GoogleTokenResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("access_token")] string AccessToken,
        [property: System.Text.Json.Serialization.JsonPropertyName("refresh_token")] string? RefreshToken,
        [property: System.Text.Json.Serialization.JsonPropertyName("expires_in")] int ExpiresIn);

    private sealed record GoogleUserInfo(
        [property: System.Text.Json.Serialization.JsonPropertyName("email")] string Email);

    private sealed record GoogleCalendarListResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("items")] List<GoogleCalendarItem>? Items);

    private sealed record GoogleCalendarItem(
        [property: System.Text.Json.Serialization.JsonPropertyName("id")] string Id,
        [property: System.Text.Json.Serialization.JsonPropertyName("summary")] string Summary,
        [property: System.Text.Json.Serialization.JsonPropertyName("primary")] bool? Primary,
        [property: System.Text.Json.Serialization.JsonPropertyName("accessRole")] string? AccessRole);

    private sealed record GoogleFreeBusyResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("calendars")] Dictionary<string, GoogleCalendarBusy>? Calendars);

    private sealed record GoogleCalendarBusy(
        [property: System.Text.Json.Serialization.JsonPropertyName("busy")] List<GoogleBusyTime>? Busy);

    private sealed record GoogleBusyTime(
        [property: System.Text.Json.Serialization.JsonPropertyName("start")] string Start,
        [property: System.Text.Json.Serialization.JsonPropertyName("end")] string End);

    private sealed record GoogleEventResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("id")] string Id);
#pragma warning restore CA1812
}
