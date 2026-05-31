using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
#pragma warning disable S4581 // GUID instantiation with zeros is valid for EF migrations

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVoiceCallConversationId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "estimated_time_minutes",
                table: "workflow_templates",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "icon",
                table: "workflow_templates",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_prebuilt",
                table: "workflow_templates",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "required_tier",
                table: "workflow_templates",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "step_count",
                table: "workflow_templates",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "trigger_description",
                table: "workflow_templates",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "trigger_type",
                table: "workflow_templates",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "workflow_id",
                table: "workflow_templates",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "workflow_plan_assignments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "subscription_plan_id",
                table: "workflow_plan_assignments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "conversation_id",
                table: "voice_calls",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_workflow_plan_assignments_subscription_plan_id",
                table: "workflow_plan_assignments",
                column: "subscription_plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_voice_calls_conversation_id",
                table: "voice_calls",
                column: "conversation_id");

            migrationBuilder.AddForeignKey(
                name: "fk_voice_calls_conversations_conversation_id",
                table: "voice_calls",
                column: "conversation_id",
                principalTable: "conversations",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_workflow_plan_assignments_subscription_plans_subscription_p",
                table: "workflow_plan_assignments",
                column: "subscription_plan_id",
                principalTable: "subscription_plans",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_voice_calls_conversations_conversation_id",
                table: "voice_calls");

            migrationBuilder.DropForeignKey(
                name: "fk_workflow_plan_assignments_subscription_plans_subscription_p",
                table: "workflow_plan_assignments");

            migrationBuilder.DropIndex(
                name: "ix_workflow_plan_assignments_subscription_plan_id",
                table: "workflow_plan_assignments");

            migrationBuilder.DropIndex(
                name: "ix_voice_calls_conversation_id",
                table: "voice_calls");

            migrationBuilder.DropColumn(
                name: "estimated_time_minutes",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "icon",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "is_prebuilt",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "required_tier",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "step_count",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "trigger_description",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "trigger_type",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "workflow_id",
                table: "workflow_templates");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "workflow_plan_assignments");

            migrationBuilder.DropColumn(
                name: "subscription_plan_id",
                table: "workflow_plan_assignments");

            migrationBuilder.DropColumn(
                name: "conversation_id",
                table: "voice_calls");
        }
    }
}
