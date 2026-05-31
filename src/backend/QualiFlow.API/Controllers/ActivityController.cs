using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AuditLogs.DTOs;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Activity controller for retrieving recent user activity and audit logs.
/// Provides endpoints for activity feeds and dashboard widgets.
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ActivityController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ActivityController"/> class.
    /// </summary>
    /// <param name="auditLogRepository">The audit log repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="logger">The logger.</param>
    public ActivityController(
        IAuditLogRepository auditLogRepository,
        ICurrentUserService currentUserService,
        ILogger<ActivityController> logger)
    {
        _auditLogRepository = auditLogRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the most recent activity items for the current business.
    /// Used for activity feed widgets and dashboards.
    /// </summary>
    /// <param name="limit">The maximum number of activity items to return (default: 10, max: 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A collection of recent activity items.</returns>
    [HttpGet("recent")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetRecentActivityAsync(
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Log authentication status
            _logger.LogInformation(
                "GetRecentActivityAsync - User authenticated: {IsAuthenticated}",
                User?.Identity?.IsAuthenticated);
            var claimsStr = string.Join(
                "; ",
                User?.Claims?.Select(c => $"{c.Type}={c.Value}") ?? new List<string>());
            _logger.LogInformation("GetRecentActivityAsync - User claims: {Claims}", claimsStr);

            // Validate limit
            if (limit < 1 || limit > 100)
            {
                limit = 10;
            }

            var businessId = _currentUserService.GetBusinessId();

            _logger.LogInformation(
                "Getting recent activity for business {BusinessId}, limit: {Limit}",
                businessId,
                limit);

            // Query audit logs as activity feed
            var result = await _auditLogRepository.GetPagedAsync(
                businessId,
                userId: null,
                entityType: null,
                entityId: null,
                action: null,
                startDate: null,
                endDate: null,
                page: 1,
                pageSize: limit,
                cancellationToken: cancellationToken);

            // Transform audit logs to DTOs
            var auditDtos = result.Items.Select(MapToDto).ToList();

            return Ok(auditDtos);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError(ex, "Unauthorized access in GetRecentActivityAsync: {Message}", ex.Message);
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Unable to retrieve business ID from authentication context",
                Status = StatusCodes.Status401Unauthorized
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetRecentActivityAsync: {Message}", ex.Message);
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = $"An error occurred while retrieving activity: {ex.Message}",
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Gets activity items filtered by entity type.
    /// </summary>
    /// <param name="entityType">The type of entity to filter by (e.g., "Lead", "Deal", "Contact").</param>
    /// <param name="limit">The maximum number of activity items to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A collection of activity items for the specified entity type.</returns>
    [HttpGet("by-entity/{entityType}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetActivityByEntityTypeAsync(
        string entityType,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        if (limit < 1 || limit > 100)
        {
            limit = 10;
        }

        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation(
            "Getting activity for entity type {EntityType}, business {BusinessId}, limit: {Limit}",
            entityType,
            businessId,
            limit);

        // Query audit logs filtered by entity type
        var result = await _auditLogRepository.GetPagedAsync(
            businessId,
            userId: null,
            entityType: entityType,
            entityId: null,
            action: null,
            startDate: null,
            endDate: null,
            page: 1,
            pageSize: limit,
            cancellationToken: cancellationToken);

        var auditDtos = result.Items.Select(MapToDto).ToList();

        return Ok(auditDtos);
    }

    /// <summary>
    /// Gets activity items for a specific user.
    /// </summary>
    /// <param name="userId">The ID of the user to filter by.</param>
    /// <param name="limit">The maximum number of activity items to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A collection of activity items for the specified user.</returns>
    [HttpGet("by-user/{userId:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetActivityByUserAsync(
        Guid userId,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        if (limit < 1 || limit > 100)
        {
            limit = 10;
        }

        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation(
            "Getting activity for user {UserId}, business {BusinessId}, limit: {Limit}",
            userId,
            businessId,
            limit);

        // Query audit logs filtered by user
        var result = await _auditLogRepository.GetPagedAsync(
            businessId,
            userId: userId,
            entityType: null,
            entityId: null,
            action: null,
            startDate: null,
            endDate: null,
            page: 1,
            pageSize: limit,
            cancellationToken: cancellationToken);

        var auditDtos = result.Items.Select(MapToDto).ToList();

        return Ok(auditDtos);
    }

    /// <summary>
    /// Maps an AuditLog domain entity to an AuditLogDto.
    /// </summary>
    /// <param name="log">The audit log domain entity.</param>
    /// <returns>The mapped AuditLogDto.</returns>
    private static AuditLogDto MapToDto(Domain.Entities.AuditLog log) => new()
    {
        Id = log.Id,
        UserId = log.UserId,
        Username = log.Username,
        EntityType = log.EntityType,
        EntityId = log.EntityId,
        Action = log.Action.ToString(),
        OldValues = log.OldValues,
        NewValues = log.NewValues,
        IpAddress = log.IpAddress,
        UserAgent = log.UserAgent,
        CreatedAt = log.CreatedAt
    };
}
