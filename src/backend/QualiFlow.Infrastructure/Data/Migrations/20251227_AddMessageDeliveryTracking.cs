using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations;

/// <summary>
/// Migration to add message delivery tracking fields (Sprint 2.3).
/// Adds support for tracking message delivery status, retries, and provider correlation.
/// </summary>
public partial class AddMessageDeliveryTracking : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add DeliveryStatus column
        migrationBuilder.AddColumn<string>(
            name: "delivery_status",
            table: "messages",
            type: "character varying(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "Queued");

        // Add RetryCount column
        migrationBuilder.AddColumn<int>(
            name: "retry_count",
            table: "messages",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        // Add LastRetryAt column
        migrationBuilder.AddColumn<DateTime>(
            name: "last_retry_at",
            table: "messages",
            type: "timestamp with time zone",
            nullable: true);

        // Add FailureReason column
        migrationBuilder.AddColumn<string>(
            name: "failure_reason",
            table: "messages",
            type: "character varying(500)",
            maxLength: 500,
            nullable: true);

        // Add ExternalMessageId column
        migrationBuilder.AddColumn<string>(
            name: "external_message_id",
            table: "messages",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        // Create index on delivery_status for finding messages by status
        migrationBuilder.CreateIndex(
            name: "ix_messages_delivery_status",
            table: "messages",
            column: "delivery_status");

        // Create index on external_message_id for webhook correlation
        migrationBuilder.CreateIndex(
            name: "ix_messages_external_message_id",
            table: "messages",
            column: "external_message_id",
            filter: "external_message_id IS NOT NULL");

        // Create composite index for finding failed messages that need retry
        migrationBuilder.CreateIndex(
            name: "ix_messages_delivery_status_last_retry_at",
            table: "messages",
            columns: new[] { "delivery_status", "last_retry_at" },
            filter: "delivery_status = 'Failed'");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Drop indexes
        migrationBuilder.DropIndex(
            name: "ix_messages_delivery_status_last_retry_at",
            table: "messages");

        migrationBuilder.DropIndex(
            name: "ix_messages_external_message_id",
            table: "messages");

        migrationBuilder.DropIndex(
            name: "ix_messages_delivery_status",
            table: "messages");

        // Drop columns
        migrationBuilder.DropColumn(
            name: "external_message_id",
            table: "messages");

        migrationBuilder.DropColumn(
            name: "failure_reason",
            table: "messages");

        migrationBuilder.DropColumn(
            name: "last_retry_at",
            table: "messages");

        migrationBuilder.DropColumn(
            name: "retry_count",
            table: "messages");

        migrationBuilder.DropColumn(
            name: "delivery_status",
            table: "messages");
    }
}
