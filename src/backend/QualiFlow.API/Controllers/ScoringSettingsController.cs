// -----------------------------------------------------------------------
// <copyright file="ScoringSettingsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for managing business-specific lead scoring configuration.
/// Allows businesses to customize BANT weights, AI scoring settings, and qualification thresholds.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/scoring-settings")]
[Authorize]
public class ScoringSettingsController : ControllerBase
{
    private readonly IBusinessScoringConfigurationRepository _configRepository;
    private readonly IBusinessRepository _businessRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ScoringSettingsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ScoringSettingsController"/> class.
    /// </summary>
    public ScoringSettingsController(
        IBusinessScoringConfigurationRepository configRepository,
        IBusinessRepository businessRepository,
        ICurrentUserService currentUserService,
        ILogger<ScoringSettingsController> logger)
    {
        _configRepository = configRepository;
        _businessRepository = businessRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the current scoring configuration for the business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The business scoring configuration.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ScoringConfigurationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ScoringConfigurationResponse>> GetConfiguration(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        var business = await _businessRepository.GetByIdAsync(businessId.Value, cancellationToken);
        var config = await _configRepository.GetOrCreateDefaultAsync(businessId.Value, business?.Industry, cancellationToken);

        return Ok(MapToResponse(config));
    }

    /// <summary>
    /// Updates the scoring configuration for the business.
    /// </summary>
    /// <param name="request">The updated scoring configuration request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated scoring configuration.</returns>
    [HttpPut]
    [ProducesResponseType(typeof(ScoringConfigurationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ScoringConfigurationResponse>> UpdateConfiguration(
        [FromBody] UpdateScoringConfigurationRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        // Validate weights sum to 100
        var bantSum = request.BudgetWeight + request.AuthorityWeight + request.NeedWeight + request.TimelineWeight;
        if (bantSum != 100)
        {
            return BadRequest($"BANT weights must sum to 100 (current: {bantSum})");
        }

        var aiRulesSum = request.AIWeight + request.RulesWeight;
        if (aiRulesSum != 100)
        {
            return BadRequest($"AI and Rules weights must sum to 100 (current: {aiRulesSum})");
        }

        var business = await _businessRepository.GetByIdAsync(businessId.Value, cancellationToken);
        var config = await _configRepository.GetOrCreateDefaultAsync(businessId.Value, business?.Industry, cancellationToken);

        // Update configuration
        config.QualificationThreshold = request.QualificationThreshold;
        config.AIWeight = request.AIWeight;
        config.RulesWeight = request.RulesWeight;
        config.BudgetWeight = request.BudgetWeight;
        config.AuthorityWeight = request.AuthorityWeight;
        config.NeedWeight = request.NeedWeight;
        config.TimelineWeight = request.TimelineWeight;
        config.ContactedThreshold = request.ContactedThreshold;
        config.EngagedThreshold = request.EngagedThreshold;
        config.QualifiedThreshold = request.QualifiedThreshold;
        config.OpportunityThreshold = request.OpportunityThreshold;
        config.AutoTransitionStatus = request.AutoTransitionStatus;
        config.AIScoreEnabled = request.AIScoreEnabled;
        config.ScoreDecayDays = request.ScoreDecayDays;
        config.ScoreDecayPercentage = request.ScoreDecayPercentage;

        await _configRepository.UpdateAsync(config, cancellationToken);

        _logger.LogInformation("Updated scoring configuration for business {BusinessId}", businessId);

        return Ok(MapToResponse(config));
    }

    /// <summary>
    /// Resets the scoring configuration to industry defaults.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The reset configuration.</returns>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(ScoringConfigurationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ScoringConfigurationResponse>> ResetToDefaults(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        var business = await _businessRepository.GetByIdAsync(businessId.Value, cancellationToken);
        var existingConfig = await _configRepository.GetByBusinessIdAsync(businessId.Value, cancellationToken);

        if (existingConfig != null)
        {
            // Reset to defaults
            existingConfig.QualificationThreshold = 70;
            existingConfig.AIWeight = 60;
            existingConfig.RulesWeight = 40;
            existingConfig.BudgetWeight = 25;
            existingConfig.AuthorityWeight = 25;
            existingConfig.NeedWeight = 25;
            existingConfig.TimelineWeight = 25;
            existingConfig.ContactedThreshold = 20;
            existingConfig.EngagedThreshold = 40;
            existingConfig.QualifiedThreshold = 70;
            existingConfig.OpportunityThreshold = 85;
            existingConfig.AutoTransitionStatus = true;
            existingConfig.AIScoreEnabled = true;
            existingConfig.ScoreDecayDays = 14;
            existingConfig.ScoreDecayPercentage = 10;

            await _configRepository.UpdateAsync(existingConfig, cancellationToken);
            return Ok(MapToResponse(existingConfig));
        }

        var config = await _configRepository.GetOrCreateDefaultAsync(businessId.Value, business?.Industry, cancellationToken);
        return Ok(MapToResponse(config));
    }

    private static ScoringConfigurationResponse MapToResponse(BusinessScoringConfiguration config)
    {
        return new ScoringConfigurationResponse
        {
            Id = config.Id,
            QualificationThreshold = config.QualificationThreshold,
            AIWeight = config.AIWeight,
            RulesWeight = config.RulesWeight,
            BudgetWeight = config.BudgetWeight,
            AuthorityWeight = config.AuthorityWeight,
            NeedWeight = config.NeedWeight,
            TimelineWeight = config.TimelineWeight,
            ContactedThreshold = config.ContactedThreshold,
            EngagedThreshold = config.EngagedThreshold,
            QualifiedThreshold = config.QualifiedThreshold,
            OpportunityThreshold = config.OpportunityThreshold,
            AutoTransitionStatus = config.AutoTransitionStatus,
            AIScoreEnabled = config.AIScoreEnabled,
            ScoreDecayDays = config.ScoreDecayDays,
            ScoreDecayPercentage = config.ScoreDecayPercentage,
            IndustryTemplate = config.IndustryTemplate,
            UpdatedAt = config.UpdatedAt,
        };
    }
}

/// <summary>
/// Response model for scoring configuration.
/// </summary>
public record ScoringConfigurationResponse
{
    /// <summary>Gets the configuration ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the qualification threshold (0-100).</summary>
    public int QualificationThreshold { get; init; }

    /// <summary>Gets the AI scoring weight (0-100).</summary>
    public int AIWeight { get; init; }

    /// <summary>Gets the rules scoring weight (0-100).</summary>
    public int RulesWeight { get; init; }

    /// <summary>Gets the Budget BANT weight (0-100).</summary>
    public int BudgetWeight { get; init; }

    /// <summary>Gets the Authority BANT weight (0-100).</summary>
    public int AuthorityWeight { get; init; }

    /// <summary>Gets the Need BANT weight (0-100).</summary>
    public int NeedWeight { get; init; }

    /// <summary>Gets the Timeline BANT weight (0-100).</summary>
    public int TimelineWeight { get; init; }

    /// <summary>Gets the Contacted status threshold.</summary>
    public int ContactedThreshold { get; init; }

    /// <summary>Gets the Engaged status threshold.</summary>
    public int EngagedThreshold { get; init; }

    /// <summary>Gets the Qualified status threshold.</summary>
    public int QualifiedThreshold { get; init; }

    /// <summary>Gets the Opportunity status threshold.</summary>
    public int OpportunityThreshold { get; init; }

    /// <summary>Gets a value indicating whether auto status transition is enabled.</summary>
    public bool AutoTransitionStatus { get; init; }

    /// <summary>Gets a value indicating whether AI scoring is enabled.</summary>
    public bool AIScoreEnabled { get; init; }

    /// <summary>Gets the score decay days.</summary>
    public int ScoreDecayDays { get; init; }

    /// <summary>Gets the score decay percentage.</summary>
    public int ScoreDecayPercentage { get; init; }

    /// <summary>Gets the industry template name.</summary>
    public string? IndustryTemplate { get; init; }

    /// <summary>Gets when the configuration was last updated.</summary>
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request model for updating scoring configuration.
/// </summary>
public record UpdateScoringConfigurationRequest
{
    /// <summary>Gets the qualification threshold (0-100).</summary>
    public int QualificationThreshold { get; init; } = 70;

    /// <summary>Gets the AI scoring weight (0-100). Must sum to 100 with RulesWeight.</summary>
    public int AIWeight { get; init; } = 60;

    /// <summary>Gets the rules scoring weight (0-100). Must sum to 100 with AIWeight.</summary>
    public int RulesWeight { get; init; } = 40;

    /// <summary>Gets the Budget BANT weight (0-100). All BANT weights must sum to 100.</summary>
    public int BudgetWeight { get; init; } = 25;

    /// <summary>Gets the Authority BANT weight (0-100). All BANT weights must sum to 100.</summary>
    public int AuthorityWeight { get; init; } = 25;

    /// <summary>Gets the Need BANT weight (0-100). All BANT weights must sum to 100.</summary>
    public int NeedWeight { get; init; } = 25;

    /// <summary>Gets the Timeline BANT weight (0-100). All BANT weights must sum to 100.</summary>
    public int TimelineWeight { get; init; } = 25;

    /// <summary>Gets the Contacted status threshold.</summary>
    public int ContactedThreshold { get; init; } = 20;

    /// <summary>Gets the Engaged status threshold.</summary>
    public int EngagedThreshold { get; init; } = 40;

    /// <summary>Gets the Qualified status threshold.</summary>
    public int QualifiedThreshold { get; init; } = 70;

    /// <summary>Gets the Opportunity status threshold.</summary>
    public int OpportunityThreshold { get; init; } = 85;

    /// <summary>Gets a value indicating whether auto status transition is enabled.</summary>
    public bool AutoTransitionStatus { get; init; } = true;

    /// <summary>Gets a value indicating whether AI scoring is enabled.</summary>
    public bool AIScoreEnabled { get; init; } = true;

    /// <summary>Gets the score decay days (0 = disabled).</summary>
    public int ScoreDecayDays { get; init; } = 14;

    /// <summary>Gets the score decay percentage per period.</summary>
    public int ScoreDecayPercentage { get; init; } = 10;
}
