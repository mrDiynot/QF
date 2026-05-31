using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for WorkflowDefinition entity.
/// </summary>
public class WorkflowDefinitionConfiguration : IEntityTypeConfiguration<WorkflowDefinition>
{
    /// <summary>
    /// Configures the WorkflowDefinition entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<WorkflowDefinition> builder)
    {
        // Table name
        builder.ToTable("workflow_definitions");

        // Primary key
        builder.HasKey(w => w.Id);

        // Properties
        builder.Property(w => w.BusinessId)
            .IsRequired();

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(w => w.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(w => w.DefinitionJson)
            .IsRequired()
            .HasColumnType("jsonb");

        builder.Property(w => w.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(w => w.TriggerType)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(WorkflowTriggerType.Manual);

        builder.Property(w => w.TriggerConfig)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(w => w.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(WorkflowCategory.Custom)
            .HasSentinel(WorkflowCategory.LeadQualification)
            .HasColumnName("category");

        builder.Property(w => w.Tags)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(w => w.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(w => w.UpdatedAt)
            .IsRequired(false);

        builder.Property(w => w.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(w => w.BusinessId)
            .HasDatabaseName("ix_workflow_definitions_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(w => w.IsActive)
            .HasDatabaseName("ix_workflow_definitions_is_active");

        builder.HasIndex(w => w.Category)
            .HasDatabaseName("ix_workflow_definitions_category");

        builder.HasIndex(w => new { w.BusinessId, w.IsActive })
            .HasDatabaseName("ix_workflow_definitions_business_id_is_active");

        builder.HasIndex(w => new { w.BusinessId, w.Category })
            .HasDatabaseName("ix_workflow_definitions_business_id_category");

        builder.HasIndex(w => new { w.BusinessId, w.Name })
            .HasDatabaseName("ix_workflow_definitions_business_id_name");

        // Relationships
        builder.HasOne(w => w.Business)
            .WithMany()
            .HasForeignKey(w => w.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.Instances)
            .WithOne(i => i.WorkflowDefinition)
            .HasForeignKey(i => i.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

