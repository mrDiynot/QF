using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboardingSupportFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "has_onboarding_support",
                table: "onboarding_progress",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "onboarding_call_scheduled",
                table: "onboarding_progress",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "onboarding_call_scheduled_at",
                table: "onboarding_progress",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "has_onboarding_support",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "onboarding_call_scheduled",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "onboarding_call_scheduled_at",
                table: "onboarding_progress");
        }
    }
}
