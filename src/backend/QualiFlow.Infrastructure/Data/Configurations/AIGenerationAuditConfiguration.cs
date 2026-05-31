// -----------------------------------------------------------------------
// <copyright file="AIGenerationAuditConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for AIGenerationAudit entity.
/// </summary>
public class AIGenerationAuditConfiguration : IEntityTypeConfiguration<AIGenerationAudit>
{
    /// <summary>
    /// Configures the AIGenerationAudit entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<AIGenerationAudit> builder)
    {
        // Table name (snake_case)
        builder.ToTable("ai_generation_audits");

        // Primary key
        builder.HasKey(a => a.Id);

        // ========================================
        // Properties
        // ========================================

        builder.Property(a => a.BusinessId)
            .IsRequired();

        builder.Property(a => a.UserId);

        builder.Property(a => a.TaskType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.InputPrompt)
            .IsRequired();

        builder.Property(a => a.OutputJson)
            .IsRequired();

        builder.Property(a => a.InputTokens)
            .IsRequired();

        builder.Property(a => a.OutputTokens)
            .IsRequired();

        builder.Property(a => a.ModelUsed)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.DurationMs)
            .IsRequired();

        builder.Property(a => a.EstimatedCostUsd)
            .HasPrecision(18, 8);

        builder.Property(a => a.Feedback)
            .HasMaxLength(50)
            .HasConversion<string>();

        builder.Property(a => a.FeedbackComment)
            .HasMaxLength(2000);

        builder.Property(a => a.FeedbackAt);

        builder.Property(a => a.IsSuccess)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(a => a.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(a => a.Metadata);

        // Ignore computed property
        builder.Ignore(a => a.TotalTokens);

        // ========================================
        // Indexes
        // ========================================

        // Multi-tenancy index for efficient filtering
        builder.HasIndex(a => a.BusinessId)
            .HasDatabaseName("ix_ai_generation_audits_business_id");

        // Index for querying by task type
        builder.HasIndex(a => new { a.BusinessId, a.TaskType })
            .HasDatabaseName("ix_ai_generation_audits_business_task_type");

        // Index for querying by user
        builder.HasIndex(a => new { a.BusinessId, a.UserId })
            .HasDatabaseName("ix_ai_generation_audits_business_user_id")
            .HasFilter("user_id IS NOT NULL");

        // Index for time-based analytics
        builder.HasIndex(a => new { a.BusinessId, a.CreatedAt })
            .HasDatabaseName("ix_ai_generation_audits_business_created_at");

        // Index for feedback analytics
        builder.HasIndex(a => new { a.BusinessId, a.Feedback })
            .HasDatabaseName("ix_ai_generation_audits_business_feedback")
            .HasFilter("feedback IS NOT NULL");

        // ========================================
        // Relationships
        // ========================================

        builder.HasOne(a => a.Business)
            .WithMany()
            .HasForeignKey(a => a.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

