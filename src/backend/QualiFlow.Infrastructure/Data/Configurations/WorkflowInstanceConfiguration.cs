using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for WorkflowInstance entity.
/// </summary>
public class WorkflowInstanceConfiguration : IEntityTypeConfiguration<WorkflowInstance>
{
    /// <summary>
    /// Configures the WorkflowInstance entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<WorkflowInstance> builder)
    {
        // Table name
        builder.ToTable("workflow_instances");

        // Primary key
        builder.HasKey(w => w.Id);

        // Properties
        builder.Property(w => w.BusinessId)
            .IsRequired();

        builder.Property(w => w.WorkflowDefinitionId)
            .IsRequired();

        builder.Property(w => w.WorkflowCoreId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(WorkflowStatus.Pending);

        builder.Property(w => w.DataJson)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(w => w.StartedAt)
            .IsRequired(false);

        builder.Property(w => w.CompletedAt)
            .IsRequired(false);

        builder.Property(w => w.ErrorMessage)
            .IsRequired(false)
            .HasMaxLength(2000);

        builder.Property(w => w.CurrentStepId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(w => w.CurrentStepName)
            .IsRequired(false)
            .HasMaxLength(200);

        builder.Property(w => w.LeadId)
            .IsRequired(false);

        builder.Property(w => w.ConversationId)
            .IsRequired(false);

        builder.Property(w => w.TriggeredByUserId)
            .IsRequired(false);

        builder.Property(w => w.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(w => w.UpdatedAt)
            .IsRequired(false);

        builder.Property(w => w.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(w => w.BusinessId)
            .HasDatabaseName("ix_workflow_instances_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(w => w.WorkflowDefinitionId)
            .HasDatabaseName("ix_workflow_instances_workflow_definition_id");

        builder.HasIndex(w => w.WorkflowCoreId)
            .HasDatabaseName("ix_workflow_instances_workflow_core_id")
            .IsUnique();

        builder.HasIndex(w => w.Status)
            .HasDatabaseName("ix_workflow_instances_status");

        builder.HasIndex(w => w.LeadId)
            .HasDatabaseName("ix_workflow_instances_lead_id")
            .HasFilter("lead_id IS NOT NULL");

        builder.HasIndex(w => w.ConversationId)
            .HasDatabaseName("ix_workflow_instances_conversation_id")
            .HasFilter("conversation_id IS NOT NULL");

        builder.HasIndex(w => new { w.BusinessId, w.Status })
            .HasDatabaseName("ix_workflow_instances_business_id_status");

        builder.HasIndex(w => new { w.WorkflowDefinitionId, w.Status })
            .HasDatabaseName("ix_workflow_instances_workflow_definition_id_status");

        // Relationships
        builder.HasOne(w => w.Business)
            .WithMany()
            .HasForeignKey(w => w.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(w => w.WorkflowDefinition)
            .WithMany(d => d.Instances)
            .HasForeignKey(w => w.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(w => w.Lead)
            .WithMany()
            .HasForeignKey(w => w.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(w => w.Conversation)
            .WithMany()
            .HasForeignKey(w => w.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(w => w.TriggeredByUser)
            .WithMany()
            .HasForeignKey(w => w.TriggeredByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

