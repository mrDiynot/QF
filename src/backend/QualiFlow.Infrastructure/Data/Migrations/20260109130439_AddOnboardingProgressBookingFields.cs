using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboardingProgressBookingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "onboarding_call_booking_uid",
                table: "onboarding_progress",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "onboarding_call_cancelled",
                table: "onboarding_progress",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "onboarding_call_cancelled_at",
                table: "onboarding_progress",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "onboarding_call_completed",
                table: "onboarding_progress",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "onboarding_call_completed_at",
                table: "onboarding_progress",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "onboarding_call_booking_uid",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "onboarding_call_cancelled",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "onboarding_call_cancelled_at",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "onboarding_call_completed",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "onboarding_call_completed_at",
                table: "onboarding_progress");
        }
    }
}
