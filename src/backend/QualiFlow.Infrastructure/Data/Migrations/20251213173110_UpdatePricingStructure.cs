using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePricingStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "onboarding_price",
                table: "subscription_plans",
                type: "numeric(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "onboarding_required",
                table: "subscription_plans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "price_quarterly",
                table: "subscription_plans",
                type: "numeric(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "stripe_price_id_quarterly",
                table: "subscription_plans",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // ========================================================================
            // Update Subscription Plans with new pricing structure
            // Free Flow: $0 (test tier)
            // Smart Flow: $199/monthly, $159/quarterly, $179/annual, $700 optional onboarding
            // Ultra Flow: $699/monthly, $599/quarterly, $549/annual, $1500 required onboarding
            // Enterprise: Custom pricing
            // ========================================================================
            migrationBuilder.Sql(@"
                UPDATE subscription_plans
                SET
                    price_monthly = 0.00,
                    price_quarterly = 0.00,
                    price_yearly = 0.00,
                    onboarding_price = NULL,
                    onboarding_required = false,
                    description = 'Perfect for testing QualiFlow capabilities'
                WHERE name = 'freeflow';

                UPDATE subscription_plans
                SET
                    price_monthly = 199.00,
                    price_quarterly = 159.00,
                    price_yearly = 179.00,
                    onboarding_price = 700.00,
                    onboarding_required = false,
                    description = 'For growing businesses ready to automate'
                WHERE name = 'smartflow';

                UPDATE subscription_plans
                SET
                    price_monthly = 699.00,
                    price_quarterly = 599.00,
                    price_yearly = 549.00,
                    onboarding_price = 1500.00,
                    onboarding_required = true,
                    description = 'Full-scale AI engagement for high-volume teams'
                WHERE name = 'ultraflow';

                UPDATE subscription_plans
                SET
                    price_monthly = 0.00,
                    price_quarterly = NULL,
                    price_yearly = NULL,
                    onboarding_price = 1500.00,
                    onboarding_required = true,
                    description = 'Custom solution for enterprise needs'
                WHERE name = 'enterprise';
            ");

            // ========================================================================
            // Update Plan Limits with new values
            // ========================================================================
            migrationBuilder.Sql(@"
                -- FreeFlow limits
                UPDATE plan_limits SET limit_value = '3' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'freeflow') AND limit_key = 'max_ai_voice_agents';
                UPDATE plan_limits SET limit_value = '3' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'freeflow') AND limit_key = 'max_ai_voice_minutes';
                UPDATE plan_limits SET limit_value = '10' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'freeflow') AND limit_key = 'max_ai_sms';
                UPDATE plan_limits SET limit_value = '5' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'freeflow') AND limit_key = 'knowledge_base_size_mb';

                -- SmartFlow limits
                UPDATE plan_limits SET limit_value = '10000' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'smartflow') AND limit_key = 'max_ai_interactions';
                UPDATE plan_limits SET limit_value = '5' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'smartflow') AND limit_key = 'max_ai_voice_agents';
                UPDATE plan_limits SET limit_value = '100' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'smartflow') AND limit_key = 'max_ai_voice_minutes';
                UPDATE plan_limits SET limit_value = '500' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'smartflow') AND limit_key = 'max_ai_sms';
                UPDATE plan_limits SET limit_value = '20' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'smartflow') AND limit_key = 'knowledge_base_size_mb';

                -- UltraFlow limits
                UPDATE plan_limits SET limit_value = '50000' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'ultraflow') AND limit_key = 'max_ai_interactions';
                UPDATE plan_limits SET limit_value = 'unlimited' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'ultraflow') AND limit_key = 'max_ai_voice_agents';
                UPDATE plan_limits SET limit_value = '500' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'ultraflow') AND limit_key = 'max_ai_voice_minutes';
                UPDATE plan_limits SET limit_value = '2500' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'ultraflow') AND limit_key = 'max_ai_sms';
                UPDATE plan_limits SET limit_value = '100' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'ultraflow') AND limit_key = 'knowledge_base_size_mb';
                UPDATE plan_limits SET limit_value = '10' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'ultraflow') AND limit_key = 'max_seats';

                -- Enterprise limits
                UPDATE plan_limits SET limit_value = 'unlimited' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'enterprise') AND limit_key = 'max_ai_interactions';
                UPDATE plan_limits SET limit_value = '250' WHERE plan_id = (SELECT id FROM subscription_plans WHERE name = 'enterprise') AND limit_key = 'knowledge_base_size_mb';
            ");

            // ========================================================================
            // Update CMS Pricing Add-Ons with new values
            // ========================================================================
            migrationBuilder.Sql(@"
                UPDATE cms_pricing_add_ons SET price = '$0.01', unit = 'per credit' WHERE title = 'Additional AI Interactions';
                UPDATE cms_pricing_add_ons SET price = '$0.12', unit = 'per minute' WHERE title = 'Additional Voice Minutes';
                UPDATE cms_pricing_add_ons SET price = '$0.02', unit = 'per message' WHERE title = 'Additional SMS';
                UPDATE cms_pricing_add_ons SET price = '$10', unit = 'per 50MB' WHERE title = 'Additional Storage';

                -- Add new add-on for team members if not exists
                INSERT INTO cms_pricing_add_ons (id, title, price, unit, display_order, is_active, created_at)
                SELECT gen_random_uuid(), 'Additional Team Members', '$25', 'per user/month', 5, true, NOW()
                WHERE NOT EXISTS (SELECT 1 FROM cms_pricing_add_ons WHERE title = 'Additional Team Members');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "onboarding_price",
                table: "subscription_plans");

            migrationBuilder.DropColumn(
                name: "onboarding_required",
                table: "subscription_plans");

            migrationBuilder.DropColumn(
                name: "price_quarterly",
                table: "subscription_plans");

            migrationBuilder.DropColumn(
                name: "stripe_price_id_quarterly",
                table: "subscription_plans");
        }
    }
}
