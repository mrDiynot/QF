// -----------------------------------------------------------------------
// <copyright file="VoiceCallsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.API.Hubs;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.VoiceAgents.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for voice call operations including Twilio integration.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/voice-calls")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class VoiceCallsController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITwilioVoiceService _twilioVoiceService;
    private readonly IConfiguration _configuration;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly ILogger<VoiceCallsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="VoiceCallsController"/> class.
    /// </summary>
    public VoiceCallsController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ITwilioVoiceService twilioVoiceService,
        IConfiguration configuration,
        IHubContext<NotificationHub> notificationHub,
        ILogger<VoiceCallsController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _twilioVoiceService = twilioVoiceService;
        _configuration = configuration;
        _notificationHub = notificationHub;
        _logger = logger;
    }

    /// <summary>
    /// Gets call history with filtering and pagination.
    /// </summary>
    /// <param name="page">Page number.</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="direction">Filter by direction (inbound/outbound).</param>
    /// <param name="status">Filter by status.</param>
    /// <param name="agentId">Filter by voice agent.</param>
    /// <param name="from">Filter from date.</param>
    /// <param name="to">Filter to date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated call list.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(VoiceCallListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<VoiceCallListResponse>> GetCallsAsync(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? direction = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? agentId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _context.Set<VoiceCall>()
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null);

        if (!string.IsNullOrEmpty(direction))
        {
            query = query.Where(c => c.Direction == direction);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(c => c.Status == status);
        }

        if (agentId.HasValue)
        {
            query = query.Where(c => c.VoiceAgentId == agentId);
        }

        if (from.HasValue)
        {
            query = query.Where(c => c.StartedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(c => c.StartedAt <= to.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var calls = await query
            .Include(c => c.VoiceAgent)
            .OrderByDescending(c => c.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new VoiceCallDetailDto
            {
                Id = c.Id,
                VoiceAgentId = c.VoiceAgentId,
                AgentName = c.VoiceAgent != null ? c.VoiceAgent.Name : "Unknown",
                ContactName = c.ContactName,
                PhoneNumber = c.PhoneNumber,
                Direction = c.Direction,
                Status = c.Status,
                Outcome = c.Outcome,
                DurationSeconds = c.DurationSeconds,
                StartedAt = c.StartedAt,
                EndedAt = c.EndedAt,
                Transcript = c.Transcript,
                RecordingUrl = c.RecordingUrl,
            })
            .ToListAsync(cancellationToken);

        return Ok(new VoiceCallListResponse
        {
            Calls = calls,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        });
    }

    /// <summary>
    /// Gets a specific call with full details.
    /// </summary>
    /// <param name="id">Call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Call details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VoiceCallDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VoiceCallDetailDto>> GetCallAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var call = await _context.Set<VoiceCall>()
            .AsNoTracking()
            .Include(c => c.VoiceAgent)
            .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId && c.DeletedAt == null, cancellationToken);

        if (call == null)
        {
            return NotFound();
        }

        return Ok(new VoiceCallDetailDto
        {
            Id = call.Id,
            VoiceAgentId = call.VoiceAgentId,
            AgentName = call.VoiceAgent?.Name ?? "Unknown",
            ContactName = call.ContactName,
            PhoneNumber = call.PhoneNumber,
            Direction = call.Direction,
            Status = call.Status,
            Outcome = call.Outcome,
            DurationSeconds = call.DurationSeconds,
            StartedAt = call.StartedAt,
            EndedAt = call.EndedAt,
            Transcript = call.Transcript,
            RecordingUrl = call.RecordingUrl,
        });
    }

    /// <summary>
    /// Initiates an outbound call.
    /// </summary>
    /// <param name="request">Call request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created call.</returns>
    [HttpPost("initiate")]
    [ProducesResponseType(typeof(VoiceCallDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VoiceCallDetailDto>> InitiateCallAsync(
        [FromBody] InitiateCallRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Validate voice agent exists
        var agent = await _context.Set<VoiceAgent>()
            .FirstOrDefaultAsync(a => a.Id == request.VoiceAgentId && a.BusinessId == businessId && a.DeletedAt == null, cancellationToken);

        if (agent == null)
        {
            return BadRequest(new { message = "Voice agent not found" });
        }

        if (!agent.IsActive)
        {
            return BadRequest(new { message = "Voice agent is not active" });
        }

        _logger.LogInformation("Initiating outbound call to {PhoneNumber} using agent {AgentId}", request.PhoneNumber, request.VoiceAgentId);

        // Step 1: Find or create Lead by phone number
        var normalizedPhone = NormalizePhoneNumber(request.PhoneNumber);
        var lead = await _context.Set<Lead>()
            .FirstOrDefaultAsync(l => l.BusinessId == businessId && l.Phone == normalizedPhone && l.DeletedAt == null, cancellationToken);

        if (lead == null)
        {
            lead = new Lead
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Phone = normalizedPhone,
                Name = request.ContactName ?? "Unknown",
                SourceChannel = "AI Voice Call",
                Status = LeadStatus.New,
                CreatedAt = DateTime.UtcNow,
            };
            _context.Set<Lead>().Add(lead);
            _logger.LogInformation("Created new lead {LeadId} for phone {Phone}", lead.Id, normalizedPhone);
        }
        else if (!string.IsNullOrEmpty(request.ContactName) && lead.Name == "Unknown")
        {
            lead.Name = request.ContactName;
        }

        // Step 2: Find or create Conversation for unified inbox
        var voiceChannel = await _context.Set<Channel>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.Type == ChannelType.Voice && c.DeletedAt == null, cancellationToken);

        var conversation = await _context.Set<Conversation>()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.LeadId == lead.Id && c.Channel == "Voice" && c.Status == ConversationStatus.Open && c.DeletedAt == null, cancellationToken);

        if (conversation == null)
        {
            conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                LeadId = lead.Id,
                Channel = "Voice",
                ChannelId = voiceChannel?.Id,
                Status = ConversationStatus.Open,
                StartedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            };
            _context.Set<Conversation>().Add(conversation);
            _logger.LogInformation("Created new conversation {ConversationId} for lead {LeadId}", conversation.Id, lead.Id);
        }

        // Step 3: Always use toll-free number for outbound calls
        var defaultTollFreeNumber = _configuration["Twilio:DefaultPhoneNumber"] ?? "+18776765329";
        var fromNumber = request.FromPhoneNumber ?? defaultTollFreeNumber;

        // Step 4: Initiate real Twilio call
        var twilioResult = await _twilioVoiceService.InitiateOutboundCallAsync(
            request.VoiceAgentId,
            request.PhoneNumber,
            fromNumber,
            request.ContactName,
            cancellationToken);

        if (!string.IsNullOrEmpty(twilioResult.ErrorMessage))
        {
            return BadRequest(new { message = twilioResult.ErrorMessage });
        }

        // Step 5: Create VoiceCall record linked to Lead and Conversation
        var call = new VoiceCall
        {
            BusinessId = businessId,
            VoiceAgentId = request.VoiceAgentId,
            LeadId = lead.Id,
            ConversationId = conversation.Id,
            ContactName = request.ContactName ?? lead.Name ?? "Unknown",
            PhoneNumber = request.PhoneNumber,
            Direction = "outbound",
            Status = twilioResult.Status,
            ExternalCallSid = twilioResult.CallSid,
            StartedAt = DateTime.UtcNow,
        };

        _context.Set<VoiceCall>().Add(call);

        // Step 6: Add initial message to conversation
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Content = $"[Outbound call initiated to {request.PhoneNumber}]",
            Direction = MessageDirection.Outbound,
            SentAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };
        _context.Set<Message>().Add(message);

        await _context.SaveChangesAsync(cancellationToken);

        // Step 7: Broadcast call started event via SignalR
        await _notificationHub.Clients.Group($"business_{businessId}").SendAsync(
            "VoiceCallStarted",
            new
            {
                CallId = call.Id,
                ConversationId = conversation.Id,
                LeadId = lead.Id,
                Direction = "outbound",
                PhoneNumber = request.PhoneNumber,
                ContactName = call.ContactName,
                AgentName = agent.Name,
                Status = call.Status,
            },
            cancellationToken);

        _logger.LogInformation("Outbound call {CallId} initiated with conversation {ConversationId} and lead {LeadId}", call.Id, conversation.Id, lead.Id);

        var result = new VoiceCallDetailDto
        {
            Id = call.Id,
            VoiceAgentId = call.VoiceAgentId,
            AgentName = agent.Name,
            ContactName = call.ContactName,
            PhoneNumber = call.PhoneNumber,
            Direction = call.Direction,
            Status = call.Status,
            StartedAt = call.StartedAt,
            LeadId = lead.Id,
            ConversationId = conversation.Id,
        };

        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Initiates a callback to a previous caller.
    /// </summary>
    /// <param name="id">The ID of the original call to callback.</param>
    /// <param name="request">Optional callback request with agent override.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The newly created call details.</returns>
    [HttpPost("{id:guid}/callback")]
    [ProducesResponseType(typeof(VoiceCallDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VoiceCallDetailDto>> CallbackAsync(
        Guid id,
        [FromBody] CallbackRequest? request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var originalCall = await _context.Set<VoiceCall>()
            .Include(c => c.VoiceAgent)
            .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId, cancellationToken);

        if (originalCall == null)
        {
            return NotFound(new { message = "Call not found" });
        }

        // Use specified agent or default to original call's agent
        var agentId = request?.VoiceAgentId ?? originalCall.VoiceAgentId;

        var initiateRequest = new InitiateCallRequest
        {
            VoiceAgentId = agentId,
            PhoneNumber = originalCall.PhoneNumber,
            ContactName = originalCall.ContactName,
        };

        return await InitiateCallAsync(initiateRequest, cancellationToken);
    }

    private static string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return phone;
        }

        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length == 10)
        {
            return $"+1{digits}";
        }

        return phone.StartsWith('+') ? phone : $"+{digits}";
    }

    /// <summary>
    /// Ends an active call.
    /// </summary>
    /// <param name="id">Call ID.</param>
    /// <param name="request">End call request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated call.</returns>
    [HttpPost("{id:guid}/end")]
    [ProducesResponseType(typeof(VoiceCallDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VoiceCallDetailDto>> EndCallAsync(
        Guid id,
        [FromBody] EndCallRequest? request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var call = await _context.Set<VoiceCall>()
            .Include(c => c.VoiceAgent)
            .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId && c.DeletedAt == null, cancellationToken);

        if (call == null)
        {
            return NotFound();
        }

        call.Status = "completed";
        call.EndedAt = DateTime.UtcNow;
        call.DurationSeconds = (int)(call.EndedAt.Value - call.StartedAt).TotalSeconds;

        if (request != null)
        {
            call.Outcome = request.Outcome;
            call.Transcript = request.Transcript;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Call {CallId} ended with outcome {Outcome}", id, call.Outcome);

        return Ok(new VoiceCallDetailDto
        {
            Id = call.Id,
            VoiceAgentId = call.VoiceAgentId,
            AgentName = call.VoiceAgent?.Name ?? "Unknown",
            ContactName = call.ContactName,
            PhoneNumber = call.PhoneNumber,
            Direction = call.Direction,
            Status = call.Status,
            Outcome = call.Outcome,
            DurationSeconds = call.DurationSeconds,
            StartedAt = call.StartedAt,
            EndedAt = call.EndedAt,
            Transcript = call.Transcript,
        });
    }

    /// <summary>
    /// Gets call analytics.
    /// </summary>
    /// <param name="from">Start date.</param>
    /// <param name="to">End date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Call analytics.</returns>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(VoiceCallAnalytics), StatusCodes.Status200OK)]
    public async Task<ActionResult<VoiceCallAnalytics>> GetAnalyticsAsync(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var startDate = from ?? DateTime.UtcNow.AddDays(-30);
        var endDate = to ?? DateTime.UtcNow;

        var calls = await _context.Set<VoiceCall>()
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null && c.StartedAt >= startDate && c.StartedAt <= endDate)
            .ToListAsync(cancellationToken);

        var totalCalls = calls.Count;
        var completedCalls = calls.Count(c => c.Status == "completed");
        var successfulCalls = calls.Count(c => c.Outcome == "qualified" || c.Outcome == "appointment_booked");
        var totalDuration = calls.Sum(c => c.DurationSeconds);
        var avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

        var byOutcome = calls
            .Where(c => !string.IsNullOrEmpty(c.Outcome))
            .GroupBy(c => c.Outcome)
            .Select(g => new OutcomeCount { Outcome = g.Key!, Count = g.Count() })
            .ToList();

        var byDirection = calls
            .GroupBy(c => c.Direction)
            .Select(g => new DirectionCount { Direction = g.Key, Count = g.Count() })
            .ToList();

        var dailyTrend = calls
            .GroupBy(c => c.StartedAt.Date)
            .Select(g => new DailyCallCount { Date = g.Key, Count = g.Count(), Duration = g.Sum(c => c.DurationSeconds) })
            .OrderBy(x => x.Date)
            .ToList();

        return Ok(new VoiceCallAnalytics
        {
            TotalCalls = totalCalls,
            CompletedCalls = completedCalls,
            SuccessRate = totalCalls > 0 ? Math.Round((decimal)successfulCalls / totalCalls * 100, 2) : 0,
            TotalDurationSeconds = totalDuration,
            AverageDurationSeconds = avgDuration,
            ByOutcome = byOutcome,
            ByDirection = byDirection,
            DailyTrend = dailyTrend,
            PeriodStart = startDate,
            PeriodEnd = endDate,
        });
    }

    /// <summary>
    /// Gets the transcript for a call.
    /// </summary>
    /// <param name="id">Call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Call transcript.</returns>
    [HttpGet("{id:guid}/transcript")]
    [ProducesResponseType(typeof(CallTranscriptResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CallTranscriptResponse>> GetTranscriptAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var call = await _context.Set<VoiceCall>()
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId && c.DeletedAt == null, cancellationToken);

        if (call == null)
        {
            return NotFound();
        }

        return Ok(new CallTranscriptResponse
        {
            CallId = call.Id,
            Transcript = call.Transcript,
            Duration = call.DurationSeconds,
        });
    }
}

// ============================================================================
// DTOs
// ============================================================================

#pragma warning disable CA1002, CA2227, MA0016 // Collection rules - DTOs need mutable collections for serialization

/// <summary>
/// Voice call list response with pagination.
/// </summary>
public class VoiceCallListResponse
{
    public List<VoiceCallDetailDto> Calls { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

/// <summary>
/// Voice call detail DTO.
/// </summary>
public class VoiceCallDetailDto
{
    public Guid Id { get; set; }
    public Guid? VoiceAgentId { get; set; }
    public string? AgentName { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? ConversationId { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Outcome { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? Transcript { get; set; }
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? RecordingUrl { get; set; }
#pragma warning restore CA1056
    public decimal? SentimentScore { get; set; }
}

/// <summary>
/// Request to initiate a call.
/// </summary>
public class InitiateCallRequest
{
    public Guid VoiceAgentId { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? FromPhoneNumber { get; set; }
    public string? ContactName { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? ContactId { get; set; }
}

/// <summary>
/// Request to end a call.
/// </summary>
public class EndCallRequest
{
    public string? Outcome { get; set; }
    public string? Transcript { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Request to callback a previous caller.
/// </summary>
public class CallbackRequest
{
    public Guid? VoiceAgentId { get; set; }
}

/// <summary>
/// Voice call analytics response.
/// </summary>
public class VoiceCallAnalytics
{
    public int TotalCalls { get; set; }
    public int CompletedCalls { get; set; }
    public decimal SuccessRate { get; set; }
    public int TotalDurationSeconds { get; set; }
    public int AverageDurationSeconds { get; set; }
    public IReadOnlyList<OutcomeCount> ByOutcome { get; init; } = [];
    public IReadOnlyList<DirectionCount> ByDirection { get; init; } = [];
    public IReadOnlyList<DailyCallCount> DailyTrend { get; init; } = [];
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

/// <summary>
/// Outcome count for analytics.
/// </summary>
public class OutcomeCount
{
    public string Outcome { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>
/// Direction count for analytics.
/// </summary>
public class DirectionCount
{
    public string Direction { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>
/// Daily call count for analytics.
/// </summary>
public class DailyCallCount
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
    public int Duration { get; set; }
}

/// <summary>
/// Call transcript response.
/// </summary>
public class CallTranscriptResponse
{
    public Guid CallId { get; set; }
    public string? Transcript { get; set; }
    public decimal? SentimentScore { get; set; }
    public int Duration { get; set; }
}
