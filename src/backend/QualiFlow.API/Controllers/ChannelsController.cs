using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Channels.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.ExternalServices.TwilioIntegration;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing communication channels.
/// Requires Admin or Owner role for all operations (channel configuration impacts communication flow).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/channels")]
[Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
public partial class ChannelsController : ControllerBase
{
    private readonly IChannelService _channelService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITwilioService _twilioService;
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<ChannelsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ChannelsController"/> class.
    /// </summary>
    /// <param name="channelService">The channel service.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="twilioService">The Twilio service for phone number provisioning.</param>
    /// <param name="configuration">The configuration instance.</param>
    /// <param name="environment">The host environment.</param>
    /// <param name="logger">The logger instance.</param>
    public ChannelsController(
        IChannelService channelService,
        ICurrentUserService currentUserService,
        ITwilioService twilioService,
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<ChannelsController> logger)
    {
        _channelService = channelService;
        _currentUserService = currentUserService;
        _twilioService = twilioService;
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Gets all channels for the current business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of channels.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ChannelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<ChannelDto>>> GetAllChannelsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingAllChannels(businessId);

        var channels = await _channelService.GetAllAsync(businessId, cancellationToken);

        return Ok(channels);
    }

    /// <summary>
    /// Gets a channel by ID.
    /// </summary>
    /// <param name="id">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The channel.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ChannelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChannelDto>> GetChannelByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogGettingChannel(id);

        var channel = await _channelService.GetByIdAsync(id, cancellationToken);

        if (channel == null)
        {
            return NotFound($"Channel with ID {id} not found");
        }

        return Ok(channel);
    }

    /// <summary>
    /// Gets channels by type.
    /// </summary>
    /// <param name="type">The channel type.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of channels.</returns>
    [HttpGet("type/{type}")]
    [ProducesResponseType(typeof(IReadOnlyList<ChannelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<ChannelDto>>> GetChannelsByTypeAsync(
        ChannelType type,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingChannelsByType(businessId, type);

        var channels = await _channelService.GetByTypeAsync(businessId, type, cancellationToken);

        return Ok(channels);
    }

    /// <summary>
    /// Gets all active channels for the current business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of active channels.</returns>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IReadOnlyList<ChannelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<ChannelDto>>> GetActiveChannelsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingActiveChannels(businessId);

        var channels = await _channelService.GetActiveAsync(businessId, cancellationToken);

        return Ok(channels);
    }

    /// <summary>
    /// Creates a new channel.
    /// Enforces max_channels limit at subscription level via [RequiresLimit] attribute.
    /// Feature access for premium channels (WhatsApp, Voice) should be enforced in service layer.
    /// </summary>
    /// <param name="request">The create channel request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created channel.</returns>
    [HttpPost]
    [RequiresLimit("max_channels")] // Enforces channel limit at subscription level
    [ProducesResponseType(typeof(ChannelDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ChannelDto>> CreateChannelAsync(
        [FromBody] CreateChannelRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogCreatingChannel(businessId, request.Type);

        var channel = await _channelService.CreateAsync(businessId, request, cancellationToken);

        // Use explicit URI overload to avoid route generation issues in some hosting/test environments
        return Created(new Uri($"/api/v1/channels/{channel.Id}", UriKind.Relative), channel);
    }

    /// <summary>
    /// Updates an existing channel.
    /// </summary>
    /// <param name="id">The channel ID.</param>
    /// <param name="request">The update channel request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated channel.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ChannelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChannelDto>> UpdateChannelAsync(
        Guid id,
        [FromBody] UpdateChannelRequest request,
        CancellationToken cancellationToken)
    {
        LogUpdatingChannel(id);

        try
        {
            var channel = await _channelService.UpdateAsync(id, request, cancellationToken);
            return Ok(channel);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Deletes a channel.
    /// </summary>
    /// <param name="id">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteChannelAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogDeletingChannel(id);

        await _channelService.DeleteAsync(id, cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Verifies a channel configuration and connectivity.
    /// </summary>
    /// <param name="id">The channel ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The verified channel.</returns>
    [HttpPost("{id}/verify")]
    [ProducesResponseType(typeof(ChannelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChannelDto>> VerifyChannelAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogVerifyingChannel(id);

        try
        {
            var channel = await _channelService.VerifyAsync(id, cancellationToken);
            return Ok(channel);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Gets pending channels from onboarding that haven't been activated yet.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of pending channel configurations.</returns>
    [HttpGet("pending")]
    [ProducesResponseType(typeof(IReadOnlyList<PendingChannelDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<PendingChannelDto>>> GetPendingChannelsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingPendingChannels(businessId);

        var pendingChannels = await _channelService.GetPendingChannelsAsync(businessId, cancellationToken);

        return Ok(pendingChannels);
    }

    /// <summary>
    /// Activates a channel from onboarding preferences, provisioning resources as needed.
    /// </summary>
    /// <param name="request">The activation request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The activation result with channel details.</returns>
    [HttpPost("activate")]
    [ProducesResponseType(typeof(ActivateChannelResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ActivateChannelResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    public async Task<ActionResult<ActivateChannelResponse>> ActivateChannelAsync(
        [FromBody] ActivateChannelRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var businessId = _currentUserService.GetBusinessId();

        LogActivatingChannel(businessId, request.ChannelType);

        var result = await _channelService.ActivateChannelAsync(businessId, request, cancellationToken);

        if (!result.Success)
        {
            // Check if it's a subscription issue
            if (result.ErrorMessage?.Contains("upgrade", StringComparison.OrdinalIgnoreCase) == true)
            {
                return StatusCode(StatusCodes.Status402PaymentRequired, result);
            }

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets Twilio configuration status including test mode indicator.
    /// </summary>
    /// <returns>Twilio status information.</returns>
    [HttpGet("twilio/status")]
    [ProducesResponseType(typeof(TwilioStatusDto), StatusCodes.Status200OK)]
    public ActionResult<TwilioStatusDto> GetTwilioStatus()
    {
        var isDevelopment = _environment.IsDevelopment();
        var skipProvisioningInDev = _configuration.GetValue<bool>("Twilio:SkipProvisioningInDevelopment");
        var developmentPhoneNumber = _configuration["Twilio:DevelopmentPhoneNumber"];
        var skipProvisioning = isDevelopment && skipProvisioningInDev && !string.IsNullOrEmpty(developmentPhoneNumber);

        return Ok(new TwilioStatusDto
        {
            IsTestMode = _twilioService.IsTestModeEnabled,
            TestPhoneNumber = _twilioService.IsTestModeEnabled ? _twilioService.TestModePhoneNumber : null,
            IsDevelopmentMode = isDevelopment,
            SkipProvisioning = skipProvisioning,
            DevelopmentPhoneNumber = skipProvisioning ? developmentPhoneNumber : null,
        });
    }

    /// <summary>
    /// Searches for available Twilio phone numbers.
    /// </summary>
    /// <param name="countryCode">The country code (e.g., "US", "CA").</param>
    /// <param name="areaCode">Optional area code filter.</param>
    /// <param name="capabilities">Required phone number capabilities (SMS, Voice, MMS).</param>
    /// <param name="limit">Maximum number of results to return (default: 10, max: 50).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of available phone numbers.</returns>
    [HttpGet("twilio/available-numbers")]
    [ProducesResponseType(typeof(IReadOnlyList<TwilioAvailableNumberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<TwilioAvailableNumberDto>>> SearchAvailableNumbersAsync(
        [FromQuery] string countryCode = "US",
        [FromQuery] string? areaCode = null,
        [FromQuery] PhoneNumberCapabilities capabilities = PhoneNumberCapabilities.SMS | PhoneNumberCapabilities.Voice,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        if (limit < 1 || limit > 50)
        {
            return BadRequest("Limit must be between 1 and 50");
        }

        LogSearchingPhoneNumbers(countryCode, areaCode ?? "any", limit);

        var numbers = await _twilioService.SearchAvailableNumbersAsync(
            countryCode,
            areaCode,
            capabilities,
            limit,
            cancellationToken);

        return Ok(numbers);
    }

    // NOTE: GetTwilioSubAccountAsync and GetProvisionedPhoneNumbersAsync endpoints
    // are temporarily commented out pending ITwilioService method implementation
    // /// <summary>
    // /// Gets the Twilio sub-account information for the current business.
    // /// </summary>
    // /// <param name="cancellationToken">The cancellation token.</param>
    // /// <returns>The Twilio sub-account information.</returns>
    // [HttpGet("twilio/sub-account")]
    // [ProducesResponseType(typeof(TwilioSubAccountDto), StatusCodes.Status200OK)]
    // [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    // [ProducesResponseType(StatusCodes.Status404NotFound)]
    // public async Task<ActionResult<TwilioSubAccountDto>> GetTwilioSubAccountAsync(
    //     CancellationToken cancellationToken)
    // {
    //     var businessId = _currentUserService.GetBusinessId();
    //
    //     LogGettingTwilioSubAccount(businessId);
    //
    //     var subAccount = await _twilioService.GetSubAccountAsync(businessId, cancellationToken);
    //
    //     if (subAccount == null)
    //     {
    //         return NotFound("Twilio sub-account not found for this business");
    //     }
    //
    //     return Ok(subAccount);
    // }
    //
    // /// <summary>
    // /// Gets provisioned phone numbers for the current business.
    // /// </summary>
    // /// <param name="cancellationToken">The cancellation token.</param>
    // /// <returns>List of provisioned phone numbers.</returns>
    // [HttpGet("twilio/phone-numbers")]
    // [ProducesResponseType(typeof(IReadOnlyList<TwilioPhoneNumberDto>), StatusCodes.Status200OK)]
    // [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    // public async Task<ActionResult<IReadOnlyList<TwilioPhoneNumberDto>>> GetProvisionedPhoneNumbersAsync(
    //     CancellationToken cancellationToken)
    // {
    //     var businessId = _currentUserService.GetBusinessId();
    //
    //     LogGettingProvisionedNumbers(businessId);
    //
    //     var subAccount = await _twilioService.GetSubAccountAsync(businessId, cancellationToken);
    //
    //     if (subAccount == null)
    //     {
    //         return Ok(Array.Empty<TwilioPhoneNumberDto>());
    //     }
    //
    //     var phoneNumbers = await _twilioService.GetPhoneNumbersAsync(subAccount.AccountSid, cancellationToken);
    //
    //     return Ok(phoneNumbers);
    // }

    // Logger message delegates

    [LoggerMessage(EventId = 10001, Level = LogLevel.Information, Message = "Getting all channels for business {BusinessId}")]
    private partial void LogGettingAllChannels(Guid businessId);

    [LoggerMessage(EventId = 10002, Level = LogLevel.Information, Message = "Getting channel {ChannelId}")]
    private partial void LogGettingChannel(Guid channelId);

    [LoggerMessage(EventId = 10003, Level = LogLevel.Information, Message = "Getting channels of type {Type} for business {BusinessId}")]
    private partial void LogGettingChannelsByType(Guid businessId, ChannelType type);

    [LoggerMessage(EventId = 10004, Level = LogLevel.Information, Message = "Getting active channels for business {BusinessId}")]
    private partial void LogGettingActiveChannels(Guid businessId);

    [LoggerMessage(EventId = 10005, Level = LogLevel.Information, Message = "Creating channel of type {Type} for business {BusinessId}")]
    private partial void LogCreatingChannel(Guid businessId, ChannelType type);

    [LoggerMessage(EventId = 10006, Level = LogLevel.Information, Message = "Updating channel {ChannelId}")]
    private partial void LogUpdatingChannel(Guid channelId);

    [LoggerMessage(EventId = 10007, Level = LogLevel.Information, Message = "Deleting channel {ChannelId}")]
    private partial void LogDeletingChannel(Guid channelId);

    [LoggerMessage(EventId = 10008, Level = LogLevel.Information, Message = "Verifying channel {ChannelId}")]
    private partial void LogVerifyingChannel(Guid channelId);

    [LoggerMessage(EventId = 10009, Level = LogLevel.Information, Message = "Getting pending channels for business {BusinessId}")]
    private partial void LogGettingPendingChannels(Guid businessId);

    [LoggerMessage(EventId = 10010, Level = LogLevel.Information, Message = "Activating channel {ChannelType} for business {BusinessId}")]
    private partial void LogActivatingChannel(Guid businessId, string channelType);

    [LoggerMessage(EventId = 10011, Level = LogLevel.Information, Message = "Searching phone numbers in {CountryCode} with area code {AreaCode}, limit {Limit}")]
    private partial void LogSearchingPhoneNumbers(string countryCode, string areaCode, int limit);

    [LoggerMessage(EventId = 10012, Level = LogLevel.Information, Message = "Getting Twilio sub-account for business {BusinessId}")]
    private partial void LogGettingTwilioSubAccount(Guid businessId);

    [LoggerMessage(EventId = 10013, Level = LogLevel.Information, Message = "Getting provisioned phone numbers for business {BusinessId}")]
    private partial void LogGettingProvisionedNumbers(Guid businessId);
}
