// <copyright file="WorkflowPlanAssignmentConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for WorkflowPlanAssignment entity.
/// </summary>
public class WorkflowPlanAssignmentConfiguration : IEntityTypeConfiguration<WorkflowPlanAssignment>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<WorkflowPlanAssignment> builder)
    {
        builder.ToTable("workflow_plan_assignments");

        builder.HasKey(wpa => wpa.Id);

        builder.Property(wpa => wpa.WorkflowTemplateId)
            .IsRequired();

        builder.Property(wpa => wpa.PlanTier)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(wpa => wpa.IsIncluded)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(wpa => wpa.RequiresApproval)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(wpa => wpa.MaxInstances);

        builder.Property(wpa => wpa.AssignedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(wpa => wpa.AssignedBy)
            .HasMaxLength(255);

        builder.Property(wpa => wpa.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(wpa => wpa.UpdatedAt);

        builder.Property(wpa => wpa.DeletedAt);

        // Indexes
        builder.HasIndex(wpa => wpa.WorkflowTemplateId);
        builder.HasIndex(wpa => wpa.PlanTier);
        builder.HasIndex(wpa => new { wpa.WorkflowTemplateId, wpa.PlanTier })
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        // Query filter for soft delete
        builder.HasQueryFilter(wpa => wpa.DeletedAt == null);

        // Relationships
        builder.HasOne(wpa => wpa.WorkflowTemplate)
            .WithMany(t => t.PlanAssignments)
            .HasForeignKey(wpa => wpa.WorkflowTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
