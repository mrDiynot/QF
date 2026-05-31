using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalUsageLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "external_usage_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    operation_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    input_tokens = table.Column<int>(type: "integer", nullable: true),
                    output_tokens = table.Column<int>(type: "integer", nullable: true),
                    model = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    direction = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    estimated_cost = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    message_id = table.Column<Guid>(type: "uuid", nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_external_usage_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_external_usage_logs_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_external_usage_logs_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_external_usage_logs_messages_message_id",
                        column: x => x.message_id,
                        principalTable: "messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            // NOTE: proposals table already exists in database (created manually or via previous deployment)
            // Skipping proposals table creation

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_business_date",
                table: "external_usage_logs",
                columns: new[] { "business_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_business_id",
                table: "external_usage_logs",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_business_service_date",
                table: "external_usage_logs",
                columns: new[] { "business_id", "service_type", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_conversation_id",
                table: "external_usage_logs",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_created_at",
                table: "external_usage_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_message_id",
                table: "external_usage_logs",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_operation_type",
                table: "external_usage_logs",
                column: "operation_type");

            migrationBuilder.CreateIndex(
                name: "ix_external_usage_logs_service_type",
                table: "external_usage_logs",
                column: "service_type");

            // NOTE: proposals indexes already exist in database
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "external_usage_logs");

            // NOTE: proposals table not dropped - it was pre-existing
        }
    }
}
