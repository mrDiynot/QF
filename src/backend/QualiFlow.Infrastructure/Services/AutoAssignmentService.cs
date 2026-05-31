// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.AutoAssignment.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for applying auto-assignment rules to leads.
/// </summary>
public partial class AutoAssignmentService : IAutoAssignmentService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AutoAssignmentService> _logger;

    // Track round-robin state per rule (in production, use Redis for distributed state)
    private static readonly Dictionary<Guid, int> RoundRobinState = [];
    private static readonly Lock RoundRobinLock = new();

    public AutoAssignmentService(
        QualiFlowDbContext context,
        ILogger<AutoAssignmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<AutoAssignmentResult> ApplyRulesAsync(
        Guid businessId,
        Guid leadId,
        string channel,
        int leadScore,
        CancellationToken cancellationToken = default)
    {
        LogApplyingRules(_logger, leadId, businessId, channel, leadScore);

        // Get active rules ordered by priority
        var rules = await _context.Set<AutoAssignmentRule>()
            .AsNoTracking()
            .Where(r => r.BusinessId == businessId && r.IsActive && r.DeletedAt == null)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);

        if (rules.Count == 0)
        {
            LogNoRulesFound(_logger, businessId);
            return AutoAssignmentResult.NotAssigned("No active auto-assignment rules configured");
        }

        // Find matching rule
        var matchingRule = rules.Find(r => RuleMatches(r, channel, leadScore));
        if (matchingRule == null)
        {
            LogNoMatchingRule(_logger, leadId, channel, leadScore);
            return AutoAssignmentResult.NotAssigned("No matching rule found for lead criteria");
        }

        // Get user to assign
        var assignedUserId = await GetUserToAssignAsync(matchingRule, businessId, cancellationToken);
        if (assignedUserId == null)
        {
            LogNoUserToAssign(_logger, matchingRule.Name);
            return AutoAssignmentResult.NotAssigned($"No available user for rule '{matchingRule.Name}'");
        }

        // Update the lead with assignment
        var lead = await _context.Leads.FindAsync(new object[] { leadId }, cancellationToken);
        if (lead != null)
        {
            lead.AssignedToUserId = assignedUserId;
            lead.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            LogLeadAssigned(_logger, leadId, assignedUserId.Value, matchingRule.Name);
        }

        return AutoAssignmentResult.Assigned(assignedUserId.Value, matchingRule.Name, matchingRule.AssignmentType);
    }

    private static bool RuleMatches(AutoAssignmentRule rule, string channel, int leadScore)
    {
        // Check channel filter (null means all channels)
        if (!string.IsNullOrEmpty(rule.Channel) &&
            !rule.Channel.Equals(channel, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // Check score range
        if (rule.MinLeadScore.HasValue && leadScore < rule.MinLeadScore.Value)
        {
            return false;
        }

        if (rule.MaxLeadScore.HasValue && leadScore > rule.MaxLeadScore.Value)
        {
            return false;
        }

        return true;
    }

    private async Task<Guid?> GetUserToAssignAsync(
        AutoAssignmentRule rule,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        return rule.AssignmentType.ToLowerInvariant() switch
        {
            "specific_user" => rule.AssignToUserId,
            "round_robin" => await GetRoundRobinUserAsync(rule.Id, businessId, cancellationToken),
            "least_busy" => await GetLeastBusyUserAsync(businessId, cancellationToken),
            _ => await GetRoundRobinUserAsync(rule.Id, businessId, cancellationToken),
        };
    }

    private async Task<Guid?> GetRoundRobinUserAsync(Guid ruleId, Guid businessId, CancellationToken cancellationToken)
    {
        var users = await GetActiveUsersAsync(businessId, cancellationToken);
        if (users.Count == 0)
        {
            return null;
        }

        lock (RoundRobinLock)
        {
            RoundRobinState.TryGetValue(ruleId, out var currentIndex);
            var nextIndex = currentIndex % users.Count;
            RoundRobinState[ruleId] = nextIndex + 1;
            return users[nextIndex];
        }
    }

    private async Task<Guid?> GetLeastBusyUserAsync(Guid businessId, CancellationToken cancellationToken)
    {
        // Get user with fewest assigned leads in New/Contacted status
        var leastBusyUser = await _context.Leads
            .Where(l => l.BusinessId == businessId && l.AssignedToUserId != null &&
                       (l.Status == LeadStatus.New || l.Status == LeadStatus.Contacted))
            .GroupBy(l => l.AssignedToUserId)
            .OrderBy(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync(cancellationToken);

        if (leastBusyUser != null)
        {
            return leastBusyUser;
        }

        // Fallback to any active user
        var users = await GetActiveUsersAsync(businessId, cancellationToken);
        return users.Count > 0 ? users[0] : null;
    }

    private async Task<List<Guid>> GetActiveUsersAsync(Guid businessId, CancellationToken cancellationToken)
    {
        // Users are stored in AspNetUsers table with BusinessId for multi-tenancy
        return await _context.Users
            .Where(u => u.BusinessId == businessId && u.IsActive)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Applying auto-assignment rules to lead {LeadId} for business {BusinessId}. Channel: {Channel}, Score: {Score}")]
    private static partial void LogApplyingRules(ILogger logger, Guid leadId, Guid businessId, string channel, int score);

    [LoggerMessage(Level = LogLevel.Debug, Message = "No active auto-assignment rules found for business {BusinessId}")]
    private static partial void LogNoRulesFound(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "No matching auto-assignment rule for lead {LeadId}. Channel: {Channel}, Score: {Score}")]
    private static partial void LogNoMatchingRule(ILogger logger, Guid leadId, string channel, int score);

    [LoggerMessage(Level = LogLevel.Warning, Message = "No available user to assign for rule '{RuleName}'")]
    private static partial void LogNoUserToAssign(ILogger logger, string ruleName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Lead {LeadId} assigned to user {UserId} by rule '{RuleName}'")]
    private static partial void LogLeadAssigned(ILogger logger, Guid leadId, Guid userId, string ruleName);
}

