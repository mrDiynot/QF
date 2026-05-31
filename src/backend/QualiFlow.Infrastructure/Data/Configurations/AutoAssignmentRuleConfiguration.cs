using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for AutoAssignmentRule entity.
/// </summary>
public class AutoAssignmentRuleConfiguration : IEntityTypeConfiguration<AutoAssignmentRule>
{
    /// <summary>
    /// Configures the AutoAssignmentRule entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<AutoAssignmentRule> builder)
    {
        builder.ToTable("auto_assignment_rules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.BusinessId)
            .IsRequired();

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(r => r.Priority)
            .IsRequired()
            .HasDefaultValue(100);

        builder.Property(r => r.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(r => r.Channel)
            .IsRequired(false)
            .HasMaxLength(50);

        builder.Property(r => r.MinLeadScore)
            .IsRequired(false);

        builder.Property(r => r.MaxLeadScore)
            .IsRequired(false);

        builder.Property(r => r.AssignmentType)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("round_robin");

        builder.Property(r => r.AssignToUserId)
            .IsRequired(false);

        builder.Property(r => r.UserPoolJson)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(r => r.LastAssignedIndex)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(r => r.UpdatedAt)
            .IsRequired(false);

        builder.Property(r => r.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(r => r.BusinessId)
            .HasDatabaseName("ix_auto_assignment_rules_business_id");

        builder.HasIndex(r => new { r.BusinessId, r.IsActive, r.Priority })
            .HasDatabaseName("ix_auto_assignment_rules_business_id_active_priority");

        // Relationships
        builder.HasOne(r => r.Business)
            .WithMany()
            .HasForeignKey(r => r.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.AssignToUser)
            .WithMany()
            .HasForeignKey(r => r.AssignToUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

