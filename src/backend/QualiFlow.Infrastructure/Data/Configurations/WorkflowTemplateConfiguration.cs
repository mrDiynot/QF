// <copyright file="WorkflowTemplateConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for WorkflowTemplate entity.
/// </summary>
public class WorkflowTemplateConfiguration : IEntityTypeConfiguration<WorkflowTemplate>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<WorkflowTemplate> builder)
    {
        builder.ToTable("workflow_templates");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(w => w.Description)
            .HasMaxLength(2000);

        builder.Property(w => w.Category)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(w => w.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(w => w.IsGlobalTemplate)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(w => w.RequiresApproval)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(w => w.DefaultTrigger)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(w => w.DefaultSteps)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(w => w.ConfigurableFields)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(w => w.CreatedBy)
            .HasMaxLength(255);

        builder.Property(w => w.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(w => w.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(w => w.UpdatedAt);

        builder.Property(w => w.DeletedAt);

        // Indexes
        builder.HasIndex(w => w.Category);
        builder.HasIndex(w => w.IsActive);
        builder.HasIndex(w => w.IsGlobalTemplate);
        builder.HasIndex(w => w.DeletedAt);

        // Query filter for soft delete
        builder.HasQueryFilter(w => w.DeletedAt == null);

        // Relationships
        builder.HasMany(w => w.PlanAssignments)
            .WithOne(pa => pa.WorkflowTemplate)
            .HasForeignKey(pa => pa.WorkflowTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.BusinessWorkflows)
            .WithOne(bw => bw.Template)
            .HasForeignKey(bw => bw.TemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.ApprovalRequests)
            .WithOne(ar => ar.WorkflowTemplate)
            .HasForeignKey(ar => ar.WorkflowTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
