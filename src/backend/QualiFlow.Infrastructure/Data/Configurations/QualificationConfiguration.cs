using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Qualification entity.
/// </summary>
public class QualificationConfiguration : IEntityTypeConfiguration<Qualification>
{
    /// <summary>
    /// Configures the Qualification entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<Qualification> builder)
    {
        // Table name
        builder.ToTable("qualifications");

        // Primary key
        builder.HasKey(q => q.Id);

        // Properties
        builder.Property(q => q.LeadId)
            .IsRequired();

        builder.Property(q => q.Score)
            .IsRequired();

        builder.Property(q => q.Reasoning)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(q => q.QualifiedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(q => q.QualifiedBy)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("AI");

        builder.Property(q => q.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(q => q.UpdatedAt)
            .IsRequired(false);

        builder.Property(q => q.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(q => q.LeadId)
            .HasDatabaseName("ix_qualifications_lead_id");

        builder.HasIndex(q => q.Score)
            .HasDatabaseName("ix_qualifications_score");

        builder.HasIndex(q => q.QualifiedAt)
            .HasDatabaseName("ix_qualifications_qualified_at");

        builder.HasIndex(q => new { q.LeadId, q.QualifiedAt })
            .HasDatabaseName("ix_qualifications_lead_id_qualified_at");

        // Relationships
        builder.HasOne(q => q.Lead)
            .WithMany(l => l.Qualifications)
            .HasForeignKey(q => q.LeadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

