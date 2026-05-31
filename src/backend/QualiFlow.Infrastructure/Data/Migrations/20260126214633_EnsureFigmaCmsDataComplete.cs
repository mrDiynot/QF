using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnsureFigmaCmsDataComplete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ========================================================================
            // ENSURE FAQ DATA MATCHES FIGMA DESIGN
            // ========================================================================
            migrationBuilder.Sql(@"
                DELETE FROM frequently_asked_questions;
                
                INSERT INTO frequently_asked_questions (id, question, answer, category, display_order, is_active, show_on_landing_page, show_in_help_center, created_at)
                VALUES
                (gen_random_uuid(), 'Can I switch plans anytime?', 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges.', 'Billing', 1, true, true, true, NOW()),
                (gen_random_uuid(), 'What happens if I exceed my limits?', 'We will notify you at 80% usage. After that, overage pricing applies automatically - no service interruptions.', 'Usage', 2, true, true, true, NOW()),
                (gen_random_uuid(), 'Is there a contract or commitment?', 'No contracts required. Monthly plans can be cancelled anytime. Annual plans offer 20% savings with a yearly commitment.', 'Billing', 3, true, true, true, NOW()),
                (gen_random_uuid(), 'Do you offer refunds?', 'We offer a 7-day free trial on Free Flow. For paid plans, we provide a 14-day money-back guarantee if you are not satisfied.', 'Billing', 4, true, true, true, NOW()),
                (gen_random_uuid(), 'What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, Amex) and ACH transfers for Enterprise plans.', 'Billing', 5, true, true, true, NOW()),
                (gen_random_uuid(), 'Can I get a custom Enterprise plan?', 'Absolutely! Contact our sales team to discuss your specific needs. We will create a tailored plan with custom pricing and features.', 'Enterprise', 6, true, true, true, NOW());
            ");

            // ========================================================================
            // ENSURE PRICING PLANS MATCH FIGMA DESIGN
            // ========================================================================
            migrationBuilder.Sql(@"
                DELETE FROM cms_pricing_plans;
                
                INSERT INTO cms_pricing_plans (id, name, monthly_price, annual_price, price_period, features_json, is_popular, is_active, display_order, cta_text, cta_link, created_at)
                VALUES
                (gen_random_uuid(), 'Free Flow', '$0', '$0', 'per month', '[""50 AI Interactions"",""2 AI Voice Agents"",""5 AI Voice Minutes"",""20 AI SMS"",""3 Prebuilt Journeys"",""Basic Analytics"",""1 Team Member""]', false, true, 1, 'Get Started', '/register', NOW()),
                (gen_random_uuid(), 'SmartFlow', '$49', '$470', 'per month', '[""250 AI Interactions"",""Unlimited AI Voice Agents"",""75 AI Voice Minutes"",""500 AI SMS"",""AI Email"",""10 Prebuilt Journeys"",""Custom Journey Builder"",""Standard Analytics"",""3 Team Members""]', false, true, 2, 'Start Free Trial', '/register', NOW()),
                (gen_random_uuid(), 'UltraFlow', '$149', '$1430', 'per month', '[""1,500 AI Interactions"",""Unlimited AI Voice Agents"",""300 AI Voice Minutes"",""2,500 AI SMS"",""AI Email"",""Unlimited Prebuilt Journeys"",""Custom Journey Builder"",""Advanced Analytics"",""Unlimited Team Members""]', true, true, 3, 'Start Free Trial', '/register', NOW()),
                (gen_random_uuid(), 'Enterprise', 'Custom', NULL, 'pricing', '[""8,000+ AI Interactions"",""Unlimited AI Voice Agents"",""1,500+ AI Voice Minutes"",""7,500+ AI SMS"",""AI Email"",""Unlimited Prebuilt Journeys"",""Custom Journey Builder"",""Custom Analytics"",""Unlimited Team Members""]', false, true, 4, 'Contact Sales', '/contact', NOW());
            ");

            // ========================================================================
            // ENSURE PRICING ADD-ONS MATCH FIGMA DESIGN
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

            // ========================================================================
            // ENSURE FEATURE COMPARISONS MATCH FIGMA DESIGN (Complete rebuild)
            // ========================================================================
            migrationBuilder.Sql(@"DELETE FROM pricing_feature_comparisons;");

            // Core AI Modules
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Core AI Modules', 'AI Voice Agents', '3 test', '5', 'Unlimited', 'Unlimited', 1, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'AI Chat + Web Widget', 'Basic', 'Full', 'Full', 'Full', 2, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'AI SMS', '❌', '✓', '✓', '✓', 3, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'AI Email', '❌', '❌ upgrade', '✓', '✓', 4, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'AI Follow-Up', '❌', 'Basic', 'Full', 'Full', 5, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'AI Qualification', 'Limited', '✓', 'Advanced', 'Custom', 6, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'AI Scoring', '❌', 'Basic', 'Predictive', 'Custom', 7, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'Lead Routing', '❌', 'Basic', 'Multi-agent', 'Enterprise', 8, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'Task Suggestions', '❌', 'Basic', '✓', '✓', 9, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'Summaries / Transcriptions', 'Test only', '✓', '✓', '✓', 10, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'Voice → Text → Email Flows', '❌', '❌', '✓', '✓', 11, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'Knowledge Base', '5MB', '20MB', '100MB', '250MB+', 12, true, NOW());
            ");

            // Communication Channels
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Communication Channels', 'Voice (Inbound)', 'Test only', '✓', '✓', '✓', 13, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Voice (Outbound AI)', '❌', '❌', '✓', '✓', 14, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'SMS', 'Limited', '✓', '✓', '✓', 15, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Email', '❌', '❌ upgrade', '✓', '✓', 16, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Social (FB/IG)', '❌', '❌ upgrade', '✓', '✓', 17, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Webchat', 'Basic', '✓', '✓', '✓', 18, true, NOW()),
                (gen_random_uuid(), 'Communication Channels', 'Forms & Surveys', '❌', '✓', '✓', '✓', 19, true, NOW());
            ");

            // Lead Capture Channels
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Lead Capture Channels', 'Voice (Inbound)', 'Test', '✓', '✓', '✓', 20, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'SMS', 'Limited', '✓', '✓', '✓', 21, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Email (Inbound Only)', '❌', '✓', '✓', '✓', 22, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Social (FB/IG) Capture', '❌', '❌ upgrade', '❌', '✓', 23, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Webchat', 'Basic', '✓', '✓', '✓', 24, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Forms', '❌', '✓', '✓', '✓', 25, true, NOW());
            ");

            // Automation System
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Automation System', 'Prebuilt Journeys', 'View Only', 'Full', 'Full+Advanced', 'Full+Custom', 26, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Custom Journey Builder', 'View', '❌', '5/mo + Unlimited', 'Unlimited', 27, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'AI-Driven Actions', '❌', 'Basic', 'Advanced Multi-Intent', 'Custom', 28, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Timers & Delays', '❌', 'Basic', 'Enhanced', 'Custom', 29, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Smart Fallback AI', '❌', '✓', 'Advanced', 'Custom', 30, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Proposal Automation', '❌', '❌ upgrade', '✓', '✓', 31, true, NOW());
            ");

            // Booking System
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Booking System', 'Smart Calendar', '❌', '✓', '✓', '✓', 32, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Multi-Calendar Routing', '❌', '❌', '✓', '✓', 33, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Smart Availability Logic', '❌', '✓', '✓', '✓', 34, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'No-Show Prevention AI', '❌', '❌', '✓', '✓', 35, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Appointment Reminders', '❌', '✓', '✓', '✓', 36, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Missed Appointment Flows', '❌', '❌', '✓', '✓', 37, true, NOW());
            ");

            // Reviews & Retention
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Reviews & Retention', 'Review Requests', 'Limited', 'Basic', 'Full Engine', 'Full Engine', 38, true, NOW()),
                (gen_random_uuid(), 'Reviews & Retention', 'Multi-Channel Review Funnels', '❌', '❌', '✓', '✓', 39, true, NOW()),
                (gen_random_uuid(), 'Reviews & Retention', 'Retention AI', '❌', '❌', '✓', '✓', 40, true, NOW()),
                (gen_random_uuid(), 'Reviews & Retention', 'Winback & Re-Activation', '❌', 'Basic', 'Full', 'Custom', 41, true, NOW());
            ");

            // CRM Integrations
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'CRM Integrations', 'Built-in CRM', '✓', '✓', '✓', '✓', 42, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'HubSpot', 'View Only', '✓', '✓', '✓', 43, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Zoho', '❌', '✓', '✓', '✓', 44, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Pipedrive', '❌', '✓', '✓', '✓', 45, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'GoHighLevel', '❌', '✓', '✓', '✓', 46, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Monday', '❌', '✓', '✓', '✓', 47, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Close CRM', '❌', '✓', '✓', '✓', 48, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'FreshSales', '❌', '✓', '✓', '✓', 49, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'ActiveCampaign', '❌', '✓', '✓', '✓', 50, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Copper', '❌', '✓', '✓', '✓', 51, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Salesforce', '❌', '✓', '✓', '✓', 52, true, NOW()),
                (gen_random_uuid(), 'CRM Integrations', 'Other CRM', '❌', '""Book Setup Call""', '""Book Setup Call""', 'Custom', 53, true, NOW());
            ");

            // Admin / Dashboard
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Admin / Dashboard', 'Usage Meters', 'Basic', '✓', '✓', '✓', 54, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Team Management', '1 user', '3 users', '10 users', 'Unlimited', 55, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'User Roles', '❌', 'Basic', 'Full', 'Full', 56, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Billing Portal', '✓', '✓', '✓', '✓', 57, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Standard Analytics', '❌', '✓', '✓', '✓', 58, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Enterprise Analytics', '❌', '❌', '❌', '✓', 59, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'File Storage', '5MB', '20MB', '100MB', '250MB+', 60, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Audit Logs', '❌', '❌', 'Basic', 'SOC2', 61, true, NOW());
            ");

            // Onboarding & Training
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Onboarding & Training', 'Implementation Setup', '❌', 'Optional $700', 'Required $1500', 'Required $1500', 62, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', '1-Hour Kickoff Call', '❌', '✓', '✓', '✓', 63, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Training Sessions', '❌', '1', '3', '3', 64, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Team Member Setup', '❌', '✓', '✓', '✓', 65, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Knowledge Base Setup', '❌', 'Limited', 'Full', 'Full', 66, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Email Configuration + Domain', '❌', '❌', '✓', '✓', 67, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'CRM Setup', '❌', '✓', '✓', '✓', 68, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Channel Configuration', '❌', '✓', '✓', '✓', 69, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Social Channel Setup', '❌', '❌', '❌', '✓', 70, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Booking Calendar Setup', '❌', '✓', '✓', '✓', 71, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Prebuilt Journey Activation', '❌', '✓', '✓', '✓', 72, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Daily Workflow Training', '❌', '✓', '✓', '✓', 73, true, NOW());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // This is a data migration only - no schema changes to revert
        }
    }
}
