using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddChatWidgetAiCustomizationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ai_personality",
                table: "chat_widgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "business_name",
                table: "chat_widgets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "custom_system_prompt",
                table: "chat_widgets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "enable_content_moderation",
                table: "chat_widgets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "enable_pii_protection",
                table: "chat_widgets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "industry_type",
                table: "chat_widgets",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ai_personality",
                table: "chat_widgets");

            migrationBuilder.DropColumn(
                name: "business_name",
                table: "chat_widgets");

            migrationBuilder.DropColumn(
                name: "custom_system_prompt",
                table: "chat_widgets");

            migrationBuilder.DropColumn(
                name: "enable_content_moderation",
                table: "chat_widgets");

            migrationBuilder.DropColumn(
                name: "enable_pii_protection",
                table: "chat_widgets");

            migrationBuilder.DropColumn(
                name: "industry_type",
                table: "chat_widgets");
        }
    }
}
