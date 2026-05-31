using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunicationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "communication_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email_sender_name = table.Column<string>(type: "text", nullable: true),
                    email_reply_to = table.Column<string>(type: "text", nullable: true),
                    email_signature = table.Column<string>(type: "text", nullable: true),
                    sms_default_sender = table.Column<string>(type: "text", nullable: true),
                    sms_opt_out_message = table.Column<string>(type: "text", nullable: true),
                    sms_enable_auto_reply = table.Column<bool>(type: "boolean", nullable: false),
                    voice_business_hours = table.Column<string>(type: "text", nullable: true),
                    voice_voicemail_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    voice_call_forwarding_number = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_communication_settings", x => x.id);
                    table.ForeignKey(
                        name: "fk_communication_settings_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_communication_settings_business_id",
                table: "communication_settings",
                column: "business_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "communication_settings");
        }
    }
}
