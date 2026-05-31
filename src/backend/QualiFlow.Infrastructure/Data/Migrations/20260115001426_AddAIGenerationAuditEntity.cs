using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAIGenerationAuditEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ai_generation_audits",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    task_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    input_prompt = table.Column<string>(type: "text", nullable: false),
                    output_json = table.Column<string>(type: "text", nullable: false),
                    input_tokens = table.Column<int>(type: "integer", nullable: false),
                    output_tokens = table.Column<int>(type: "integer", nullable: false),
                    model_used = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    duration_ms = table.Column<int>(type: "integer", nullable: false),
                    estimated_cost_usd = table.Column<decimal>(type: "numeric(18,8)", precision: 18, scale: 8, nullable: false),
                    feedback = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    feedback_comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    feedback_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_success = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    metadata = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_generation_audits", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_generation_audits_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ai_generation_audits_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ai_generation_audits_business_created_at",
                table: "ai_generation_audits",
                columns: new[] { "business_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_ai_generation_audits_business_feedback",
                table: "ai_generation_audits",
                columns: new[] { "business_id", "feedback" },
                filter: "feedback IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_ai_generation_audits_business_id",
                table: "ai_generation_audits",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_generation_audits_business_task_type",
                table: "ai_generation_audits",
                columns: new[] { "business_id", "task_type" });

            migrationBuilder.CreateIndex(
                name: "ix_ai_generation_audits_business_user_id",
                table: "ai_generation_audits",
                columns: new[] { "business_id", "user_id" },
                filter: "user_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_ai_generation_audits_user_id",
                table: "ai_generation_audits",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_generation_audits");
        }
    }
}
