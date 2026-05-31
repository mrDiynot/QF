using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUsageTrackingEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "current_ai_voice_agents_count",
                table: "usage_counters",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "knowledge_base_storage_bytes",
                table: "usage_counters",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "monthly_ai_sms_count",
                table: "usage_counters",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "monthly_ai_voice_minutes",
                table: "usage_counters",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Add missing plan_limits for all plans
            // Plan IDs (from database):
            // FreeFlow:    11111111-1111-1111-1111-111111111111
            // SmartFlow:   22222222-2222-2222-2222-222222222222
            // UltraFlow:   33333333-3333-3333-3333-333333333333
            // Enterprise:  44444444-4444-4444-4444-444444444444

            // FreeFlow limits
            migrationBuilder.Sql(@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, created_at)
                VALUES
                    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'max_leads', '25', NOW()),
                    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'max_channels', '3', NOW()),
                    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'max_crm_contacts', '50', NOW())
                ON CONFLICT DO NOTHING;
            ");

            // SmartFlow limits
            migrationBuilder.Sql(@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, created_at)
                VALUES
                    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'max_leads', '500', NOW()),
                    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'max_channels', '10', NOW()),
                    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'max_crm_contacts', '1000', NOW())
                ON CONFLICT DO NOTHING;
            ");

            // UltraFlow limits
            migrationBuilder.Sql(@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, created_at)
                VALUES
                    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'max_leads', '5000', NOW()),
                    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'max_channels', '25', NOW()),
                    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'max_crm_contacts', '10000', NOW())
                ON CONFLICT DO NOTHING;
            ");

            // Enterprise limits (unlimited)
            migrationBuilder.Sql(@"
                INSERT INTO plan_limits (id, plan_id, limit_key, limit_value, created_at)
                VALUES
                    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'max_leads', 'unlimited', NOW()),
                    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'max_channels', 'unlimited', NOW()),
                    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'max_crm_contacts', 'unlimited', NOW())
                ON CONFLICT DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "current_ai_voice_agents_count",
                table: "usage_counters");

            migrationBuilder.DropColumn(
                name: "knowledge_base_storage_bytes",
                table: "usage_counters");

            migrationBuilder.DropColumn(
                name: "monthly_ai_sms_count",
                table: "usage_counters");

            migrationBuilder.DropColumn(
                name: "monthly_ai_voice_minutes",
                table: "usage_counters");

            // Remove added plan_limits
            migrationBuilder.Sql(@"
                DELETE FROM plan_limits
                WHERE limit_key IN ('max_leads', 'max_channels', 'max_crm_contacts');
            ");
        }
    }
}
