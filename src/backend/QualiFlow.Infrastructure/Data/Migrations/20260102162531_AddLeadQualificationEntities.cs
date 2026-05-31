using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadQualificationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_score_history_leads_lead_id",
                table: "score_history");

            migrationBuilder.DropPrimaryKey(
                name: "pk_score_history",
                table: "score_history");

            migrationBuilder.RenameTable(
                name: "score_history",
                newName: "score_histories");

            migrationBuilder.RenameIndex(
                name: "ix_score_history_lead_id",
                table: "score_histories",
                newName: "ix_score_histories_lead_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_score_histories",
                table: "score_histories",
                column: "id");

            migrationBuilder.CreateTable(
                name: "business_knowledge_bases",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entry_type = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: true),
                    tags = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    keywords = table.Column<string>(type: "text", nullable: true),
                    metadata_json = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_business_knowledge_bases", x => x.id);
                    table.ForeignKey(
                        name: "fk_business_knowledge_bases_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "business_scoring_configurations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    qualification_threshold = table.Column<int>(type: "integer", nullable: false),
                    ai_weight = table.Column<int>(type: "integer", nullable: false),
                    rules_weight = table.Column<int>(type: "integer", nullable: false),
                    budget_weight = table.Column<int>(type: "integer", nullable: false),
                    authority_weight = table.Column<int>(type: "integer", nullable: false),
                    need_weight = table.Column<int>(type: "integer", nullable: false),
                    timeline_weight = table.Column<int>(type: "integer", nullable: false),
                    contacted_threshold = table.Column<int>(type: "integer", nullable: false),
                    engaged_threshold = table.Column<int>(type: "integer", nullable: false),
                    qualified_threshold = table.Column<int>(type: "integer", nullable: false),
                    opportunity_threshold = table.Column<int>(type: "integer", nullable: false),
                    auto_transition_status = table.Column<bool>(type: "boolean", nullable: false),
                    ai_score_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    score_decay_days = table.Column<int>(type: "integer", nullable: false),
                    score_decay_percentage = table.Column<int>(type: "integer", nullable: false),
                    scoring_model_version = table.Column<string>(type: "text", nullable: true),
                    custom_rules_json = table.Column<string>(type: "text", nullable: true),
                    industry_template = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_business_scoring_configurations", x => x.id);
                    table.ForeignKey(
                        name: "fk_business_scoring_configurations_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "industry_scoring_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    industry = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    qualification_threshold = table.Column<int>(type: "integer", nullable: false),
                    ai_weight = table.Column<int>(type: "integer", nullable: false),
                    rules_weight = table.Column<int>(type: "integer", nullable: false),
                    budget_weight = table.Column<int>(type: "integer", nullable: false),
                    authority_weight = table.Column<int>(type: "integer", nullable: false),
                    need_weight = table.Column<int>(type: "integer", nullable: false),
                    timeline_weight = table.Column<int>(type: "integer", nullable: false),
                    industry_criteria_json = table.Column<string>(type: "text", nullable: true),
                    bant_questions_json = table.Column<string>(type: "text", nullable: true),
                    objection_handling_json = table.Column<string>(type: "text", nullable: true),
                    industry_keywords = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_industry_scoring_templates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lead_enrichments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source = table.Column<string>(type: "text", nullable: false),
                    company_name = table.Column<string>(type: "text", nullable: true),
                    company_domain = table.Column<string>(type: "text", nullable: true),
                    company_industry = table.Column<string>(type: "text", nullable: true),
                    company_size = table.Column<string>(type: "text", nullable: true),
                    company_revenue = table.Column<string>(type: "text", nullable: true),
                    company_location = table.Column<string>(type: "text", nullable: true),
                    company_linked_in = table.Column<string>(type: "text", nullable: true),
                    job_title = table.Column<string>(type: "text", nullable: true),
                    seniority = table.Column<string>(type: "text", nullable: true),
                    department = table.Column<string>(type: "text", nullable: true),
                    person_linked_in = table.Column<string>(type: "text", nullable: true),
                    twitter_handle = table.Column<string>(type: "text", nullable: true),
                    confidence_score = table.Column<int>(type: "integer", nullable: false),
                    is_decision_maker = table.Column<bool>(type: "boolean", nullable: false),
                    raw_response_json = table.Column<string>(type: "text", nullable: true),
                    enriched_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lead_enrichments", x => x.id);
                    table.ForeignKey(
                        name: "fk_lead_enrichments_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ml_score_predictions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    model_version = table.Column<string>(type: "text", nullable: false),
                    conversion_probability = table.Column<decimal>(type: "numeric", nullable: false),
                    predicted_score = table.Column<int>(type: "integer", nullable: false),
                    confidence_lower = table.Column<decimal>(type: "numeric", nullable: false),
                    confidence_upper = table.Column<decimal>(type: "numeric", nullable: false),
                    feature_importance_json = table.Column<string>(type: "text", nullable: true),
                    feature_vector_json = table.Column<string>(type: "text", nullable: true),
                    was_accurate = table.Column<bool>(type: "boolean", nullable: true),
                    actual_outcome = table.Column<string>(type: "text", nullable: true),
                    predicted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ml_score_predictions", x => x.id);
                    table.ForeignKey(
                        name: "fk_ml_score_predictions_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scoring_ab_tests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    control_configuration_id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_configuration_id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_traffic_percent = table.Column<int>(type: "integer", nullable: false),
                    primary_metric = table.Column<string>(type: "text", nullable: false),
                    minimum_sample_size = table.Column<int>(type: "integer", nullable: false),
                    significance_threshold = table.Column<decimal>(type: "numeric", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    winning_variant = table.Column<string>(type: "text", nullable: true),
                    control_conversions = table.Column<int>(type: "integer", nullable: false),
                    control_total_leads = table.Column<int>(type: "integer", nullable: false),
                    treatment_conversions = table.Column<int>(type: "integer", nullable: false),
                    treatment_total_leads = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scoring_ab_tests", x => x.id);
                    table.ForeignKey(
                        name: "fk_scoring_ab_tests_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_business_knowledge_bases_business_id",
                table: "business_knowledge_bases",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_business_scoring_configurations_business_id",
                table: "business_scoring_configurations",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_lead_enrichments_lead_id",
                table: "lead_enrichments",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_ml_score_predictions_lead_id",
                table: "ml_score_predictions",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_scoring_ab_tests_business_id",
                table: "scoring_ab_tests",
                column: "business_id");

            migrationBuilder.AddForeignKey(
                name: "fk_score_histories_leads_lead_id",
                table: "score_histories",
                column: "lead_id",
                principalTable: "leads",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_score_histories_leads_lead_id",
                table: "score_histories");

            migrationBuilder.DropTable(
                name: "business_knowledge_bases");

            migrationBuilder.DropTable(
                name: "business_scoring_configurations");

            migrationBuilder.DropTable(
                name: "industry_scoring_templates");

            migrationBuilder.DropTable(
                name: "lead_enrichments");

            migrationBuilder.DropTable(
                name: "ml_score_predictions");

            migrationBuilder.DropTable(
                name: "scoring_ab_tests");

            migrationBuilder.DropPrimaryKey(
                name: "pk_score_histories",
                table: "score_histories");

            migrationBuilder.RenameTable(
                name: "score_histories",
                newName: "score_history");

            migrationBuilder.RenameIndex(
                name: "ix_score_histories_lead_id",
                table: "score_history",
                newName: "ix_score_history_lead_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_score_history",
                table: "score_history",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_score_history_leads_lead_id",
                table: "score_history",
                column: "lead_id",
                principalTable: "leads",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
