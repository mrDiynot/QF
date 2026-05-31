using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboardingStep10Fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ai_tone",
                table: "onboarding_progress",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "business_hours",
                table: "onboarding_progress",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "follow_up_preference",
                table: "onboarding_progress",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ai_tone",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "business_hours",
                table: "onboarding_progress");

            migrationBuilder.DropColumn(
                name: "follow_up_preference",
                table: "onboarding_progress");
        }
    }
}
