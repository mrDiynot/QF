using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateToFigmaPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ========================================================================
            // Update subscription_plans to match EXACT Figma design
            // SmartFlow: $199/mo ($175 quarterly, $159 annually)
            // UltraFlow: $699/mo ($629 quarterly, $559 annually)
            // ========================================================================
            
            migrationBuilder.Sql(@"
                -- Free Flow (no changes needed)
                UPDATE subscription_plans 
                SET 
                    price_monthly = 0,
                    price_quarterly = 0,
                    price_yearly = 0,
                    onboarding_price = NULL,
                    onboarding_required = false
                WHERE name = 'freeflow';

                -- SmartFlow: $199/mo, $175/mo quarterly, $159/mo annually
                UPDATE subscription_plans 
                SET 
                    price_monthly = 199,
                    price_quarterly = 175,
                    price_yearly = 1908,
                    discount_quarterly = 12,
                    discount_annual = 20,
                    onboarding_price = 700,
                    onboarding_required = false
                WHERE name = 'smartflow';

                -- UltraFlow: $699/mo, $629/mo quarterly, $559/mo annually
                UPDATE subscription_plans 
                SET 
                    price_monthly = 699,
                    price_quarterly = 629,
                    price_yearly = 6708,
                    discount_quarterly = 10,
                    discount_annual = 20,
                    onboarding_price = 1500,
                    onboarding_required = true
                WHERE name = 'ultraflow';

                -- Enterprise: Custom pricing
                UPDATE subscription_plans 
                SET 
                    price_monthly = 0,
                    price_quarterly = NULL,
                    price_yearly = NULL,
                    onboarding_price = 1500,
                    onboarding_required = true
                WHERE name = 'enterprise';
            ");

            // ========================================================================
            // Update CMS Pricing Plans to match Figma
            // ========================================================================
            migrationBuilder.Sql(@"
                DELETE FROM cms_pricing_plans;
                
                INSERT INTO cms_pricing_plans (id, name, monthly_price, annual_price, price_period, features_json, is_popular, is_active, display_order, cta_text, cta_link, created_at)
                VALUES
                (gen_random_uuid(), 'Free Flow', '$0', '$0', 'per month', 
                 '[""3 test voice calls"",""Limited SMS"",""5MB Knowledge Base"",""1 user"",""Basic widget"",""Journey builder view-only"",""Prebuilt journeys (disabled)""]', 
                 false, true, 1, 'Start Free Trial', '/register', NOW()),
                
                (gen_random_uuid(), 'Smart Flow', '$199', '$1908', 'per month', 
                 '[""10,000 AI Credits"",""100 Voice Minutes"",""500 SMS"",""20MB Knowledge Base"",""3 users"",""1 phone number"",""AI SMS + Chat"",""AI qualification & scoring"",""Forms + surveys"",""Smart booking"",""2 CRM connections""]', 
                 false, true, 2, 'Start with Smart Flow', '/register', NOW()),
                
                (gen_random_uuid(), 'Ultra Flow', '$699', '$6708', 'per month', 
                 '[""35,000 AI Credits"",""600 Voice Minutes"",""2,500 SMS"",""100MB Knowledge Base"",""7 users"",""Unlimited voice agents"",""Advanced automations"",""Multi-calendar routing"",""Full review engine"",""All CRM connections"",""Dedicated success manager""]', 
                 true, true, 3, 'Start with Ultra Flow', '/register', NOW()),
                
                (gen_random_uuid(), 'Enterprise Flow', 'Custom', NULL, 'pricing', 
                 '[""Custom AI Credits"",""Custom Voice Minutes"",""Custom SMS"",""Custom Knowledge Base"",""Custom users"",""Unlimited CRM connections"",""Custom AI training"",""SOC2-ready security"",""Custom integrations"",""AI model selection"",""Priority support + SLAs""]', 
                 false, true, 4, 'Contact Us', '/contact', NOW());
            ");

            // ========================================================================
            // Update Add-Ons Pricing to match Figma
            // ========================================================================
            migrationBuilder.Sql(@"
                DELETE FROM cms_pricing_add_ons;
                
                INSERT INTO cms_pricing_add_ons (id, title, price, unit, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Additional AI Interactions', '$0.012', 'per interaction', 1, true, NOW()),
                (gen_random_uuid(), 'Additional Voice Minutes', '$0.08', 'per minute', 2, true, NOW()),
                (gen_random_uuid(), 'Additional SMS', '$0.015', 'per SMS', 3, true, NOW()),
                (gen_random_uuid(), 'Additional Storage', '$5', 'per 10MB', 4, true, NOW());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert to previous pricing (not recommended)
            migrationBuilder.Sql(@"
                UPDATE subscription_plans SET price_monthly = 49, price_yearly = 470 WHERE name = 'smartflow';
                UPDATE subscription_plans SET price_monthly = 149, price_yearly = 1430 WHERE name = 'ultraflow';
            ");
        }
    }
}
