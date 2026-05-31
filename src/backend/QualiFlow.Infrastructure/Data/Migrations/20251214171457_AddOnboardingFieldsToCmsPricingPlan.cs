using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboardingFieldsToCmsPricingPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "cms_pricing_plans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "onboarding_price",
                table: "cms_pricing_plans",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "onboarding_required",
                table: "cms_pricing_plans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "quarterly_price",
                table: "cms_pricing_plans",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description",
                table: "cms_pricing_plans");

            migrationBuilder.DropColumn(
                name: "onboarding_price",
                table: "cms_pricing_plans");

            migrationBuilder.DropColumn(
                name: "onboarding_required",
                table: "cms_pricing_plans");

            migrationBuilder.DropColumn(
                name: "quarterly_price",
                table: "cms_pricing_plans");
        }
    }
}
