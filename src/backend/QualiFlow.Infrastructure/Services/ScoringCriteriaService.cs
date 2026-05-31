// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using AutoMapper;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ScoringCriteria.DTOs;
using QualiFlow.Application.Features.ScoringCriteria.Services;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for scoring criteria operations.
/// </summary>
public sealed partial class ScoringCriteriaService : IScoringCriteriaService
{
    private readonly IScoringCriteriaRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ILogger<ScoringCriteriaService> _logger;

    /// <summary>Initializes a new instance of the <see cref="ScoringCriteriaService"/> class.</summary>
    /// <param name="repository">The scoring criteria repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="logger">The logger instance.</param>
    public ScoringCriteriaService(
        IScoringCriteriaRepository repository,
        ICurrentUserService currentUserService,
        IMapper mapper,
        ILogger<ScoringCriteriaService> logger)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ScoringCriteriaListResponse> GetAllAsync(
        bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var criteria = includeInactive
            ? await _repository.GetAllByBusinessIdAsync(businessId, cancellationToken)
            : await _repository.GetByBusinessIdAsync(businessId, cancellationToken);

        var responses = _mapper.Map<List<ScoringCriteriaResponse>>(criteria);
        var totalWeight = criteria.Where(c => c.IsActive).Sum(c => c.Weight);

        return new ScoringCriteriaListResponse
        {
            Criteria = responses,
            TotalWeight = totalWeight,
            IsWeightValid = totalWeight == 100,
            ActiveCount = criteria.Count(c => c.IsActive),
            TotalCount = criteria.Count,
        };
    }

    /// <inheritdoc />
    public async Task<ScoringCriteriaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var criteria = await _repository.GetByIdAsync(id, cancellationToken);
        if (criteria == null)
        {
            return null;
        }

        // Verify business ownership
        var businessId = _currentUserService.GetBusinessId();
        if (criteria.BusinessId != businessId)
        {
            LogUnauthorizedAccess(id, businessId);
            return null;
        }

        return _mapper.Map<ScoringCriteriaResponse>(criteria);
    }

    /// <inheritdoc />
    public async Task<ScoringCriteriaResponse> CreateAsync(
        CreateScoringCriteriaRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Check for duplicate name
        var existing = await _repository.GetByNameAsync(businessId, request.Name, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"A scoring criterion with name '{request.Name}' already exists.");
        }

        var criteria = _mapper.Map<Domain.Entities.ScoringCriteria>(request);
        criteria.BusinessId = businessId;

        var created = await _repository.CreateAsync(criteria, cancellationToken);

        LogCriteriaCreated(created.Id, created.Name, businessId);

        return _mapper.Map<ScoringCriteriaResponse>(created);
    }

    /// <inheritdoc />
    public async Task<ScoringCriteriaResponse?> UpdateAsync(
        Guid id,
        UpdateScoringCriteriaRequest request,
        CancellationToken cancellationToken = default)
    {
        var criteria = await _repository.GetByIdAsync(id, cancellationToken);
        if (criteria == null)
        {
            return null;
        }

        // Verify business ownership
        var businessId = _currentUserService.GetBusinessId();
        if (criteria.BusinessId != businessId)
        {
            LogUnauthorizedUpdate(id, businessId);
            return null;
        }

        // Check for duplicate name if name is being changed
        if (!string.IsNullOrEmpty(request.Name) && !string.Equals(request.Name, criteria.Name, StringComparison.Ordinal))
        {
            var existing = await _repository.GetByNameAsync(businessId, request.Name, cancellationToken);
            if (existing != null && existing.Id != id)
            {
                throw new InvalidOperationException($"A scoring criterion with name '{request.Name}' already exists.");
            }
        }

        // Apply updates
        ApplyUpdates(criteria, request);

        var updated = await _repository.UpdateAsync(criteria, cancellationToken);

        LogCriteriaUpdated(id, businessId);

        return _mapper.Map<ScoringCriteriaResponse>(updated);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var criteria = await _repository.GetByIdAsync(id, cancellationToken);
        if (criteria == null)
        {
            return false;
        }

        // Verify business ownership
        var businessId = _currentUserService.GetBusinessId();
        if (criteria.BusinessId != businessId)
        {
            LogUnauthorizedDelete(id, businessId);
            return false;
        }

        await _repository.DeleteAsync(id, cancellationToken);

        LogCriteriaDeleted(id, businessId);

        return true;
    }

    /// <inheritdoc />
    public async Task InitializeDefaultCriteriaAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        // Check if criteria already exist
        var existing = await _repository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        if (existing.Count > 0)
        {
            LogCriteriaAlreadyExist(businessId);
            return;
        }

        // Create default BANT criteria
        var defaultCriteria = GetDefaultBantCriteria(businessId);

        foreach (var criteria in defaultCriteria)
        {
            await _repository.CreateAsync(criteria, cancellationToken);
        }

        LogDefaultCriteriaInitialized(defaultCriteria.Count, businessId);
    }

    /// <inheritdoc />
    public Task<bool> ValidateWeightsAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        return _repository.ValidateWeightsSumAsync(businessId, null, cancellationToken);
    }

    private static void ApplyUpdates(Domain.Entities.ScoringCriteria criteria, UpdateScoringCriteriaRequest request)
    {
        if (!string.IsNullOrEmpty(request.Name))
        {
            criteria.Name = request.Name;
        }

        if (request.Description != null)
        {
            criteria.Description = request.Description;
        }

        if (request.Weight.HasValue)
        {
            criteria.Weight = request.Weight.Value;
        }

        if (request.ExtractionHint != null)
        {
            criteria.ExtractionHint = request.ExtractionHint;
        }

        if (request.IsActive.HasValue)
        {
            criteria.IsActive = request.IsActive.Value;
        }

        if (request.DisplayOrder.HasValue)
        {
            criteria.DisplayOrder = request.DisplayOrder.Value;
        }

        if (request.MinimumScore.HasValue)
        {
            criteria.MinimumScore = request.MinimumScore.Value;
        }

        if (!string.IsNullOrEmpty(request.Category))
        {
            criteria.Category = request.Category;
        }

        if (request.AiQuestions != null)
        {
            criteria.AiQuestions = request.AiQuestions;
        }
    }

    private static List<Domain.Entities.ScoringCriteria> GetDefaultBantCriteria(Guid businessId)
    {
        return
        [
            new Domain.Entities.ScoringCriteria
            {
                BusinessId = businessId,
                Name = "Budget",
                Description = "Does the lead have the budget to purchase?",
                Weight = 25,
                Category = "BANT",
                DisplayOrder = 1,
                IsActive = true,
                ExtractionHint = "Look for mentions of budget, pricing, cost concerns, or financial capacity.",
                AiQuestions = "What is your budget for this project? Have you allocated funds for this solution?",
            },
            new Domain.Entities.ScoringCriteria
            {
                BusinessId = businessId,
                Name = "Authority",
                Description = "Is the lead a decision maker or influencer?",
                Weight = 25,
                Category = "BANT",
                DisplayOrder = 2,
                IsActive = true,
                ExtractionHint = "Identify job title, role in decision-making, and stakeholder involvement.",
                AiQuestions = "Who else is involved in this decision? What is your role in the purchasing process?",
            },
            new Domain.Entities.ScoringCriteria
            {
                BusinessId = businessId,
                Name = "Need",
                Description = "Does the lead have a genuine need for the product/service?",
                Weight = 25,
                Category = "BANT",
                DisplayOrder = 3,
                IsActive = true,
                ExtractionHint = "Identify pain points, challenges, requirements, and use cases.",
                AiQuestions = "What challenges are you trying to solve? What would an ideal solution look like?",
            },
            new Domain.Entities.ScoringCriteria
            {
                BusinessId = businessId,
                Name = "Timeline",
                Description = "When does the lead plan to make a decision or implement?",
                Weight = 25,
                Category = "BANT",
                DisplayOrder = 4,
                IsActive = true,
                ExtractionHint = "Look for urgency indicators, deadlines, and implementation timeframes.",
                AiQuestions = "When are you looking to implement a solution? Is there a specific deadline?",
            },
        ];
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized access attempt to scoring criteria {CriteriaId} by business {BusinessId}")]
    private partial void LogUnauthorizedAccess(Guid criteriaId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized update attempt to scoring criteria {CriteriaId} by business {BusinessId}")]
    private partial void LogUnauthorizedUpdate(Guid criteriaId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized delete attempt to scoring criteria {CriteriaId} by business {BusinessId}")]
    private partial void LogUnauthorizedDelete(Guid criteriaId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created scoring criteria {CriteriaId} '{Name}' for business {BusinessId}")]
    private partial void LogCriteriaCreated(Guid criteriaId, string name, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated scoring criteria {CriteriaId} for business {BusinessId}")]
    private partial void LogCriteriaUpdated(Guid criteriaId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleted scoring criteria {CriteriaId} for business {BusinessId}")]
    private partial void LogCriteriaDeleted(Guid criteriaId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Scoring criteria already exist for business {BusinessId}")]
    private partial void LogCriteriaAlreadyExist(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Initialized {Count} default BANT criteria for business {BusinessId}")]
    private partial void LogDefaultCriteriaInitialized(int count, Guid businessId);
}
