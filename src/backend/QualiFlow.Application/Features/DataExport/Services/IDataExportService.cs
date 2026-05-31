// <copyright file="IDataExportService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.DataExport.DTOs;

namespace QualiFlow.Application.Features.DataExport.Services;

/// <summary>
/// Service interface for data export and import operations.
/// </summary>
public interface IDataExportService
{
    /// <summary>
    /// Exports data to CSV, Excel, or JSON format.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Export result with file content.</returns>
    Task<ExportResult> ExportDataAsync(
        Guid businessId,
        ExportRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Imports data from CSV or Excel file.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The import request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Import result with success/failure counts.</returns>
    Task<ImportResult> ImportDataAsync(
        Guid businessId,
        ImportRequest request,
        CancellationToken cancellationToken = default);
}

