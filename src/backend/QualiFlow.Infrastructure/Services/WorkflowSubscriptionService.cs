// <copyright file="WorkflowSubscriptionService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Workflows.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for enforcing workflow subscription restrictions.
/// </summary>
public class WorkflowSubscriptionService : IWorkflowSubscriptionService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<WorkflowSubscriptionService> _logger;

    // Workflow tier mappings - aligned with Figma specification
    // All paid tiers (SmartFlow+) get access to ALL 10 workflows
    // FreeFlow can only VIEW workflows, not execute them
    private static readonly Dictionary<string, SubscriptionTier> WorkflowTierRequirements = new()
    {
        // All 10 workflows available from SmartFlow tier
        // FreeFlow tier can view all but execute none
        ["lead-qualification-workflow"] = SubscriptionTier.SmartFlow,
        ["review-survey-workflow"] = SubscriptionTier.SmartFlow,
        ["email-nurture-campaign-workflow"] = SubscriptionTier.SmartFlow,
        ["follow-up-sequence-workflow"] = SubscriptionTier.SmartFlow,
        ["missed-call-recovery-workflow"] = SubscriptionTier.SmartFlow,
        ["no-show-recovery-workflow"] = SubscriptionTier.SmartFlow,
        ["cold-lead-revival-workflow"] = SubscriptionTier.SmartFlow,
        ["retention-reengagement-workflow"] = SubscriptionTier.SmartFlow,
        ["proposal-workflow"] = SubscriptionTier.SmartFlow,
        ["abandoned-form-recovery-workflow"] = SubscriptionTier.SmartFlow,
    };

    public WorkflowSubscriptionService(
        QualiFlowDbContext context,
        ILogger<WorkflowSubscriptionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<bool> CanActivateWorkflowAsync(
        Guid businessId,
        string workflowId,
        CancellationToken cancellationToken = default)
    {
        var businessTier = await GetBusinessTierAsync(businessId, cancellationToken);
        var requiredTier = await GetRequiredTierAsync(workflowId, cancellationToken);

        // Check if business tier meets or exceeds required tier
        var canActivate = TierMeetsRequirement(businessTier, requiredTier);

        _logger.LogInformation(
            "Workflow activation check for business {BusinessId}: workflow={WorkflowId}, businessTier={BusinessTier}, requiredTier={RequiredTier}, canActivate={CanActivate}",
            businessId, workflowId, businessTier, requiredTier, canActivate);

        return canActivate;
    }

    /// <inheritdoc/>
    public async Task<bool> CanExecuteWorkflowAsync(
        Guid businessId,
        string workflowId,
        CancellationToken cancellationToken = default)
    {
        var businessTier = await GetBusinessTierAsync(businessId, cancellationToken);

        // FreeFlow tier can only view workflows, not execute them
        if (businessTier == SubscriptionTier.FreeFlow)
        {
            _logger.LogInformation(
                "Workflow execution blocked for business {BusinessId}: FreeFlow tier cannot execute workflows",
                businessId);
            return false;
        }

        // Check if the workflow is available for the business's tier
        return await CanActivateWorkflowAsync(businessId, workflowId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<string>> GetAvailableWorkflowsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var businessTier = await GetBusinessTierAsync(businessId, cancellationToken);

        // FreeFlow can VIEW all workflows in the gallery (but not execute)
        // All paid tiers can both view and execute all 10 workflows
        var availableWorkflows = WorkflowTierRequirements.Keys.ToList();

        _logger.LogDebug(
            "Available workflows for business {BusinessId} (tier={Tier}): {Count} workflows (all viewable)",
            businessId, businessTier, availableWorkflows.Count);

        return availableWorkflows;
    }

    /// <inheritdoc/>
    public Task<SubscriptionTier> GetRequiredTierAsync(
        string workflowId,
        CancellationToken cancellationToken = default)
    {
        if (WorkflowTierRequirements.TryGetValue(workflowId, out var tier))
        {
            return Task.FromResult(tier);
        }

        // Unknown workflows require Enterprise tier
        return Task.FromResult(SubscriptionTier.Enterprise);
    }

    /// <inheritdoc/>
    public async Task<bool> HasReachedWorkflowLimitAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var businessTier = await GetBusinessTierAsync(businessId, cancellationToken);

        // All paid tiers have unlimited workflow instances
        if (businessTier != SubscriptionTier.FreeFlow)
        {
            return false;
        }

        // FreeFlow: check if they've activated any workflows (limit: 0 active instances)
        var activeWorkflowCount = await _context.BusinessWorkflows
            .CountAsync(bw => bw.BusinessId == businessId && bw.IsActive, cancellationToken);

        // FreeFlow can view but not activate any workflows
        return activeWorkflowCount > 0;
    }

    /// <inheritdoc/>
    public async Task<WorkflowUsageStats> GetWorkflowUsageAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var businessTier = await GetBusinessTierAsync(businessId, cancellationToken);

        var activeWorkflows = await _context.BusinessWorkflows
            .CountAsync(bw => bw.BusinessId == businessId && bw.IsActive, cancellationToken);

        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthlyExecutions = await _context.WorkflowExecutions
            .CountAsync(we => we.BusinessId == businessId && we.StartedAt >= startOfMonth, cancellationToken);

        // Per Figma spec: All tiers can view ALL 10 workflows
        const int availableWorkflowCount = 10;

        return new WorkflowUsageStats
        {
            CurrentTier = businessTier,
            AvailableWorkflows = availableWorkflowCount,
            ActiveWorkflows = activeWorkflows,
            MonthlyExecutions = monthlyExecutions,
            MaxInstances = null, // All paid tiers have unlimited
            CanCreateCustomWorkflows = businessTier == SubscriptionTier.Enterprise,
            HasVisualBuilder = businessTier == SubscriptionTier.Enterprise,
        };
    }

    private async Task<SubscriptionTier> GetBusinessTierAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .Where(s => s.BusinessId == businessId && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (subscription?.Plan == null)
        {
            return SubscriptionTier.FreeFlow;
        }

        // Parse tier from plan name
        var planName = subscription.Plan.Name.Replace(" ", string.Empty, StringComparison.Ordinal);
        return planName switch
        {
            "FreeFlow" => SubscriptionTier.FreeFlow,
            "SmartFlow" => SubscriptionTier.SmartFlow,
            "UltraFlow" => SubscriptionTier.UltraFlow,
            "Enterprise" => SubscriptionTier.Enterprise,
            _ => SubscriptionTier.FreeFlow
        };
    }

    private static bool TierMeetsRequirement(SubscriptionTier businessTier, SubscriptionTier requiredTier)
    {
        // Tier hierarchy: FreeFlow < SmartFlow < UltraFlow < Enterprise
        return (int)businessTier >= (int)requiredTier;
    }
}
