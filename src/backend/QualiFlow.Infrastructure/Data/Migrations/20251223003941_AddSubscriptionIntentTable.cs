using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionIntentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "subscription_intents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_id = table.Column<Guid>(type: "uuid", nullable: false),
                    intended_plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    billing_interval = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "monthly"),
                    include_onboarding = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    stripe_checkout_session_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    stripe_customer_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    failure_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "registration"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    amount_cents = table.Column<long>(type: "bigint", nullable: true),
                    currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "USD"),
                    metadata_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_intents", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscription_intents_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "businesses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_subscription_intents_subscription_plans_intended_plan_id",
                        column: x => x.intended_plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_subscription_intents_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_subscription_intents_business_id",
                table: "subscription_intents",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_intents_intended_plan_id",
                table: "subscription_intents",
                column: "intended_plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_intents_status",
                table: "subscription_intents",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_intents_status_expires_at",
                table: "subscription_intents",
                columns: new[] { "status", "expires_at" },
                filter: "status = 'Pending'");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_intents_stripe_checkout_session_id",
                table: "subscription_intents",
                column: "stripe_checkout_session_id",
                unique: true,
                filter: "stripe_checkout_session_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_intents_user_id",
                table: "subscription_intents",
                column: "user_id",
                filter: "user_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "subscription_intents");
        }
    }
}
