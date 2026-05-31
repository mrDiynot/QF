using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessSettingsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "country",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "logo_url",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "primary_color",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "state",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "website",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "widget_offline_message",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "widget_position",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "widget_welcome_message",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "zip_code",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "business_hours_end",
                table: "ai_configurations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "business_hours_start",
                table: "ai_configurations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "out_of_hours_message",
                table: "ai_configurations",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ai_response_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "general"),
                    prompt = table.Column<string>(type: "text", nullable: false),
                    variables_json = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    tone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "professional"),
                    max_tokens = table.Column<int>(type: "integer", nullable: false, defaultValue: 150),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    usage_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_response_templates", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_response_templates_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "overage_alert_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    email_notifications_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    in_app_notifications_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    alert_at_50_percent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    alert_at_75_percent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    alert_at_90_percent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    alert_at_100_percent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_alert_at_50_percent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_alert_at_75_percent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_alert_at_90_percent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_alert_at_100_percent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notify_emails_json = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_overage_alert_settings", x => x.id);
                    table.ForeignKey(
                        name: "fk_overage_alert_settings_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ai_response_templates_business_category",
                table: "ai_response_templates",
                columns: new[] { "business_id", "category" });

            migrationBuilder.CreateIndex(
                name: "ix_ai_response_templates_business_id",
                table: "ai_response_templates",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_overage_alert_settings_business_id",
                table: "overage_alert_settings",
                column: "business_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_response_templates");

            migrationBuilder.DropTable(
                name: "overage_alert_settings");

            migrationBuilder.DropColumn(
                name: "address",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "city",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "country",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "description",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "logo_url",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "primary_color",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "state",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "website",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "widget_offline_message",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "widget_position",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "widget_welcome_message",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "zip_code",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "business_hours_end",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "business_hours_start",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "out_of_hours_message",
                table: "ai_configurations");
        }
    }
}
