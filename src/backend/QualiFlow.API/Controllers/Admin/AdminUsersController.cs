using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.Users;
using QualiFlow.Application.Features.Admin.Users.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Controller for managing admin users.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/users")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)] // Only Platform Admins can manage admin users
[Produces("application/json")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;
    private readonly ILogger<AdminUsersController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminUsersController"/> class.
    /// </summary>
    /// <param name="adminUserService">The admin user service.</param>
    /// <param name="logger">The logger.</param>
    public AdminUsersController(
        IAdminUserService adminUserService,
        ILogger<AdminUsersController> logger)
    {
        _adminUserService = adminUserService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new admin user.
    /// </summary>
    /// <param name="request">The create admin user request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created admin user.</returns>
    /// <response code="201">Admin user created successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    /// <response code="409">User is already an admin.</response>
    [HttpPost]
    [ProducesResponseType(typeof(CreateAdminUserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CreateAdminUserResponse>> CreateAdminUser(
        [FromBody] CreateAdminUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _adminUserService.CreateAdminUserAsync(request, cancellationToken);

            _logger.LogInformation(
                "Admin user {AdminUserId} created with email {Email} and role {Role}",
                response.Admin.Id,
                request.Email,
                request.Role);

            return CreatedAtAction(
                nameof(GetAdminUser),
                new { id = response.Admin.Id },
                response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
        {
            return Conflict(new ProblemDetails
            {
                Title = "Conflict",
                Detail = ex.Message,
                Status = StatusCodes.Status409Conflict
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Gets an admin user by ID.
    /// </summary>
    /// <param name="id">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The admin user.</returns>
    /// <response code="200">Admin user retrieved successfully.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires admin role.</response>
    /// <response code="404">Admin user not found.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminUserDto>> GetAdminUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        var adminUser = await _adminUserService.GetAdminUserAsync(id, cancellationToken);

        if (adminUser == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Admin user {id} not found",
                Status = StatusCodes.Status404NotFound
            });
        }

        return Ok(adminUser);
    }

    /// <summary>
    /// Gets a paginated list of admin users.
    /// </summary>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of admin users.</returns>
    /// <response code="200">Admin users retrieved successfully.</response>
    /// <response code="400">Invalid query parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires admin role.</response>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AdminUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetAdminUsers(
        [FromQuery] AdminUserQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _adminUserService.GetAdminUsersAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Updates an admin user's role.
    /// </summary>
    /// <param name="id">The admin user ID.</param>
    /// <param name="request">The update role request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated admin user.</returns>
    /// <response code="200">Admin user role updated successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    /// <response code="404">Admin user not found.</response>
    [HttpPatch("{id:guid}/role")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminUserDto>> UpdateAdminRole(
        Guid id,
        [FromBody] UpdateAdminRoleRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var adminUser = await _adminUserService.UpdateAdminRoleAsync(id, request.Role, cancellationToken);

            _logger.LogInformation(
                "Admin user {AdminUserId} role updated to {Role}",
                id,
                request.Role);

            return Ok(adminUser);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }

    /// <summary>
    /// Updates an admin user's IP whitelist.
    /// </summary>
    /// <param name="id">The admin user ID.</param>
    /// <param name="request">The update IP whitelist request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated admin user.</returns>
    /// <response code="200">IP whitelist updated successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    /// <response code="404">Admin user not found.</response>
    [HttpPatch("{id:guid}/ip-whitelist")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminUserDto>> UpdateIpWhitelist(
        Guid id,
        [FromBody] UpdateIpWhitelistRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var adminUser = await _adminUserService.UpdateIpWhitelistAsync(id, request.IpWhitelist, cancellationToken);

            _logger.LogInformation(
                "Admin user {AdminUserId} IP whitelist updated",
                id);

            return Ok(adminUser);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }

    /// <summary>
    /// Deactivates an admin user.
    /// </summary>
    /// <param name="id">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Admin user deactivated successfully.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    /// <response code="404">Admin user not found.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateAdminUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _adminUserService.DeactivateAdminUserAsync(id, cancellationToken);

            _logger.LogInformation(
                "Admin user {AdminUserId} deactivated",
                id);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }

    /// <summary>
    /// Reactivates an admin user.
    /// </summary>
    /// <param name="id">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The reactivated admin user.</returns>
    /// <response code="200">Admin user reactivated successfully.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - requires Platform Admin role.</response>
    /// <response code="404">Admin user not found.</response>
    [HttpPost("{id:guid}/reactivate")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminUserDto>> ReactivateAdminUser(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var adminUser = await _adminUserService.ReactivateAdminUserAsync(id, cancellationToken);

            _logger.LogInformation(
                "Admin user {AdminUserId} reactivated",
                id);

            return Ok(adminUser);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }

    /// <summary>
    /// Resets an admin user's password and returns a temporary password.
    /// </summary>
    /// <param name="id">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The temporary password.</returns>
    [HttpPost("{id:guid}/reset-password")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetAdminPassword(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var temporaryPassword = await _adminUserService.ResetPasswordAsync(id, cancellationToken);

            _logger.LogInformation(
                "Admin user {AdminUserId} password reset",
                id);

            return Ok(new { temporaryPassword });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }
}

