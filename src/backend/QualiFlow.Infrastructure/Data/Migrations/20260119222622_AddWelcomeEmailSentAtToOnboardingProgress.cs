using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWelcomeEmailSentAtToOnboardingProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "welcome_email_sent_at",
                table: "onboarding_progress",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "welcome_email_sent_at",
                table: "onboarding_progress");
        }
    }
}
