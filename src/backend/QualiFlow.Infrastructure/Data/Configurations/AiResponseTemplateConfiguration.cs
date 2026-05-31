// <copyright file="AiResponseTemplateConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for AiResponseTemplate entity.
/// </summary>
public class AiResponseTemplateConfiguration : IEntityTypeConfiguration<AiResponseTemplate>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<AiResponseTemplate> builder)
    {
        builder.ToTable("ai_response_templates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(t => t.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(t => t.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(t => t.Category)
            .HasColumnName("category")
            .HasMaxLength(100)
            .IsRequired()
            .HasDefaultValue("general");

        builder.Property(t => t.Prompt)
            .HasColumnName("prompt")
            .IsRequired();

        builder.Property(t => t.VariablesJson)
            .HasColumnName("variables_json")
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(t => t.Tone)
            .HasColumnName("tone")
            .HasMaxLength(50)
            .HasDefaultValue("professional");

        builder.Property(t => t.MaxTokens)
            .HasColumnName("max_tokens")
            .HasDefaultValue(150);

        builder.Property(t => t.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(t => t.SortOrder)
            .HasColumnName("sort_order")
            .HasDefaultValue(0);

        builder.Property(t => t.UsageCount)
            .HasColumnName("usage_count")
            .HasDefaultValue(0);

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(t => t.DeletedAt)
            .HasColumnName("deleted_at");

        // Multi-tenancy: Index on BusinessId for efficient filtering
        builder.HasIndex(t => t.BusinessId)
            .HasDatabaseName("ix_ai_response_templates_business_id");

        // Index for category filtering
        builder.HasIndex(t => new { t.BusinessId, t.Category })
            .HasDatabaseName("ix_ai_response_templates_business_category");

        // Soft delete filter
        builder.HasQueryFilter(t => t.DeletedAt == null);

        // Navigation to Business
        builder.HasOne(t => t.Business)
            .WithMany()
            .HasForeignKey(t => t.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
