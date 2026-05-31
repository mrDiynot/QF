// -----------------------------------------------------------------------
// <copyright file="AuditLogsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.AuditLogs.DTOs;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for business audit log operations.
/// Provides audit trail visibility for business owners and admins.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/audit-logs")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuditLogsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuditLogsController"/> class.
    /// </summary>
    public AuditLogsController(
        IAuditLogRepository auditLogRepository,
        ICurrentUserService currentUserService,
        ILogger<AuditLogsController> logger)
    {
        _auditLogRepository = auditLogRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets paginated audit logs for the current business.
    /// </summary>
    /// <param name="userId">Optional filter by user ID.</param>
    /// <param name="entityType">Optional filter by entity type (e.g., Lead, Conversation).</param>
    /// <param name="entityId">Optional filter by entity ID.</param>
    /// <param name="action">Optional filter by action type.</param>
    /// <param name="startDate">Optional filter by start date.</param>
    /// <param name="endDate">Optional filter by end date.</param>
    /// <param name="page">Page number (default: 1).</param>
    /// <param name="pageSize">Page size (default: 20, max: 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of audit logs.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.MediumTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(typeof(PagedResult<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> GetAuditLogsAsync(
        [FromQuery] Guid? userId,
        [FromQuery] string? entityType,
        [FromQuery] Guid? entityId,
        [FromQuery] AuditAction? action,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Enforce max page size
        pageSize = Math.Min(pageSize, 100);

        var result = await _auditLogRepository.GetPagedAsync(
            businessId,
            userId,
            entityType,
            entityId,
            action,
            startDate,
            endDate,
            page,
            pageSize,
            cancellationToken);

        return Ok(new PagedResult<AuditLogDto>
        {
            Items = result.Items.Select(MapToDto).ToList(),
            TotalItems = result.TotalItems,
            Page = result.Page,
            PageSize = result.PageSize
        });
    }

    /// <summary>
    /// Gets the audit history for a specific entity.
    /// </summary>
    /// <param name="entityType">The entity type (e.g., Lead, Conversation).</param>
    /// <param name="entityId">The entity ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of audit logs for the entity.</returns>
    [HttpGet("entity/{entityType}/{entityId:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IReadOnlyList<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<AuditLogDto>>> GetEntityHistoryAsync(
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var logs = await _auditLogRepository.GetEntityHistoryAsync(
            businessId,
            entityType,
            entityId,
            cancellationToken);

        return Ok(logs.Select(MapToDto).ToList());
    }

    /// <summary>
    /// Exports audit logs to CSV format.
    /// </summary>
    /// <param name="userId">Optional filter by user ID.</param>
    /// <param name="entityType">Optional filter by entity type.</param>
    /// <param name="action">Optional filter by action type.</param>
    /// <param name="startDate">Optional filter by start date.</param>
    /// <param name="endDate">Optional filter by end date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file with audit logs.</returns>
    [HttpGet("export")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportAuditLogsAsync(
        [FromQuery] Guid? userId,
        [FromQuery] string? entityType,
        [FromQuery] AuditAction? action,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Get all logs matching the filters (up to 10,000 for export)
        var result = await _auditLogRepository.GetPagedAsync(
            businessId,
            userId,
            entityType,
            entityId: null,
            action,
            startDate,
            endDate,
            page: 1,
            pageSize: 10000,
            cancellationToken);

        // Build CSV
        var csv = new StringBuilder();
        csv.AppendLine("Timestamp,User,Action,Entity Type,Entity ID,IP Address,User Agent");

        foreach (var log in result.Items)
        {
            csv.Append(CultureInfo.InvariantCulture, $"\"{log.CreatedAt:yyyy-MM-dd HH:mm:ss}\",\"{log.Username}\",\"{log.Action}\",\"{log.EntityType}\",\"{log.EntityId}\",\"{log.IpAddress}\",\"{log.UserAgent}\"");
            csv.AppendLine();
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        var fileName = $"audit-logs-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";

        return File(bytes, "text/csv", fileName);
    }

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

