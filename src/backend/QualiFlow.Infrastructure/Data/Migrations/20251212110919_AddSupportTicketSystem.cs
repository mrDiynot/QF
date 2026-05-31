using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSupportTicketSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "sla_policies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    first_response_minutes = table.Column<int>(type: "integer", nullable: false),
                    resolution_minutes = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sla_policies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "support_tickets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ticket_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reported_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reporter_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    reporter_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    first_response_due = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolution_due = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    first_response_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sla_breached = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    assigned_to_admin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_support_tickets", x => x.id);
                    table.ForeignKey(
                        name: "fk_support_tickets_admin_users_assigned_to_admin_id",
                        column: x => x.assigned_to_admin_id,
                        principalTable: "admin_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_support_tickets_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_support_tickets_users_reported_by_user_id",
                        column: x => x.reported_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ticket_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    is_internal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    sent_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sent_by_admin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sender_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    sender_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ticket_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_ticket_messages_admin_users_sent_by_admin_id",
                        column: x => x.sent_by_admin_id,
                        principalTable: "admin_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_ticket_messages_support_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "support_tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ticket_messages_users_sent_by_user_id",
                        column: x => x.sent_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ticket_attachments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<Guid>(type: "uuid", nullable: true),
                    file_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    storage_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ticket_attachments", x => x.id);
                    table.ForeignKey(
                        name: "fk_ticket_attachments_support_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "support_tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ticket_attachments_ticket_messages_message_id",
                        column: x => x.message_id,
                        principalTable: "ticket_messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "sla_policies",
                columns: new[] { "id", "created_at", "deleted_at", "description", "first_response_minutes", "is_active", "priority", "resolution_minutes", "updated_at" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0001-000000000001"), new DateTime(2025, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Critical priority: 1 hour first response, 4 hours resolution", 60, true, "Critical", 240, null },
                    { new Guid("00000000-0000-0000-0001-000000000002"), new DateTime(2025, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "High priority: 4 hours first response, 24 hours resolution", 240, true, "High", 1440, null },
                    { new Guid("00000000-0000-0000-0001-000000000003"), new DateTime(2025, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Medium priority: 24 hours first response, 72 hours resolution", 1440, true, "Medium", 4320, null },
                    { new Guid("00000000-0000-0000-0001-000000000004"), new DateTime(2025, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), null, "Low priority: 72 hours first response, 7 days resolution", 4320, true, "Low", 10080, null }
                });

            migrationBuilder.CreateIndex(
                name: "ix_sla_policies_priority",
                table: "sla_policies",
                column: "priority",
                unique: true,
                filter: "deleted_at IS NULL AND is_active = true");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_assigned_to_admin_id",
                table: "support_tickets",
                column: "assigned_to_admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_business_id",
                table: "support_tickets",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_created_at",
                table: "support_tickets",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_priority",
                table: "support_tickets",
                column: "priority");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_reported_by_user_id",
                table: "support_tickets",
                column: "reported_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_sla_breached",
                table: "support_tickets",
                column: "sla_breached",
                filter: "sla_breached = true");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_status",
                table: "support_tickets",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_ticket_number",
                table: "support_tickets",
                column: "ticket_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ticket_attachments_message_id",
                table: "ticket_attachments",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "ix_ticket_attachments_ticket_id",
                table: "ticket_attachments",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "ix_ticket_messages_created_at",
                table: "ticket_messages",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_ticket_messages_is_internal",
                table: "ticket_messages",
                column: "is_internal");

            migrationBuilder.CreateIndex(
                name: "ix_ticket_messages_sent_by_admin_id",
                table: "ticket_messages",
                column: "sent_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_ticket_messages_sent_by_user_id",
                table: "ticket_messages",
                column: "sent_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_ticket_messages_ticket_id",
                table: "ticket_messages",
                column: "ticket_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sla_policies");

            migrationBuilder.DropTable(
                name: "ticket_attachments");

            migrationBuilder.DropTable(
                name: "ticket_messages");

            migrationBuilder.DropTable(
                name: "support_tickets");
        }
    }
}
