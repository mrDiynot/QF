// <copyright file="DataExportController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.DataExport.DTOs;
using QualiFlow.Application.Features.DataExport.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for data export and import operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class DataExportController(
    IDataExportService dataExportService,
    ICurrentUserService currentUserService) : ControllerBase
{
    /// <summary>
    /// Exports data to CSV, Excel, or JSON format.
    /// </summary>
    /// <param name="request">The export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>File download with exported data.</returns>
    /// <response code="200">Export completed successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("export")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ExportData(
        [FromBody] ExportRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = currentUserService.GetBusinessId();
        var result = await dataExportService.ExportDataAsync(businessId, request, cancellationToken);

        return File(result.FileContent.ToArray(), result.ContentType, result.FileName);
    }

    /// <summary>
    /// Imports data from CSV or Excel file.
    /// </summary>
    /// <param name="file">The import file.</param>
    /// <param name="entityType">The entity type (Lead, Contact, Deal).</param>
    /// <param name="skipDuplicates">Whether to skip duplicate records (default: true).</param>
    /// <param name="updateExisting">Whether to update existing records (default: false).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Import result with success/failure counts.</returns>
    /// <response code="200">Import completed successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("import")]
    [IgnoreAntiforgeryToken] // File upload from API clients
    [ProducesResponseType(typeof(ImportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ImportResult>> ImportData(
        IFormFile file,
        [FromForm] string entityType,
        [FromForm] bool skipDuplicates = true,
        [FromForm] bool updateExisting = false,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = "File is required.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);

        var request = new ImportRequest
        {
            EntityType = entityType,
            FileContent = memoryStream.ToArray().ToList(),
            FileName = file.FileName,
            SkipDuplicates = skipDuplicates,
            UpdateExisting = updateExisting,
        };

        var businessId = currentUserService.GetBusinessId();
        var result = await dataExportService.ImportDataAsync(businessId, request, cancellationToken);

        return Ok(result);
    }
}

