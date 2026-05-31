// -----------------------------------------------------------------------
// <copyright file="BusinessController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Business.DTOs;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Channels.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for business settings management.
/// Read operations require any business role (Viewer+).
/// Update operations require Admin or Owner role (enforced per-method).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer", Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public partial class BusinessController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<BusinessController> _logger;
    private readonly ITwilioService _twilioService;
    private readonly IChannelRepository _channelRepository;

    /// <summary>
    /// Initializes a new instance of the <see cref="BusinessController"/> class.
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="twilioService">The Twilio service.</param>
    /// <param name="channelRepository">The channel repository.</param>
    public BusinessController(
        QualiFlowDbContext dbContext,
        ICurrentUserService currentUserService,
        ILogger<BusinessController> logger,
        ITwilioService twilioService,
        IChannelRepository channelRepository)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _logger = logger;
        _twilioService = twilioService;
        _channelRepository = channelRepository;
    }

    /// <summary>
    /// Gets the current business settings.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The business settings.</returns>
    [HttpGet("settings")]
    [NoCache]
    [ProducesResponseType(typeof(BusinessSettingsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BusinessSettingsResponse>> GetBusinessSettingsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var business = await _dbContext.Set<Business>()
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = "The current business could not be found.",
            });
        }

        // Load AI configuration for the business
        var aiConfig = await _dbContext.Set<AIConfiguration>()
            .FirstOrDefaultAsync(a => a.BusinessId == businessId, cancellationToken);

        return Ok(MapToResponse(business, aiConfig));
    }

    /// <summary>
    /// Updates the current business settings.
    /// </summary>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated business settings.</returns>
    [HttpPatch("settings")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(typeof(BusinessSettingsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BusinessSettingsResponse>> UpdateBusinessSettingsAsync(
        [FromBody] UpdateBusinessSettingsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            _logger.LogInformation("Updating business settings for {BusinessId}. Request: {@Request}", businessId, request);

            var business = await _dbContext.Set<Business>()
                .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

            if (business == null)
            {
                _logger.LogWarning("Business not found: {BusinessId}", businessId);
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Business not found",
                    Detail = "The current business could not be found.",
                });
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                business.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                business.Email = request.Email;
            }

            if (request.Phone != null)
            {
                business.Phone = request.Phone;
            }

            if (request.AllowedEmailDomain != null)
            {
                // Allow empty string to clear the domain, otherwise trim and lowercase
                business.AllowedEmailDomain = string.IsNullOrWhiteSpace(request.AllowedEmailDomain)
                    ? null
                    : request.AllowedEmailDomain.Trim().ToLowerInvariant();
                _logger.LogInformation("Setting AllowedEmailDomain to: {Domain}", business.AllowedEmailDomain);
            }

            if (request.EnforceEmailDomainRestriction.HasValue)
            {
                business.EnforceEmailDomainRestriction = request.EnforceEmailDomainRestriction.Value;
                _logger.LogInformation("Setting EnforceEmailDomainRestriction to: {Value}", business.EnforceEmailDomainRestriction);
            }

            // Update new profile fields
            if (request.Website != null)
            {
                business.Website = string.IsNullOrWhiteSpace(request.Website) ? null : request.Website.Trim();
            }

            if (request.Industry != null)
            {
                business.Industry = request.Industry;
            }

            if (request.TeamSize != null)
            {
                business.CompanySize = request.TeamSize;
            }

            if (request.Timezone != null)
            {
                business.Timezone = request.Timezone;
            }

            if (request.LogoUrl != null)
            {
                business.LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl.Trim();
            }

            if (request.PrimaryColor != null)
            {
                business.PrimaryColor = request.PrimaryColor;
            }

            if (request.Description != null)
            {
                business.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            }

            // Update address fields
            if (request.Address != null)
            {
                business.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
            }

            if (request.City != null)
            {
                business.City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim();
            }

            if (request.State != null)
            {
                business.State = string.IsNullOrWhiteSpace(request.State) ? null : request.State.Trim();
            }

            if (request.Country != null)
            {
                business.Country = string.IsNullOrWhiteSpace(request.Country) ? null : request.Country.Trim();
            }

            if (request.ZipCode != null)
            {
                business.ZipCode = string.IsNullOrWhiteSpace(request.ZipCode) ? null : request.ZipCode.Trim();
            }

            // Update widget settings
            if (request.WidgetPosition != null)
            {
                business.WidgetPosition = request.WidgetPosition;
            }

            if (request.WidgetWelcomeMessage != null)
            {
                business.WidgetWelcomeMessage = string.IsNullOrWhiteSpace(request.WidgetWelcomeMessage) ? null : request.WidgetWelcomeMessage.Trim();
            }

            if (request.WidgetOfflineMessage != null)
            {
                business.WidgetOfflineMessage = string.IsNullOrWhiteSpace(request.WidgetOfflineMessage) ? null : request.WidgetOfflineMessage.Trim();
            }

            // Update AI configuration if any AI fields are provided
            if (request.AiPersona != null || request.QualificationThreshold.HasValue ||
                request.GreetingMessage != null || request.OutOfHoursMessage != null ||
                request.BusinessHoursStart != null || request.BusinessHoursEnd != null ||
                request.FollowUpPreference != null)
            {
                var aiConfig = await _dbContext.Set<AIConfiguration>()
                    .FirstOrDefaultAsync(a => a.BusinessId == businessId, cancellationToken);

                if (aiConfig == null)
                {
                    aiConfig = new AIConfiguration { BusinessId = businessId };
                    _dbContext.Set<AIConfiguration>().Add(aiConfig);
                }

                if (request.AiPersona != null)
                {
                    aiConfig.Persona = request.AiPersona;
                    aiConfig.AITone = request.AiPersona;
                }

                if (request.QualificationThreshold.HasValue)
                {
                    aiConfig.QualificationThreshold = request.QualificationThreshold.Value;
                }

                if (request.GreetingMessage != null)
                {
                    aiConfig.GreetingMessage = request.GreetingMessage;
                }

                if (request.OutOfHoursMessage != null)
                {
                    aiConfig.OutOfHoursMessage = request.OutOfHoursMessage;
                }

                if (request.BusinessHoursStart != null)
                {
                    aiConfig.BusinessHoursStart = request.BusinessHoursStart;
                }

                if (request.BusinessHoursEnd != null)
                {
                    aiConfig.BusinessHoursEnd = request.BusinessHoursEnd;
                }

                if (request.FollowUpPreference != null)
                {
                    aiConfig.FollowUpPreference = request.FollowUpPreference;
                }
            }

            business.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);

            LogBusinessSettingsUpdated(businessId);

            // Reload AI configuration for response
            var aiConfigForResponse = await _dbContext.Set<AIConfiguration>()
                .FirstOrDefaultAsync(a => a.BusinessId == businessId, cancellationToken);

            return Ok(MapToResponse(business, aiConfigForResponse));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update business settings");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Failed to update business settings",
                Detail = ex.Message,
            });
        }
    }

    // ============================================================================
    // TWILIO SETTINGS & USAGE ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Gets the Twilio sub-account settings for the current business.
    /// Each business has exactly ONE Twilio sub-account for billing isolation.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The Twilio settings.</returns>
    [HttpGet("twilio/settings")]
    [ProducesResponseType(typeof(BusinessTwilioSettingsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BusinessTwilioSettingsResponse>> GetTwilioSettingsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogGettingTwilioSettings(businessId);

        // Find the business's Twilio sub-account (from any Twilio channel)
        var channels = await _channelRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        var twilioChannel = channels
            .FirstOrDefault(c => !string.IsNullOrEmpty(c.ExternalAccountId) &&
                                 c.Type is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp);

        if (twilioChannel == null || string.IsNullOrEmpty(twilioChannel.ExternalAccountId))
        {
            return Ok(new BusinessTwilioSettingsResponse
            {
                BusinessId = businessId,
                IsConfigured = false,
                IsTestMode = _twilioService.IsTestModeEnabled,
                Message = "No Twilio channels configured. Activate SMS, Voice, or WhatsApp to provision a Twilio sub-account."
            });
        }

        // Get sub-account details
        var subAccount = await _twilioService.GetSubAccountAsync(
            twilioChannel.ExternalAccountId, cancellationToken);

        // Get all Twilio channels for this business
        var twilioChannels = channels
            .Where(c => c.Type is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp)
            .Select(c => new TwilioChannelSummary
            {
                ChannelId = c.Id,
                Type = c.Type.ToString(),
                PhoneNumber = c.PhoneNumber ?? string.Empty,
                IsActive = c.IsActive,
                VerificationStatus = c.VerificationStatus
            })
            .ToList();

        return Ok(new BusinessTwilioSettingsResponse
        {
            BusinessId = businessId,
            IsConfigured = true,
            IsTestMode = _twilioService.IsTestModeEnabled,
            SubAccountSid = twilioChannel.ExternalAccountId,
            SubAccountStatus = subAccount?.Status ?? "Unknown",
            SubAccountCreatedAt = subAccount?.CreatedAt,
            Channels = twilioChannels
        });
    }

    /// <summary>
    /// Gets the Twilio usage (SMS, Voice, WhatsApp) for the current business.
    /// This data is essential for billing transparency.
    /// </summary>
    /// <param name="startDate">Start date for usage period (defaults to start of current month).</param>
    /// <param name="endDate">End date for usage period (defaults to today).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The Twilio usage summary.</returns>
    [HttpGet("twilio/usage")]
    [ProducesResponseType(typeof(TwilioUsageSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TwilioUsageSummaryDto>> GetTwilioUsageAsync(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Default to current month
        var start = startDate ?? new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var end = endDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        LogGettingTwilioUsage(businessId, start.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), end.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));

        // Find the business's Twilio sub-account
        var channels = await _channelRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        var twilioChannel = channels
            .FirstOrDefault(c => !string.IsNullOrEmpty(c.ExternalAccountId) &&
                                 c.Type is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp);

        if (twilioChannel == null || string.IsNullOrEmpty(twilioChannel.ExternalAccountId))
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "No Twilio account configured",
                Detail = "This business does not have any Twilio channels configured."
            });
        }

        // CRITICAL: Ensure this business owns this sub-account (multi-tenant security)
        // The sub-account SID was retrieved from the business's own channels, so it's valid

        var usage = await _twilioService.GetUsageAsync(
            twilioChannel.ExternalAccountId, start, end, cancellationToken);

        return Ok(usage);
    }

    private static BusinessSettingsResponse MapToResponse(Business business, AIConfiguration? aiConfig = null)
    {
        return new BusinessSettingsResponse
        {
            Id = business.Id,
            Name = business.Name,
            Email = business.Email,
            Phone = business.Phone,
            Website = business.Website,
            Industry = business.Industry,
            TeamSize = business.CompanySize,
            Timezone = business.Timezone,
            LogoUrl = business.LogoUrl,
            PrimaryColor = business.PrimaryColor,
            Description = business.Description,
            Address = business.Address,
            City = business.City,
            State = business.State,
            Country = business.Country,
            ZipCode = business.ZipCode,
            IsActive = business.IsActive,
            CreatedAt = business.CreatedAt,
            UpdatedAt = business.UpdatedAt,
            AllowedEmailDomain = business.AllowedEmailDomain,
            EnforceEmailDomainRestriction = business.EnforceEmailDomainRestriction,
            WidgetPosition = business.WidgetPosition,
            WidgetWelcomeMessage = business.WidgetWelcomeMessage,
            WidgetOfflineMessage = business.WidgetOfflineMessage,

            // AI Configuration fields
            AiPersona = aiConfig?.Persona,
            BusinessHoursStart = aiConfig?.BusinessHoursStart,
            BusinessHoursEnd = aiConfig?.BusinessHoursEnd,
            BusinessDays = null,
            QualificationThreshold = aiConfig?.QualificationThreshold,
            GreetingMessage = aiConfig?.GreetingMessage,
            OutOfHoursMessage = aiConfig?.OutOfHoursMessage,
            FollowUpPreference = aiConfig?.FollowUpPreference,
        };
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Business {BusinessId} settings updated")]
    private partial void LogBusinessSettingsUpdated(Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Getting Twilio settings for business {BusinessId}")]
    private partial void LogGettingTwilioSettings(Guid businessId);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Getting Twilio usage for business {BusinessId} from {StartDate} to {EndDate}")]
    private partial void LogGettingTwilioUsage(Guid businessId, string startDate, string endDate);
}

