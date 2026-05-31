// <copyright file="BusinessWorkflowConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for BusinessWorkflow entity.
/// </summary>
public class BusinessWorkflowConfiguration : IEntityTypeConfiguration<BusinessWorkflow>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<BusinessWorkflow> builder)
    {
        builder.ToTable("business_workflows");

        builder.HasKey(bw => bw.Id);

        builder.Property(bw => bw.BusinessId)
            .IsRequired();

        builder.Property(bw => bw.TemplateId)
            .IsRequired();

        builder.Property(bw => bw.IsActive)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(bw => bw.IsApproved)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(bw => bw.ApprovedBy)
            .HasMaxLength(255);

        builder.Property(bw => bw.ApprovedAt);

        builder.Property(bw => bw.CustomConfiguration)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(bw => bw.TotalExecutions)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(bw => bw.SuccessfulExecutions)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(bw => bw.FailedExecutions)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(bw => bw.LastExecutedAt);

        builder.Property(bw => bw.ActivatedAt);

        builder.Property(bw => bw.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(bw => bw.UpdatedAt);

        builder.Property(bw => bw.DeletedAt);

        // Indexes
        builder.HasIndex(bw => bw.BusinessId);
        builder.HasIndex(bw => bw.TemplateId);
        builder.HasIndex(bw => bw.IsActive);
        builder.HasIndex(bw => bw.DeletedAt);
        builder.HasIndex(bw => new { bw.BusinessId, bw.TemplateId })
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        // Query filter for soft delete
        builder.HasQueryFilter(bw => bw.DeletedAt == null);

        // Relationships
        builder.HasOne(bw => bw.Business)
            .WithMany()
            .HasForeignKey(bw => bw.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(bw => bw.Template)
            .WithMany(t => t.BusinessWorkflows)
            .HasForeignKey(bw => bw.TemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(bw => bw.Executions)
            .WithOne(e => e.BusinessWorkflow)
            .HasForeignKey(e => e.BusinessWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
