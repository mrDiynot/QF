using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Bookings.DTOs;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.ExternalServices;

/// <summary>
/// Cal.com API service implementation.
/// Uses per-business API keys stored in the database.
/// </summary>
public partial class CalComService : ICalComService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly QualiFlowDbContext _dbContext;
    private readonly ILogger<CalComService> _logger;
    private readonly Uri _baseUri;
    private readonly string? _platformApiKey;
    private readonly string? _platformOnboardingEventTypeId;

    /// <summary>
    /// Initializes a new instance of the <see cref="CalComService"/> class.
    /// </summary>
    /// <param name="httpClientFactory">The HTTP client factory.</param>
    /// <param name="dbContext">The database context.</param>
    /// <param name="configuration">The configuration.</param>
    /// <param name="logger">The logger.</param>
    public CalComService(
        IHttpClientFactory httpClientFactory,
        QualiFlowDbContext dbContext,
        IConfiguration configuration,
        ILogger<CalComService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _dbContext = dbContext;
        _logger = logger;
#pragma warning disable S1075 // URIs should not be hardcoded
        var baseUrl = configuration["CalCom:BaseUrl"] ?? "https://api.cal.com/v1";
#pragma warning restore S1075
        _baseUri = new Uri(baseUrl);

        // Platform-level Cal.com configuration for QualiFlow onboarding calls
        _platformApiKey = configuration["CalCom:PlatformApiKey"];
        _platformOnboardingEventTypeId = configuration["CalCom:OnboardingEventTypeId"];
    }

    private async Task<string?> GetApiKeyForBusinessAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var integration = await _dbContext.CalComIntegrations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        return integration?.ApiKey;
    }

    private HttpClient CreateClient()
    {
        var client = _httpClientFactory.CreateClient("CalCom");
        client.BaseAddress = _baseUri;
        client.DefaultRequestHeaders.Clear();
        return client;
    }

    private Uri BuildUri(string path, string apiKey)
    {
        var separator = path.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return new Uri(_baseUri, $"{path}{separator}apiKey={apiKey}");
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<TimeSlotResponse>> GetAvailableSlotsAsync(
        Guid businessId,
        string eventTypeId,
        DateTime startDate,
        DateTime endDate,
        string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        try
        {
            var apiKey = await GetApiKeyForBusinessAsync(businessId, cancellationToken);
            if (string.IsNullOrEmpty(apiKey))
            {
                LogNoApiKeyForBusiness(businessId);
                return [];
            }

            using var client = CreateClient();
            var uri = BuildUri($"/slots?eventTypeId={eventTypeId}&startTime={startDate:O}&endTime={endDate:O}&timeZone={timezone}", apiKey);
            var response = await client.GetAsync(uri, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadFromJsonAsync<CalComSlotsResponse>(cancellationToken: cancellationToken);

            // Cal.com v1 API returns slots grouped by date as a dictionary
            // Flatten all slots from all dates into a single list
            var slots = content?.Slots?.Values
                .SelectMany(slotList => slotList)
                .Select(s => new TimeSlotResponse
                {
                    StartTime = s.Time,
                    EndTime = s.Time.AddMinutes(30),
                    IsAvailable = true,
                })
                .OrderBy(s => s.StartTime)
                .ToList() ?? [];

            return slots;
        }
        catch (Exception ex)
        {
            LogGetSlotsError(ex);
            return [];
        }
    }

    /// <inheritdoc/>
    public async Task<string> CreateBookingAsync(
        Guid businessId,
        string eventTypeId,
        DateTime startTime,
        string name,
        string email,
        string? notes = null,
        string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        var apiKey = await GetApiKeyForBusinessAsync(businessId, cancellationToken)
            ?? throw new InvalidOperationException("Cal.com is not configured for this business");

        try
        {
            using var client = CreateClient();
            var request = new
            {
                eventTypeId = int.Parse(eventTypeId, CultureInfo.InvariantCulture),
                start = startTime.ToString("O", CultureInfo.InvariantCulture),
                responses = new { name, email, notes = notes ?? string.Empty },
                timeZone = timezone,
                language = "en",
                metadata = new { },
            };

            var response = await client.PostAsJsonAsync(BuildUri("/bookings", apiKey), request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadFromJsonAsync<CalComBookingResponse>(cancellationToken: cancellationToken);
            LogBookingCreated(content?.Uid ?? "unknown");

            return content?.Uid ?? throw new InvalidOperationException("Failed to get booking UID from Cal.com");
        }
        catch (Exception ex)
        {
            LogCreateBookingError(ex);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task RescheduleBookingAsync(
        Guid businessId,
        string bookingUid,
        DateTime newStartTime,
        string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var apiKey = await GetApiKeyForBusinessAsync(businessId, cancellationToken)
            ?? throw new InvalidOperationException("Cal.com is not configured for this business");

        try
        {
            using var client = CreateClient();
            var request = new { start = newStartTime.ToString("O", CultureInfo.InvariantCulture), rescheduleReason = reason ?? string.Empty };
            var response = await client.PatchAsJsonAsync(BuildUri($"/bookings/{bookingUid}", apiKey), request, cancellationToken);
            response.EnsureSuccessStatusCode();

            LogBookingRescheduled(bookingUid);
        }
        catch (Exception ex)
        {
            LogRescheduleBookingError(ex);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task CancelBookingAsync(
        Guid businessId,
        string bookingUid,
        string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var apiKey = await GetApiKeyForBusinessAsync(businessId, cancellationToken)
            ?? throw new InvalidOperationException("Cal.com is not configured for this business");

        try
        {
            using var client = CreateClient();
            var request = new { cancellationReason = reason ?? string.Empty };
            var response = await client.PostAsJsonAsync(BuildUri($"/bookings/{bookingUid}/cancel", apiKey), request, cancellationToken);
            response.EnsureSuccessStatusCode();

            LogBookingCancelled(bookingUid);
        }
        catch (Exception ex)
        {
            LogCancelBookingError(ex);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<CalComEventType>> GetEventTypesAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var apiKey = await GetApiKeyForBusinessAsync(businessId, cancellationToken);
            if (string.IsNullOrEmpty(apiKey))
            {
                LogNoApiKeyForBusiness(businessId);
                return [];
            }

            using var client = CreateClient();
            var response = await client.GetAsync(BuildUri("/event-types", apiKey), cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadFromJsonAsync<CalComEventTypesResponse>(cancellationToken: cancellationToken);
            return content?.EventTypes?.Select(e => new CalComEventType
            {
                Id = e.Id.ToString(CultureInfo.InvariantCulture),
                Title = e.Title,
                Slug = e.Slug,
                DurationMinutes = e.Length,
                Description = e.Description,
            }).ToList() ?? [];
        }
        catch (Exception ex)
        {
            LogGetEventTypesError(ex);
            return [];
        }
    }

    /// <inheritdoc/>
    public async Task<CalComValidationResult> ValidateApiKeyAsync(
        string apiKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = CreateClient();
            var response = await client.GetAsync(BuildUri("/me", apiKey), cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new CalComValidationResult { IsValid = false };
            }

            var content = await response.Content.ReadFromJsonAsync<CalComMeResponse>(cancellationToken: cancellationToken);
            return new CalComValidationResult
            {
                IsValid = true,
                UserName = content?.Username,
                Email = content?.Email,
            };
        }
        catch (Exception ex)
        {
            LogValidateApiKeyError(ex);
            return new CalComValidationResult { IsValid = false };
        }
    }

    // ============================================================================
    // Platform-Level Methods (QualiFlow's Cal.com account for onboarding)
    // ============================================================================

    /// <inheritdoc/>
    public async Task<IReadOnlyList<TimeSlotResponse>> GetPlatformOnboardingSlotsAsync(
        DateTime startDate,
        DateTime endDate,
        string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_platformApiKey) || string.IsNullOrEmpty(_platformOnboardingEventTypeId))
        {
            LogPlatformNotConfigured();
            return [];
        }

        try
        {
            using var client = CreateClient();
            var uri = BuildUri($"/slots?eventTypeId={_platformOnboardingEventTypeId}&startTime={startDate:O}&endTime={endDate:O}&timeZone={timezone}", _platformApiKey);
            var response = await client.GetAsync(uri, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadFromJsonAsync<CalComSlotsResponse>(cancellationToken: cancellationToken);

            // Cal.com v1 API returns slots grouped by date as a dictionary
            // Flatten all slots from all dates into a single list
            var slots = content?.Slots?.Values
                .SelectMany(slotList => slotList)
                .Select(s => new TimeSlotResponse
                {
                    StartTime = s.Time,
                    EndTime = s.Time.AddMinutes(30),
                    IsAvailable = true,
                })
                .OrderBy(s => s.StartTime)
                .ToList() ?? [];

            return slots;
        }
        catch (Exception ex)
        {
            LogGetSlotsError(ex);
            return [];
        }
    }

    /// <inheritdoc/>
    public async Task<string> CreatePlatformOnboardingBookingAsync(
        DateTime startTime,
        string name,
        string email,
        string? notes = null,
        string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_platformApiKey) || string.IsNullOrEmpty(_platformOnboardingEventTypeId))
        {
            throw new InvalidOperationException("Platform Cal.com integration is not configured");
        }

        try
        {
            using var client = CreateClient();
            var request = new
            {
                eventTypeId = int.Parse(_platformOnboardingEventTypeId, CultureInfo.InvariantCulture),
                start = startTime.ToString("O", CultureInfo.InvariantCulture),
                responses = new { name, email, notes = notes ?? string.Empty },
                timeZone = timezone,
                language = "en",
                metadata = new { source = "qualiflow-onboarding" },
            };

            var response = await client.PostAsJsonAsync(BuildUri("/bookings", _platformApiKey), request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadFromJsonAsync<CalComBookingResponse>(cancellationToken: cancellationToken);
            LogBookingCreated(content?.Uid ?? "unknown");

            return content?.Uid ?? throw new InvalidOperationException("Failed to get booking UID from Cal.com");
        }
        catch (Exception ex)
        {
            LogCreateBookingError(ex);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task ReschedulePlatformOnboardingBookingAsync(
        string bookingUid,
        DateTime newStartTime,
        string? reason = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_platformApiKey))
        {
            throw new InvalidOperationException("Platform Cal.com integration is not configured");
        }

        try
        {
            using var client = CreateClient();
            var request = new { start = newStartTime.ToString("O", CultureInfo.InvariantCulture), rescheduleReason = reason ?? string.Empty };
            var response = await client.PatchAsJsonAsync(BuildUri($"/bookings/{bookingUid}", _platformApiKey), request, cancellationToken);
            response.EnsureSuccessStatusCode();

            LogBookingRescheduled(bookingUid);
        }
        catch (Exception ex)
        {
            LogRescheduleBookingError(ex);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task CancelPlatformOnboardingBookingAsync(
        string bookingUid,
        string? reason = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_platformApiKey))
        {
            throw new InvalidOperationException("Platform Cal.com integration is not configured");
        }

        try
        {
            using var client = CreateClient();
            var request = new { cancellationReason = reason ?? string.Empty };
            var response = await client.PostAsJsonAsync(BuildUri($"/bookings/{bookingUid}/cancel", _platformApiKey), request, cancellationToken);
            response.EnsureSuccessStatusCode();

            LogBookingCancelled(bookingUid);
        }
        catch (Exception ex)
        {
            LogCancelBookingError(ex);
            throw;
        }
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to get available slots from Cal.com")]
    private partial void LogGetSlotsError(Exception ex);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created Cal.com booking {BookingUid}")]
    private partial void LogBookingCreated(string bookingUid);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to create booking in Cal.com")]
    private partial void LogCreateBookingError(Exception ex);

    [LoggerMessage(Level = LogLevel.Information, Message = "Rescheduled Cal.com booking {BookingUid}")]
    private partial void LogBookingRescheduled(string bookingUid);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to reschedule booking in Cal.com")]
    private partial void LogRescheduleBookingError(Exception ex);

    [LoggerMessage(Level = LogLevel.Information, Message = "Cancelled Cal.com booking {BookingUid}")]
    private partial void LogBookingCancelled(string bookingUid);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to cancel booking in Cal.com")]
    private partial void LogCancelBookingError(Exception ex);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to get event types from Cal.com")]
    private partial void LogGetEventTypesError(Exception ex);

    [LoggerMessage(Level = LogLevel.Warning, Message = "No Cal.com API key configured for business {BusinessId}")]
    private partial void LogNoApiKeyForBusiness(Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to validate Cal.com API key")]
    private partial void LogValidateApiKeyError(Exception ex);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Platform Cal.com integration is not configured. Set CalCom:PlatformApiKey and CalCom:OnboardingEventTypeId in configuration.")]
    private partial void LogPlatformNotConfigured();

    // ============================================================================
    // Private DTOs for Cal.com API responses (used for JSON deserialization)
    // ============================================================================

#pragma warning disable CA1812 // Internal class is never instantiated (used for JSON deserialization)
    /// <summary>
    /// Cal.com v1 API returns slots grouped by date as a dictionary.
    /// Example: { "slots": { "2026-01-10": [{"time": "..."}], "2026-01-11": [{"time": "..."}] } }.
    /// </summary>
    private sealed record CalComSlotsResponse(
        [property: JsonPropertyName("slots")] Dictionary<string, List<CalComSlot>>? Slots);

    private sealed record CalComSlot(
        [property: JsonPropertyName("time")] DateTime Time);

    private sealed record CalComBookingResponse(
        [property: JsonPropertyName("uid")] string Uid);

    private sealed record CalComEventTypesResponse(
        [property: JsonPropertyName("event_types")] List<CalComEventTypeDto>? EventTypes);

    private sealed record CalComEventTypeDto(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("title")] string Title,
        [property: JsonPropertyName("slug")] string Slug,
        [property: JsonPropertyName("length")] int Length,
        [property: JsonPropertyName("description")] string? Description);

    private sealed record CalComMeResponse(
        [property: JsonPropertyName("username")] string? Username,
        [property: JsonPropertyName("email")] string? Email);
#pragma warning restore CA1812
}

