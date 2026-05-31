using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for KnowledgeBaseArticle entity.
/// </summary>
public class KnowledgeBaseArticleConfiguration : IEntityTypeConfiguration<KnowledgeBaseArticle>
{
    /// <summary>
    /// Configures the KnowledgeBaseArticle entity.
    /// </summary>
    public void Configure(EntityTypeBuilder<KnowledgeBaseArticle> builder)
    {
        ConfigureTable(builder);
        ConfigureProperties(builder);
        ConfigureIndexes(builder);
        ConfigureRelationships(builder);
    }

    private static void ConfigureTable(EntityTypeBuilder<KnowledgeBaseArticle> builder)
    {
        builder.ToTable("knowledge_base_articles");
        builder.HasKey(a => a.Id);
    }

    private static void ConfigureProperties(EntityTypeBuilder<KnowledgeBaseArticle> builder)
    {
        builder.Property(a => a.BusinessId).IsRequired();

        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Content)
            .IsRequired()
            .HasMaxLength(10000); // Support long-form content

        builder.Property(a => a.Category)
            .HasMaxLength(100);

        builder.Property(a => a.Tags)
            .HasMaxLength(500);

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(a => a.IsPublished)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.Priority)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(a => a.UsageCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(a => a.LastUsedAt).IsRequired(false);

        builder.Property(a => a.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(a => a.UpdatedAt).IsRequired(false);
        builder.Property(a => a.DeletedAt).IsRequired(false);
    }

    private static void ConfigureIndexes(EntityTypeBuilder<KnowledgeBaseArticle> builder)
    {
        // Index for finding articles by business
        builder.HasIndex(a => a.BusinessId)
            .HasDatabaseName("ix_knowledge_base_articles_business_id");

        // Index for filtering active/published articles
        builder.HasIndex(a => new { a.BusinessId, a.IsActive, a.IsPublished })
            .HasDatabaseName("ix_knowledge_base_articles_business_active_published");

        // Index for category filtering
        builder.HasIndex(a => new { a.BusinessId, a.Category })
            .HasDatabaseName("ix_knowledge_base_articles_business_category")
            .HasFilter("category IS NOT NULL");

        // Index for full-text search on title
        builder.HasIndex(a => a.Title)
            .HasDatabaseName("ix_knowledge_base_articles_title");

        // Index for sorting by priority
        builder.HasIndex(a => new { a.BusinessId, a.Priority })
            .HasDatabaseName("ix_knowledge_base_articles_business_priority");
    }

    private static void ConfigureRelationships(EntityTypeBuilder<KnowledgeBaseArticle> builder)
    {
        builder.HasOne(a => a.Business)
            .WithMany()
            .HasForeignKey(a => a.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
