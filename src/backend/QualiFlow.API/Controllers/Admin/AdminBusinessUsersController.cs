using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.UserManagement;
using QualiFlow.Application.Features.Admin.UserManagement.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Controller for managing business users (platform users) by administrators.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/business-users")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
public class AdminBusinessUsersController : ControllerBase
{
    private readonly IAdminUserManagementService _userManagementService;
    private readonly IUserImpersonationService _impersonationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AdminBusinessUsersController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminBusinessUsersController"/> class.
    /// </summary>
    /// <param name="userManagementService">User management service.</param>
    /// <param name="impersonationService">User impersonation service.</param>
    /// <param name="currentUserService">Current user service.</param>
    /// <param name="logger">Logger.</param>
    public AdminBusinessUsersController(
        IAdminUserManagementService userManagementService,
        IUserImpersonationService impersonationService,
        ICurrentUserService currentUserService,
        ILogger<AdminBusinessUsersController> logger)
    {
        _userManagementService = userManagementService;
        _impersonationService = impersonationService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of all business users across all businesses.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of users.</returns>
    [HttpGet]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(typeof(PagedResult<AdminUserListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AdminUserListDto>>> GetAllUsersAsync(
        [FromQuery] AdminUserQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _userManagementService.GetAllUsersAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets detailed information about a specific business user.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed user information.</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(typeof(AdminUserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminUserDetailDto>> GetUserByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await _userManagementService.GetUserByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = $"User with ID {id} was not found.",
            });
        }

        return Ok(user);
    }

    /// <summary>
    /// Updates a business user's information.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="request">Update request with new values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated user information.</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(typeof(AdminUserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminUserDetailDto>> UpdateUserAsync(
        Guid id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManagementService.UpdateUserAsync(id, request, cancellationToken);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Soft deletes a business user account.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUserAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _userManagementService.DeleteUserAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Sends a password reset email to a business user.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/reset-password")]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SendPasswordResetEmailAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _userManagementService.SendPasswordResetEmailAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Suspends a business user account.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="request">Suspension request with reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/suspend")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SuspendUserAsync(
        Guid id,
        [FromBody] SuspendUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _userManagementService.SuspendUserAsync(id, request.Reason, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Reactivates a suspended business user account.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/reactivate")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReactivateUserAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _userManagementService.ReactivateUserAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Starts an impersonation session for the specified user (Support Admin only).
    /// </summary>
    /// <param name="id">The user ID to impersonate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The impersonation token with 1-hour expiry.</returns>
    [HttpPost("{id}/impersonate")]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(typeof(ImpersonationTokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ImpersonationTokenDto>> StartImpersonationAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var adminUserId = _currentUserService.GetUserId()
                ?? throw new UnauthorizedAccessException("Admin user ID not found in claims");

            var result = await _impersonationService.StartImpersonationAsync(
                adminUserId,
                id,
                cancellationToken);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "User not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Stops the current impersonation session.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("stop-impersonation")]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> StopImpersonationAsync(CancellationToken cancellationToken)
    {
        var adminUserId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("Admin user ID not found in claims");

        await _impersonationService.StopImpersonationAsync(adminUserId, cancellationToken);
        return NoContent();
    }
}

/// <summary>
/// Request to suspend a user.
/// </summary>
public class SuspendUserRequest
{
    /// <summary>
    /// Gets or sets the reason for suspension.
    /// </summary>
    public required string Reason { get; set; }
}

