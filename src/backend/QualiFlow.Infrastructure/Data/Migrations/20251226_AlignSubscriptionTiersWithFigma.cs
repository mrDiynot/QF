using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AlignSubscriptionTiersWithFigma : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ========================================================================
            // CRITICAL: Align subscription tiers with Figma specification
            // Old: Trial(0), Starter(1), Professional(2), Business(3), Enterprise(4)
            // New: FreeFlow(0), SmartFlow(1), UltraFlow(2), Enterprise(3)
            // ========================================================================

            // Step 1: Delete all existing workflow_plan_assignments
            // We'll recreate them with correct tier values
            migrationBuilder.Sql(@"DELETE FROM workflow_plan_assignments;");

            // Step 2: Update Enterprise tier from 4 to 3 in any existing data
            // (This affects subscriptions, usage_counters, etc.)
            migrationBuilder.Sql(@"
                -- Update subscriptions table if tier is stored there
                -- (Currently subscriptions link to subscription_plans, not tier enum directly)
                
                -- Update any other tables that might store tier enum values
                -- Add as needed based on schema
            ");

            // Step 3: Re-seed workflow_plan_assignments with correct Figma spec
            // Get workflow template IDs
            migrationBuilder.Sql(@"
                -- FreeFlow (0): View only - NO assignments
                -- Intentionally empty - users can view templates but not activate

                -- SmartFlow (1): Full - ALL 10 workflows, unlimited instances
                INSERT INTO workflow_plan_assignments (id, workflow_template_id, plan_tier, is_included, requires_approval, max_instances, assigned_by, created_at)
                SELECT 
                    gen_random_uuid(),
                    wt.id,
                    1,  -- SmartFlow
                    true,
                    false,
                    NULL,  -- Unlimited (no instance limits in Figma spec)
                    (SELECT id FROM admin_users ORDER BY created_at LIMIT 1),
                    NOW()
                FROM workflow_templates wt
                WHERE wt.is_active = true AND wt.deleted_at IS NULL;

                -- UltraFlow (2): Full+Advanced - ALL 10 workflows, unlimited instances
                INSERT INTO workflow_plan_assignments (id, workflow_template_id, plan_tier, is_included, requires_approval, max_instances, assigned_by, created_at)
                SELECT 
                    gen_random_uuid(),
                    wt.id,
                    2,  -- UltraFlow
                    true,
                    CASE WHEN wt.name = 'Proposal Creation' THEN true ELSE false END,
                    NULL,  -- Unlimited (no instance limits in Figma spec)
                    (SELECT id FROM admin_users ORDER BY created_at LIMIT 1),
                    NOW()
                FROM workflow_templates wt
                WHERE wt.is_active = true AND wt.deleted_at IS NULL;

                -- Enterprise (3): Full+Custom - ALL 10 workflows, unlimited instances
                INSERT INTO workflow_plan_assignments (id, workflow_template_id, plan_tier, is_included, requires_approval, max_instances, assigned_by, created_at)
                SELECT 
                    gen_random_uuid(),
                    wt.id,
                    3,  -- Enterprise
                    true,
                    false,
                    NULL,  -- Unlimited (no instance limits in Figma spec)
                    (SELECT id FROM admin_users ORDER BY created_at LIMIT 1),
                    NOW()
                FROM workflow_templates wt
                WHERE wt.is_active = true AND wt.deleted_at IS NULL;
            ");

            // Step 4: Add comment to document the change
            migrationBuilder.Sql(@"
                COMMENT ON TABLE workflow_plan_assignments IS 'Workflow assignments per subscription tier. Aligned with Figma spec: FreeFlow(0)=view-only, SmartFlow(1)=all 10 workflows (unlimited instances), UltraFlow(2)=all 10 (unlimited instances), Enterprise(3)=all 10 (unlimited instances). MaxInstances is NULL for all tiers - Figma has no instance limits, only workflow access control.';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverting this migration would require restoring old tier structure
            // Not recommended - this is a one-way alignment to Figma spec
            migrationBuilder.Sql(@"
                -- To revert, you would need to:
                -- 1. Delete all workflow_plan_assignments
                -- 2. Re-seed with old Trial/Starter/Professional/Business/Enterprise structure
                -- This is not implemented as it's a breaking change
                RAISE EXCEPTION 'Cannot revert AlignSubscriptionTiersWithFigma migration - this is a one-way alignment to Figma specification';
            ");
        }
    }
}
