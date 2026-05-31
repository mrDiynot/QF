using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Deal entity.
/// </summary>
public class DealConfiguration : IEntityTypeConfiguration<Deal>
{
    /// <summary>
    /// Configures the Deal entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<Deal> builder)
    {
        // Table name
        builder.ToTable("deals");

        // Primary key
        builder.HasKey(d => d.Id);

        // Properties
        builder.Property(d => d.BusinessId)
            .IsRequired();

        builder.Property(d => d.ContactId)
            .IsRequired();

        builder.Property(d => d.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Value)
            .IsRequired()
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(d => d.Probability)
            .IsRequired()
            .HasDefaultValue(50);

        builder.Property(d => d.Stage)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(DealStage.New)
            .HasSentinel(DealStage.None);

        builder.Property(d => d.ExpectedCloseDate)
            .IsRequired(false);

        builder.Property(d => d.ActualCloseDate)
            .IsRequired(false);

        builder.Property(d => d.AssignedToUserId)
            .IsRequired(false);

        builder.Property(d => d.Description)
            .IsRequired(false)
            .HasColumnType("text");

        builder.Property(d => d.Notes)
            .IsRequired(false)
            .HasColumnType("text");

        builder.Property(d => d.LossReason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(d => d.ExternalCRMId)
            .IsRequired(false)
            .HasMaxLength(255);

        builder.Property(d => d.ExternalCRMUrl)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(d => d.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(d => d.UpdatedAt)
            .IsRequired(false);

        builder.Property(d => d.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(d => d.BusinessId)
            .HasDatabaseName("ix_deals_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(d => d.ContactId)
            .HasDatabaseName("ix_deals_contact_id");

        builder.HasIndex(d => d.Stage)
            .HasDatabaseName("ix_deals_stage");

        builder.HasIndex(d => d.AssignedToUserId)
            .HasDatabaseName("ix_deals_assigned_to_user_id")
            .HasFilter("assigned_to_user_id IS NOT NULL");

        builder.HasIndex(d => d.Value)
            .HasDatabaseName("ix_deals_value");

        builder.HasIndex(d => d.ExpectedCloseDate)
            .HasDatabaseName("ix_deals_expected_close_date")
            .HasFilter("expected_close_date IS NOT NULL");

        builder.HasIndex(d => d.ActualCloseDate)
            .HasDatabaseName("ix_deals_actual_close_date")
            .HasFilter("actual_close_date IS NOT NULL");

        builder.HasIndex(d => d.CreatedAt)
            .HasDatabaseName("ix_deals_created_at");

        builder.HasIndex(d => d.UpdatedAt)
            .HasDatabaseName("ix_deals_updated_at")
            .HasFilter("updated_at IS NOT NULL");

        builder.HasIndex(d => d.ExternalCRMId)
            .HasDatabaseName("ix_deals_external_crm_id")
            .HasFilter("external_crm_id IS NOT NULL");

        // Composite indexes for common queries
        builder.HasIndex(d => new { d.BusinessId, d.Stage })
            .HasDatabaseName("ix_deals_business_id_stage");

        builder.HasIndex(d => new { d.BusinessId, d.ContactId })
            .HasDatabaseName("ix_deals_business_id_contact_id");

        builder.HasIndex(d => new { d.BusinessId, d.AssignedToUserId })
            .HasDatabaseName("ix_deals_business_id_assigned_to_user_id")
            .HasFilter("assigned_to_user_id IS NOT NULL");

        builder.HasIndex(d => new { d.BusinessId, d.Value })
            .HasDatabaseName("ix_deals_business_id_value");

        // Pipeline queries (open deals only - not Won/Lost)
        builder.HasIndex(d => new { d.BusinessId, d.Stage, d.Value })
            .HasDatabaseName("ix_deals_pipeline")
            .HasFilter("stage NOT IN ('Won', 'Lost') AND deleted_at IS NULL");

        // Relationships
        builder.HasOne(d => d.Business)
            .WithMany(b => b.Deals)
            .HasForeignKey(d => d.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Contact)
            .WithMany(c => c.Deals)
            .HasForeignKey(d => d.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.AssignedToUser)
            .WithMany()
            .HasForeignKey(d => d.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Ignore computed properties
        builder.Ignore(d => d.IsWon);
        builder.Ignore(d => d.IsLost);
        builder.Ignore(d => d.IsClosed);
        builder.Ignore(d => d.IsOpen);
        builder.Ignore(d => d.WeightedValue);
    }
}
