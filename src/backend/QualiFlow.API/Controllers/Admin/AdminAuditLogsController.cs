using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.AuditLogs;
using QualiFlow.Application.Features.Admin.AuditLogs.DTOs;
using QualiFlow.Application.Features.Admin.Authorization;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Controller for admin audit log operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/audit-logs")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly IAdminAuditLogService _auditLogService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminAuditLogsController"/> class.
    /// </summary>
    public AdminAuditLogsController(IAdminAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Gets a paginated list of admin audit logs.
    /// </summary>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of audit logs.</returns>
    /// <response code="200">Returns the paginated list of audit logs.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AdminAuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AdminAuditLogDto>>> GetAuditLogs(
        [FromQuery] AdminAuditLogQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _auditLogService.GetAuditLogsAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets an audit log by ID.
    /// </summary>
    /// <param name="id">The audit log ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The audit log.</returns>
    /// <response code="200">Returns the audit log.</response>
    /// <response code="404">Audit log not found.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminAuditLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminAuditLogDto>> GetAuditLogById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var auditLog = await _auditLogService.GetAuditLogByIdAsync(id, cancellationToken);

        if (auditLog == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Audit log not found",
                Detail = $"Audit log with ID {id} was not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        return Ok(auditLog);
    }

    /// <summary>
    /// Gets audit logs for a specific entity.
    /// </summary>
    /// <param name="entityType">The entity type.</param>
    /// <param name="entityId">The entity ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of audit logs for the entity.</returns>
    /// <response code="200">Returns the list of audit logs.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    [HttpGet("entity/{entityType}/{entityId}")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminAuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<AdminAuditLogDto>>> GetEntityAuditLogs(
        string entityType,
        string entityId,
        CancellationToken cancellationToken)
    {
        var auditLogs = await _auditLogService.GetEntityAuditLogsAsync(
            entityType,
            entityId,
            cancellationToken);

        return Ok(auditLogs);
    }

    /// <summary>
    /// Gets audit logs for a specific admin user.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="page">The page number.</param>
    /// <param name="pageSize">The page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of audit logs for the admin user.</returns>
    /// <response code="200">Returns the paginated list of audit logs.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    [HttpGet("admin-user/{adminUserId:guid}")]
    [ProducesResponseType(typeof(PagedResult<AdminAuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AdminAuditLogDto>>> GetAdminUserAuditLogs(
        Guid adminUserId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = new AdminAuditLogQuery
        {
            AdminUserId = adminUserId,
            Page = page,
            PageSize = pageSize
        };

        var result = await _auditLogService.GetAuditLogsAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Exports audit logs as a CSV file.
    /// </summary>
    /// <param name="query">The query parameters for filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file download.</returns>
    /// <response code="200">Returns the CSV file.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    [HttpGet("export")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportAuditLogs(
        [FromQuery] AdminAuditLogQuery query,
        CancellationToken cancellationToken)
    {
        var csvBytes = await _auditLogService.ExportAuditLogsAsync(query, cancellationToken);
        return File(csvBytes, "text/csv", $"audit-logs-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }
}

