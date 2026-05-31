using Microsoft.EntityFrameworkCore;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Seeds;

/// <summary>
/// Seeder for pre-built workflow templates.
/// </summary>
public static class WorkflowSeeder
{
    /// <summary>
    /// Seeds the database with 10 pre-built workflow templates.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="adminUserId">Admin user ID for created by field.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public static async Task SeedWorkflowTemplatesAsync(QualiFlowDbContext context, Guid adminUserId)
    {
        // Check if templates already exist
        if (await context.WorkflowTemplates.AnyAsync())
        {
            return;
        }

        var templates = new List<WorkflowTemplate>
        {
            // 1. Lead Qualification Workflow
            new()
            {
                Name = "Lead Qualification",
                Description = "Automatically qualify leads based on BANT criteria and engagement score",
                Category = WorkflowCategory.LeadQualification,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "LeadCreated", conditions = new { minScore = 0 } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "CheckBANT", description = "Evaluate Budget, Authority, Need, Timeline" },
                    new { step = 2, action = "CalculateScore", description = "Calculate lead qualification score" },
                    new { step = 3, action = "AssignToSales", description = "Assign qualified leads to sales team", condition = "score >= 70" },
                    new { step = 4, action = "SendNotification", description = "Notify sales rep of new qualified lead" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "minScore", "assignmentRules", "notificationTemplate" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 2. Missed Call Follow-up
            new()
            {
                Name = "Missed Call Follow-up",
                Description = "Automatically follow up with leads who missed calls via SMS and email",
                Category = WorkflowCategory.FollowUp,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "CallMissed", conditions = new { } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "Wait", description = "Wait 5 minutes", duration = "5m" },
                    new { step = 2, action = "SendSMS", description = "Send SMS: 'Sorry we missed your call. When's a good time to reach you?'" },
                    new { step = 3, action = "Wait", description = "Wait 2 hours", duration = "2h" },
                    new { step = 4, action = "SendEmail", description = "Send follow-up email with booking link", condition = "noResponse" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "smsTemplate", "emailTemplate", "waitDuration" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 3. No-Show Recovery
            new()
            {
                Name = "No-Show Recovery",
                Description = "Re-engage leads who missed scheduled appointments",
                Category = WorkflowCategory.FollowUp,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "AppointmentNoShow", conditions = new { } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "Wait", description = "Wait 30 minutes after appointment time", duration = "30m" },
                    new { step = 2, action = "SendSMS", description = "Send SMS: 'We missed you today. Can we reschedule?'" },
                    new { step = 3, action = "Wait", description = "Wait 4 hours", duration = "4h" },
                    new { step = 4, action = "SendEmail", description = "Send email with easy reschedule link", condition = "noResponse" },
                    new { step = 5, action = "UpdateLeadStatus", description = "Mark as 'No-Show - Follow-up Sent'" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "smsTemplate", "emailTemplate", "rescheduleLink" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 4. Review & Survey Request
            new()
            {
                Name = "Review & Survey Request",
                Description = "Request reviews and feedback from satisfied customers",
                Category = WorkflowCategory.Custom,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "DealClosed", conditions = new { status = "Won" } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "Wait", description = "Wait 3 days after deal closed", duration = "3d" },
                    new { step = 2, action = "SendEmail", description = "Send satisfaction survey email" },
                    new { step = 3, action = "Wait", description = "Wait for response", duration = "2d" },
                    new { step = 4, action = "CheckScore", description = "Check NPS score", condition = "surveyCompleted" },
                    new { step = 5, action = "SendReviewRequest", description = "Request Google/Yelp review", condition = "score >= 8" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "surveyLink", "reviewPlatforms", "minScoreForReview" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 5. Cold Lead Revival
            new()
            {
                Name = "Cold Lead Revival",
                Description = "Re-engage leads that have gone cold with targeted campaigns",
                Category = WorkflowCategory.EmailNurture,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "LeadInactive", conditions = new { daysSinceLastContact = 30 } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "SendEmail", description = "Send re-engagement email with value proposition" },
                    new { step = 2, action = "Wait", description = "Wait 3 days", duration = "3d" },
                    new { step = 3, action = "SendSMS", description = "Send SMS with special offer", condition = "noEmailOpen" },
                    new { step = 4, action = "Wait", description = "Wait 7 days", duration = "7d" },
                    new { step = 5, action = "UpdateLeadStatus", description = "Mark as 'Cold - Attempted Revival'", condition = "noResponse" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "emailTemplate", "smsTemplate", "specialOffer" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 6. Retention & Re-engagement
            new()
            {
                Name = "Retention & Re-engagement",
                Description = "Keep existing customers engaged with regular touchpoints",
                Category = WorkflowCategory.EmailNurture,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "CustomerInactive", conditions = new { daysSinceLastPurchase = 60 } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "SendEmail", description = "Send 'We miss you' email with exclusive offer" },
                    new { step = 2, action = "Wait", description = "Wait 5 days", duration = "5d" },
                    new { step = 3, action = "SendSMS", description = "Send SMS with limited-time discount", condition = "noEmailOpen" },
                    new { step = 4, action = "Wait", description = "Wait 10 days", duration = "10d" },
                    new { step = 5, action = "AssignToCSM", description = "Assign to Customer Success Manager for personal outreach", condition = "noResponse" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "emailTemplate", "discountCode", "csmAssignment" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 7. Proposal Creation
            new()
            {
                Name = "Proposal Creation",
                Description = "Automatically generate and send proposals to qualified leads",
                Category = WorkflowCategory.Custom,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = true,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "LeadQualified", conditions = new { score = 80 } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "GatherLeadData", description = "Collect lead requirements and preferences" },
                    new { step = 2, action = "GenerateProposal", description = "Create customized proposal from template" },
                    new { step = 3, action = "RequestApproval", description = "Send to sales manager for approval" },
                    new { step = 4, action = "SendProposal", description = "Email proposal to lead", condition = "approved" },
                    new { step = 5, action = "ScheduleFollowUp", description = "Schedule follow-up call in 3 days" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "proposalTemplate", "approvalWorkflow", "followUpDelay" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 8. Proposal Sending
            new()
            {
                Name = "Proposal Sending",
                Description = "Send proposals and track engagement with automated follow-ups",
                Category = WorkflowCategory.Custom,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "ProposalApproved", conditions = new { } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "SendProposal", description = "Email proposal with tracking link" },
                    new { step = 2, action = "TrackOpens", description = "Monitor proposal opens and time spent" },
                    new { step = 3, action = "Wait", description = "Wait 2 days", duration = "2d" },
                    new { step = 4, action = "SendFollowUp", description = "Send follow-up email", condition = "notOpened" },
                    new { step = 5, action = "NotifySalesRep", description = "Notify rep when proposal is opened" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "emailTemplate", "trackingEnabled", "followUpDelay" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 9. Abandoned Form Recovery
            new()
            {
                Name = "Abandoned Form Recovery",
                Description = "Follow up with leads who started but didn't complete forms",
                Category = WorkflowCategory.FollowUp,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "FormAbandoned", conditions = new { completionPercentage = 50 } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "Wait", description = "Wait 1 hour", duration = "1h" },
                    new { step = 2, action = "SendEmail", description = "Send email with form completion link" },
                    new { step = 3, action = "Wait", description = "Wait 24 hours", duration = "24h" },
                    new { step = 4, action = "SendSMS", description = "Send SMS reminder", condition = "formNotCompleted" },
                    new { step = 5, action = "CreateLead", description = "Create lead with partial data", condition = "stillNotCompleted" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "emailTemplate", "smsTemplate", "minCompletionForLead" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            },

            // 10. Post-Purchase Follow-up
            new()
            {
                Name = "Post-Purchase Follow-up",
                Description = "Onboard new customers and request feedback after purchase",
                Category = WorkflowCategory.Custom,
                IsActive = true,
                IsGlobalTemplate = true,
                RequiresApproval = false,
                DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(new { type = "PurchaseCompleted", conditions = new { } }),
                DefaultSteps = System.Text.Json.JsonSerializer.Serialize(new List<object>
                {
                    new { step = 1, action = "SendWelcome", description = "Send welcome email with getting started guide" },
                    new { step = 2, action = "Wait", description = "Wait 1 day", duration = "1d" },
                    new { step = 3, action = "SendOnboarding", description = "Send onboarding checklist and resources" },
                    new { step = 4, action = "Wait", description = "Wait 7 days", duration = "7d" },
                    new { step = 5, action = "RequestFeedback", description = "Send satisfaction survey" },
                    new { step = 6, action = "OfferUpsell", description = "Present relevant upsell opportunities", condition = "satisfactionHigh" }
                }),
                ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(new List<string> { "welcomeTemplate", "onboardingChecklist", "upsellOffers" }),
                CreatedBy = adminUserId.ToString(),
                Version = 1
            }
        };

        context.WorkflowTemplates.AddRange(templates);
        await context.SaveChangesAsync();

        // Create default plan assignments
        await SeedPlanAssignmentsAsync(context, templates, adminUserId);
    }

    /// <summary>
    /// Seeds default workflow plan assignments.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="templates">List of workflow templates.</param>
    /// <param name="adminUserId">Admin user ID.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    private static async Task SeedPlanAssignmentsAsync(
        QualiFlowDbContext context,
        List<WorkflowTemplate> templates,
        Guid adminUserId)
    {
        var assignments = new List<WorkflowPlanAssignment>();

        // FreeFlow: View only - NO assignments (users can view but not activate)
        // Intentionally empty - Free Flow users have read-only access to workflow templates

        // SmartFlow: Full - ALL 10 templates, unlimited instances
        foreach (var template in templates)
        {
            assignments.Add(new WorkflowPlanAssignment
            {
                WorkflowTemplateId = template.Id,
                PlanTier = SubscriptionTier.SmartFlow,
                IsIncluded = true,
                RequiresApproval = false,
                MaxInstances = null, // Unlimited (no instance limits in Figma spec)
                AssignedBy = adminUserId.ToString()
            });
        }

        // UltraFlow: Full+Advanced - ALL 10 templates, unlimited instances
        foreach (var template in templates)
        {
            assignments.Add(new WorkflowPlanAssignment
            {
                WorkflowTemplateId = template.Id,
                PlanTier = SubscriptionTier.UltraFlow,
                IsIncluded = true,
                RequiresApproval = template.RequiresApproval,
                MaxInstances = null, // Unlimited (no instance limits in Figma spec)
                AssignedBy = adminUserId.ToString()
            });
        }

        // Enterprise: Full+Custom - ALL 10 templates, unlimited instances
        foreach (var template in templates)
        {
            assignments.Add(new WorkflowPlanAssignment
            {
                WorkflowTemplateId = template.Id,
                PlanTier = SubscriptionTier.Enterprise,
                IsIncluded = true,
                RequiresApproval = false,
                MaxInstances = null, // Unlimited (no instance limits in Figma spec)
                AssignedBy = adminUserId.ToString()
            });
        }

        context.WorkflowPlanAssignments.AddRange(assignments);
        await context.SaveChangesAsync();
    }
}
