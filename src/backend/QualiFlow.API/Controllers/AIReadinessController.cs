// <copyright file="AIReadinessController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

#pragma warning disable SA1503 // Braces should not be omitted
#pragma warning disable CA1002 // Do not expose generic lists
#pragma warning disable MA0016 // Prefer collection abstraction

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/ai-readiness")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class AIReadinessController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public AIReadinessController(QualiFlowDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet("checklist")]
    [CacheControl(CacheStrategies.NoCache)]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    public async Task<ActionResult<AIReadinessResponse>> GetChecklistAsync(CancellationToken ct)
    {
        var businessId = _currentUserService.GetBusinessId();

        var business = await _dbContext.Businesses
            .AsNoTracking()
            .Include(b => b.OnboardingProgress)
            .Include(b => b.AIConfiguration)
            .FirstOrDefaultAsync(b => b.Id == businessId && b.DeletedAt == null, ct);

        if (business == null)
        {
            return NotFound("Business not found");
        }

        var hasPhone = await _dbContext.Channels
            .AnyAsync(c => c.BusinessId == businessId && c.DeletedAt == null && c.IsActive && c.PhoneNumber != null, ct);

        var leadsCount = await _dbContext.Leads
            .CountAsync(l => l.BusinessId == businessId && l.DeletedAt == null, ct);

        var formsCount = await _dbContext.Forms
            .CountAsync(f => f.BusinessId == businessId && f.DeletedAt == null, ct);

        // Check Channels table for ChatWidget type (used by Web Chat Builder)
        var hasWebChatChannel = await _dbContext.Channels
            .AnyAsync(c => c.BusinessId == businessId && c.DeletedAt == null && c.IsActive && c.Type == ChannelType.ChatWidget, ct);

        var kbCount = await _dbContext.KnowledgeBaseArticles
            .CountAsync(k => k.BusinessId == businessId && k.DeletedAt == null, ct);

        var qrCount = await _dbContext.QuickReplies
            .CountAsync(q => q.BusinessId == businessId && q.DeletedAt == null, ct);

        var subscription = await _dbContext.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Status == SubscriptionStatus.Active, ct);

        var channels = await _dbContext.Channels
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null && c.IsActive)
            .Select(c => c.Type.ToString())
            .ToListAsync(ct);

        var onboarding = business.OnboardingProgress;
        var aiConfig = business.AIConfiguration;
        var tier = subscription?.Plan?.Name ?? "FreeFlow";
        var isPaid = !tier.Equals("freeflow", StringComparison.OrdinalIgnoreCase);

        // Check BOTH tracking flags AND actual data values for robust detection
        // This ensures existing users with data but without tracking flags still see correct status
        var bantConfigured = (aiConfig?.IsBantWeightsConfigured ?? false)
            || (!string.IsNullOrEmpty(aiConfig?.ScoringWeights) && aiConfig.ScoringWeights != "{\"budget\":25,\"timeline\":25,\"authority\":25,\"need\":25}");
        var thresholdConfigured = (aiConfig?.IsQualificationThresholdConfigured ?? false)
            || (aiConfig?.QualificationThreshold != null && aiConfig.QualificationThreshold != 70);
        var personaConfigured = (aiConfig?.IsPersonaConfigured ?? false)
            || !string.IsNullOrEmpty(aiConfig?.Persona)
            || !string.IsNullOrEmpty(aiConfig?.AITone);
        var autoResponseEnabled = aiConfig?.IsAutoResponseEnabled ?? false;

        // AI Tone is configured if EITHER:
        // 1. OnboardingProgress.AITone is set (from onboarding wizard)
        // 2. AIConfiguration.AITone is set (from settings page)
        // 3. AIConfiguration.Persona is set (alternative way of configuring)
        var aiToneIsConfigured = !string.IsNullOrEmpty(onboarding?.AITone)
            || !string.IsNullOrEmpty(aiConfig?.AITone)
            || !string.IsNullOrEmpty(aiConfig?.Persona);

        return Ok(new AIReadinessResponse
        {
            BusinessId = businessId.ToString(),
            BusinessName = business.Name,
            OnboardingComplete = onboarding?.CompletedAt != null,
            OnboardingStep = onboarding?.CurrentStep ?? 1,
            Industry = onboarding?.Industry ?? business.Industry,
            PrimaryGoal = onboarding?.MainObjective,
            AiToneConfigured = aiToneIsConfigured,
            ActiveChannels = channels,
            HasPhoneNumber = hasPhone,
            HasWebChat = hasWebChatChannel,
            HasForms = formsCount > 0,
            BantWeightsConfigured = bantConfigured,
            QualificationThresholdSet = thresholdConfigured,
            AiPersonaSelected = personaConfigured,
            AutoResponseEnabled = autoResponseEnabled,
            BusinessInfoComplete = !string.IsNullOrEmpty(business.Name) && !string.IsNullOrEmpty(business.Industry),
            KnowledgeBasePopulated = kbCount > 0,
            QuickRepliesConfigured = qrCount > 0,
            LeadCount = leadsCount,
            LeadSourcesTracked = leadsCount > 0,
            SubscriptionTier = tier,
            SubscriptionPlanName = subscription?.Plan?.DisplayName ?? subscription?.Plan?.Name ?? "Free Flow",
            AiInteractionsRemaining = isPaid ? 2000 : 50,
            AiInteractionsLimit = isPaid ? 2000 : 50,
        });
    }

    [HttpGet("quick-score")]
    [CacheControl(CacheStrategies.NoCache)]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    public async Task<ActionResult<QuickScoreResponse>> GetQuickScoreAsync(CancellationToken ct)
    {
        var businessId = _currentUserService.GetBusinessId();

        var business = await _dbContext.Businesses
            .AsNoTracking()
            .Include(b => b.OnboardingProgress)
            .FirstOrDefaultAsync(b => b.Id == businessId && b.DeletedAt == null, ct);

        if (business == null)
        {
            return NotFound("Business not found");
        }

        var channelCount = await _dbContext.Channels
            .CountAsync(c => c.BusinessId == businessId && c.DeletedAt == null && c.IsActive, ct);

        var subscription = await _dbContext.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Status == SubscriptionStatus.Active, ct);

        var onboarding = business.OnboardingProgress;
        var complete = onboarding?.CompletedAt != null;
        var hasChannels = channelCount > 0;
        var tier = subscription?.Plan?.Name ?? "FreeFlow";
        var isPaid = !tier.Equals("freeflow", StringComparison.OrdinalIgnoreCase);

        var score = 0;
        if (complete)
        {
            score += 30;
        }

        if (hasChannels)
        {
            score += 25;
        }

        if (!string.IsNullOrEmpty(onboarding?.Industry ?? business.Industry))
        {
            score += 10;
        }

        score += 15;

        if (isPaid)
        {
            score += 20;
        }

        string? next = null;
        if (!complete)
        {
            next = "Complete onboarding wizard";
        }
        else if (!hasChannels)
        {
            next = "Activate at least one channel";
        }
        else if (!isPaid)
        {
            next = "Upgrade to a paid plan";
        }

        return Ok(new QuickScoreResponse { Score = score, IsReady = score >= 70, NextAction = next });
    }
}

public record AIReadinessResponse
{
    public required string BusinessId { get; init; }
    public required string BusinessName { get; init; }
    public bool OnboardingComplete { get; init; }
    public int OnboardingStep { get; init; }
    public string? Industry { get; init; }

    /// <summary>
    /// Gets the primary business goal (MainObjective from onboarding).
    /// </summary>
    public string? PrimaryGoal { get; init; }
    public bool AiToneConfigured { get; init; }
    public List<string> ActiveChannels { get; init; } = [];
    public bool HasPhoneNumber { get; init; }
    public bool HasWebChat { get; init; }
    public bool HasForms { get; init; }
    public bool BantWeightsConfigured { get; init; }
    public bool QualificationThresholdSet { get; init; }
    public bool AiPersonaSelected { get; init; }
    public bool AutoResponseEnabled { get; init; }
    public bool BusinessInfoComplete { get; init; }
    public bool KnowledgeBasePopulated { get; init; }
    public bool QuickRepliesConfigured { get; init; }
    public int LeadCount { get; init; }
    public bool LeadSourcesTracked { get; init; }
    public required string SubscriptionTier { get; init; }
    public string SubscriptionPlanName { get; init; } = "Free Flow";
    public int AiInteractionsRemaining { get; init; }
    public int AiInteractionsLimit { get; init; }
}

public record QuickScoreResponse
{
    public int Score { get; init; }
    public bool IsReady { get; init; }
    public string? NextAction { get; init; }
}
