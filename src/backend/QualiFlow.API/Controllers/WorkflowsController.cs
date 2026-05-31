// <copyright file="WorkflowsController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.DTOs;
using QualiFlow.Application.Features.Workflows.Services;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for workflow management operations.
/// Provides RESTful endpoints for starting, monitoring, and controlling workflows.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class WorkflowsController : ControllerBase
{
    private readonly IWorkflowHost _workflowHost;
    private readonly IPersistenceProvider _persistenceProvider;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly IWorkflowSubscriptionService _workflowSubscriptionService;
    private readonly ILogger<WorkflowsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowsController"/> class.
    /// </summary>
    /// <param name="workflowHost">The Workflow Core host.</param>
    /// <param name="persistenceProvider">The Workflow Core persistence provider.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="usageLimitService">The usage limit service for subscription enforcement.</param>
    /// <param name="workflowSubscriptionService">The workflow subscription service.</param>
    /// <param name="logger">The logger.</param>
    public WorkflowsController(
        IWorkflowHost workflowHost,
        IPersistenceProvider persistenceProvider,
        ICurrentUserService currentUserService,
        IUsageLimitService usageLimitService,
        IWorkflowSubscriptionService workflowSubscriptionService,
        ILogger<WorkflowsController> logger)
    {
        _workflowHost = workflowHost;
        _persistenceProvider = persistenceProvider;
        _currentUserService = currentUserService;
        _usageLimitService = usageLimitService;
        _workflowSubscriptionService = workflowSubscriptionService;
        _logger = logger;
    }

    /// <summary>
    /// Starts a new workflow instance.
    /// Enforces subscription limits via [RequiresLimit] attribute.
    /// </summary>
    /// <param name="request">The workflow start request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created workflow instance.</returns>
    /// <response code="201">Workflow instance created successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="403">Workflow limit exceeded - upgrade required.</response>
    [HttpPost("start")]
    [RequiresLimit("max_workflows")] // Enforces workflow limit at plan level
    [ProducesResponseType(typeof(WorkflowInstanceResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<WorkflowInstanceResponse>> StartWorkflowAsync(
        [FromBody] StartWorkflowRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Limit enforcement handled by [RequiresLimit] attribute - no manual check needed

        _logger.LogInformation(
            "Starting workflow {WorkflowId} v{Version} for business {BusinessId}",
            request.WorkflowId,
            request.Version,
            businessId);

        // Deserialize workflow data
        var workflowData = JsonSerializer.Deserialize<object>(request.Data);

        // Start the workflow
        var workflowInstanceId = await _workflowHost.StartWorkflow(
            request.WorkflowId,
            request.Version,
            workflowData);

        // Increment usage counter
        await _usageLimitService.IncrementWorkflowsAsync(businessId, cancellationToken);

        _logger.LogInformation(
            "Started workflow instance {WorkflowInstanceId}",
            workflowInstanceId);

        // Get the workflow instance details
        var instance = await _persistenceProvider.GetWorkflowInstance(workflowInstanceId, cancellationToken);

        var response = new WorkflowInstanceResponse
        {
            WorkflowInstanceId = instance.Id,
            WorkflowId = instance.WorkflowDefinitionId,
            Version = instance.Version,
            Status = instance.Status.ToString(),
            CreatedAt = instance.CreateTime,
            CompletedAt = instance.CompleteTime,
            Data = JsonSerializer.Serialize(instance.Data),
            ReferenceId = request.ReferenceId,
        };

        return Created(new Uri($"/api/v1/workflows/{workflowInstanceId}", UriKind.Relative), response);
    }

    /// <summary>
    /// Gets a workflow instance by ID.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The workflow instance.</returns>
    /// <response code="200">Workflow instance found.</response>
    /// <response code="404">Workflow instance not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WorkflowInstanceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WorkflowInstanceResponse>> GetWorkflowInstanceAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var instance = await _persistenceProvider.GetWorkflowInstance(id, cancellationToken);

        if (instance == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Workflow Instance Not Found",
                Detail = $"Workflow instance with ID {id} was not found.",
                Instance = HttpContext.Request.Path,
            });
        }

        var response = new WorkflowInstanceResponse
        {
            WorkflowInstanceId = instance.Id,
            WorkflowId = instance.WorkflowDefinitionId,
            Version = instance.Version,
            Status = instance.Status.ToString(),
            CreatedAt = instance.CreateTime,
            CompletedAt = instance.CompleteTime,
            Data = JsonSerializer.Serialize(instance.Data),
        };

        return Ok(response);
    }

    /// <summary>
    /// Lists all workflow instances with optional filtering.
    /// </summary>
    /// <param name="workflowId">Optional filter by workflow ID.</param>
    /// <param name="status">Optional filter by status.</param>
    /// <param name="page">Page number (default: 1).</param>
    /// <param name="pageSize">Page size (default: 10, max: 100).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of workflow instances.</returns>
    /// <response code="200">Workflow instances retrieved successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<WorkflowInstanceResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<WorkflowInstanceResponse>>> GetWorkflowInstancesAsync(
        [FromQuery] string? workflowId = null,
        [FromQuery] WorkflowStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Min(pageSize, 100);

        // Get runnable instance IDs
        var instanceIds = await _persistenceProvider.GetRunnableInstances(DateTime.UtcNow, cancellationToken);

        // Fetch full instances
        var instances = new List<WorkflowInstance>();
        foreach (var id in instanceIds)
        {
            var instance = await _persistenceProvider.GetWorkflowInstance(id, cancellationToken);
            if (instance != null)
            {
                instances.Add(instance);
            }
        }

        // Apply filters
        var filteredInstances = instances.AsEnumerable();

        if (!string.IsNullOrEmpty(workflowId))
        {
            filteredInstances = filteredInstances.Where(i => i.WorkflowDefinitionId == workflowId);
        }

        if (status.HasValue)
        {
            filteredInstances = filteredInstances.Where(i => i.Status == status.Value);
        }

        // Apply pagination
        var skip = (page - 1) * pageSize;
        var pagedInstances = filteredInstances
            .Skip(skip)
            .Take(pageSize)
            .Select(i => new WorkflowInstanceResponse
            {
                WorkflowInstanceId = i.Id,
                WorkflowId = i.WorkflowDefinitionId,
                Version = i.Version,
                Status = i.Status.ToString(),
                CreatedAt = i.CreateTime,
                CompletedAt = i.CompleteTime,
                Data = JsonSerializer.Serialize(i.Data),
            })
            .ToList();

        return Ok(pagedInstances);
    }

    /// <summary>
    /// Cancels a running workflow instance.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Workflow instance cancelled successfully.</response>
    /// <response code="404">Workflow instance not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CancelWorkflowAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var instance = await _persistenceProvider.GetWorkflowInstance(id, cancellationToken);

        if (instance == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Workflow Instance Not Found",
                Detail = $"Workflow instance with ID {id} was not found.",
                Instance = HttpContext.Request.Path,
            });
        }

        var result = await _workflowHost.TerminateWorkflow(id);

        if (result)
        {
            _logger.LogInformation("Cancelled workflow instance {WorkflowInstanceId}", id);
            return NoContent();
        }

        return BadRequest(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Failed to Cancel Workflow",
            Detail = $"Failed to cancel workflow instance {id}. It may already be completed or cancelled.",
            Instance = HttpContext.Request.Path,
        });
    }

    /// <summary>
    /// Resumes a suspended workflow instance.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Workflow instance resumed successfully.</response>
    /// <response code="404">Workflow instance not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/resume")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ResumeWorkflowAsync(
        string id,
        CancellationToken cancellationToken)
    {
        var instance = await _persistenceProvider.GetWorkflowInstance(id, cancellationToken);

        if (instance == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Workflow Instance Not Found",
                Detail = $"Workflow instance with ID {id} was not found.",
                Instance = HttpContext.Request.Path,
            });
        }

#pragma warning disable CS4014 // Workflow Core ResumeWorkflow is fire-and-forget by design
        _workflowHost.ResumeWorkflow(id);
#pragma warning restore CS4014

        _logger.LogInformation("Resumed workflow instance {WorkflowInstanceId}", id);

        return NoContent();
    }

    /// <summary>
    /// Gets all available workflow definitions.
    /// </summary>
    /// <returns>The list of workflow definitions.</returns>
    /// <response code="200">Workflow definitions retrieved successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("definitions")]
    [ProducesResponseType(typeof(IEnumerable<WorkflowDefinitionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<IEnumerable<WorkflowDefinitionResponse>> GetWorkflowDefinitions()
    {
        var definitions = new List<WorkflowDefinitionResponse>
        {
            // FreeFlow tier (view-only for FreeFlow, executable for SmartFlow+)
            new()
            {
                WorkflowId = "lead-qualification-workflow",
                Version = 1,
                Name = "Lead Qualification → Booking",
                Description = "AI responds instantly, qualifies leads using BANT criteria, scores them, and books appointments automatically.",
            },
            new()
            {
                WorkflowId = "review-survey-workflow",
                Version = 1,
                Name = "Review + Survey Flow",
                Description = "After completed appointments, sends thank-you messages, review requests, and surveys.",
            },

            // SmartFlow tier
            new()
            {
                WorkflowId = "email-nurture-campaign-workflow",
                Version = 1,
                Name = "Email Nurture Campaign",
                Description = "5-email drip campaign with configurable delays for lead nurturing.",
            },
            new()
            {
                WorkflowId = "follow-up-sequence-workflow",
                Version = 1,
                Name = "Follow-Up Sequence",
                Description = "Score-based follow-up sequence with priority-based timing.",
            },
            new()
            {
                WorkflowId = "missed-call-recovery-workflow",
                Version = 1,
                Name = "Missed Call Recovery",
                Description = "When a call is missed, AI sends SMS and email to recover the lead.",
            },
            new()
            {
                WorkflowId = "no-show-recovery-workflow",
                Version = 1,
                Name = "No-Show Recovery",
                Description = "Automatically re-engages customers who miss appointments and helps them rebook.",
            },

            // UltraFlow tier
            new()
            {
                WorkflowId = "cold-lead-revival-workflow",
                Version = 1,
                Name = "Cold Lead Revival",
                Description = "AI reactivates leads who stopped responding using smart timing and personalized messaging.",
            },
            new()
            {
                WorkflowId = "retention-reengagement-workflow",
                Version = 1,
                Name = "Retention & Re-Engagement",
                Description = "AI targets inactive customers with personalized offers based on lifetime value.",
            },
            new()
            {
                WorkflowId = "proposal-workflow",
                Version = 1,
                Name = "Proposal Creation + Sending",
                Description = "AI creates proposals, sends them to leads, and handles acceptance/rejection automatically.",
            },
            new()
            {
                WorkflowId = "abandoned-form-recovery-workflow",
                Version = 1,
                Name = "Abandoned Form Recovery",
                Description = "When someone starts but doesn't submit a form, AI follows up instantly to recover them.",
            },
        };

        return Ok(definitions);
    }

    /// <summary>
    /// Publishes an event to resume waiting workflows.
    /// </summary>
    /// <param name="request">The event publish request.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Event published successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("event")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public IActionResult PublishEvent([FromBody] PublishEventRequest request)
    {
        var eventData = string.IsNullOrEmpty(request.EventData)
            ? null
            : JsonSerializer.Deserialize<object>(request.EventData);

#pragma warning disable CS4014, MA0134, VSTHRD110 // Workflow Core PublishEvent is fire-and-forget by design
        _workflowHost.PublishEvent(request.EventName, request.EventKey, eventData);
#pragma warning restore CS4014, MA0134, VSTHRD110

        _logger.LogInformation(
            "Published event {EventName} with key {EventKey}",
            request.EventName,
            request.EventKey);

        return NoContent();
    }

    /// <summary>
    /// Gets the workflow subscription status for the current business.
    /// Returns available workflows, usage stats, and tier information.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The workflow subscription status.</returns>
    /// <response code="200">Subscription status retrieved successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("subscription")]
    [ProducesResponseType(typeof(WorkflowSubscriptionStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WorkflowSubscriptionStatusResponse>> GetWorkflowSubscriptionStatusAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var availableWorkflows = await _workflowSubscriptionService.GetAvailableWorkflowsAsync(businessId, cancellationToken);
        var usageStats = await _workflowSubscriptionService.GetWorkflowUsageAsync(businessId, cancellationToken);

        var response = new WorkflowSubscriptionStatusResponse
        {
            CurrentTier = usageStats.CurrentTier.ToString(),
            AvailableWorkflowIds = availableWorkflows.ToList(),
            AvailableWorkflowCount = usageStats.AvailableWorkflows,
            ActiveWorkflowCount = usageStats.ActiveWorkflows,
            MonthlyExecutions = usageStats.MonthlyExecutions,
            CanCreateCustomWorkflows = usageStats.CanCreateCustomWorkflows,
            HasVisualBuilder = usageStats.HasVisualBuilder,
        };

        return Ok(response);
    }

    /// <summary>
    /// Checks if a specific workflow can be activated by the current business.
    /// </summary>
    /// <param name="workflowId">The workflow ID to check.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Whether the workflow can be activated.</returns>
    /// <response code="200">Check completed successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("can-activate/{workflowId}")]
    [ProducesResponseType(typeof(WorkflowAccessCheckResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WorkflowAccessCheckResponse>> CanActivateWorkflowAsync(
        string workflowId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var canActivate = await _workflowSubscriptionService.CanActivateWorkflowAsync(businessId, workflowId, cancellationToken);
        var canExecute = await _workflowSubscriptionService.CanExecuteWorkflowAsync(businessId, workflowId, cancellationToken);
        var requiredTier = await _workflowSubscriptionService.GetRequiredTierAsync(workflowId, cancellationToken);

        var response = new WorkflowAccessCheckResponse
        {
            WorkflowId = workflowId,
            CanActivate = canActivate,
            CanExecute = canExecute,
            RequiredTier = requiredTier.ToString(),
        };

        return Ok(response);
    }
}

/// <summary>
/// Response model for workflow subscription status.
/// </summary>
public record WorkflowSubscriptionStatusResponse
{
    /// <summary>
    /// Gets the current subscription tier.
    /// </summary>
    public string CurrentTier { get; init; } = string.Empty;

    /// <summary>
    /// Gets the list of available workflow IDs for the current tier.
    /// </summary>
    public IReadOnlyList<string> AvailableWorkflowIds { get; init; } = [];

    /// <summary>
    /// Gets the number of available workflows.
    /// </summary>
    public int AvailableWorkflowCount { get; init; }

    /// <summary>
    /// Gets the number of active workflows.
    /// </summary>
    public int ActiveWorkflowCount { get; init; }

    /// <summary>
    /// Gets the total monthly executions.
    /// </summary>
    public int MonthlyExecutions { get; init; }

    /// <summary>
    /// Gets a value indicating whether custom workflows can be created.
    /// </summary>
    public bool CanCreateCustomWorkflows { get; init; }

    /// <summary>
    /// Gets a value indicating whether the visual builder is available.
    /// </summary>
    public bool HasVisualBuilder { get; init; }
}

/// <summary>
/// Response model for workflow access check.
/// </summary>
public record WorkflowAccessCheckResponse
{
    /// <summary>
    /// Gets the workflow ID that was checked.
    /// </summary>
    public string WorkflowId { get; init; } = string.Empty;

    /// <summary>
    /// Gets a value indicating whether the workflow can be activated.
    /// </summary>
    public bool CanActivate { get; init; }

    /// <summary>
    /// Gets a value indicating whether the workflow can be executed.
    /// </summary>
    public bool CanExecute { get; init; }

    /// <summary>
    /// Gets the required subscription tier for this workflow.
    /// </summary>
    public string RequiredTier { get; init; } = string.Empty;
}

