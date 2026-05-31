using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationsAndUsageSnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    data_json = table.Column<string>(type: "text", nullable: true),
                    action_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    priority = table.Column<string>(type: "text", nullable: false, defaultValue: "Normal"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_notifications_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "usage_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    snapshot_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: true),
                    plan_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    current_leads_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_channels_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_phone_numbers_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_seats_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_workflows_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_crm_contacts_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_ai_voice_agents_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    monthly_messages_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    monthly_ai_conversations_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    monthly_ai_sms_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    monthly_ai_voice_minutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    monthly_api_calls_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    storage_used_bytes = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    knowledge_base_storage_bytes = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    billing_cycle_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    billing_cycle_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usage_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_usage_snapshots_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_business_id",
                table: "notifications",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_business_id_is_read",
                table: "notifications",
                columns: new[] { "business_id", "is_read" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_business_user_is_read",
                table: "notifications",
                columns: new[] { "business_id", "user_id", "is_read" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_created_at",
                table: "notifications",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_usage_snapshots_business_date_unique",
                table: "usage_snapshots",
                columns: new[] { "business_id", "snapshot_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usage_snapshots_business_id",
                table: "usage_snapshots",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_usage_snapshots_snapshot_date",
                table: "usage_snapshots",
                column: "snapshot_date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "usage_snapshots");
        }
    }
}
