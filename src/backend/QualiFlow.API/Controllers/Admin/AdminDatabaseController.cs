// -----------------------------------------------------------------------
// <copyright file="AdminDatabaseController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Data.Seeds;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for database management operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/database")]
[Authorize(Policy = "SuperAdminOnly")]
public class AdminDatabaseController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminDatabaseController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminDatabaseController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    public AdminDatabaseController(
        QualiFlowDbContext context,
        ILogger<AdminDatabaseController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Cleans up all test/seeded data from the database.
    /// Keeps only essential CMS content needed for website and landing pages.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("cleanup-test-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CleanupTestData(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogWarning("SuperAdmin {Email} initiated database cleanup", User.Identity?.Name);

            await DatabaseCleanupScript.CleanupTestDataAsync(_context, _logger, cancellationToken);

            return Ok(new
            {
                success = true,
                message = "Database cleanup completed successfully. All test data removed.",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup test data");
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to cleanup test data",
                error = ex.Message
            });
        }
    }
}
