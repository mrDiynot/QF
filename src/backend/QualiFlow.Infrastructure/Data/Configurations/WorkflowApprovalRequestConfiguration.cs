// <copyright file="WorkflowApprovalRequestConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for WorkflowApprovalRequest entity.
/// </summary>
public class WorkflowApprovalRequestConfiguration : IEntityTypeConfiguration<WorkflowApprovalRequest>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<WorkflowApprovalRequest> builder)
    {
        builder.ToTable("workflow_approval_requests");

        builder.HasKey(war => war.Id);

        builder.Property(war => war.BusinessId)
            .IsRequired();

        builder.Property(war => war.WorkflowTemplateId)
            .IsRequired();

        builder.Property(war => war.RequestedByUserId)
            .IsRequired();

        builder.Property(war => war.RequestedByEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(war => war.RequestReason)
            .HasMaxLength(1000);

        builder.Property(war => war.CustomConfiguration)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(war => war.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Pending");

        builder.Property(war => war.ReviewedBy)
            .HasMaxLength(255);

        builder.Property(war => war.ReviewedAt);

        builder.Property(war => war.ReviewNotes)
            .HasMaxLength(1000);

        builder.Property(war => war.RequestedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(war => war.ExpiresAt);

        builder.Property(war => war.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(war => war.UpdatedAt);

        builder.Property(war => war.DeletedAt);

        // Indexes
        builder.HasIndex(war => war.BusinessId);
        builder.HasIndex(war => war.WorkflowTemplateId);
        builder.HasIndex(war => war.Status);
        builder.HasIndex(war => war.RequestedAt);
        builder.HasIndex(war => war.DeletedAt);

        // Query filter for soft delete
        builder.HasQueryFilter(war => war.DeletedAt == null);

        // Relationships
        builder.HasOne(war => war.Business)
            .WithMany()
            .HasForeignKey(war => war.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(war => war.WorkflowTemplate)
            .WithMany(t => t.ApprovalRequests)
            .HasForeignKey(war => war.WorkflowTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(war => war.RequestedByUser)
            .WithMany()
            .HasForeignKey(war => war.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
