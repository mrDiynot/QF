using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailDomainRestrictionToBusiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "allowed_email_domain",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "enforce_email_domain_restriction",
                table: "businesses",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "allowed_email_domain",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "enforce_email_domain_restriction",
                table: "businesses");
        }
    }
}
