using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddComingSoonAnalytics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chat_widget_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    chat_session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    event_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    event_data = table.Column<string>(type: "jsonb", nullable: true),
                    visitor_token = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    page_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_widget_events", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_widget_events_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_chat_widget_events_chat_sessions_chat_session_id",
                        column: x => x.chat_session_id,
                        principalTable: "chat_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "waitlist_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    chat_session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    page_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    referrer_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    signed_up_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    synced_to_brevo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    metadata_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_waitlist_entries", x => x.id);
                    table.ForeignKey(
                        name: "fk_waitlist_entries_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_waitlist_entries_chat_sessions_chat_session_id",
                        column: x => x.chat_session_id,
                        principalTable: "chat_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "idx_chat_widget_events_business_id",
                table: "chat_widget_events",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "idx_chat_widget_events_business_type_time",
                table: "chat_widget_events",
                columns: new[] { "business_id", "event_type", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "idx_chat_widget_events_chat_session_id",
                table: "chat_widget_events",
                column: "chat_session_id");

            migrationBuilder.CreateIndex(
                name: "idx_chat_widget_events_event_type",
                table: "chat_widget_events",
                column: "event_type");

            migrationBuilder.CreateIndex(
                name: "idx_chat_widget_events_occurred_at",
                table: "chat_widget_events",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "idx_waitlist_entries_business_email",
                table: "waitlist_entries",
                columns: new[] { "business_id", "email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_waitlist_entries_business_id",
                table: "waitlist_entries",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "idx_waitlist_entries_email",
                table: "waitlist_entries",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "idx_waitlist_entries_signed_up_at",
                table: "waitlist_entries",
                column: "signed_up_at");

            migrationBuilder.CreateIndex(
                name: "idx_waitlist_entries_source",
                table: "waitlist_entries",
                column: "source");

            migrationBuilder.CreateIndex(
                name: "ix_waitlist_entries_chat_session_id",
                table: "waitlist_entries",
                column: "chat_session_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chat_widget_events");

            migrationBuilder.DropTable(
                name: "waitlist_entries");
        }
    }
}
