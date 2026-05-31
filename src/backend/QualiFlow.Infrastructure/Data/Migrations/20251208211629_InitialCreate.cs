using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.CreateTable(
                name: "businesses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    industry = table.Column<string>(type: "text", nullable: true),
                    company_size = table.Column<string>(type: "text", nullable: true),
                    timezone = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    stripe_customer_id = table.Column<string>(type: "text", nullable: true),
                    stripe_subscription_id = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_businesses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "features",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    feature_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_features", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subscription_plans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    price_monthly = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    price_yearly = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    stripe_price_id_monthly = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    stripe_price_id_yearly = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_plans", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ai_configurations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    persona = table.Column<string>(type: "text", nullable: false),
                    qualification_threshold = table.Column<int>(type: "integer", nullable: false),
                    scoring_weights = table.Column<string>(type: "text", nullable: false),
                    greeting_message = table.Column<string>(type: "text", nullable: false),
                    use_industry_questions = table.Column<bool>(type: "boolean", nullable: false),
                    ai_tone = table.Column<string>(type: "text", nullable: false),
                    business_hours = table.Column<string>(type: "text", nullable: false),
                    follow_up_preference = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_configurations", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_configurations_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "business_overrides",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    override_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    override_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    override_value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_business_overrides", x => x.id);
                    table.ForeignKey(
                        name: "fk_business_overrides_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "call_scripts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    greeting_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    voicemail_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    closing_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    questions_json = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    voice_settings_json = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    system_prompt = table.Column<string>(type: "text", nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_call_scripts", x => x.id);
                    table.ForeignKey(
                        name: "fk_call_scripts_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "channels",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    configuration = table.Column<string>(type: "jsonb", nullable: true),
                    external_account_id = table.Column<string>(type: "text", nullable: true),
                    encrypted_credentials = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    webhook_url = table.Column<string>(type: "text", nullable: true),
                    last_verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verification_status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_channels", x => x.id);
                    table.ForeignKey(
                        name: "fk_channels_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "chat_widgets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    widget_key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    allowed_domains = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    primary_color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    position = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    greeting_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    offline_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    show_pre_chat_form = table.Column<bool>(type: "boolean", nullable: false),
                    pre_chat_form_fields_json = table.Column<string>(type: "jsonb", nullable: false),
                    enable_ai_response = table.Column<bool>(type: "boolean", nullable: false),
                    ai_response_delay_ms = table.Column<int>(type: "integer", nullable: false),
                    session_timeout_minutes = table.Column<int>(type: "integer", nullable: false),
                    auto_create_lead = table.Column<bool>(type: "boolean", nullable: false),
                    business_hours_json = table.Column<string>(type: "jsonb", nullable: false),
                    custom_css = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_widgets", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_widgets_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "crm_providers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_type = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    sync_strategy = table.Column<string>(type: "text", nullable: false, defaultValue: "RealTime"),
                    access_token = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    refresh_token = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    token_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    external_account_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    external_account_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    last_sync_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_sync_error = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    configuration_json = table.Column<string>(type: "text", nullable: false, defaultValue: "{}"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_crm_providers", x => x.id);
                    table.ForeignKey(
                        name: "fk_crm_providers_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "email_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    html_body = table.Column<string>(type: "text", nullable: false),
                    text_body = table.Column<string>(type: "text", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_email_templates", x => x.id);
                    table.ForeignKey(
                        name: "fk_email_templates_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "forms",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    fields = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    styling = table.Column<string>(type: "jsonb", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Draft"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    thank_you_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    redirect_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    notify_on_submission = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    notification_emails = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forms", x => x.id);
                    table.ForeignKey(
                        name: "fk_forms_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "onboarding_progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    current_step = table.Column<int>(type: "integer", nullable: false),
                    completed_steps = table.Column<string>(type: "text", nullable: false),
                    industry = table.Column<string>(type: "text", nullable: true),
                    team_size = table.Column<string>(type: "text", nullable: true),
                    selected_crm_provider = table.Column<string>(type: "text", nullable: true),
                    lead_type = table.Column<string>(type: "text", nullable: true),
                    main_objective = table.Column<string>(type: "text", nullable: true),
                    selected_channels = table.Column<string>(type: "text", nullable: false),
                    selected_automations = table.Column<string>(type: "text", nullable: false),
                    phone_number_option = table.Column<string>(type: "text", nullable: true),
                    existing_phone_number = table.Column<string>(type: "text", nullable: true),
                    selected_ai_phone_number = table.Column<string>(type: "text", nullable: true),
                    call_forward_to = table.Column<string>(type: "text", nullable: true),
                    missed_call_sms = table.Column<bool>(type: "boolean", nullable: false),
                    outbound_ai_calling = table.Column<bool>(type: "boolean", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_onboarding_progress", x => x.id);
                    table.ForeignKey(
                        name: "fk_onboarding_progress_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scoring_criteria",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    weight = table.Column<int>(type: "integer", nullable: false),
                    extraction_hint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    minimum_score = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Custom"),
                    ai_questions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scoring_criteria", x => x.id);
                    table.ForeignKey(
                        name: "fk_scoring_criteria_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usage_counters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    current_leads_count = table.Column<int>(type: "integer", nullable: false),
                    current_channels_count = table.Column<int>(type: "integer", nullable: false),
                    current_phone_numbers_count = table.Column<int>(type: "integer", nullable: false),
                    current_seats_count = table.Column<int>(type: "integer", nullable: false),
                    current_workflows_count = table.Column<int>(type: "integer", nullable: false),
                    current_crm_contacts_count = table.Column<int>(type: "integer", nullable: false),
                    monthly_messages_count = table.Column<int>(type: "integer", nullable: false),
                    monthly_ai_conversations_count = table.Column<int>(type: "integer", nullable: false),
                    monthly_api_calls_count = table.Column<int>(type: "integer", nullable: false),
                    storage_used_bytes = table.Column<long>(type: "bigint", nullable: false),
                    billing_cycle_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    billing_cycle_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usage_counters", x => x.id);
                    table.ForeignKey(
                        name: "fk_usage_counters_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    google_id = table.Column<string>(type: "text", nullable: true),
                    microsoft_id = table.Column<string>(type: "text", nullable: true),
                    profile_picture_url = table.Column<string>(type: "text", nullable: true),
                    email_verified_via_o_auth = table.Column<bool>(type: "boolean", nullable: false),
                    o_auth_provider = table.Column<string>(type: "text", nullable: true),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    security_stamp = table.Column<string>(type: "text", nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    phone_number_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    lockout_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lockout_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    access_failed_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_users_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "webhooks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    events = table.Column<string>(type: "text", nullable: false),
                    secret = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    consecutive_failures = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    last_success_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_failure_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_webhooks", x => x.id);
                    table.ForeignKey(
                        name: "fk_webhooks_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "workflow_definitions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    definition_json = table.Column<string>(type: "jsonb", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    trigger_type = table.Column<string>(type: "text", nullable: false, defaultValue: "Manual"),
                    trigger_config = table.Column<string>(type: "jsonb", nullable: true),
                    category = table.Column<string>(type: "text", nullable: false, defaultValue: "Custom"),
                    tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_definitions", x => x.id);
                    table.ForeignKey(
                        name: "fk_workflow_definitions_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "role_claims",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_role_claims_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "plan_features",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    feature_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_plan_features_features_feature_id",
                        column: x => x.feature_id,
                        principalTable: "features",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_plan_features_subscription_plans_plan_id",
                        column: x => x.plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "plan_limits",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    limit_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    limit_value = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    limit_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "integer"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_limits", x => x.id);
                    table.ForeignKey(
                        name: "fk_plan_limits_subscription_plans_plan_id",
                        column: x => x.plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subscription",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    stripe_customer_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    stripe_subscription_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    stripe_price_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    billing_cycle = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    current_period_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    current_period_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    trial_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    trial_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancel_at_period_end = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    monthly_amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    annual_amount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "USD"),
                    scheduled_plan_id = table.Column<Guid>(type: "uuid", nullable: true),
                    scheduled_change_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscription_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_subscription_subscription_plans_plan_id",
                        column: x => x.plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_subscription_subscription_plans_scheduled_plan_id",
                        column: x => x.scheduled_plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "email_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email_template_id = table.Column<Guid>(type: "uuid", nullable: true),
                    resend_email_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    to_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    to_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    from_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    from_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    delivered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    opened_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    open_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    clicked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    click_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    bounced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    bounce_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_email_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_email_logs_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_email_logs_email_templates_email_template_id",
                        column: x => x.email_template_id,
                        principalTable: "email_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "admin_users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ip_whitelist = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    two_factor_secret = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admin_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_admin_users_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    old_values = table.Column<string>(type: "jsonb", nullable: true),
                    new_values = table.Column<string>(type: "jsonb", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    http_method = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    request_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    metadata = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_audit_logs_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_audit_logs_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "auto_assignment_rules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    channel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    min_lead_score = table.Column<int>(type: "integer", nullable: true),
                    max_lead_score = table.Column<int>(type: "integer", nullable: true),
                    assignment_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "round_robin"),
                    assign_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    user_pool_json = table.Column<string>(type: "jsonb", nullable: true),
                    last_assigned_index = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_auto_assignment_rules", x => x.id);
                    table.ForeignKey(
                        name: "fk_auto_assignment_rules_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_auto_assignment_rules_users_assign_to_user_id",
                        column: x => x.assign_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "leads",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "New"),
                    score = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    source_channel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    metadata = table.Column<string>(type: "jsonb", nullable: true),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_leads", x => x.id);
                    table.ForeignKey(
                        name: "fk_leads_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_leads_users_assigned_to_user_id",
                        column: x => x.assigned_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "quick_replies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    shortcut = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    content = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_global = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    usage_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quick_replies", x => x.id);
                    table.ForeignKey(
                        name: "fk_quick_replies_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_quick_replies_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_revoked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by_ip = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    revoked_by_ip = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "saved_searches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    search_criteria_json = table.Column<string>(type: "jsonb", nullable: false),
                    is_shared = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    last_used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    usage_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_saved_searches", x => x.id);
                    table.ForeignKey(
                        name: "fk_saved_searches_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_saved_searches_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "search_analytics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    search_query = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    results_count = table.Column<int>(type: "integer", nullable: false),
                    execution_time_ms = table.Column<long>(type: "bigint", nullable: false),
                    filters_json = table.Column<string>(type: "jsonb", nullable: true),
                    searched_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_search_analytics", x => x.id);
                    table.ForeignKey(
                        name: "fk_search_analytics_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_search_analytics_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_claims",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_claims_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_logins",
                columns: table => new
                {
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    provider_key = table.Column<string>(type: "text", nullable: false),
                    provider_display_name = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_logins", x => new { x.login_provider, x.provider_key });
                    table.ForeignKey(
                        name: "fk_user_logins_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_user_roles_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_roles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tokens",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_tokens", x => new { x.user_id, x.login_provider, x.name });
                    table.ForeignKey(
                        name: "fk_user_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "webhook_deliveries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    webhook_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    payload = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    attempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    next_retry_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    response_code = table.Column<int>(type: "integer", nullable: true),
                    response_body = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    duration_ms = table.Column<int>(type: "integer", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_webhook_deliveries", x => x.id);
                    table.ForeignKey(
                        name: "fk_webhook_deliveries_webhooks_webhook_id",
                        column: x => x.webhook_id,
                        principalTable: "webhooks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "billing_transaction",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    line_items_json = table.Column<string>(type: "text", nullable: true),
                    stripe_invoice_id = table.Column<string>(type: "text", nullable: true),
                    stripe_payment_intent_id = table.Column<string>(type: "text", nullable: true),
                    stripe_charge_id = table.Column<string>(type: "text", nullable: true),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_billing_transaction", x => x.id);
                    table.ForeignKey(
                        name: "fk_billing_transaction_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_billing_transaction_subscription_subscription_id",
                        column: x => x.subscription_id,
                        principalTable: "subscription",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "admin_audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    admin_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    old_values = table.Column<string>(type: "jsonb", nullable: true),
                    new_values = table.Column<string>(type: "jsonb", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    http_method = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    request_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    status_code = table.Column<int>(type: "integer", nullable: false),
                    success = table.Column<bool>(type: "boolean", nullable: false),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admin_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_admin_audit_logs_admin_users_admin_user_id",
                        column: x => x.admin_user_id,
                        principalTable: "admin_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "contacts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    job_title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Active"),
                    source = table.Column<string>(type: "text", nullable: false, defaultValue: "Manual"),
                    tags = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    last_contacted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    original_lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    external_crm_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    external_crm_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_contacts", x => x.id);
                    table.ForeignKey(
                        name: "fk_contacts_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_contacts_leads_original_lead_id",
                        column: x => x.original_lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_contacts_users_assigned_to_user_id",
                        column: x => x.assigned_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "conversations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    channel_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Open"),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_conversations", x => x.id);
                    table.ForeignKey(
                        name: "fk_conversations_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_conversations_channels_channel_id",
                        column: x => x.channel_id,
                        principalTable: "channels",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_conversations_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_conversations_users_assigned_to_user_id",
                        column: x => x.assigned_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "form_submissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    form_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    submitted_data = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    referrer_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    is_processed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    processed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_form_submissions", x => x.id);
                    table.ForeignKey(
                        name: "fk_form_submissions_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_form_submissions_forms_form_id",
                        column: x => x.form_id,
                        principalTable: "forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_form_submissions_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "qualifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false),
                    reasoning = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    qualified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    qualified_by = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "AI"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_qualifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_qualifications_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "score_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false),
                    previous_score = table.Column<int>(type: "integer", nullable: true),
                    score_change = table.Column<int>(type: "integer", nullable: false),
                    source = table.Column<string>(type: "text", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    score_breakdown = table.Column<string>(type: "text", nullable: true),
                    scored_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_score_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_score_history_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "deals",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    contact_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    probability = table.Column<int>(type: "integer", nullable: false, defaultValue: 50),
                    stage = table.Column<string>(type: "text", nullable: false, defaultValue: "New"),
                    expected_close_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_close_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    loss_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    external_crm_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    external_crm_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_deals", x => x.id);
                    table.ForeignKey(
                        name: "fk_deals_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_deals_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_deals_users_assigned_to_user_id",
                        column: x => x.assigned_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    scheduled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duration = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Pending"),
                    meeting_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    cal_com_event_type_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    cal_com_booking_uid = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "UTC"),
                    confirmation_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reminder_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancellation_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookings", x => x.id);
                    table.ForeignKey(
                        name: "fk_bookings_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bookings_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_bookings_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_bookings_users_assigned_to_user_id",
                        column: x => x.assigned_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "chat_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    chat_widget_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_token = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    visitor_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    visitor_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    visitor_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    page_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    referrer_url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    assigned_agent_id = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_activity_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ai_qualification_score = table.Column<int>(type: "integer", nullable: true),
                    extracted_data_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_sessions_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_chat_sessions_chat_widgets_chat_widget_id",
                        column: x => x.chat_widget_id,
                        principalTable: "chat_widgets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_chat_sessions_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_chat_sessions_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "conversation_notes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_conversation_notes", x => x.id);
                    table.ForeignKey(
                        name: "fk_conversation_notes_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_conversation_notes_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_conversation_notes_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    direction = table.Column<string>(type: "text", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    delivered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    parent_message_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_messages_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_messages_messages_parent_message_id",
                        column: x => x.parent_message_id,
                        principalTable: "messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "outbound_calls",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    call_script_id = table.Column<Guid>(type: "uuid", nullable: true),
                    twilio_call_sid = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    from_phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    to_phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    outcome = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    scheduled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    initiated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    connected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    recording_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    recording_sid = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    transcription = table.Column<string>(type: "text", nullable: true),
                    retry_attempt = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    max_retries = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbound_calls", x => x.id);
                    table.ForeignKey(
                        name: "fk_outbound_calls_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_outbound_calls_call_scripts_call_script_id",
                        column: x => x.call_script_id,
                        principalTable: "call_scripts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_outbound_calls_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_outbound_calls_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "workflow_instances",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_definition_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workflow_core_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Pending"),
                    data_json = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    current_step_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    current_step_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    triggered_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workflow_instances", x => x.id);
                    table.ForeignKey(
                        name: "fk_workflow_instances_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_workflow_instances_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_workflow_instances_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_workflow_instances_users_triggered_by_user_id",
                        column: x => x.triggered_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_workflow_instances_workflow_definitions_workflow_definition",
                        column: x => x.workflow_definition_id,
                        principalTable: "workflow_definitions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    chat_session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    sender_id = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    sender_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    attachments_json = table.Column<string>(type: "jsonb", nullable: true),
                    detected_intent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    sentiment_score = table.Column<float>(type: "real", nullable: true),
                    metadata_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_messages_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_chat_messages_chat_sessions_chat_session_id",
                        column: x => x.chat_session_id,
                        principalTable: "chat_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "message_attachments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    blob_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    blob_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    container_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_message_attachments", x => x.id);
                    table.ForeignKey(
                        name: "fk_message_attachments_messages_message_id",
                        column: x => x.message_id,
                        principalTable: "messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "message_read_statuses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_message_read_statuses", x => x.id);
                    table.ForeignKey(
                        name: "fk_message_read_statuses_messages_message_id",
                        column: x => x.message_id,
                        principalTable: "messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_message_read_statuses_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "concurrency_stamp", "created_at", "description", "name", "normalized_name" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), "00000000-0000-0000-0000-000000000001", new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Full access to all features and settings. Can manage users, billing, and delete the business.", "Owner", "OWNER" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), "00000000-0000-0000-0000-000000000002", new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Administrative access to most features. Can manage users, leads, conversations, and settings.", "Admin", "ADMIN" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), "00000000-0000-0000-0000-000000000003", new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Operational access to leads and conversations. Can view and manage leads, conversations, and workflows.", "Manager", "MANAGER" },
                    { new Guid("00000000-0000-0000-0000-000000000004"), "00000000-0000-0000-0000-000000000004", new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Read-only access to leads and conversations. Can view leads, conversations, and analytics.", "Viewer", "VIEWER" }
                });

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_logs_action",
                table: "admin_audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_logs_admin_user_id",
                table: "admin_audit_logs",
                column: "admin_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_logs_created_at",
                table: "admin_audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_logs_entity_type",
                table: "admin_audit_logs",
                column: "entity_type");

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_logs_entity_type_entity_id",
                table: "admin_audit_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_admin_users_is_active",
                table: "admin_users",
                column: "is_active",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_admin_users_role",
                table: "admin_users",
                column: "role",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_admin_users_user_id",
                table: "admin_users",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ai_configurations_business_id",
                table: "ai_configurations",
                column: "business_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_action",
                table: "audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_business_entity",
                table: "audit_logs",
                columns: new[] { "business_id", "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_business_id",
                table: "audit_logs",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_business_user_date",
                table: "audit_logs",
                columns: new[] { "business_id", "user_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_created_at",
                table: "audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_id",
                table: "audit_logs",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_type",
                table: "audit_logs",
                column: "entity_type");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_user_id",
                table: "audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_auto_assignment_rules_assign_to_user_id",
                table: "auto_assignment_rules",
                column: "assign_to_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_auto_assignment_rules_business_id",
                table: "auto_assignment_rules",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_auto_assignment_rules_business_id_active_priority",
                table: "auto_assignment_rules",
                columns: new[] { "business_id", "is_active", "priority" });

            migrationBuilder.CreateIndex(
                name: "ix_billing_transaction_business_id",
                table: "billing_transaction",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_billing_transaction_subscription_id",
                table: "billing_transaction",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_assigned_to_user_id",
                table: "bookings",
                column: "assigned_to_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_business_id",
                table: "bookings",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_business_id_lead_id",
                table: "bookings",
                columns: new[] { "business_id", "lead_id" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_business_id_scheduled_at",
                table: "bookings",
                columns: new[] { "business_id", "scheduled_at" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_business_id_status",
                table: "bookings",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_calcom_booking_uid",
                table: "bookings",
                column: "cal_com_booking_uid");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_conversation_id",
                table: "bookings",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_lead_id",
                table: "bookings",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_scheduled_at",
                table: "bookings",
                column: "scheduled_at");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_status",
                table: "bookings",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_business_overrides_business_id",
                table: "business_overrides",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_business_overrides_business_id_override_type_override_key",
                table: "business_overrides",
                columns: new[] { "business_id", "override_type", "override_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_business_overrides_expires_at",
                table: "business_overrides",
                column: "expires_at",
                filter: "expires_at IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_businesses_deleted_at",
                table: "businesses",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_businesses_email",
                table: "businesses",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_businesses_is_active",
                table: "businesses",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_call_scripts_business_id",
                table: "call_scripts",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_call_scripts_business_id_is_default",
                table: "call_scripts",
                columns: new[] { "business_id", "is_default" });

            migrationBuilder.CreateIndex(
                name: "ix_channels_business_id",
                table: "channels",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_channels_business_id_is_active",
                table: "channels",
                columns: new[] { "business_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_channels_business_id_type",
                table: "channels",
                columns: new[] { "business_id", "type" });

            migrationBuilder.CreateIndex(
                name: "ix_channels_is_active",
                table: "channels",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_channels_type",
                table: "channels",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_chat_messages_business_id",
                table: "chat_messages",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_messages_sent_at",
                table: "chat_messages",
                column: "sent_at");

            migrationBuilder.CreateIndex(
                name: "ix_chat_messages_session_id",
                table: "chat_messages",
                column: "chat_session_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_messages_session_id_sent_at",
                table: "chat_messages",
                columns: new[] { "chat_session_id", "sent_at" });

            migrationBuilder.CreateIndex(
                name: "ix_chat_messages_type",
                table: "chat_messages",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_business_id",
                table: "chat_sessions",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_business_id_status",
                table: "chat_sessions",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_conversation_id",
                table: "chat_sessions",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_lead_id",
                table: "chat_sessions",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_session_token",
                table: "chat_sessions",
                column: "session_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_status",
                table: "chat_sessions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_visitor_email",
                table: "chat_sessions",
                column: "visitor_email");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessions_widget_id",
                table: "chat_sessions",
                column: "chat_widget_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_widgets_business_id",
                table: "chat_widgets",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_widgets_business_id_is_active",
                table: "chat_widgets",
                columns: new[] { "business_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_chat_widgets_widget_key",
                table: "chat_widgets",
                column: "widget_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_contacts_assigned_to_user_id",
                table: "contacts",
                column: "assigned_to_user_id",
                filter: "assigned_to_user_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_business_id",
                table: "contacts",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_business_id_assigned_to_user_id",
                table: "contacts",
                columns: new[] { "business_id", "assigned_to_user_id" },
                filter: "assigned_to_user_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_business_id_email_unique",
                table: "contacts",
                columns: new[] { "business_id", "email" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_business_id_status",
                table: "contacts",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_contacts_created_at",
                table: "contacts",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_email",
                table: "contacts",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_external_crm_id",
                table: "contacts",
                column: "external_crm_id",
                filter: "external_crm_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_original_lead_id",
                table: "contacts",
                column: "original_lead_id",
                filter: "original_lead_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_status",
                table: "contacts",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_contacts_updated_at",
                table: "contacts",
                column: "updated_at",
                filter: "updated_at IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_conversation_notes_business_id",
                table: "conversation_notes",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_conversation_notes_conversation_id",
                table: "conversation_notes",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_conversation_notes_conversation_id_is_pinned",
                table: "conversation_notes",
                columns: new[] { "conversation_id", "is_pinned" });

            migrationBuilder.CreateIndex(
                name: "ix_conversation_notes_created_by_user_id",
                table: "conversation_notes",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_conversations_assigned_to_user_id",
                table: "conversations",
                column: "assigned_to_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_conversations_business_id",
                table: "conversations",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_conversations_business_id_lead_id",
                table: "conversations",
                columns: new[] { "business_id", "lead_id" });

            migrationBuilder.CreateIndex(
                name: "ix_conversations_business_id_status",
                table: "conversations",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_conversations_channel",
                table: "conversations",
                column: "channel");

            migrationBuilder.CreateIndex(
                name: "ix_conversations_channel_id",
                table: "conversations",
                column: "channel_id");

            migrationBuilder.CreateIndex(
                name: "ix_conversations_lead_id",
                table: "conversations",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_conversations_status",
                table: "conversations",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_crm_providers_business_id",
                table: "crm_providers",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_crm_providers_business_id_is_active",
                table: "crm_providers",
                columns: new[] { "business_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_deals_actual_close_date",
                table: "deals",
                column: "actual_close_date",
                filter: "actual_close_date IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_assigned_to_user_id",
                table: "deals",
                column: "assigned_to_user_id",
                filter: "assigned_to_user_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_business_id",
                table: "deals",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_business_id_assigned_to_user_id",
                table: "deals",
                columns: new[] { "business_id", "assigned_to_user_id" },
                filter: "assigned_to_user_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_business_id_contact_id",
                table: "deals",
                columns: new[] { "business_id", "contact_id" });

            migrationBuilder.CreateIndex(
                name: "ix_deals_business_id_stage",
                table: "deals",
                columns: new[] { "business_id", "stage" });

            migrationBuilder.CreateIndex(
                name: "ix_deals_business_id_value",
                table: "deals",
                columns: new[] { "business_id", "value" });

            migrationBuilder.CreateIndex(
                name: "ix_deals_contact_id",
                table: "deals",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "ix_deals_created_at",
                table: "deals",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_deals_expected_close_date",
                table: "deals",
                column: "expected_close_date",
                filter: "expected_close_date IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_external_crm_id",
                table: "deals",
                column: "external_crm_id",
                filter: "external_crm_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_pipeline",
                table: "deals",
                columns: new[] { "business_id", "stage", "value" },
                filter: "stage NOT IN ('Won', 'Lost') AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_stage",
                table: "deals",
                column: "stage");

            migrationBuilder.CreateIndex(
                name: "ix_deals_updated_at",
                table: "deals",
                column: "updated_at",
                filter: "updated_at IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_deals_value",
                table: "deals",
                column: "value");

            migrationBuilder.CreateIndex(
                name: "ix_email_logs_business_id",
                table: "email_logs",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_email_logs_business_id_status",
                table: "email_logs",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_email_logs_email_template_id",
                table: "email_logs",
                column: "email_template_id");

            migrationBuilder.CreateIndex(
                name: "ix_email_logs_resend_email_id",
                table: "email_logs",
                column: "resend_email_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_email_logs_status",
                table: "email_logs",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_email_logs_to_email",
                table: "email_logs",
                column: "to_email");

            migrationBuilder.CreateIndex(
                name: "ix_email_templates_business_id",
                table: "email_templates",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_email_templates_business_id_is_active",
                table: "email_templates",
                columns: new[] { "business_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_email_templates_business_id_type",
                table: "email_templates",
                columns: new[] { "business_id", "type" });

            migrationBuilder.CreateIndex(
                name: "ix_email_templates_type",
                table: "email_templates",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_features_category",
                table: "features",
                column: "category",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_features_feature_key",
                table: "features",
                column: "feature_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_features_is_active",
                table: "features",
                column: "is_active",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_business_id",
                table: "form_submissions",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_form_id",
                table: "form_submissions",
                column: "form_id");

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_form_id_submitted_at",
                table: "form_submissions",
                columns: new[] { "form_id", "submitted_at" });

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_is_processed",
                table: "form_submissions",
                column: "is_processed");

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_lead_id",
                table: "form_submissions",
                column: "lead_id",
                filter: "lead_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_submitted_at",
                table: "form_submissions",
                column: "submitted_at");

            migrationBuilder.CreateIndex(
                name: "ix_forms_business_id",
                table: "forms",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_forms_business_id_status",
                table: "forms",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_forms_created_at",
                table: "forms",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_forms_slug",
                table: "forms",
                column: "slug",
                unique: true,
                filter: "slug IS NOT NULL AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_forms_status",
                table: "forms",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_leads_assigned_to_user_id",
                table: "leads",
                column: "assigned_to_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_leads_business_id",
                table: "leads",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_leads_business_id_email",
                table: "leads",
                columns: new[] { "business_id", "email" });

            migrationBuilder.CreateIndex(
                name: "ix_leads_business_id_score",
                table: "leads",
                columns: new[] { "business_id", "score" });

            migrationBuilder.CreateIndex(
                name: "ix_leads_business_id_status",
                table: "leads",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_leads_created_at",
                table: "leads",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_leads_email",
                table: "leads",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "ix_leads_score",
                table: "leads",
                column: "score");

            migrationBuilder.CreateIndex(
                name: "ix_leads_status",
                table: "leads",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_message_attachments_message_id",
                table: "message_attachments",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "ix_message_read_statuses_message_id",
                table: "message_read_statuses",
                column: "message_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_message_read_statuses_message_id_user_id",
                table: "message_read_statuses",
                columns: new[] { "message_id", "user_id" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_message_read_statuses_user_id",
                table: "message_read_statuses",
                column: "user_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id",
                table: "messages",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id_parent_message_id",
                table: "messages",
                columns: new[] { "conversation_id", "parent_message_id" });

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id_sent_at",
                table: "messages",
                columns: new[] { "conversation_id", "sent_at" });

            migrationBuilder.CreateIndex(
                name: "ix_messages_parent_message_id",
                table: "messages",
                column: "parent_message_id",
                filter: "parent_message_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_messages_sent_at",
                table: "messages",
                column: "sent_at");

            migrationBuilder.CreateIndex(
                name: "ix_onboarding_progress_business_id",
                table: "onboarding_progress",
                column: "business_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_business_id",
                table: "outbound_calls",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_call_script_id",
                table: "outbound_calls",
                column: "call_script_id");

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_conversation_id",
                table: "outbound_calls",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_lead_id",
                table: "outbound_calls",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_scheduled_at",
                table: "outbound_calls",
                column: "scheduled_at");

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_status",
                table: "outbound_calls",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_outbound_calls_twilio_call_sid",
                table: "outbound_calls",
                column: "twilio_call_sid");

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_feature_id",
                table: "plan_features",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_plan_id",
                table: "plan_features",
                column: "plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_plan_id_feature_id",
                table: "plan_features",
                columns: new[] { "plan_id", "feature_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_plan_limits_limit_key",
                table: "plan_limits",
                column: "limit_key");

            migrationBuilder.CreateIndex(
                name: "ix_plan_limits_plan_id",
                table: "plan_limits",
                column: "plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_plan_limits_plan_id_limit_key",
                table: "plan_limits",
                columns: new[] { "plan_id", "limit_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_qualifications_lead_id",
                table: "qualifications",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_qualifications_lead_id_qualified_at",
                table: "qualifications",
                columns: new[] { "lead_id", "qualified_at" });

            migrationBuilder.CreateIndex(
                name: "ix_qualifications_qualified_at",
                table: "qualifications",
                column: "qualified_at");

            migrationBuilder.CreateIndex(
                name: "ix_qualifications_score",
                table: "qualifications",
                column: "score");

            migrationBuilder.CreateIndex(
                name: "ix_quick_replies_business_id",
                table: "quick_replies",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_quick_replies_business_id_shortcut",
                table: "quick_replies",
                columns: new[] { "business_id", "shortcut" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_quick_replies_category",
                table: "quick_replies",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_quick_replies_created_by_user_id",
                table: "quick_replies",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_expires_at",
                table: "refresh_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_claims_role_id",
                table: "role_claims",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "roles",
                column: "normalized_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_saved_searches_business_id",
                table: "saved_searches",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_saved_searches_business_id_entity_type",
                table: "saved_searches",
                columns: new[] { "business_id", "entity_type" });

            migrationBuilder.CreateIndex(
                name: "ix_saved_searches_business_id_is_shared",
                table: "saved_searches",
                columns: new[] { "business_id", "is_shared" });

            migrationBuilder.CreateIndex(
                name: "ix_saved_searches_user_id",
                table: "saved_searches",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_score_history_lead_id",
                table: "score_history",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "ix_scoring_criteria_business_id",
                table: "scoring_criteria",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_scoring_criteria_business_id_is_active",
                table: "scoring_criteria",
                columns: new[] { "business_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_scoring_criteria_business_id_name",
                table: "scoring_criteria",
                columns: new[] { "business_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_search_analytics_business_id",
                table: "search_analytics",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_search_analytics_business_id_entity_type",
                table: "search_analytics",
                columns: new[] { "business_id", "entity_type" });

            migrationBuilder.CreateIndex(
                name: "ix_search_analytics_business_id_results_count",
                table: "search_analytics",
                columns: new[] { "business_id", "results_count" },
                filter: "results_count = 0");

            migrationBuilder.CreateIndex(
                name: "ix_search_analytics_business_id_searched_at",
                table: "search_analytics",
                columns: new[] { "business_id", "searched_at" });

            migrationBuilder.CreateIndex(
                name: "ix_search_analytics_user_id",
                table: "search_analytics",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_scheduled_plan_id",
                table: "subscription",
                column: "scheduled_plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_business_id",
                table: "subscription",
                column: "business_id",
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_business_id_status",
                table: "subscription",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_current_period_end",
                table: "subscription",
                column: "current_period_end");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_plan_id",
                table: "subscription",
                column: "plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_status",
                table: "subscription",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_status_period_end",
                table: "subscription",
                columns: new[] { "status", "current_period_end" },
                filter: "status = 'Active'");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_status_trial_end",
                table: "subscription",
                columns: new[] { "status", "trial_end" },
                filter: "status = 'Trialing' AND trial_end IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_trial_end",
                table: "subscription",
                column: "trial_end",
                filter: "trial_end IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_plans_is_active",
                table: "subscription_plans",
                column: "is_active",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_plans_is_public",
                table: "subscription_plans",
                column: "is_public",
                filter: "is_active = true");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_plans_name",
                table: "subscription_plans",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_subscription_plans_sort_order",
                table: "subscription_plans",
                column: "sort_order");

            migrationBuilder.CreateIndex(
                name: "ix_usage_counters_business_id",
                table: "usage_counters",
                column: "business_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_claims_user_id",
                table: "user_claims",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_logins_user_id",
                table: "user_logins",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_roles_role_id",
                table: "user_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "users",
                column: "normalized_email");

            migrationBuilder.CreateIndex(
                name: "ix_users_business_id",
                table: "users",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_business_id_email",
                table: "users",
                columns: new[] { "business_id", "email" });

            migrationBuilder.CreateIndex(
                name: "ix_users_deleted_at",
                table: "users",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "ix_users_is_active",
                table: "users",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "users",
                column: "normalized_user_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_webhook_deliveries_event_type",
                table: "webhook_deliveries",
                column: "event_type");

            migrationBuilder.CreateIndex(
                name: "ix_webhook_deliveries_next_retry_at",
                table: "webhook_deliveries",
                column: "next_retry_at",
                filter: "next_retry_at IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_webhook_deliveries_status",
                table: "webhook_deliveries",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_webhook_deliveries_webhook_id",
                table: "webhook_deliveries",
                column: "webhook_id");

            migrationBuilder.CreateIndex(
                name: "ix_webhook_deliveries_webhook_id_status",
                table: "webhook_deliveries",
                columns: new[] { "webhook_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_webhooks_business_id",
                table: "webhooks",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_webhooks_business_id_status",
                table: "webhooks",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_webhooks_status",
                table: "webhooks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_definitions_business_id",
                table: "workflow_definitions",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_definitions_business_id_category",
                table: "workflow_definitions",
                columns: new[] { "business_id", "category" });

            migrationBuilder.CreateIndex(
                name: "ix_workflow_definitions_business_id_is_active",
                table: "workflow_definitions",
                columns: new[] { "business_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_workflow_definitions_business_id_name",
                table: "workflow_definitions",
                columns: new[] { "business_id", "name" });

            migrationBuilder.CreateIndex(
                name: "ix_workflow_definitions_category",
                table: "workflow_definitions",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_definitions_is_active",
                table: "workflow_definitions",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_business_id",
                table: "workflow_instances",
                column: "business_id",
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_business_id_status",
                table: "workflow_instances",
                columns: new[] { "business_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_conversation_id",
                table: "workflow_instances",
                column: "conversation_id",
                filter: "conversation_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_lead_id",
                table: "workflow_instances",
                column: "lead_id",
                filter: "lead_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_status",
                table: "workflow_instances",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_triggered_by_user_id",
                table: "workflow_instances",
                column: "triggered_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_workflow_core_id",
                table: "workflow_instances",
                column: "workflow_core_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_workflow_definition_id",
                table: "workflow_instances",
                column: "workflow_definition_id");

            migrationBuilder.CreateIndex(
                name: "ix_workflow_instances_workflow_definition_id_status",
                table: "workflow_instances",
                columns: new[] { "workflow_definition_id", "status" });

            // ========================================================================
            // Seed Subscription Plans
            // ========================================================================
            var freeflowId = "11111111-1111-1111-1111-111111111111";
            var smartflowId = "22222222-2222-2222-2222-222222222222";
            var ultraflowId = "33333333-3333-3333-3333-333333333333";
            var enterpriseId = "44444444-4444-4444-4444-444444444444";

            migrationBuilder.Sql($@"
                INSERT INTO subscription_plans (id, name, display_name, description, price_monthly, price_yearly, is_active, is_public, version, sort_order, created_at)
                VALUES
                ('{freeflowId}', 'freeflow', 'Free Flow', 'Perfect for getting started with AI-powered lead engagement', 0.00, 0.00, true, true, 1, 1, NOW()),
                ('{smartflowId}', 'smartflow', 'Smart Flow', 'Ideal for small businesses scaling their lead generation', 49.00, 470.00, true, true, 1, 2, NOW()),
                ('{ultraflowId}', 'ultraflow', 'Ultra Flow', 'For growing businesses with high-volume lead engagement', 149.00, 1430.00, true, true, 1, 3, NOW()),
                ('{enterpriseId}', 'enterprise', 'Enterprise', 'Enterprise-grade solution with unlimited capabilities', 499.00, 4790.00, true, true, 1, 4, NOW());
            ");

            // ========================================================================
            // Seed Plan Limits - FreeFlow
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, limit_type, created_at)
                VALUES
                (gen_random_uuid(), '{freeflowId}', 'max_ai_interactions', '50', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'max_ai_voice_agents', '0', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'max_ai_voice_minutes', '0', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'max_ai_sms', '0', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'max_seats', '1', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'knowledge_base_size_mb', '5', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'max_workflows', '1', 'integer', NOW()),
                (gen_random_uuid(), '{freeflowId}', 'response_time_sla', 'standard', 'string', NOW());
            ");

            // ========================================================================
            // Seed Plan Limits - SmartFlow
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, limit_type, created_at)
                VALUES
                (gen_random_uuid(), '{smartflowId}', 'max_ai_interactions', '250', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'max_ai_voice_agents', '1', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'max_ai_voice_minutes', '100', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'max_ai_sms', '100', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'max_seats', '3', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'knowledge_base_size_mb', '20', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'max_workflows', '5', 'integer', NOW()),
                (gen_random_uuid(), '{smartflowId}', 'response_time_sla', 'standard', 'string', NOW());
            ");

            // ========================================================================
            // Seed Plan Limits - UltraFlow
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, limit_type, created_at)
                VALUES
                (gen_random_uuid(), '{ultraflowId}', 'max_ai_interactions', '1500', 'integer', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'max_ai_voice_agents', '3', 'integer', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'max_ai_voice_minutes', '500', 'integer', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'max_ai_sms', '500', 'integer', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'max_seats', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'knowledge_base_size_mb', '100', 'integer', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'max_workflows', '25', 'integer', NOW()),
                (gen_random_uuid(), '{ultraflowId}', 'response_time_sla', 'priority', 'string', NOW());
            ");

            // ========================================================================
            // Seed Plan Limits - Enterprise
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, limit_type, created_at)
                VALUES
                (gen_random_uuid(), '{enterpriseId}', 'max_ai_interactions', '8000', 'integer', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'max_ai_voice_agents', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'max_ai_voice_minutes', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'max_ai_sms', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'max_seats', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'knowledge_base_size_mb', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'max_workflows', 'unlimited', 'string', NOW()),
                (gen_random_uuid(), '{enterpriseId}', 'response_time_sla', 'dedicated', 'string', NOW());
            ");

            // ========================================================================
            // Seed Features
            // ========================================================================
            var aiEmailId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
            var aiVoiceId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
            var aiSmsId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
            var webchatId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
            var instagramId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
            var facebookId = "ffffffff-ffff-ffff-ffff-ffffffffffff";
            var whatsappId = "11111111-aaaa-aaaa-aaaa-111111111111";
            var customBrandingId = "22222222-aaaa-aaaa-aaaa-222222222222";
            var apiAccessId = "33333333-aaaa-aaaa-aaaa-333333333333";
            var dedicatedSupportId = "44444444-aaaa-aaaa-aaaa-444444444444";

            migrationBuilder.Sql($@"
                INSERT INTO features (id, feature_key, display_name, description, category, is_active, created_at)
                VALUES
                ('{aiEmailId}', 'ai_email', 'AI Email', 'AI-powered email conversations', 'channel', true, NOW()),
                ('{aiVoiceId}', 'ai_voice', 'AI Voice', 'AI-powered voice conversations', 'channel', true, NOW()),
                ('{aiSmsId}', 'ai_sms', 'AI SMS', 'AI-powered SMS conversations', 'channel', true, NOW()),
                ('{webchatId}', 'webchat', 'Web Chat', 'Website chat widget', 'channel', true, NOW()),
                ('{instagramId}', 'instagram', 'Instagram', 'Instagram DM integration', 'channel', true, NOW()),
                ('{facebookId}', 'facebook', 'Facebook', 'Facebook Messenger integration', 'channel', true, NOW()),
                ('{whatsappId}', 'whatsapp', 'WhatsApp', 'WhatsApp Business integration', 'channel', true, NOW()),
                ('{customBrandingId}', 'custom_branding', 'Custom Branding', 'White-label branding options', 'customization', true, NOW()),
                ('{apiAccessId}', 'api_access', 'API Access', 'REST API access for integrations', 'integration', true, NOW()),
                ('{dedicatedSupportId}', 'dedicated_support', 'Dedicated Support', 'Priority support with dedicated account manager', 'support', true, NOW());
            ");

            // ========================================================================
            // Seed Plan Features - FreeFlow (basic features only)
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_features (id, plan_id, feature_id, created_at)
                VALUES
                (gen_random_uuid(), '{freeflowId}', '{aiEmailId}', NOW()),
                (gen_random_uuid(), '{freeflowId}', '{webchatId}', NOW());
            ");

            // ========================================================================
            // Seed Plan Features - SmartFlow
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_features (id, plan_id, feature_id, created_at)
                VALUES
                (gen_random_uuid(), '{smartflowId}', '{aiEmailId}', NOW()),
                (gen_random_uuid(), '{smartflowId}', '{aiVoiceId}', NOW()),
                (gen_random_uuid(), '{smartflowId}', '{aiSmsId}', NOW()),
                (gen_random_uuid(), '{smartflowId}', '{webchatId}', NOW()),
                (gen_random_uuid(), '{smartflowId}', '{instagramId}', NOW()),
                (gen_random_uuid(), '{smartflowId}', '{facebookId}', NOW());
            ");

            // ========================================================================
            // Seed Plan Features - UltraFlow
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_features (id, plan_id, feature_id, created_at)
                VALUES
                (gen_random_uuid(), '{ultraflowId}', '{aiEmailId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{aiVoiceId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{aiSmsId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{webchatId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{instagramId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{facebookId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{whatsappId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{customBrandingId}', NOW()),
                (gen_random_uuid(), '{ultraflowId}', '{apiAccessId}', NOW());
            ");

            // ========================================================================
            // Seed Plan Features - Enterprise (all features)
            // ========================================================================
            migrationBuilder.Sql($@"
                INSERT INTO plan_features (id, plan_id, feature_id, created_at)
                VALUES
                (gen_random_uuid(), '{enterpriseId}', '{aiEmailId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{aiVoiceId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{aiSmsId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{webchatId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{instagramId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{facebookId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{whatsappId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{customBrandingId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{apiAccessId}', NOW()),
                (gen_random_uuid(), '{enterpriseId}', '{dedicatedSupportId}', NOW());
            ");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_audit_logs");

            migrationBuilder.DropTable(
                name: "ai_configurations");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "auto_assignment_rules");

            migrationBuilder.DropTable(
                name: "billing_transaction");

            migrationBuilder.DropTable(
                name: "bookings");

            migrationBuilder.DropTable(
                name: "business_overrides");

            migrationBuilder.DropTable(
                name: "chat_messages");

            migrationBuilder.DropTable(
                name: "conversation_notes");

            migrationBuilder.DropTable(
                name: "crm_providers");

            migrationBuilder.DropTable(
                name: "deals");

            migrationBuilder.DropTable(
                name: "email_logs");

            migrationBuilder.DropTable(
                name: "form_submissions");

            migrationBuilder.DropTable(
                name: "message_attachments");

            migrationBuilder.DropTable(
                name: "message_read_statuses");

            migrationBuilder.DropTable(
                name: "onboarding_progress");

            migrationBuilder.DropTable(
                name: "outbound_calls");

            migrationBuilder.DropTable(
                name: "plan_features");

            migrationBuilder.DropTable(
                name: "plan_limits");

            migrationBuilder.DropTable(
                name: "qualifications");

            migrationBuilder.DropTable(
                name: "quick_replies");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "role_claims");

            migrationBuilder.DropTable(
                name: "saved_searches");

            migrationBuilder.DropTable(
                name: "score_history");

            migrationBuilder.DropTable(
                name: "scoring_criteria");

            migrationBuilder.DropTable(
                name: "search_analytics");

            migrationBuilder.DropTable(
                name: "usage_counters");

            migrationBuilder.DropTable(
                name: "user_claims");

            migrationBuilder.DropTable(
                name: "user_logins");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "user_tokens");

            migrationBuilder.DropTable(
                name: "webhook_deliveries");

            migrationBuilder.DropTable(
                name: "workflow_instances");

            migrationBuilder.DropTable(
                name: "admin_users");

            migrationBuilder.DropTable(
                name: "subscription");

            migrationBuilder.DropTable(
                name: "chat_sessions");

            migrationBuilder.DropTable(
                name: "contacts");

            migrationBuilder.DropTable(
                name: "email_templates");

            migrationBuilder.DropTable(
                name: "forms");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "call_scripts");

            migrationBuilder.DropTable(
                name: "features");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "webhooks");

            migrationBuilder.DropTable(
                name: "workflow_definitions");

            migrationBuilder.DropTable(
                name: "subscription_plans");

            migrationBuilder.DropTable(
                name: "chat_widgets");

            migrationBuilder.DropTable(
                name: "conversations");

            migrationBuilder.DropTable(
                name: "channels");

            migrationBuilder.DropTable(
                name: "leads");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "businesses");
        }
    }
}
