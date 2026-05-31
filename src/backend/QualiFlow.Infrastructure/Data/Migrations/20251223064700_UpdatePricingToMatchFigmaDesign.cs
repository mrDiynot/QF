using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePricingToMatchFigmaDesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ========================================================================
            // Update CMS Pricing Add-Ons to match Figma design
            // ========================================================================
            migrationBuilder.Sql(@"
                UPDATE cms_pricing_add_ons SET price = '$0.012', unit = 'per interaction' WHERE title = 'Additional AI Interactions';
                UPDATE cms_pricing_add_ons SET price = '$0.08', unit = 'per minute' WHERE title = 'Additional Voice Minutes';
                UPDATE cms_pricing_add_ons SET price = '$0.015', unit = 'per SMS' WHERE title = 'Additional SMS';
                UPDATE cms_pricing_add_ons SET price = '$5', unit = 'per 10MB' WHERE title = 'Additional Storage';
            ");

            // ========================================================================
            // Update CMS Pricing Plans features_json to match Figma design
            // ========================================================================
            
            // Free Flow - Simple list format for CmsService compatibility
            migrationBuilder.Sql(@"
                UPDATE cms_pricing_plans
                SET features_json = '[
                    ""3 test voice calls"",
                    ""Limited SMS"",
                    ""5MB Knowledge Base"",
                    ""1 user"",
                    ""Basic widget"",
                    ""Journey builder view-only""
                ]'
                WHERE name = 'Free Flow';
            ");

            // SmartFlow
            migrationBuilder.Sql(@"
                UPDATE cms_pricing_plans
                SET features_json = '[
                    ""10,000 AI Interactions"",
                    ""100 Voice Minutes"",
                    ""500 SMS"",
                    ""20MB Knowledge Base"",
                    ""3 users"",
                    ""1 phone number"",
                    ""AI SMS + Chat"",
                    ""AI qualification & scoring"",
                    ""Forms + surveys"",
                    ""Smart booking"",
                    ""2 CRM connections""
                ]'
                WHERE name = 'SmartFlow';
            ");

            // UltraFlow
            migrationBuilder.Sql(@"
                UPDATE cms_pricing_plans
                SET features_json = '[
                    ""50,000 AI Interactions"",
                    ""500 Voice Minutes"",
                    ""2,500 SMS"",
                    ""100MB Knowledge Base"",
                    ""10 users"",
                    ""Unlimited voice agents"",
                    ""Advanced automations"",
                    ""Multi-calendar routing"",
                    ""Full review engine"",
                    ""All CRM connections"",
                    ""Dedicated success manager""
                ]'
                WHERE name = 'UltraFlow';
            ");

            // Enterprise
            migrationBuilder.Sql(@"
                UPDATE cms_pricing_plans
                SET features_json = '[
                    ""Unlimited AI Interactions"",
                    ""Unlimited Voice Minutes"",
                    ""Unlimited SMS"",
                    ""250MB+ Knowledge Base"",
                    ""Unlimited users"",
                    ""Unlimited CRM connections"",
                    ""Custom AI training"",
                    ""SOC2-ready security"",
                    ""Custom integrations"",
                    ""AI model selection"",
                    ""Priority support + SLAs""
                ]'
                WHERE name = 'Enterprise';
            ");

            // ========================================================================
            // Delete and re-seed Pricing Feature Comparisons
            // ========================================================================
            migrationBuilder.Sql(@"DELETE FROM pricing_feature_comparisons;");

            // Core AI Modules (display_order 1-12)
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
                (gen_random_uuid(), 'Core AI Modules', 'Voice + Text + Email Flows', '❌', '❌', '✓', '✓', 11, true, NOW()),
                (gen_random_uuid(), 'Core AI Modules', 'Knowledge Base', '5MB', '20MB', '100MB', '250MB+', 12, true, NOW());
            ");

            // Communication Channels (display_order 13-19)
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

            // Lead Capture Channels (display_order 20-25)
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Lead Capture Channels', 'Voice (Inbound)', 'Test', '✓', '✓', '✓', 20, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'SMS', 'Limited', '✓', '✓', '✓', 21, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Email (Inbound Only)', '❌', '✓', '✓', '✓', 22, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Social (FB/IG) Capture', '❌', '❌ upgrade', '✓', '✓', 23, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Webchat', 'Basic', '✓', '✓', '✓', 24, true, NOW()),
                (gen_random_uuid(), 'Lead Capture Channels', 'Forms', '❌', '✓', '✓', '✓', 25, true, NOW());
            ");

            // Automation System (display_order 26-31)
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Automation System', 'Prebuilt Journeys', 'View Only', 'Full', 'Full+Advanced', 'Full+Custom', 26, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Custom Journey Builder', 'View', '❌', '5/mo + Unlimited', 'Unlimited', 27, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'AI-Driven Actions', '❌', 'Basic', 'Advanced Multi-Intent', 'Custom', 28, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Timers & Delays', '❌', 'Basic', 'Enhanced', 'Custom', 29, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Smart Fallback AI', '❌', '✓', 'Advanced', 'Custom', 30, true, NOW()),
                (gen_random_uuid(), 'Automation System', 'Proposal Automation', '❌', '❌ upgrade', '✓', '✓', 31, true, NOW());
            ");

            // Booking System (display_order 32-37)
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Booking System', 'Smart Calendar', '❌', '✓', '✓', '✓', 32, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Multi-Calendar Routing', '❌', '❌', '✓', '✓', 33, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Smart Availability Logic', '❌', '❌', '✓', '✓', 34, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'No-Show Prevention AI', '❌', '❌', '✓', '✓', 35, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Appointment Reminders', '❌', '✓', '✓', '✓', 36, true, NOW()),
                (gen_random_uuid(), 'Booking System', 'Missed Appointment Flows', '❌', '❌', '✓', '✓', 37, true, NOW());
            ");

            // Reviews & Retention (display_order 38-41)
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Reviews & Retention', 'Review Requests', 'Limited', 'Basic', 'Full Engine', 'Full Engine', 38, true, NOW()),
                (gen_random_uuid(), 'Reviews & Retention', 'Multi-Channel Review Funnels', '❌', '❌', '✓', '✓', 39, true, NOW()),
                (gen_random_uuid(), 'Reviews & Retention', 'Retention AI', '❌', '❌', '✓', '✓', 40, true, NOW()),
                (gen_random_uuid(), 'Reviews & Retention', 'Winback & Re-Activation', '❌', 'Basic', '✓', '✓', 41, true, NOW());
            ");

            // CRM Integrations (display_order 42-53)
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
                (gen_random_uuid(), 'CRM Integrations', 'Other CRM', '❌', 'Book Setup Call', 'Book Setup Call', 'Custom', 53, true, NOW());
            ");

            // Admin / Dashboard (display_order 54-61)
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Admin / Dashboard', 'Usage Meters', 'Basic', '✓', '✓', '✓', 54, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Team Management', '1 user', '3 users', '10 users', 'Unlimited', 55, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'User Roles', '❌', 'Basic', 'Full', 'Full', 56, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Billing Portal', '❌', '✓', '✓', '✓', 57, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Standard Analytics', '❌', '✓', '✓', '✓', 58, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Enterprise Analytics', '❌', '❌', '✓', '✓', 59, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'File Storage', '5MB', '20MB', '100MB', '250MB+', 60, true, NOW()),
                (gen_random_uuid(), 'Admin / Dashboard', 'Audit Logs', '❌', '❌', 'Basic', 'SOC2', 61, true, NOW());
            ");

            // Onboarding & Training (display_order 62-73)
            migrationBuilder.Sql(@"
                INSERT INTO pricing_feature_comparisons (id, category, feature_name, free_flow_value, smart_flow_value, ultra_flow_value, enterprise_value, display_order, is_active, created_at) VALUES
                (gen_random_uuid(), 'Onboarding & Training', 'Implementation Setup', '❌', 'Optional $700', 'Required $1500', 'Required $1500', 62, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', '1-Hour Kickoff Call', '❌', '✓', '✓', '✓', 63, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Training Sessions', '❌', '1', '3', '3', 64, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Team Member Setup', '❌', '✓', '✓', '✓', 65, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Knowledge Base Setup', '❌', 'Limited', 'Full', 'Full', 66, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Email Configuration + Domain', '❌', '❌', '✓', '✓', 67, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'CRM Setup', '❌', '✓', '✓', '✓', 68, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Channel Configuration', '❌', '❌', '✓', '✓', 69, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Social Channel Setup', '❌', '❌', '✓', '✓', 70, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Booking Calendar Setup', '❌', '✓', '✓', '✓', 71, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Prebuilt Journey Activation', '❌', '✓', '✓', '✓', 72, true, NOW()),
                (gen_random_uuid(), 'Onboarding & Training', 'Daily Workflow Training', '❌', '❌', '✓', '✓', 73, true, NOW());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // This is a data migration, no schema changes to revert
            // The old data was already replaced and cannot be easily restored
        }
    }
}
