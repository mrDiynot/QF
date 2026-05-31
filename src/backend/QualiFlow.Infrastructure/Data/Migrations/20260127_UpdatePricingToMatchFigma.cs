using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePricingToMatchFigma : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ========================================================================
            // Update subscription_plans pricing to match Figma design
            // SmartFlow: $199/mo ($1910/yr with 20% discount)
            // UltraFlow: $699/mo ($6710/yr with 20% discount)
            // ========================================================================
            migrationBuilder.Sql(@"
                UPDATE subscription_plans 
                SET price_monthly = 199, price_yearly = 1910
                WHERE name = 'smartflow';

                UPDATE subscription_plans 
                SET price_monthly = 699, price_yearly = 6710
                WHERE name = 'ultraflow';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert to old pricing (if needed)
            migrationBuilder.Sql(@"
                UPDATE subscription_plans 
                SET price_monthly = 99, price_yearly = 950
                WHERE name = 'smartflow';

                UPDATE subscription_plans 
                SET price_monthly = 199, price_yearly = 1910
                WHERE name = 'ultraflow';
            ");
        }
    }
}
