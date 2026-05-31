using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Exceptions;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AutoAssignment.Interfaces;
using QualiFlow.Application.Features.Journeys.Services;
using QualiFlow.Application.Features.Leads.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.Services;

/// <summary>
/// Service implementation for lead business logic operations.
/// </summary>
public partial class LeadService : ILeadService
{
    private readonly ILeadRepository _leadRepository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateLeadRequest> _createValidator;
    private readonly IValidator<UpdateLeadRequest> _updateValidator;
    private readonly IJourneyTriggerService? _journeyTriggerService;
    private readonly IAutoAssignmentService? _autoAssignmentService;
    private readonly IBackgroundJobService? _backgroundJobService;
    private readonly ILogger<LeadService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadService"/> class.
    /// </summary>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="createValidator">The create request validator.</param>
    /// <param name="updateValidator">The update request validator.</param>
    /// <param name="journeyTriggerService">The journey trigger service (optional).</param>
    /// <param name="autoAssignmentService">The auto-assignment service for lead routing (optional).</param>
    /// <param name="backgroundJobService">The background job service for enqueuing async tasks (optional).</param>
    /// <param name="logger">The logger instance.</param>
    public LeadService(
        ILeadRepository leadRepository,
        IMapper mapper,
        IValidator<CreateLeadRequest> createValidator,
        IValidator<UpdateLeadRequest> updateValidator,
        IJourneyTriggerService? journeyTriggerService,
        IAutoAssignmentService? autoAssignmentService,
        IBackgroundJobService? backgroundJobService,
        ILogger<LeadService> logger)
    {
        _leadRepository = leadRepository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _journeyTriggerService = journeyTriggerService;
        _autoAssignmentService = autoAssignmentService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<PagedLeadResponse> GetLeadsAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 10,
        LeadStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingLeads(_logger, businessId, page, pageSize, status);

        // Validate pagination parameters
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 10;
        }

        var skip = (page - 1) * pageSize;

        // Get leads and total count (automatically filtered by current user's BusinessId)
        var leads = await _leadRepository.GetAllAsync(status, skip, pageSize, cancellationToken);
        var totalItems = await _leadRepository.GetCountAsync(status, cancellationToken);

        // Map to response DTOs
        var leadResponses = _mapper.Map<IReadOnlyList<LeadResponse>>(leads);

        // Calculate pagination metadata
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        return new PagedLeadResponse
        {
            Items = leadResponses,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1,
        };
    }

    /// <inheritdoc />
    public async Task<LeadResponse?> GetLeadByIdAsync(
        Guid businessId,
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        LogGettingLead(_logger, leadId, businessId);

        // Automatically filtered by current user's BusinessId via global query filters
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken);

        return lead == null ? null : _mapper.Map<LeadResponse>(lead);
    }

    /// <inheritdoc />
    public async Task<LeadResponse> CreateLeadAsync(
        Guid businessId,
        CreateLeadRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingLead(_logger, request.Email, businessId);

        // Validate request
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Check if lead with email already exists (automatically filtered by current user's BusinessId)
        var existingLead = await _leadRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingLead != null)
        {
            throw new InvalidOperationException($"Lead with email '{request.Email}' already exists in this business.");
        }

        // Map request to entity
        var lead = _mapper.Map<Lead>(request);
        lead.BusinessId = businessId; // Set explicitly for logging purposes
        lead.CreatedAt = DateTime.UtcNow;

        // Validate initial score (default is 0, which is valid for New status)
        ValidateScore(lead.Score, lead.Status);

        // Save to database
        var createdLead = await _leadRepository.AddAsync(lead, cancellationToken);

        LogLeadCreated(_logger, createdLead.Id, businessId, createdLead.Status, createdLead.Score);

        // Trigger journey workflows for new lead via background job (Hangfire creates its own DI scope)
        if (_journeyTriggerService != null && _backgroundJobService != null)
        {
            _backgroundJobService.Enqueue<IJourneyTriggerService>(
                service => service.OnLeadCreatedAsync(
                    businessId,
                    createdLead.Id,
                    createdLead.Email,
                    createdLead.SourceChannel,
                    CancellationToken.None));
        }

        // Apply auto-assignment rules via background job (uses new DbContext scope)
        if (_backgroundJobService != null)
        {
            _backgroundJobService.Enqueue<IAutoAssignmentService>(
                service => service.ApplyRulesAsync(
                    businessId,
                    createdLead.Id,
                    createdLead.SourceChannel,
                    createdLead.Score,
                    CancellationToken.None));

            _logger.LogDebug(
                "Enqueued auto-assignment job for lead {LeadId} on channel {Channel}",
                createdLead.Id,
                createdLead.SourceChannel);
        }

        return _mapper.Map<LeadResponse>(createdLead);
    }

    /// <inheritdoc />
    public async Task<LeadResponse?> UpdateLeadAsync(
        Guid businessId,
        Guid leadId,
        UpdateLeadRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingLead(_logger, leadId, businessId);

        // Validate request
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Get existing lead (automatically filtered by current user's BusinessId)
        var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken);
        if (lead == null)
        {
            return null;
        }

        // Check if email is being changed and if it already exists
        if (!string.IsNullOrEmpty(request.Email) && !string.Equals(request.Email, lead.Email, StringComparison.Ordinal))
        {
            var existingLead = await _leadRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (existingLead != null)
            {
                throw new InvalidOperationException($"Lead with email '{request.Email}' already exists in this business.");
            }
        }

        // Apply updates (only non-null properties) with business rule validation
        ApplyLeadUpdates(lead, request);

        // Save changes
        await _leadRepository.UpdateAsync(lead, cancellationToken);

        LogLeadUpdated(_logger, leadId, businessId, lead.Status, lead.Score);

        return _mapper.Map<LeadResponse>(lead);
    }

    /// <inheritdoc />
    public Task<bool> DeleteLeadAsync(
        Guid businessId,
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingLead(_logger, leadId, businessId);

        // Automatically filtered by current user's BusinessId via global query filters
        return _leadRepository.DeleteAsync(leadId, cancellationToken);
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /// <summary>
    /// Applies updates from the request to the lead entity with business rule validation.
    /// </summary>
    /// <param name="lead">The lead entity to update.</param>
    /// <param name="request">The update request containing new values.</param>
    /// <exception cref="LeadBusinessRuleException">Thrown when business rules are violated.</exception>
    private static void ApplyLeadUpdates(Lead lead, UpdateLeadRequest request)
    {
        // Track original status for validation
        var originalStatus = lead.Status;

        // Apply basic property updates
        if (!string.IsNullOrEmpty(request.Name))
        {
            lead.Name = request.Name;
        }

        if (!string.IsNullOrEmpty(request.Email))
        {
            lead.Email = request.Email;
        }

        if (request.Phone != null)
        {
            lead.Phone = request.Phone;
        }

        if (request.Metadata != null)
        {
            lead.Metadata = request.Metadata;
        }

        // Validate and apply status change
        if (request.Status.HasValue)
        {
            ValidateStatusTransition(originalStatus, request.Status.Value);
            lead.Status = request.Status.Value;
        }

        // Validate and apply score change
        if (request.Score.HasValue)
        {
            // Use the new status if it's being updated, otherwise use current status
            var statusForValidation = request.Status ?? lead.Status;
            ValidateScore(request.Score.Value, statusForValidation);
            lead.Score = request.Score.Value;
        }

        // If status changed but score didn't, validate existing score against new status
        if (request.Status.HasValue && !request.Score.HasValue)
        {
            ValidateScore(lead.Score, request.Status.Value);
        }

        lead.UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Validates that a lead status transition is allowed.
    /// </summary>
    /// <param name="currentStatus">The current lead status.</param>
    /// <param name="newStatus">The new lead status.</param>
    /// <exception cref="LeadBusinessRuleException">Thrown when the status transition is invalid.</exception>
    private static void ValidateStatusTransition(LeadStatus currentStatus, LeadStatus newStatus)
    {
        // Allow same status (no change)
        if (currentStatus == newStatus)
        {
            return;
        }

        // Define valid status transitions
        var validTransitions = new Dictionary<LeadStatus, LeadStatus[]>
        {
            [LeadStatus.New] = [LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.Unqualified, LeadStatus.Lost],
            [LeadStatus.Contacted] = [LeadStatus.Qualified, LeadStatus.Unqualified, LeadStatus.Lost],
            [LeadStatus.Qualified] = [LeadStatus.Converted, LeadStatus.Lost],
            [LeadStatus.Unqualified] = [LeadStatus.Contacted, LeadStatus.Lost],
            [LeadStatus.Converted] = [], // Terminal state - no transitions allowed
            [LeadStatus.Lost] = [], // Terminal state - no transitions allowed
        };

        if (!validTransitions.TryGetValue(currentStatus, out var allowedStatuses) ||
            !allowedStatuses.Contains(newStatus))
        {
            throw new LeadBusinessRuleException(
                $"Invalid status transition from {currentStatus} to {newStatus}. " +
                $"Allowed transitions from {currentStatus}: {string.Join(", ", validTransitions[currentStatus])}");
        }
    }

    /// <summary>
    /// Validates that a lead score is within the valid range and consistent with status.
    /// </summary>
    /// <param name="score">The lead score to validate.</param>
    /// <param name="status">The lead status.</param>
    /// <exception cref="LeadBusinessRuleException">Thrown when the score is invalid.</exception>
    private static void ValidateScore(int score, LeadStatus status)
    {
        // Score must be between 0 and 100
        if (score < 0 || score > 100)
        {
            throw new LeadBusinessRuleException($"Lead score must be between 0 and 100. Provided: {score}");
        }

        // Business rule: Qualified leads should have score >= 70
        if (status == LeadStatus.Qualified && score < 70)
        {
            throw new LeadBusinessRuleException(
                $"Qualified leads must have a score of at least 70. Provided: {score}");
        }

        // Business rule: Unqualified leads should have score < 70
        if (status == LeadStatus.Unqualified && score >= 70)
        {
            throw new LeadBusinessRuleException(
                $"Unqualified leads must have a score below 70. Provided: {score}");
        }
    }

    // ============================================================================
    // Logging (Source Generated)
    // ============================================================================

    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Getting leads for business {BusinessId} - Page: {Page}, PageSize: {PageSize}, Status: {Status}")]
    private static partial void LogGettingLeads(
        ILogger logger,
        Guid businessId,
        int page,
        int pageSize,
        LeadStatus? status);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Getting lead {LeadId} for business {BusinessId}")]
    private static partial void LogGettingLead(
        ILogger logger,
        Guid leadId,
        Guid businessId);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Creating lead with email {Email} for business {BusinessId}")]
    private static partial void LogCreatingLead(
        ILogger logger,
        string email,
        Guid businessId);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Updating lead {LeadId} for business {BusinessId}")]
    private static partial void LogUpdatingLead(
        ILogger logger,
        Guid leadId,
        Guid businessId);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Information,
        Message = "Deleting lead {LeadId} for business {BusinessId}")]
    private static partial void LogDeletingLead(
        ILogger logger,
        Guid leadId,
        Guid businessId);

    [LoggerMessage(
        EventId = 6,
        Level = LogLevel.Information,
        Message = "Lead {LeadId} created for business {BusinessId} with status {Status} and score {Score}")]
    private static partial void LogLeadCreated(
        ILogger logger,
        Guid leadId,
        Guid businessId,
        LeadStatus status,
        int score);

    [LoggerMessage(
        EventId = 7,
        Level = LogLevel.Information,
        Message = "Lead {LeadId} updated for business {BusinessId} - New status: {Status}, New score: {Score}")]
    private static partial void LogLeadUpdated(
        ILogger logger,
        Guid leadId,
        Guid businessId,
        LeadStatus status,
        int score);
}
