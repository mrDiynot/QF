using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations;

/// <summary>
/// Migration to add knowledge_base_articles table for AI training and knowledge management.
/// </summary>
public partial class AddKnowledgeBaseArticles : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "knowledge_base_articles",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                business_id = table.Column<Guid>(type: "uuid", nullable: false),
                title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                content = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                is_published = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                usage_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                last_used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_knowledge_base_articles", x => x.id);
                table.ForeignKey(
                    name: "fk_knowledge_base_articles_businesses_business_id",
                    column: x => x.business_id,
                    principalTable: "businesses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create indexes
        migrationBuilder.CreateIndex(
            name: "ix_knowledge_base_articles_business_id",
            table: "knowledge_base_articles",
            column: "business_id");

        migrationBuilder.CreateIndex(
            name: "ix_knowledge_base_articles_business_active_published",
            table: "knowledge_base_articles",
            columns: new[] { "business_id", "is_active", "is_published" });

        migrationBuilder.CreateIndex(
            name: "ix_knowledge_base_articles_business_category",
            table: "knowledge_base_articles",
            columns: new[] { "business_id", "category" },
            filter: "category IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "ix_knowledge_base_articles_title",
            table: "knowledge_base_articles",
            column: "title");

        migrationBuilder.CreateIndex(
            name: "ix_knowledge_base_articles_business_priority",
            table: "knowledge_base_articles",
            columns: new[] { "business_id", "priority" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "knowledge_base_articles");
    }
}
