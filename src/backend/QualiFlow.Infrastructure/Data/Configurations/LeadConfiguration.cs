using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Lead entity.
/// </summary>
public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    /// <summary>
    /// Configures the Lead entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        // Table name
        builder.ToTable("leads");

        // Primary key
        builder.HasKey(l => l.Id);

        // Properties
        builder.Property(l => l.BusinessId)
            .IsRequired();

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(l => l.Phone)
            .IsRequired(false)
            .HasMaxLength(20);

        builder.Property(l => l.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(LeadStatus.New);

        builder.Property(l => l.Score)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(l => l.SourceChannel)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(l => l.Metadata)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(l => l.AssignedToUserId)
            .IsRequired(false);

        builder.Property(l => l.AssignedAt)
            .IsRequired(false);

        builder.Property(l => l.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(l => l.UpdatedAt)
            .IsRequired(false);

        builder.Property(l => l.DeletedAt)
            .IsRequired(false);

        builder.Property(l => l.IsSimulated)
            .IsRequired()
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(l => l.BusinessId)
            .HasDatabaseName("ix_leads_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(l => l.Email)
            .HasDatabaseName("ix_leads_email");

        builder.HasIndex(l => l.Status)
            .HasDatabaseName("ix_leads_status");

        builder.HasIndex(l => l.Score)
            .HasDatabaseName("ix_leads_score");

        builder.HasIndex(l => l.CreatedAt)
            .HasDatabaseName("ix_leads_created_at");

        builder.HasIndex(l => new { l.BusinessId, l.Email })
            .HasDatabaseName("ix_leads_business_id_email");

        builder.HasIndex(l => new { l.BusinessId, l.Status })
            .HasDatabaseName("ix_leads_business_id_status");

        builder.HasIndex(l => new { l.BusinessId, l.Score })
            .HasDatabaseName("ix_leads_business_id_score");

        builder.HasIndex(l => l.AssignedToUserId)
            .HasDatabaseName("ix_leads_assigned_to_user_id");

        // Relationships
        builder.HasOne(l => l.Business)
            .WithMany(b => b.Leads)
            .HasForeignKey(l => l.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.AssignedToUser)
            .WithMany()
            .HasForeignKey(l => l.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(l => l.Conversations)
            .WithOne(c => c.Lead)
            .HasForeignKey(c => c.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Qualifications)
            .WithOne(q => q.Lead)
            .HasForeignKey(q => q.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Bookings)
            .WithOne(b => b.Lead)
            .HasForeignKey(b => b.LeadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

