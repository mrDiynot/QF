using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.AuditLogs.DTOs;

namespace QualiFlow.Application.Features.Admin.AuditLogs;

/// <summary>
/// Service interface for admin audit log operations.
/// </summary>
public interface IAdminAuditLogService
{
    /// <summary>
    /// Gets a paginated list of admin audit logs.
    /// </summary>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of audit logs.</returns>
    Task<PagedResult<AdminAuditLogDto>> GetAuditLogsAsync(
        AdminAuditLogQuery query,
        CancellationToken cancellationToken);

    /// <summary>
    /// Gets an audit log by ID.
    /// </summary>
    /// <param name="id">The audit log ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The audit log.</returns>
    Task<AdminAuditLogDto?> GetAuditLogByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets audit logs for a specific entity.
    /// </summary>
    /// <param name="entityType">The entity type.</param>
    /// <param name="entityId">The entity ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of audit logs for the entity.</returns>
    Task<IReadOnlyList<AdminAuditLogDto>> GetEntityAuditLogsAsync(
        string entityType,
        string entityId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Exports audit logs matching the query as CSV content.
    /// </summary>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV content as a byte array.</returns>
    Task<byte[]> ExportAuditLogsAsync(
        AdminAuditLogQuery query,
        CancellationToken cancellationToken);
}

