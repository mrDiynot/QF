using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAIConfigurationTrackingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "auto_response_configured_at",
                table: "ai_configurations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "bant_weights_configured_at",
                table: "ai_configurations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_auto_response_enabled",
                table: "ai_configurations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_bant_weights_configured",
                table: "ai_configurations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_persona_configured",
                table: "ai_configurations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_qualification_threshold_configured",
                table: "ai_configurations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "persona_configured_at",
                table: "ai_configurations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "qualification_threshold_configured_at",
                table: "ai_configurations",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "auto_response_configured_at",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "bant_weights_configured_at",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "is_auto_response_enabled",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "is_bant_weights_configured",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "is_persona_configured",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "is_qualification_threshold_configured",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "persona_configured_at",
                table: "ai_configurations");

            migrationBuilder.DropColumn(
                name: "qualification_threshold_configured_at",
                table: "ai_configurations");
        }
    }
}
