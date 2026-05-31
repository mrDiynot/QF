using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminUserForIndependentAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_admin_users_users_user_id",
                table: "admin_users");

            migrationBuilder.DropIndex(
                name: "ix_admin_users_user_id",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "admin_users");

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "admin_users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "failed_login_attempts",
                table: "admin_users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "first_name",
                table: "admin_users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "last_login_ip",
                table: "admin_users",
                type: "character varying(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "last_name",
                table: "admin_users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "lockout_end_at",
                table: "admin_users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "must_change_password",
                table: "admin_users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "normalized_email",
                table: "admin_users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "password_hash",
                table: "admin_users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "refresh_token",
                table: "admin_users",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "refresh_token_expires_at",
                table: "admin_users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_admin_users_normalized_email",
                table: "admin_users",
                column: "normalized_email",
                unique: true,
                filter: "deleted_at IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_admin_users_normalized_email",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "email",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "failed_login_attempts",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "first_name",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "last_login_ip",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "last_name",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "lockout_end_at",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "must_change_password",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "normalized_email",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "password_hash",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "refresh_token",
                table: "admin_users");

            migrationBuilder.DropColumn(
                name: "refresh_token_expires_at",
                table: "admin_users");

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "admin_users",
                type: "uuid",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.CreateIndex(
                name: "ix_admin_users_user_id",
                table: "admin_users",
                column: "user_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_admin_users_users_user_id",
                table: "admin_users",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
