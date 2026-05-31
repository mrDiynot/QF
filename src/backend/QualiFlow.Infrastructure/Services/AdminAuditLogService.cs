// -----------------------------------------------------------------------
// <copyright file="AdminAuditLogService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;

using Microsoft.EntityFrameworkCore;

using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.AuditLogs;
using QualiFlow.Application.Features.Admin.AuditLogs.DTOs;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for admin audit log operations.
/// Admin users are now independent with their own email property.
/// </summary>
public class AdminAuditLogService : IAdminAuditLogService
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminAuditLogService"/> class.
    /// </summary>
    public AdminAuditLogService(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<AdminAuditLogDto>> GetAuditLogsAsync(
        AdminAuditLogQuery query,
        CancellationToken cancellationToken)
    {
        var queryable = _context.AdminAuditLogs
            .Include(a => a.AdminUser)
            .AsNoTracking();

        // Apply filters
        if (query.AdminUserId.HasValue)
        {
            queryable = queryable.Where(a => a.AdminUserId == query.AdminUserId.Value);
        }

        if (!string.IsNullOrEmpty(query.Action))
        {
            queryable = queryable.Where(a => a.Action.Contains(query.Action));
        }

        if (!string.IsNullOrEmpty(query.EntityType))
        {
            queryable = queryable.Where(a => a.EntityType == query.EntityType);
        }

        if (!string.IsNullOrEmpty(query.EntityId))
        {
            queryable = queryable.Where(a => a.EntityId == query.EntityId);
        }

        if (query.StartDate.HasValue)
        {
            queryable = queryable.Where(a => a.CreatedAt >= query.StartDate.Value);
        }

        if (query.EndDate.HasValue)
        {
            queryable = queryable.Where(a => a.CreatedAt <= query.EndDate.Value);
        }

        if (query.SuccessOnly.HasValue)
        {
            queryable = queryable.Where(a => a.Success == query.SuccessOnly.Value);
        }

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(a => new AdminAuditLogDto
            {
                Id = a.Id,
                AdminUserId = a.AdminUserId,
                AdminUserEmail = a.AdminUser.Email,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                UserAgent = a.UserAgent,
                HttpMethod = a.HttpMethod,
                RequestPath = a.RequestPath,
                StatusCode = a.StatusCode,
                Success = a.Success,
                ErrorMessage = a.ErrorMessage,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminAuditLogDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    /// <inheritdoc/>
    public async Task<AdminAuditLogDto?> GetAuditLogByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.AdminAuditLogs
            .Include(a => a.AdminUser)
            .Where(a => a.Id == id)
            .Select(a => new AdminAuditLogDto
            {
                Id = a.Id,
                AdminUserId = a.AdminUserId,
                AdminUserEmail = a.AdminUser.Email,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                UserAgent = a.UserAgent,
                HttpMethod = a.HttpMethod,
                RequestPath = a.RequestPath,
                StatusCode = a.StatusCode,
                Success = a.Success,
                ErrorMessage = a.ErrorMessage,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminAuditLogDto>> GetEntityAuditLogsAsync(
        string entityType,
        string entityId,
        CancellationToken cancellationToken)
    {
        return await _context.AdminAuditLogs
            .Include(a => a.AdminUser)
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AdminAuditLogDto
            {
                Id = a.Id,
                AdminUserId = a.AdminUserId,
                AdminUserEmail = a.AdminUser.Email,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                UserAgent = a.UserAgent,
                HttpMethod = a.HttpMethod,
                RequestPath = a.RequestPath,
                StatusCode = a.StatusCode,
                Success = a.Success,
                ErrorMessage = a.ErrorMessage,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<byte[]> ExportAuditLogsAsync(
        AdminAuditLogQuery query,
        CancellationToken cancellationToken)
    {
        // Use a large page size for export (max 10,000 rows)
        query.PageSize = 10000;
        query.Page = 1;

        var result = await GetAuditLogsAsync(query, cancellationToken);

        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, System.Text.Encoding.UTF8);

        // Write CSV header
        await writer.WriteLineAsync("Id,AdminUserEmail,Action,EntityType,EntityId,IpAddress,HttpMethod,RequestPath,StatusCode,Success,ErrorMessage,CreatedAt");

        // Write data rows
        foreach (var log in result.Items)
        {
            var line = string.Join(
                ",",
                EscapeCsv(log.Id.ToString("D")),
                EscapeCsv(log.AdminUserEmail),
                EscapeCsv(log.Action),
                EscapeCsv(log.EntityType ?? string.Empty),
                EscapeCsv(log.EntityId ?? string.Empty),
                EscapeCsv(log.IpAddress),
                EscapeCsv(log.HttpMethod),
                EscapeCsv(log.RequestPath),
                log.StatusCode.ToString(CultureInfo.InvariantCulture),
                log.Success.ToString(CultureInfo.InvariantCulture),
                EscapeCsv(log.ErrorMessage ?? string.Empty),
                log.CreatedAt.ToString("O", CultureInfo.InvariantCulture));

            await writer.WriteLineAsync(line);
        }

        await writer.FlushAsync(cancellationToken);
        return memoryStream.ToArray();
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',', StringComparison.Ordinal)
            || value.Contains('"', StringComparison.Ordinal)
            || value.Contains('\n', StringComparison.Ordinal))
        {
            return "\"" + value.Replace("\"", "\"\"", StringComparison.Ordinal) + "\"";
        }

        return value;
    }
}
