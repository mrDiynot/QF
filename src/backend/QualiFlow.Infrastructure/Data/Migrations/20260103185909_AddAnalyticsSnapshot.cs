using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalyticsSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "analytics_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    snapshot_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    period = table.Column<int>(type: "integer", nullable: false),
                    total_leads = table.Column<int>(type: "integer", nullable: false),
                    qualified_leads = table.Column<int>(type: "integer", nullable: false),
                    total_conversations = table.Column<int>(type: "integer", nullable: false),
                    total_messages = table.Column<int>(type: "integer", nullable: false),
                    average_response_time = table.Column<decimal>(type: "numeric", nullable: false),
                    conversion_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    active_channels = table.Column<int>(type: "integer", nullable: false),
                    channel_performance_json = table.Column<string>(type: "text", nullable: true),
                    total_ai_interactions = table.Column<int>(type: "integer", nullable: false),
                    ai_coverage_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    ai_qualification_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    leads_with_conversation = table.Column<int>(type: "integer", nullable: false),
                    leads_with_booking = table.Column<int>(type: "integer", nullable: false),
                    converted_leads = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_analytics_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_analytics_snapshots_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_analytics_snapshots_business_id",
                table: "analytics_snapshots",
                column: "business_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "analytics_snapshots");
        }
    }
}
