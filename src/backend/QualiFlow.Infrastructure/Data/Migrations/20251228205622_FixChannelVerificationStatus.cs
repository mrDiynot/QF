using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixChannelVerificationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cal_com_integrations_businesses_business_id",
                table: "cal_com_integrations");

            migrationBuilder.DropForeignKey(
                name: "fk_cal_com_integrations_users_connected_by_user_id",
                table: "cal_com_integrations");

            migrationBuilder.AddColumn<string>(
                name: "delivery_status",
                table: "messages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Queued");

            migrationBuilder.AddColumn<string>(
                name: "external_message_id",
                table: "messages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "failure_reason",
                table: "messages",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_retry_at",
                table: "messages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "retry_count",
                table: "messages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "knowledge_base_articles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    content = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_published = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    usage_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    last_used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_knowledge_base_articles", x => x.id);
                    table.ForeignKey(
                        name: "fk_knowledge_base_articles_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_messages_delivery_status",
                table: "messages",
                column: "delivery_status");

            migrationBuilder.CreateIndex(
                name: "ix_messages_delivery_status_last_retry_at",
                table: "messages",
                columns: new[] { "delivery_status", "last_retry_at" },
                filter: "delivery_status = 'Failed'");

            migrationBuilder.CreateIndex(
                name: "ix_messages_external_message_id",
                table: "messages",
                column: "external_message_id",
                filter: "external_message_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_base_articles_business_active_published",
                table: "knowledge_base_articles",
                columns: new[] { "business_id", "is_active", "is_published" });

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_base_articles_business_category",
                table: "knowledge_base_articles",
                columns: new[] { "business_id", "category" },
                filter: "category IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_base_articles_business_id",
                table: "knowledge_base_articles",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_base_articles_business_priority",
                table: "knowledge_base_articles",
                columns: new[] { "business_id", "priority" });

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_base_articles_title",
                table: "knowledge_base_articles",
                column: "title");

            migrationBuilder.AddForeignKey(
                name: "fk_cal_com_integrations_businesses_business_id",
                table: "cal_com_integrations",
                column: "business_id",
                principalTable: "businesses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_cal_com_integrations_users_connected_by_user_id",
                table: "cal_com_integrations",
                column: "connected_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            // ========================================================================
            // FIX: Update channel verification status for existing channels
            // ========================================================================
            // Background: The original activation logic incorrectly marked all
            // non-Twilio channels as "Pending" even though they don't require
            // external provisioning. This migration fixes existing data.
            //
            // Channel verification rules:
            // 1. Standalone channels (ChatWidget, WebForm) → Always "Verified" (no external setup)
            // 2. Twilio channels (SMS, Voice, WhatsApp) → "Verified" only if phone_number exists
            // 3. OAuth channels (Instagram, Facebook) → Remain "Pending" until OAuth connected
            //
            // NOTE: Future channel activations will use the corrected logic in ChannelService.
            // ========================================================================

            migrationBuilder.Sql(@"
                -- Fix standalone channels: ChatWidget and WebForm should be auto-verified
                -- These don't require phone numbers or OAuth, so they're functional immediately
                UPDATE channels
                SET
                    verification_status = 'Verified',
                    last_verified_at = NOW()
                WHERE
                    type IN ('ChatWidget', 'WebForm')  -- Enum names stored as text
                    AND verification_status = 'Pending'
                    AND deleted_at IS NULL;

                -- Note: Twilio channels (SMS, Voice, WhatsApp) with phone numbers
                -- should already be 'Verified' from original provisioning logic.
                -- Only update those that failed provisioning (no phone number).
                UPDATE channels
                SET
                    verification_status = 'Failed'
                WHERE
                    type IN ('SMS', 'Voice', 'WhatsApp')  -- Enum names stored as text
                    AND (phone_number IS NULL OR phone_number = '')
                    AND verification_status = 'Pending'
                    AND deleted_at IS NULL;

                -- Note: OAuth channels (Instagram, Facebook) should remain 'Pending'
                -- until Meta OAuth integration is implemented and user connects account.
                -- No update needed - they stay as 'Pending'.
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cal_com_integrations_businesses_business_id",
                table: "cal_com_integrations");

            migrationBuilder.DropForeignKey(
                name: "fk_cal_com_integrations_users_connected_by_user_id",
                table: "cal_com_integrations");

            migrationBuilder.DropTable(
                name: "knowledge_base_articles");

            migrationBuilder.DropIndex(
                name: "ix_messages_delivery_status",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "ix_messages_delivery_status_last_retry_at",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "ix_messages_external_message_id",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "delivery_status",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "external_message_id",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "failure_reason",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "last_retry_at",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "retry_count",
                table: "messages");

            migrationBuilder.AddForeignKey(
                name: "fk_cal_com_integrations_businesses_business_id",
                table: "cal_com_integrations",
                column: "business_id",
                principalTable: "businesses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_cal_com_integrations_users_connected_by_user_id",
                table: "cal_com_integrations",
                column: "connected_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
