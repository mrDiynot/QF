// <copyright file="WorkflowTemplateSeeder.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Seeders;

/// <summary>
/// Seeds the 10 prebuilt workflow templates with subscription tier assignments.
/// </summary>
public class WorkflowTemplateSeeder
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<WorkflowTemplateSeeder> _logger;

    public WorkflowTemplateSeeder(QualiFlowDbContext context, ILogger<WorkflowTemplateSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds all workflow templates if they don't exist.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting workflow template seeding...");

        var templates = GetWorkflowTemplates();

        foreach (var template in templates)
        {
            var exists = await _context.WorkflowTemplates
                .AnyAsync(t => t.WorkflowId == template.WorkflowId, cancellationToken);

            if (!exists)
            {
                _context.WorkflowTemplates.Add(template);
                _logger.LogInformation("Added workflow template: {Name} ({WorkflowId})", template.Name, template.WorkflowId);
            }
        }

        var added = await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Workflow template seeding completed. {Count} templates added.", added);

        // Seed tier assignments
        await SeedTierAssignmentsAsync(cancellationToken);
    }

    private async Task SeedTierAssignmentsAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Seeding workflow tier assignments...");

        var templates = await _context.WorkflowTemplates.ToListAsync(cancellationToken);
        var plans = await _context.SubscriptionPlans.ToListAsync(cancellationToken);

        foreach (var template in templates)
        {
            var allowedTiers = GetAllowedTiersForWorkflow(template.WorkflowId);

            foreach (var tierName in allowedTiers)
            {
                var plan = plans.Find(p => p.Name.Replace(" ", string.Empty, StringComparison.Ordinal).Equals(tierName, StringComparison.OrdinalIgnoreCase)
                    || p.Name.Equals(tierName, StringComparison.OrdinalIgnoreCase));
                if (plan == null)
                {
                    continue;
                }

                var planTier = tierName switch
                {
                    "FreeFlow" => SubscriptionTier.FreeFlow,
                    "SmartFlow" => SubscriptionTier.SmartFlow,
                    "UltraFlow" => SubscriptionTier.UltraFlow,
                    "Enterprise" => SubscriptionTier.Enterprise,
                    _ => SubscriptionTier.FreeFlow
                };

                var exists = await _context.WorkflowPlanAssignments
                    .AnyAsync(a => a.WorkflowTemplateId == template.Id && a.SubscriptionPlanId == plan.Id, cancellationToken);

                if (!exists)
                {
                    _context.WorkflowPlanAssignments.Add(new WorkflowPlanAssignment
                    {
                        Id = Guid.NewGuid(),
                        WorkflowTemplateId = template.Id,
                        SubscriptionPlanId = plan.Id,
                        PlanTier = planTier,
                        MaxInstances = null, // Unlimited
                        IsActive = true,
                        IsIncluded = true,
                        AssignedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Workflow tier assignments seeding completed.");
    }

    private static string[] GetAllowedTiersForWorkflow(string workflowId)
    {
        return workflowId switch
        {
            // FreeFlow tier (view-only, no execution)
            "lead-qualification-workflow" => ["FreeFlow", "SmartFlow", "UltraFlow", "Enterprise"],
            "review-survey-workflow" => ["FreeFlow", "SmartFlow", "UltraFlow", "Enterprise"],

            // SmartFlow tier+
            "missed-call-recovery-workflow" => ["SmartFlow", "UltraFlow", "Enterprise"],
            "no-show-recovery-workflow" => ["SmartFlow", "UltraFlow", "Enterprise"],
            "cold-lead-revival-workflow" => ["SmartFlow", "UltraFlow", "Enterprise"],
            "retention-reengagement-workflow" => ["SmartFlow", "UltraFlow", "Enterprise"],

            // UltraFlow tier+
            "proposal-creation-workflow" => ["UltraFlow", "Enterprise"],
            "proposal-sending-workflow" => ["UltraFlow", "Enterprise"],
            "abandoned-form-recovery-workflow" => ["UltraFlow", "Enterprise"],
            "email-nurture-campaign-workflow" => ["UltraFlow", "Enterprise"],
            "follow-up-sequence-workflow" => ["UltraFlow", "Enterprise"],

            _ => ["Enterprise"]
        };
    }

    private static List<WorkflowTemplate> GetWorkflowTemplates()
    {
        return
        [

            // 1. Lead Qualification (FreeFlow - view only, SmartFlow+ can execute)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "lead-qualification-workflow",
                Name = "Lead Qualification → Booking",
                Description = "AI responds instantly, qualifies leads using BANT criteria, scores them, and books appointments automatically.",
                Category = WorkflowCategory.LeadQualification,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when a new lead is created",
                StepCount = 4,
                EstimatedTimeMinutes = 1440,
                Icon = "🎯",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.FreeFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 2. Email Nurture Campaign (SmartFlow+)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "email-nurture-campaign-workflow",
                Name = "Email Nurture Campaign",
                Description = "Automated email sequence to nurture leads over time with personalized content.",
                Category = WorkflowCategory.EmailNurture,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when lead status changes to Nurture",
                StepCount = 5,
                EstimatedTimeMinutes = 10080,
                Icon = "📧",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.SmartFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 3. Follow-Up Sequence (SmartFlow+)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "follow-up-sequence-workflow",
                Name = "Follow-Up Sequence",
                Description = "Automated follow-up emails based on lead score priority - high, medium, or low touch.",
                Category = WorkflowCategory.FollowUp,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when lead is qualified",
                StepCount = 4,
                EstimatedTimeMinutes = 10080,
                Icon = "📬",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.SmartFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // Placeholder templates for future implementation
            // These will show in UI but are "coming soon" until implemented

            // 4. Review + Survey (FreeFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "review-survey-workflow",
                Name = "Review + Survey Flow",
                Description = "After completed appointments, sends thank-you messages, review requests, and surveys.",
                Category = WorkflowCategory.Custom,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when an appointment is completed",
                StepCount = 5,
                EstimatedTimeMinutes = 4320,
                Icon = "⭐",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.FreeFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 5. Missed Call Recovery (SmartFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "missed-call-recovery-workflow",
                Name = "Missed Call Recovery",
                Description = "When a call is missed, AI sends SMS and email to recover the lead.",
                Category = WorkflowCategory.FollowUp,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when an inbound call is missed",
                StepCount = 4,
                EstimatedTimeMinutes = 180,
                Icon = "📞",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.SmartFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 6. No-Show Recovery (SmartFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "no-show-recovery-workflow",
                Name = "No-Show Recovery",
                Description = "Automatically re-engages customers who miss appointments and helps them rebook.",
                Category = WorkflowCategory.FollowUp,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when customer doesn't show up",
                StepCount = 5,
                EstimatedTimeMinutes = 1440,
                Icon = "🔄",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.SmartFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 7. Cold Lead Revival (UltraFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "cold-lead-revival-workflow",
                Name = "Cold Lead Revival",
                Description = "AI reactivates leads who stopped responding using smart timing and personalized messaging.",
                Category = WorkflowCategory.EmailNurture,
                TriggerType = WorkflowTriggerType.Scheduled,
                TriggerDescription = "Runs daily for leads inactive for 30+ days",
                StepCount = 6,
                EstimatedTimeMinutes = 20160,
                Icon = "⚡",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.UltraFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 8. Retention & Re-engagement (UltraFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "retention-reengagement-workflow",
                Name = "Retention & Re-Engagement",
                Description = "AI targets inactive customers with personalized offers to bring them back.",
                Category = WorkflowCategory.EmailNurture,
                TriggerType = WorkflowTriggerType.Scheduled,
                TriggerDescription = "Runs weekly for customers inactive for 60+ days",
                StepCount = 5,
                EstimatedTimeMinutes = 30240,
                Icon = "👥",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.UltraFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 9. Proposal Workflow (UltraFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "proposal-workflow",
                Name = "Proposal Creation + Sending",
                Description = "AI creates proposals, tracks views, and handles acceptance/rejection automatically.",
                Category = WorkflowCategory.Custom,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when lead requests a proposal",
                StepCount = 6,
                EstimatedTimeMinutes = 10080,
                Icon = "📄",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.UltraFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            },

            // 10. Abandoned Form Recovery (UltraFlow - coming soon)
            new WorkflowTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowId = "abandoned-form-recovery-workflow",
                Name = "Abandoned Form Recovery",
                Description = "When someone starts but doesn't submit a form, AI follows up instantly to recover them.",
                Category = WorkflowCategory.FollowUp,
                TriggerType = WorkflowTriggerType.Event,
                TriggerDescription = "Triggered when form is abandoned after 5 minutes",
                StepCount = 4,
                EstimatedTimeMinutes = 1440,
                Icon = "✅",
                IsActive = true,
                IsPrebuilt = true,
                RequiredTier = SubscriptionTier.UltraFlow,
                Version = 1,
                CreatedAt = DateTime.UtcNow
            }
        ];
    }
}
