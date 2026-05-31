using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowTemplateSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "workflow_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_global_template = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    default_trigger = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    default_steps = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    configurable_fields = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "business_workflows",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_approved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    custom_configuration = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    total_executions = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    successful_executions = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    failed_executions = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    last_executed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    activated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_business_workflows", x => x.id);
                    table.ForeignKey(
                        name: "fk_business_workflows_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_business_workflows_workflow_templates_template_id",
                        column: x => x.template_id,
                        principalTable: "workflow_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "workflow_approval_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requested_by_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    request_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    custom_configuration = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    reviewed_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    review_notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_approval_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_workflow_approval_requests_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_workflow_approval_requests_users_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_workflow_approval_requests_workflow_templates_workflow_temp",
                        column: x => x.workflow_template_id,
                        principalTable: "workflow_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflow_plan_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_template_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_tier = table.Column<string>(type: "text", nullable: false),
                    is_included = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    requires_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    max_instances = table.Column<int>(type: "integer", nullable: true),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    assigned_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_plan_assignments", x => x.id);
                    table.ForeignKey(
                        name: "fk_workflow_plan_assignments_workflow_templates_workflow_templ",
                        column: x => x.workflow_template_id,
                        principalTable: "workflow_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "workflow_executions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_core_instance_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    steps_completed = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    steps_total = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    current_step = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    input_data = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    result_data = table.Column<string>(type: "jsonb", nullable: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    error_stack_trace = table.Column<string>(type: "text", nullable: true),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    triggered_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_executions", x => x.id);
                    table.ForeignKey(
                        name: "fk_workflow_executions_business_workflows_business_workflow_id",
                        column: x => x.business_workflow_id,
                        principalTable: "business_workflows",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_workflow_executions_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_workflow_executions_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_workflow_executions_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_workflow_executions_users_triggered_by_user_id",
                        column: x => x.triggered_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_business_workflows_business_id",
                table: "business_workflows",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_business_workflows_business_id_template_id",
                table: "business_workflows",
                columns: new[] { "business_id", "template_id" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_business_workflows_deleted_at",
                table: "business_workflows",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_business_workflows_is_active",
                table: "business_workflows",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_business_workflows_template_id",
                table: "business_workflows",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_approval_requests_business_id",
                table: "workflow_approval_requests",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_approval_requests_deleted_at",
                table: "workflow_approval_requests",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_approval_requests_requested_at",
                table: "workflow_approval_requests",
                column: "requested_at");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_approval_requests_requested_by_user_id",
                table: "workflow_approval_requests",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_approval_requests_status",
                table: "workflow_approval_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_approval_requests_workflow_template_id",
                table: "workflow_approval_requests",
                column: "workflow_template_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_business_id",
                table: "workflow_executions",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_business_workflow_id",
                table: "workflow_executions",
                column: "business_workflow_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_completed_at",
                table: "workflow_executions",
                column: "completed_at");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_conversation_id",
                table: "workflow_executions",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_deleted_at",
                table: "workflow_executions",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_lead_id",
                table: "workflow_executions",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_started_at",
                table: "workflow_executions",
                column: "started_at");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_status",
                table: "workflow_executions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_executions_triggered_by_user_id",
                table: "workflow_executions",
                column: "triggered_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_plan_assignments_plan_tier",
                table: "workflow_plan_assignments",
                column: "plan_tier");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_plan_assignments_workflow_template_id",
                table: "workflow_plan_assignments",
                column: "workflow_template_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_plan_assignments_workflow_template_id_plan_tier",
                table: "workflow_plan_assignments",
                columns: new[] { "workflow_template_id", "plan_tier" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_templates_category",
                table: "workflow_templates",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_templates_deleted_at",
                table: "workflow_templates",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_templates_is_active",
                table: "workflow_templates",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_templates_is_global_template",
                table: "workflow_templates",
                column: "is_global_template");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "workflow_approval_requests");

            migrationBuilder.DropTable(
                name: "workflow_executions");

            migrationBuilder.DropTable(
                name: "workflow_plan_assignments");

            migrationBuilder.DropTable(
                name: "business_workflows");

            migrationBuilder.DropTable(
                name: "workflow_templates");
        }
    }
}
