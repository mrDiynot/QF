using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingDiscounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "discount_annual",
                table: "subscription_plans",
                type: "integer",
                nullable: false,
                defaultValue: 20);

            migrationBuilder.AddColumn<int>(
                name: "discount_quarterly",
                table: "subscription_plans",
                type: "integer",
                nullable: false,
                defaultValue: 10);

            // Fix pricing values - Quarterly should be 10% off, Annual should be 20% off
            // Smart Flow: $199/mo -> Quarterly: $179 (10% off), Annual: $159 (20% off)
            // Ultra Flow: $699/mo -> Quarterly: $629 (10% off), Annual: $559 (20% off)
            migrationBuilder.Sql(@"
                UPDATE subscription_plans
                SET price_quarterly = 179, price_yearly = 159, discount_quarterly = 10, discount_annual = 20
                WHERE name = 'smartflow';

                UPDATE subscription_plans
                SET price_quarterly = 629, price_yearly = 559, discount_quarterly = 10, discount_annual = 20
                WHERE name = 'ultraflow';

                UPDATE subscription_plans
                SET price_quarterly = 0, price_yearly = 0, discount_quarterly = 0, discount_annual = 0
                WHERE name = 'freeflow';

                UPDATE subscription_plans
                SET discount_quarterly = 10, discount_annual = 20
                WHERE name = 'enterprise';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "discount_annual",
                table: "subscription_plans");

            migrationBuilder.DropColumn(
                name: "discount_quarterly",
                table: "subscription_plans");
        }
    }
}
