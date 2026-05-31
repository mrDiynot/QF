using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MetaIntegrationEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "external_participant_id",
                table: "conversations",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "external_account_id",
                table: "channels",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "credentials",
                table: "channels",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "external_id",
                table: "channels",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "metadata",
                table: "channels",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "token_expires_at",
                table: "channels",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_channels_type_external_id",
                table: "channels",
                columns: new[] { "type", "external_id" },
                filter: "external_id IS NOT NULL AND deleted_at IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_channels_type_external_id",
                table: "channels");

            migrationBuilder.DropColumn(
                name: "external_participant_id",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "credentials",
                table: "channels");

            migrationBuilder.DropColumn(
                name: "external_id",
                table: "channels");

            migrationBuilder.DropColumn(
                name: "metadata",
                table: "channels");

            migrationBuilder.DropColumn(
                name: "token_expires_at",
                table: "channels");

            migrationBuilder.AlterColumn<string>(
                name: "external_account_id",
                table: "channels",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);
        }
    }
}
