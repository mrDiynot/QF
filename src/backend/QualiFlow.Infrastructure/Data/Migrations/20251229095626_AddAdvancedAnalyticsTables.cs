using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancedAnalyticsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ab_tests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    hypothesis = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    winner_variant = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    confidence_level = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    statistical_significance = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    traffic_split_percentage = table.Column<int>(type: "integer", nullable: false, defaultValue: 50),
                    minimum_sample_size = table.Column<int>(type: "integer", nullable: true),
                    configuration = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ab_tests", x => x.id);
                    table.ForeignKey(
                        name: "fk_ab_tests_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "form_views",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    form_id = table.Column<Guid>(type: "uuid", nullable: false),
                    viewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    referrer = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    utm_source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    utm_medium = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    utm_campaign = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    session_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    device_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    browser = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    operating_system = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    submitted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    submission_id = table.Column<Guid>(type: "uuid", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    time_spent_seconds = table.Column<int>(type: "integer", nullable: true),
                    bounced = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    furthest_field_reached = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    completion_percentage = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_form_views", x => x.id);
                    table.ForeignKey(
                        name: "fk_form_views_forms_form_id",
                        column: x => x.form_id,
                        principalTable: "forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "qr_campaigns",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    qr_code_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    destination_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    linked_form_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    qr_code_image_data = table.Column<string>(type: "text", nullable: true),
                    customization_settings = table.Column<string>(type: "jsonb", nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_qr_campaigns", x => x.id);
                    table.ForeignKey(
                        name: "fk_qr_campaigns_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_qr_campaigns_forms_linked_form_id",
                        column: x => x.linked_form_id,
                        principalTable: "forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ab_test_variants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ab_test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    variant_id = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    variant_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    form_id = table.Column<Guid>(type: "uuid", nullable: false),
                    views = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    conversions = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    conversion_rate = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: false, defaultValue: 0m),
                    avg_completion_time = table.Column<int>(type: "integer", nullable: true),
                    bounce_rate = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    configuration = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ab_test_variants", x => x.id);
                    table.ForeignKey(
                        name: "fk_ab_test_variants_ab_tests_ab_test_id",
                        column: x => x.ab_test_id,
                        principalTable: "ab_tests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ab_test_variants_forms_form_id",
                        column: x => x.form_id,
                        principalTable: "forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "field_interactions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    form_view_id = table.Column<Guid>(type: "uuid", nullable: false),
                    field_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    field_label = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    field_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    event_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    event_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    time_spent_seconds = table.Column<int>(type: "integer", nullable: true),
                    characters_entered = table.Column<int>(type: "integer", nullable: true),
                    edit_count = table.Column<int>(type: "integer", nullable: true),
                    had_validation_error = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    validation_error_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    abandoned_at_field = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_field_interactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_field_interactions_form_views_form_view_id",
                        column: x => x.form_view_id,
                        principalTable: "form_views",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "qr_scans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uuid", nullable: false),
                    scanned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    device_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    operating_system = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    browser = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    location_city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    location_state = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    location_country = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(10,7)", precision: 10, scale: 7, nullable: true),
                    longitude = table.Column<decimal>(type: "numeric(10,7)", precision: 10, scale: 7, nullable: true),
                    referrer = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    utm_source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    utm_medium = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    utm_campaign = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    converted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    converted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    conversion_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    conversion_value = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    session_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_unique = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_qr_scans", x => x.id);
                    table.ForeignKey(
                        name: "fk_qr_scans_qr_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "qr_campaigns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ab_test_variants_ab_test_id",
                table: "ab_test_variants",
                column: "ab_test_id");

            migrationBuilder.CreateIndex(
                name: "ix_ab_test_variants_form_id",
                table: "ab_test_variants",
                column: "form_id");

            migrationBuilder.CreateIndex(
                name: "ix_ab_test_variants_test_variant",
                table: "ab_test_variants",
                columns: new[] { "ab_test_id", "variant_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ab_tests_business_id",
                table: "ab_tests",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_ab_tests_ended_at",
                table: "ab_tests",
                column: "ended_at");

            migrationBuilder.CreateIndex(
                name: "ix_ab_tests_started_at",
                table: "ab_tests",
                column: "started_at");

            migrationBuilder.CreateIndex(
                name: "ix_ab_tests_status",
                table: "ab_tests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_field_interactions_abandoned",
                table: "field_interactions",
                column: "abandoned_at_field");

            migrationBuilder.CreateIndex(
                name: "ix_field_interactions_event_at",
                table: "field_interactions",
                column: "event_at");

            migrationBuilder.CreateIndex(
                name: "ix_field_interactions_event_type",
                table: "field_interactions",
                column: "event_type");

            migrationBuilder.CreateIndex(
                name: "ix_field_interactions_field_id",
                table: "field_interactions",
                column: "field_id");

            migrationBuilder.CreateIndex(
                name: "ix_field_interactions_form_view_id",
                table: "field_interactions",
                column: "form_view_id");

            migrationBuilder.CreateIndex(
                name: "ix_field_interactions_view_field_event",
                table: "field_interactions",
                columns: new[] { "form_view_id", "field_id", "event_type" });

            migrationBuilder.CreateIndex(
                name: "ix_form_views_form_id",
                table: "form_views",
                column: "form_id");

            migrationBuilder.CreateIndex(
                name: "ix_form_views_form_viewed",
                table: "form_views",
                columns: new[] { "form_id", "viewed_at" });

            migrationBuilder.CreateIndex(
                name: "ix_form_views_session_id",
                table: "form_views",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_form_views_submission_id",
                table: "form_views",
                column: "submission_id");

            migrationBuilder.CreateIndex(
                name: "ix_form_views_submitted",
                table: "form_views",
                column: "submitted");

            migrationBuilder.CreateIndex(
                name: "ix_form_views_viewed_at",
                table: "form_views",
                column: "viewed_at");

            migrationBuilder.CreateIndex(
                name: "ix_qr_campaigns_business_id",
                table: "qr_campaigns",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_qr_campaigns_created_at",
                table: "qr_campaigns",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_qr_campaigns_linked_form_id",
                table: "qr_campaigns",
                column: "linked_form_id");

            migrationBuilder.CreateIndex(
                name: "ix_qr_campaigns_status",
                table: "qr_campaigns",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_campaign_id",
                table: "qr_scans",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_campaign_scanned",
                table: "qr_scans",
                columns: new[] { "campaign_id", "scanned_at" });

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_converted",
                table: "qr_scans",
                column: "converted");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_device_type",
                table: "qr_scans",
                column: "device_type");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_location_country",
                table: "qr_scans",
                column: "location_country");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_scanned_at",
                table: "qr_scans",
                column: "scanned_at");

            migrationBuilder.CreateIndex(
                name: "ix_qr_scans_session_id",
                table: "qr_scans",
                column: "session_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ab_test_variants");

            migrationBuilder.DropTable(
                name: "field_interactions");

            migrationBuilder.DropTable(
                name: "qr_scans");

            migrationBuilder.DropTable(
                name: "ab_tests");

            migrationBuilder.DropTable(
                name: "form_views");

            migrationBuilder.DropTable(
                name: "qr_campaigns");
        }
    }
}
