using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Contact entity.
/// </summary>
public class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    /// <summary>
    /// Configures the Contact entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        // Table name
        builder.ToTable("contacts");

        // Primary key
        builder.HasKey(c => c.Id);

        // Properties
        builder.Property(c => c.BusinessId)
            .IsRequired();

        builder.Property(c => c.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.PhoneNumber)
            .IsRequired(false)
            .HasMaxLength(20);

        builder.Property(c => c.Company)
            .IsRequired(false)
            .HasMaxLength(200);

        builder.Property(c => c.JobTitle)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(ContactStatus.Active)
            .HasSentinel(ContactStatus.None);

        builder.Property(c => c.Source)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(ContactSource.Manual)
            .HasSentinel(ContactSource.None);

        builder.Property(c => c.Tags)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(c => c.LastContactedAt)
            .IsRequired(false);

        builder.Property(c => c.AssignedToUserId)
            .IsRequired(false);

        builder.Property(c => c.Notes)
            .IsRequired(false)
            .HasColumnType("text");

        builder.Property(c => c.OriginalLeadId)
            .IsRequired(false);

        builder.Property(c => c.ExternalCRMId)
            .IsRequired(false)
            .HasMaxLength(255);

        builder.Property(c => c.ExternalCRMUrl)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(c => c.UpdatedAt)
            .IsRequired(false);

        builder.Property(c => c.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(c => c.BusinessId)
            .HasDatabaseName("ix_contacts_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(c => c.Email)
            .HasDatabaseName("ix_contacts_email");

        builder.HasIndex(c => c.Status)
            .HasDatabaseName("ix_contacts_status");

        builder.HasIndex(c => c.AssignedToUserId)
            .HasDatabaseName("ix_contacts_assigned_to_user_id")
            .HasFilter("assigned_to_user_id IS NOT NULL");

        builder.HasIndex(c => c.CreatedAt)
            .HasDatabaseName("ix_contacts_created_at");

        builder.HasIndex(c => c.UpdatedAt)
            .HasDatabaseName("ix_contacts_updated_at")
            .HasFilter("updated_at IS NOT NULL");

        builder.HasIndex(c => c.OriginalLeadId)
            .HasDatabaseName("ix_contacts_original_lead_id")
            .HasFilter("original_lead_id IS NOT NULL");

        builder.HasIndex(c => c.ExternalCRMId)
            .HasDatabaseName("ix_contacts_external_crm_id")
            .HasFilter("external_crm_id IS NOT NULL");

        // Unique constraint: Email must be unique per business
        builder.HasIndex(c => new { c.BusinessId, c.Email })
            .IsUnique()
            .HasDatabaseName("ix_contacts_business_id_email_unique")
            .HasFilter("deleted_at IS NULL");

        // Composite indexes for common queries
        builder.HasIndex(c => new { c.BusinessId, c.Status })
            .HasDatabaseName("ix_contacts_business_id_status");

        builder.HasIndex(c => new { c.BusinessId, c.AssignedToUserId })
            .HasDatabaseName("ix_contacts_business_id_assigned_to_user_id")
            .HasFilter("assigned_to_user_id IS NOT NULL");

        // Relationships
        builder.HasOne(c => c.Business)
            .WithMany(b => b.Contacts)
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.AssignedToUser)
            .WithMany()
            .HasForeignKey(c => c.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.OriginalLead)
            .WithMany()
            .HasForeignKey(c => c.OriginalLeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Deals)
            .WithOne(d => d.Contact)
            .HasForeignKey(d => d.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ignore computed properties
        builder.Ignore(c => c.FullName);
        builder.Ignore(c => c.IsConvertedFromLead);
    }
}
