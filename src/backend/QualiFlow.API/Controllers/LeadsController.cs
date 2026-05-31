using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Exceptions;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Leads.DTOs;
using QualiFlow.Application.Features.Leads.Services;
using QualiFlow.Application.Features.Scoring.DTOs;
using QualiFlow.Application.Features.Scoring.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for lead management operations.
/// Provides RESTful endpoints for creating, reading, updating, and deleting leads.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
/// <remarks>
/// This controller implements the following business rules:
/// - Multi-tenancy: All operations are automatically filtered by the current user's business ID.
/// - Lead status transitions: Only valid status transitions are allowed (enforced by LeadService).
/// - Lead scoring: Scores must be 0-100, with specific rules for Qualified (≥70) and Unqualified (&lt;70) statuses.
/// - Email uniqueness: Email addresses must be unique within a business (tenant).
/// - Soft delete: Deleted leads are marked with DeletedAt timestamp, not physically removed.
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILeadScoringService _leadScoringService;
    private readonly IUsageLimitService _usageLimitService;

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadsController"/> class.
    /// </summary>
    /// <param name="leadService">The lead service for business logic operations.</param>
    /// <param name="currentUserService">The current user service for accessing authenticated user context.</param>
    /// <param name="leadScoringService">The lead scoring service for AI qualification.</param>
    /// <param name="usageLimitService">The usage limit service for subscription enforcement.</param>
    public LeadsController(
        ILeadService leadService,
        ICurrentUserService currentUserService,
        ILeadScoringService leadScoringService,
        IUsageLimitService usageLimitService)
    {
        _leadService = leadService;
        _currentUserService = currentUserService;
        _usageLimitService = usageLimitService;
        _leadScoringService = leadScoringService;
    }

    /// <summary>
    /// Gets a paginated list of leads for the authenticated user's business.
    /// </summary>
    /// <param name="page">Page number (1-based). Default is 1.</param>
    /// <param name="pageSize">Number of items per page (1-100). Default is 10.</param>
    /// <param name="status">Optional status filter. If not provided, returns leads of all statuses.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A paginated list of leads with metadata (total count, page info, etc.).</returns>
    /// <response code="200">Returns the paginated list of leads successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., page &lt; 1, pageSize &gt; 100).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/leads?page=1&amp;pageSize=10&amp;status=Qualified
    ///
    /// This endpoint automatically filters leads by the authenticated user's business ID (multi-tenancy).
    /// Only leads belonging to the current user's business will be returned.
    ///
    /// Valid status values: New, Contacted, Qualified, Unqualified, Converted, Lost.
    /// </remarks>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(PagedLeadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedLeadResponse>> GetLeadsAsync(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] LeadStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _leadService.GetLeadsAsync(businessId, page, pageSize, status, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets a specific lead by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the lead to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The lead details if found.</returns>
    /// <response code="200">Returns the lead successfully.</response>
    /// <response code="404">Lead not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/leads/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// If the lead exists but belongs to a different business, it will return 404 Not Found.
    /// </remarks>
    [HttpGet("{id}")]
    [CacheControl(60, "Authorization")] // Cache individual leads for 1 minute with per-user variation
    [ProducesResponseType(typeof(LeadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LeadResponse>> GetLeadAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var lead = await _leadService.GetLeadByIdAsync(businessId, id, cancellationToken);

        if (lead == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Lead not found",
                Detail = $"Lead with ID {id} was not found or does not belong to your business.",
            });
        }

        return Ok(lead);
    }

    /// <summary>
    /// Creates a new lead in the authenticated user's business.
    /// </summary>
    /// <param name="request">The lead creation request containing name, email, phone, and source channel.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The created lead with generated ID and timestamps.</returns>
    /// <response code="201">Lead created successfully. Returns the created lead and Location header with the lead's URI.</response>
    /// <response code="400">Invalid request data (validation errors or business rule violations).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/leads
    ///     {
    ///       "name": "John Doe",
    ///       "email": "john.doe@example.com",
    ///       "phone": "+1234567890",
    ///       "sourceChannel": "chat_widget",
    ///       "status": "New",
    ///       "metadata": "{\"utm_source\": \"google\", \"utm_campaign\": \"summer_sale\"}"
    ///     }
    ///
    /// The lead will be automatically assigned to the authenticated user's business (multi-tenancy).
    /// Initial status defaults to "New" if not provided.
    /// Initial score defaults to 0.
    ///
    /// Valid source channels: chat_widget, sms, voice, whatsapp, instagram, facebook.
    /// Valid status values: New, Contacted, Qualified, Unqualified, Converted, Lost.
    /// </remarks>
    [HttpPost]
    [RequiresLimit("max_leads")] // Enforces lead limit at subscription level
    [ProducesResponseType(typeof(LeadResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LeadResponse>> CreateLeadAsync(
        [FromBody] CreateLeadRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();

            // Limit enforcement handled by [RequiresLimit] attribute
            // No manual check needed - attribute blocks request if limit exceeded

            var lead = await _leadService.CreateLeadAsync(businessId, request, cancellationToken);

            // Use explicit URI to avoid route resolution issues under test hosts
            return Created(new Uri($"/api/v1/leads/{lead.Id}", UriKind.Relative), lead);
        }
        catch (LeadBusinessRuleException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Business rule violation",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Updates an existing lead with partial data (PATCH operation).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the lead to update.</param>
    /// <param name="request">The lead update request. Only provided fields will be updated.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The updated lead with all current values.</returns>
    /// <response code="200">Lead updated successfully.</response>
    /// <response code="400">Invalid request data or business rule violation (e.g., invalid status transition, invalid score).</response>
    /// <response code="404">Lead not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     PATCH /api/v1/leads/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///     {
    ///       "status": "Qualified",
    ///       "score": 85,
    ///       "metadata": "{\"notes\": \"Follow up next week\"}"
    ///     }
    ///
    /// This is a PATCH operation - only the fields you provide will be updated.
    /// All other fields will remain unchanged.
    ///
    /// Business rules enforced:
    /// - Status transitions must be valid (e.g., cannot go from Converted to New)
    /// - Score must be 0-100
    /// - Qualified leads must have score ≥ 70
    /// - Unqualified leads must have score &lt; 70
    /// - Terminal states (Converted, Lost) cannot transition to other states
    ///
    /// Valid status transitions:
    /// - New → Contacted, Qualified, Unqualified, Lost
    /// - Contacted → Qualified, Unqualified, Lost
    /// - Qualified → Converted, Lost.
    /// - Unqualified → Contacted, Lost.
    /// - Converted → (no transitions allowed).
    /// - Lost → (no transitions allowed).
    /// </remarks>
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(LeadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LeadResponse>> UpdateLeadAsync(
        Guid id,
        [FromBody] UpdateLeadRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();

            var lead = await _leadService.UpdateLeadAsync(businessId, id, request, cancellationToken);

            if (lead == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Lead not found",
                    Detail = $"Lead with ID {id} was not found or does not belong to your business.",
                });
            }

            return Ok(lead);
        }
        catch (LeadBusinessRuleException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Business rule violation",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Deletes a lead (soft delete - marks as deleted without physical removal).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the lead to delete.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>No content on successful deletion.</returns>
    /// <response code="204">Lead deleted successfully (soft delete - marked with DeletedAt timestamp).</response>
    /// <response code="404">Lead not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     DELETE /api/v1/leads/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///
    /// This is a soft delete operation - the lead is not physically removed from the database.
    /// Instead, the DeletedAt timestamp is set to the current UTC time.
    ///
    /// Soft-deleted leads:
    /// - Will not appear in normal queries (filtered by global query filters)
    /// - Can be restored by clearing the DeletedAt timestamp (future feature)
    /// - Are retained for audit and compliance purposes
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// If the lead exists but belongs to a different business, it will return 404 Not Found.
    /// </remarks>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteLeadAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var deleted = await _leadService.DeleteLeadAsync(businessId, id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Lead not found",
                Detail = $"Lead with ID {id} was not found or does not belong to your business.",
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Qualifies a lead using AI-powered scoring.
    /// </summary>
    /// <param name="id">The lead's unique identifier.</param>
    /// <param name="conversationId">Optional conversation ID to use for qualification context.</param>
    /// <param name="cancellationToken">Cancellation token for async operations.</param>
    /// <returns>The qualification result with score and reasoning.</returns>
    /// <remarks>
    /// This endpoint triggers AI-powered lead qualification.
    ///
    /// The qualification process:
    /// 1. Retrieves the lead and associated conversation history
    /// 2. Applies configured scoring criteria for the business
    /// 3. Uses AI to analyze conversation and determine lead quality
    /// 4. Updates the lead's score and status based on results
    ///
    /// Qualification thresholds:
    /// - Score ≥ 70: Lead is marked as Qualified
    /// - Score &lt; 70: Lead is marked as Unqualified
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// </remarks>
    [HttpPost("{id}/qualify")]
    [ProducesResponseType(typeof(LeadQualificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LeadQualificationResponse>> QualifyLeadAsync(
        Guid id,
        [FromQuery] Guid? conversationId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // First verify the lead exists
        var lead = await _leadService.GetLeadByIdAsync(businessId, id, cancellationToken);

        if (lead == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Lead not found",
                Detail = $"Lead with ID {id} was not found or does not belong to your business.",
            });
        }

        var previousStatus = lead.Status;

        try
        {
            var request = new CalculateScoreRequest
            {
                LeadId = id,
                BusinessId = businessId,
                ConversationId = conversationId,
                IncludeAIScoring = true,
                SaveToHistory = true,
            };

            var result = await _leadScoringService.CalculateScoreAsync(request, cancellationToken);

            return Ok(new LeadQualificationResponse
            {
                LeadId = id,
                Score = result.FinalScore,
                IsQualified = result.IsQualified,
                PreviousStatus = previousStatus,
                NewStatus = result.RecommendedStatus,
                Reasoning = result.AIScore?.Reasoning,
                SuggestedActions = [],
                Confidence = result.AIScore?.Confidence ?? 0.0,
                QualifiedAt = result.CalculatedAt,
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Qualification failed",
                Detail = ex.Message,
            });
        }
    }
}
