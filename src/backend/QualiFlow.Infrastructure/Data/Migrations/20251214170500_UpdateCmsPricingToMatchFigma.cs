using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCmsPricingToMatchFigma : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Delete existing CMS pricing plans
            migrationBuilder.Sql(@"DELETE FROM cms_pricing_plans;");

            // Insert updated CMS pricing plans matching Figma design
            migrationBuilder.Sql(@"
                INSERT INTO cms_pricing_plans (id, name, monthly_price, annual_price, price_period, features_json, is_popular, is_active, display_order, cta_text, cta_link, created_at)
                VALUES
                (gen_random_uuid(), 'Free Flow', '$0', '$0', 'per month', 
                 '[""3 test voice calls"",""Limited SMS"",""5MB Knowledge Base"",""1 user"",""Basic widget"",""Journey builder view-only"",""Prebuilt journeys (disabled)""]', 
                 false, true, 1, 'Start Free Trial', '/register', NOW()),
                
                (gen_random_uuid(), 'Smart Flow', '$199', '$1908', 'per month', 
                 '[""10,000 AI Credits"",""100 Voice Minutes"",""500 SMS"",""20MB Knowledge Base"",""3 users"",""1 phone number"",""AI SMS + Chat"",""AI qualification & scoring"",""Forms + surveys"",""Smart Routing"",""2 CRM connections""]', 
                 false, true, 2, 'Start with Smart Flow', '/register', NOW()),
                
                (gen_random_uuid(), 'Ultra Flow', '$699', '$6708', 'per month', 
                 '[""35,000 AI Credits"",""600 Voice Minutes"",""2,500 SMS"",""100MB Knowledge Base"",""7 users"",""Unlimited voice agents"",""Advanced automations"",""Multi-calendar routing"",""Full review engine"",""All CRM connections"",""Dedicated success manager""]', 
                 true, true, 3, 'Start with Ultra Flow', '/register', NOW()),
                
                (gen_random_uuid(), 'Enterprise Flow', 'Custom', NULL, 'pricing', 
                 '[""Custom AI Credits"",""Custom Voice Minutes"",""Custom SMS"",""Custom Knowledge Base"",""Custom users"",""Unlimited CRM connections"",""Custom AI training"",""SOC2-ready security"",""Custom integrations"",""AI model selection"",""Priority support + SLAs""]', 
                 false, true, 4, 'Contact Us', '/contact', NOW());
            ");

            // Update CMS pricing add-ons to match Figma design
            migrationBuilder.Sql(@"DELETE FROM cms_pricing_add_ons;");
            
            migrationBuilder.Sql(@"
                INSERT INTO cms_pricing_add_ons (id, title, price, unit, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Additional AI Credits', '$0.01', 'per credit', 1, true, NOW()),
                (gen_random_uuid(), 'Additional Voice Minutes', '$0.12', 'per minute', 2, true, NOW()),
                (gen_random_uuid(), 'Additional SMS', '$0.02', 'per message', 3, true, NOW()),
                (gen_random_uuid(), 'Additional Team Members', '$25', 'per user/month', 4, true, NOW()),
                (gen_random_uuid(), 'Additional Storage', '$10', 'per 50MB', 5, true, NOW());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert to original CMS pricing plans
            migrationBuilder.Sql(@"DELETE FROM cms_pricing_plans;");

            migrationBuilder.Sql(@"
                INSERT INTO cms_pricing_plans (id, name, monthly_price, annual_price, price_period, features_json, is_popular, is_active, display_order, cta_text, cta_link, created_at)
                VALUES
                (gen_random_uuid(), 'Free Flow', '$0', '$0', 'per month', '[""50 AI Interactions"",""2 AI Voice Agents"",""5 AI Voice Minutes"",""20 AI SMS"",""3 Prebuilt Journeys"",""Basic Analytics"",""1 Team Member""]', false, true, 1, 'Get Started', '/register', NOW()),
                (gen_random_uuid(), 'SmartFlow', '$49', '$470', 'per month', '[""250 AI Interactions"",""Unlimited AI Voice Agents"",""75 AI Voice Minutes"",""500 AI SMS"",""AI Email"",""10 Prebuilt Journeys"",""Custom Journey Builder"",""Standard Analytics"",""3 Team Members""]', false, true, 2, 'Start Free Trial', '/register', NOW()),
                (gen_random_uuid(), 'UltraFlow', '$149', '$1430', 'per month', '[""1,500 AI Interactions"",""Unlimited AI Voice Agents"",""300 AI Voice Minutes"",""2,500 AI SMS"",""AI Email"",""Unlimited Prebuilt Journeys"",""Custom Journey Builder"",""Advanced Analytics"",""Unlimited Team Members""]', true, true, 3, 'Start Free Trial', '/register', NOW()),
                (gen_random_uuid(), 'Enterprise', 'Custom', NULL, 'pricing', '[""8,000+ AI Interactions"",""Unlimited AI Voice Agents"",""1,500+ AI Voice Minutes"",""7,500+ AI SMS"",""AI Email"",""Unlimited Prebuilt Journeys"",""Custom Journey Builder"",""Custom Analytics"",""Unlimited Team Members""]', false, true, 4, 'Contact Sales', '/contact', NOW());
            ");

            // Revert CMS pricing add-ons
            migrationBuilder.Sql(@"DELETE FROM cms_pricing_add_ons;");
            
            migrationBuilder.Sql(@"
                INSERT INTO cms_pricing_add_ons (id, title, price, unit, display_order, is_active, created_at)
                VALUES
                (gen_random_uuid(), 'Additional AI Interactions', '$0.012', 'per interaction', 1, true, NOW()),
                (gen_random_uuid(), 'Additional Voice Minutes', '$0.08', 'per minute', 2, true, NOW()),
                (gen_random_uuid(), 'Additional SMS', '$0.015', 'per SMS', 3, true, NOW()),
                (gen_random_uuid(), 'Additional Storage', '$5', 'per 10MB', 4, true, NOW());
            ");
        }
    }
}
