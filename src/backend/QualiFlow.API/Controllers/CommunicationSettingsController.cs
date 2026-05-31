using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.CommunicationSettings.DTOs;
using QualiFlow.Application.Features.CommunicationSettings.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for communication settings management.
/// Provides endpoints for managing email, SMS, and voice communication preferences.
/// All operations are scoped to the authenticated user's business (tenant).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public partial class CommunicationSettingsController : ControllerBase
{
    private readonly ICommunicationSettingsService _settingsService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CommunicationSettingsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CommunicationSettingsController"/> class.
    /// </summary>
    public CommunicationSettingsController(
        ICommunicationSettingsService settingsService,
        ICurrentUserService currentUserService,
        ILogger<CommunicationSettingsController> logger)
    {
        _settingsService = settingsService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets communication settings for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The communication settings.</returns>
    /// <response code="200">Returns the communication settings.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet]
    [ProducesResponseType(typeof(CommunicationSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CommunicationSettingsDto>> GetSettingsAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogGettingSettings(_logger, businessId);

        var settings = await _settingsService.GetAsync(businessId, cancellationToken);
        return Ok(settings);
    }

    /// <summary>
    /// Updates communication settings for the current business.
    /// </summary>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated communication settings.</returns>
    /// <response code="200">Settings updated successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPut]
    [ProducesResponseType(typeof(CommunicationSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CommunicationSettingsDto>> UpdateSettingsAsync(
        [FromBody] UpdateCommunicationSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogUpdatingSettings(_logger, businessId);

        var settings = await _settingsService.UpdateAsync(businessId, request, cancellationToken);
        return Ok(settings);
    }

    // ============================================================================
    // Logger Message Delegates
    // ============================================================================

    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Getting communication settings for business {BusinessId}")]
    private static partial void LogGettingSettings(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Updating communication settings for business {BusinessId}")]
    private static partial void LogUpdatingSettings(ILogger logger, Guid businessId);
}

