using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.BusinessManagement;
using QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Controller for managing businesses (tenants) by administrators.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/businesses")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
public class AdminBusinessesController : ControllerBase
{
    private readonly IAdminBusinessManagementService _businessManagementService;
    private readonly ILogger<AdminBusinessesController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminBusinessesController"/> class.
    /// </summary>
    /// <param name="businessManagementService">Business management service.</param>
    /// <param name="logger">Logger.</param>
    public AdminBusinessesController(
        IAdminBusinessManagementService businessManagementService,
        ILogger<AdminBusinessesController> logger)
    {
        _businessManagementService = businessManagementService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of all businesses.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of businesses.</returns>
    [HttpGet]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(typeof(PagedResult<AdminBusinessListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AdminBusinessListDto>>> GetAllBusinessesAsync(
        [FromQuery] AdminBusinessQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _businessManagementService.GetAllBusinessesAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets detailed information about a specific business.
    /// </summary>
    /// <param name="id">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed business information.</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(typeof(AdminBusinessDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminBusinessDetailDto>> GetBusinessByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var business = await _businessManagementService.GetBusinessByIdAsync(id, cancellationToken);
        if (business == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = $"Business with ID {id} was not found.",
            });
        }

        return Ok(business);
    }

    /// <summary>
    /// Updates a business's information.
    /// </summary>
    /// <param name="id">The business ID.</param>
    /// <param name="request">Update request with new values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated business information.</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(typeof(AdminBusinessDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminBusinessDetailDto>> UpdateBusinessAsync(
        Guid id,
        [FromBody] UpdateBusinessRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var business = await _businessManagementService.UpdateBusinessAsync(id, request, cancellationToken);
            return Ok(business);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Soft deletes a business account.
    /// </summary>
    /// <param name="id">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteBusinessAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _businessManagementService.DeleteBusinessAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Suspends a business account.
    /// </summary>
    /// <param name="id">The business ID.</param>
    /// <param name="request">Suspension request with reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/suspend")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SuspendBusinessAsync(
        Guid id,
        [FromBody] SuspendBusinessRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _businessManagementService.SuspendBusinessAsync(id, request.Reason, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Reactivates a suspended business account.
    /// </summary>
    /// <param name="id">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/reactivate")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReactivateBusinessAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _businessManagementService.ReactivateBusinessAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Gets recent activity for a specific business.
    /// </summary>
    /// <param name="id">The business ID.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of activity items.</returns>
    [HttpGet("{id}/activity")]
    [Authorize(Policy = AdminPolicies.RequireSupportAdmin)]
    [ProducesResponseType(typeof(PagedResult<BusinessActivityItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResult<BusinessActivityItemDto>>> GetBusinessActivity(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _businessManagementService.GetBusinessActivityAsync(
                id, page, pageSize, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Business not found",
                Detail = ex.Message,
            });
        }
    }
}

/// <summary>
/// Request to suspend a business.
/// </summary>
public class SuspendBusinessRequest
{
    /// <summary>
    /// Gets or sets the reason for suspension.
    /// </summary>
    public required string Reason { get; set; }
}

