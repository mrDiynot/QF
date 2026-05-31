// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations;

/// <summary>
/// Seeds the coming-soon-widget for the landing page chat functionality.
/// This widget uses real OpenAI API responses for visitor engagement.
/// </summary>
public partial class SeedComingSoonChatWidget : Migration
{
    // Use the QualiFlowAI Platform business (seeded in initial migration)
    private static readonly Guid PlatformBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");
    private static readonly Guid ComingSoonWidgetId = Guid.Parse("00000000-0000-0000-0000-000000000101");

    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Insert the coming-soon-widget for the landing page
        migrationBuilder.Sql($@"
            INSERT INTO chat_widgets (
                id,
                business_id,
                name,
                widget_key,
                is_active,
                allowed_domains,
                primary_color,
                position,
                greeting_message,
                offline_message,
                show_pre_chat_form,
                pre_chat_form_fields_json,
                enable_ai_response,
                ai_response_delay_ms,
                session_timeout_minutes,
                auto_create_lead,
                business_hours_json,
                custom_css,
                created_at,
                updated_at
            )
            SELECT
                '{ComingSoonWidgetId}',
                '{PlatformBusinessId}',
                'Coming Soon Landing Page Chat',
                'coming-soon-widget',
                true,
                'localhost,qualiflow.ai,qualiflowai.com,www.qualiflowai.com',
                '#6B2D9E',
                'bottom-right',
                'Hi! 👋 I''m the QualiflowAI assistant. I can answer questions about our AI-powered customer journey platform. What would you like to know?',
                'Thanks for reaching out! Leave your email and we''ll get back to you soon.',
                false,
                '[]',
                true,
                1500,
                60,
                true,
                '{{}}',
                '',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM chat_widgets WHERE widget_key = 'coming-soon-widget'
            );
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql($@"
            DELETE FROM chat_widgets WHERE id = '{ComingSoonWidgetId}';
        ");
    }
}
