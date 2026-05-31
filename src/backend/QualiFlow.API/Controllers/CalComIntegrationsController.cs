// <copyright file="CalComIntegrationsController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for Cal.com integrations.
/// Each business can connect their own Cal.com account for booking and scheduling.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/integrations/calcom")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class CalComIntegrationsController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICalComService _calComService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="CalComIntegrationsController"/> class.
    /// </summary>
    public CalComIntegrationsController(
        QualiFlowDbContext dbContext,
        ICalComService calComService,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _calComService = calComService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets the current Cal.com integration for the business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Integration details or null.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(CalComIntegrationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CalComIntegrationDto>> GetIntegrationAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var integration = await _dbContext.CalComIntegrations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        if (integration == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(integration));
    }

    /// <summary>
    /// Connects Cal.com with an API key.
    /// </summary>
    /// <param name="request">The connection request containing the API key.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Connection result.</returns>
    [HttpPost("connect")]
    [ProducesResponseType(typeof(CalComConnectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CalComConnectionResponse>> ConnectAsync(
        [FromBody] CalComConnectRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        // Validate the API key with Cal.com
        var validationResult = await _calComService.ValidateApiKeyAsync(request.ApiKey, cancellationToken);

        if (!validationResult.IsValid)
        {
            return BadRequest(new CalComConnectionResponse
            {
                Success = false,
                ErrorMessage = "Invalid Cal.com API key. Please check your key and try again.",
            });
        }

        // Check if integration already exists
        var existing = await _dbContext.CalComIntegrations
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        if (existing != null)
        {
            // Update existing integration
            existing.ApiKey = request.ApiKey;
            existing.Username = validationResult.UserName;
            existing.Email = validationResult.Email;
            existing.Status = CalComIntegrationStatus.Active;
            existing.LastSyncAt = DateTime.UtcNow;
            existing.LastErrorMessage = null;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new integration
            existing = new CalComIntegration
            {
                BusinessId = businessId,
                ConnectedByUserId = userId ?? Guid.Empty,
                ApiKey = request.ApiKey,
                Username = validationResult.UserName,
                Email = validationResult.Email,
                Status = CalComIntegrationStatus.Active,
                LastSyncAt = DateTime.UtcNow,
            };
            _dbContext.CalComIntegrations.Add(existing);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Get event types
        var eventTypes = await _calComService.GetEventTypesAsync(businessId, cancellationToken);

        return Ok(new CalComConnectionResponse
        {
            Success = true,
            Integration = MapToDto(existing),
            EventTypes = eventTypes.Select(e => new CalComEventTypeDto
            {
                Id = e.Id,
                Title = e.Title,
                Slug = e.Slug,
                Description = e.Description,
                Length = e.DurationMinutes,
                IsDefault = false,
            }).ToList(),
        });
    }

    /// <summary>
    /// Disconnects Cal.com integration.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DisconnectAsync(CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var integration = await _dbContext.CalComIntegrations
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        if (integration == null)
        {
            return NotFound();
        }

        // Soft delete
        integration.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Gets event types from Cal.com.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of event types.</returns>
    [HttpGet("event-types")]
    [ProducesResponseType(typeof(List<CalComEventTypeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CalComEventTypeDto>>> GetEventTypesAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var eventTypes = await _calComService.GetEventTypesAsync(businessId, cancellationToken);

        var integration = await _dbContext.CalComIntegrations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        return Ok(eventTypes.Select(e => new CalComEventTypeDto
        {
            Id = e.Id,
            Title = e.Title,
            Slug = e.Slug,
            Description = e.Description,
            Length = e.DurationMinutes,
            IsDefault = integration?.DefaultEventTypeId == e.Id,
        }).ToList());
    }

    /// <summary>
    /// Updates Cal.com settings.
    /// </summary>
    /// <param name="request">Settings update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated integration.</returns>
    [HttpPatch("settings")]
    [ProducesResponseType(typeof(CalComIntegrationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CalComIntegrationDto>> UpdateSettingsAsync(
        [FromBody] CalComSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var integration = await _dbContext.CalComIntegrations
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        if (integration == null)
        {
            return NotFound();
        }

        if (request.DefaultEventTypeId != null)
        {
            integration.DefaultEventTypeId = request.DefaultEventTypeId;
        }

        integration.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(integration));
    }

    /// <summary>
    /// Tests the Cal.com connection.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Test result.</returns>
    [HttpPost("test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var integration = await _dbContext.CalComIntegrations
            .FirstOrDefaultAsync(x => x.BusinessId == businessId && x.DeletedAt == null, cancellationToken);

        if (integration == null)
        {
            return NotFound(new { success = false, message = "Cal.com is not connected" });
        }

        var testResult = await _calComService.ValidateApiKeyAsync(integration.ApiKey, cancellationToken);

        if (!testResult.IsValid)
        {
            integration.Status = CalComIntegrationStatus.Error;
            integration.LastErrorMessage = "API key validation failed";
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Ok(new { success = false, message = "API key is no longer valid" });
        }

        integration.Status = CalComIntegrationStatus.Active;
        integration.LastSyncAt = DateTime.UtcNow;
        integration.LastErrorMessage = null;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true, message = "Connection is working" });
    }

    private static CalComIntegrationDto MapToDto(CalComIntegration integration) => new()
    {
        Id = integration.Id.ToString(),
        IsConnected = integration.Status == CalComIntegrationStatus.Active,
        ApiKeyConfigured = !string.IsNullOrEmpty(integration.ApiKey),
        Username = integration.Username,
        Email = integration.Email,
        DefaultEventTypeId = integration.DefaultEventTypeId,
        LastSyncAt = integration.LastSyncAt?.ToString("O"),
        Status = integration.Status.ToString().ToLowerInvariant(),
    };
}

#pragma warning disable SA1402 // File may only contain a single type

/// <summary>
/// DTO for Cal.com integration.
/// </summary>
public class CalComIntegrationDto
{
    /// <summary>Gets or sets the integration ID.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Gets or sets a value indicating whether the integration is connected.</summary>
    public bool IsConnected { get; set; }

    /// <summary>Gets or sets a value indicating whether an API key is configured.</summary>
    public bool ApiKeyConfigured { get; set; }

    /// <summary>Gets or sets the Cal.com username.</summary>
    public string? Username { get; set; }

    /// <summary>Gets or sets the Cal.com email.</summary>
    public string? Email { get; set; }

    /// <summary>Gets or sets the default event type ID.</summary>
    public string? DefaultEventTypeId { get; set; }

    /// <summary>Gets or sets the last sync timestamp.</summary>
    public string? LastSyncAt { get; set; }

    /// <summary>Gets or sets the status.</summary>
    public string Status { get; set; } = "active";
}

/// <summary>
/// Request to connect Cal.com.
/// </summary>
public class CalComConnectRequest
{
    /// <summary>Gets or sets the Cal.com API key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Response from Cal.com connection.
/// </summary>
public class CalComConnectionResponse
{
    /// <summary>Gets or sets a value indicating whether the connection was successful.</summary>
    public bool Success { get; set; }

    /// <summary>Gets or sets the integration.</summary>
    public CalComIntegrationDto? Integration { get; set; }

    /// <summary>Gets or sets the event types.</summary>
    public IReadOnlyList<CalComEventTypeDto>? EventTypes { get; set; }

    /// <summary>Gets or sets the error message.</summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// DTO for Cal.com event type.
/// </summary>
public class CalComEventTypeDto
{
    /// <summary>Gets or sets the event type ID.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Gets or sets the title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the slug.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Gets or sets the description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the duration in minutes.</summary>
    public int Length { get; set; }

    /// <summary>Gets or sets a value indicating whether this is the default event type.</summary>
    public bool IsDefault { get; set; }
}

/// <summary>
/// Request to update Cal.com settings.
/// </summary>
public class CalComSettingsRequest
{
    /// <summary>Gets or sets the default event type ID.</summary>
    public string? DefaultEventTypeId { get; set; }
}

#pragma warning restore SA1402
