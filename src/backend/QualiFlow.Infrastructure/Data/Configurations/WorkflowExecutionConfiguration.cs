// <copyright file="WorkflowExecutionConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for WorkflowExecution entity.
/// </summary>
public class WorkflowExecutionConfiguration : IEntityTypeConfiguration<WorkflowExecution>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<WorkflowExecution> builder)
    {
        builder.ToTable("workflow_executions");

        builder.HasKey(we => we.Id);

        builder.Property(we => we.BusinessWorkflowId)
            .IsRequired();

        builder.Property(we => we.BusinessId)
            .IsRequired();

        builder.Property(we => we.WorkflowCoreInstanceId)
            .HasMaxLength(255);

        builder.Property(we => we.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(we => we.StartedAt);

        builder.Property(we => we.CompletedAt);

        builder.Property(we => we.DurationSeconds);

        builder.Property(we => we.StepsCompleted)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(we => we.StepsTotal)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(we => we.CurrentStep)
            .HasMaxLength(255);

        builder.Property(we => we.InputData)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(we => we.ResultData)
            .HasColumnType("jsonb");

        builder.Property(we => we.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(we => we.ErrorStackTrace)
            .HasColumnType("text");

        builder.Property(we => we.LeadId);

        builder.Property(we => we.ConversationId);

        builder.Property(we => we.TriggeredByUserId);

        builder.Property(we => we.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(we => we.UpdatedAt);

        builder.Property(we => we.DeletedAt);

        // Indexes
        builder.HasIndex(we => we.BusinessWorkflowId);
        builder.HasIndex(we => we.BusinessId);
        builder.HasIndex(we => we.Status);
        builder.HasIndex(we => we.StartedAt);
        builder.HasIndex(we => we.CompletedAt);
        builder.HasIndex(we => we.LeadId);
        builder.HasIndex(we => we.ConversationId);
        builder.HasIndex(we => we.DeletedAt);

        // Query filter for soft delete
        builder.HasQueryFilter(we => we.DeletedAt == null);

        // Relationships
        builder.HasOne(we => we.BusinessWorkflow)
            .WithMany(bw => bw.Executions)
            .HasForeignKey(we => we.BusinessWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(we => we.Business)
            .WithMany()
            .HasForeignKey(we => we.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(we => we.Lead)
            .WithMany()
            .HasForeignKey(we => we.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(we => we.Conversation)
            .WithMany()
            .HasForeignKey(we => we.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(we => we.TriggeredByUser)
            .WithMany()
            .HasForeignKey(we => we.TriggeredByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
