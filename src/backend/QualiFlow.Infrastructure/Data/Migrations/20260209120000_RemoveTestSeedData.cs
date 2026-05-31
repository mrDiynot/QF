// -----------------------------------------------------------------------
// <copyright file="20260209120000_RemoveTestSeedData.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations;

/// <summary>
/// Removes all test/seeded data from production database.
/// Preserves only essential data required for platform functionality:
/// - Subscription plans, plan features, plan limits, features, roles
/// - SuperAdmin user
/// - System business (00000000-0000-0000-0000-000000000100) + chat widget + knowledge base + AI config
/// - Workflow templates + plan assignments
/// - CMS pricing plans
/// </summary>
public partial class RemoveTestSeedData : Migration
{
    private const string SystemBusinessId = "00000000-0000-0000-0000-000000000100";

    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // =====================================================
        // PHASE 1: Delete fake admin audit logs (seeded entries)
        // =====================================================
        migrationBuilder.Sql("DELETE FROM admin_audit_logs;");

        // =====================================================
        // PHASE 2: Delete CMS test content
        // =====================================================
        migrationBuilder.Sql("DELETE FROM blog_posts;");
        migrationBuilder.Sql("DELETE FROM testimonials;");
        migrationBuilder.Sql("DELETE FROM frequently_asked_questions;");

        // =====================================================
        // PHASE 3: Delete support tickets and messages
        // =====================================================
        migrationBuilder.Sql("DELETE FROM ticket_attachments;");
        migrationBuilder.Sql("DELETE FROM ticket_messages;");
        migrationBuilder.Sql("DELETE FROM support_tickets;");

        // =====================================================
        // PHASE 4: Delete test business-related data
        // Preserve system business (Coming Soon chat widget)
        // =====================================================

        // Delete child entities of test businesses first (FK order)
        migrationBuilder.Sql($@"
            DELETE FROM audit_logs 
            WHERE business_id IS NOT NULL 
            AND business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM usage_snapshots 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM overage_alert_settings 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM notification_preferences 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM notifications 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM saved_searches 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM search_analytics 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM invitations 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM email_logs 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM email_templates 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM quick_replies 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM auto_assignment_rules 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM scoring_criteria 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM call_scripts 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM ai_response_templates 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM external_usage_logs 
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM ai_generation_audits 
            WHERE business_id != '{SystemBusinessId}';");

        // Delete proposals (depends on deals)
        migrationBuilder.Sql($@"
            DELETE FROM proposals 
            WHERE business_id != '{SystemBusinessId}';");

        // Delete deals (depends on contacts)
        migrationBuilder.Sql($@"
            DELETE FROM deals 
            WHERE business_id != '{SystemBusinessId}';");

        // Delete contacts
        migrationBuilder.Sql($@"
            DELETE FROM contacts 
            WHERE business_id != '{SystemBusinessId}';");

        // Delete QR scans -> campaigns
        migrationBuilder.Sql($@"
            DELETE FROM qr_scans 
            WHERE qr_campaign_id IN (
                SELECT id FROM qr_campaigns WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM qr_campaigns 
            WHERE business_id != '{SystemBusinessId}';");

        // Delete survey responses -> surveys
        migrationBuilder.Sql($@"
            DELETE FROM survey_responses 
            WHERE survey_id IN (
                SELECT id FROM surveys WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM surveys
            WHERE business_id != '{SystemBusinessId}';");

        // Delete form-related data
        migrationBuilder.Sql($@"
            DELETE FROM field_interactions
            WHERE form_id IN (
                SELECT id FROM forms WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM form_views
            WHERE form_id IN (
                SELECT id FROM forms WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM form_submissions
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM forms
            WHERE business_id != '{SystemBusinessId}';");

        // Delete AB test variants -> tests
        migrationBuilder.Sql($@"
            DELETE FROM ab_test_variants
            WHERE ab_test_id IN (
                SELECT id FROM ab_tests WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM ab_tests
            WHERE business_id != '{SystemBusinessId}';");

        // Delete tracked links
        migrationBuilder.Sql($@"
            DELETE FROM tracked_links
            WHERE business_id != '{SystemBusinessId}';");

        // Delete message-related data
        migrationBuilder.Sql($@"
            DELETE FROM message_read_statuses
            WHERE message_id IN (
                SELECT m.id FROM messages m
                JOIN conversations c ON m.conversation_id = c.id
                WHERE c.business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM message_attachments
            WHERE message_id IN (
                SELECT m.id FROM messages m
                JOIN conversations c ON m.conversation_id = c.id
                WHERE c.business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM messages
            WHERE conversation_id IN (
                SELECT id FROM conversations WHERE business_id != '{SystemBusinessId}'
            );");

        // Delete conversation-related data
        migrationBuilder.Sql($@"
            DELETE FROM conversation_notes
            WHERE conversation_id IN (
                SELECT id FROM conversations WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM bookings
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM qualifications
            WHERE lead_id IN (
                SELECT id FROM leads WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM conversations
            WHERE business_id != '{SystemBusinessId}';");

        // Delete leads
        migrationBuilder.Sql($@"
            DELETE FROM leads
            WHERE business_id != '{SystemBusinessId}';");

        // Delete voice-related data
        migrationBuilder.Sql($@"
            DELETE FROM voice_calls
            WHERE voice_agent_id IN (
                SELECT id FROM voice_agents WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM outbound_calls
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM voice_agents
            WHERE business_id != '{SystemBusinessId}';");

        // Delete chat-related data (preserve system business chat widget)
        migrationBuilder.Sql($@"
            DELETE FROM chat_messages
            WHERE chat_session_id IN (
                SELECT cs.id FROM chat_sessions cs
                JOIN chat_widgets cw ON cs.chat_widget_id = cw.id
                WHERE cw.business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM chat_widget_events
            WHERE chat_widget_id IN (
                SELECT id FROM chat_widgets WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM chat_sessions
            WHERE chat_widget_id IN (
                SELECT id FROM chat_widgets WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM chat_widgets
            WHERE business_id != '{SystemBusinessId}';");

        // Delete knowledge base (preserve system business)
        migrationBuilder.Sql($@"
            DELETE FROM knowledge_base_articles
            WHERE business_id != '{SystemBusinessId}';");

        // Delete webhook data
        migrationBuilder.Sql($@"
            DELETE FROM webhook_deliveries
            WHERE webhook_id IN (
                SELECT id FROM webhooks WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM webhooks
            WHERE business_id != '{SystemBusinessId}';");

        // Delete workflow instances and definitions
        migrationBuilder.Sql($@"
            DELETE FROM workflow_executions
            WHERE workflow_instance_id IN (
                SELECT id FROM workflow_instances WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM workflow_approval_requests
            WHERE workflow_instance_id IN (
                SELECT id FROM workflow_instances WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM workflow_instances
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM workflow_definitions
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM business_workflows
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM business_overrides
            WHERE business_id != '{SystemBusinessId}';");

        // Delete channels (preserve system business channels)
        migrationBuilder.Sql($@"
            DELETE FROM channels
            WHERE business_id != '{SystemBusinessId}';");

        // Delete CRM providers
        migrationBuilder.Sql($@"
            DELETE FROM crm_providers
            WHERE business_id != '{SystemBusinessId}';");

        // Delete Cal.com integrations
        migrationBuilder.Sql($@"
            DELETE FROM cal_com_integrations
            WHERE business_id != '{SystemBusinessId}';");

        // Delete SLA policies
        migrationBuilder.Sql($@"
            DELETE FROM sla_policies
            WHERE business_id != '{SystemBusinessId}';");

        // =====================================================
        // PHASE 5: Delete subscriptions for test businesses
        // =====================================================
        migrationBuilder.Sql($@"
            DELETE FROM subscription_intents
            WHERE business_id != '{SystemBusinessId}';");

        migrationBuilder.Sql($@"
            DELETE FROM subscription
            WHERE business_id != '{SystemBusinessId}';");

        // =====================================================
        // PHASE 6: Delete users of test businesses
        // =====================================================
        migrationBuilder.Sql($@"
            DELETE FROM refresh_tokens
            WHERE user_id IN (
                SELECT id FROM users WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM email_otps
            WHERE user_id IN (
                SELECT id FROM users WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM user_roles
            WHERE user_id IN (
                SELECT id FROM users WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM user_claims
            WHERE user_id IN (
                SELECT id FROM users WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM user_logins
            WHERE user_id IN (
                SELECT id FROM users WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM user_tokens
            WHERE user_id IN (
                SELECT id FROM users WHERE business_id != '{SystemBusinessId}'
            );");

        migrationBuilder.Sql($@"
            DELETE FROM users
            WHERE business_id != '{SystemBusinessId}';");

        // =====================================================
        // PHASE 7: Delete test businesses (keep system business)
        // =====================================================
        migrationBuilder.Sql($@"
            DELETE FROM businesses
            WHERE id != '{SystemBusinessId}';");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // This migration is intentionally irreversible.
        // Test data should not be re-added to production.
        // If needed, re-run TestDataSeeder in development environment.
    }
}

