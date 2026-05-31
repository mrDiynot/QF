using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for A/B tests.
/// </summary>
public class AbTestConfiguration : IEntityTypeConfiguration<AbTest>
{
    public void Configure(EntityTypeBuilder<AbTest> builder)
    {
        builder.ToTable("ab_tests");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(t => t.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(t => t.TestName)
            .HasColumnName("test_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(t => t.Hypothesis)
            .HasColumnName("hypothesis")
            .HasMaxLength(1000);

        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.StartedAt)
            .HasColumnName("started_at");

        builder.Property(t => t.EndedAt)
            .HasColumnName("ended_at");

        builder.Property(t => t.WinnerVariant)
            .HasColumnName("winner_variant")
            .HasMaxLength(10);

        builder.Property(t => t.ConfidenceLevel)
            .HasColumnName("confidence_level")
            .HasPrecision(5, 2);

        builder.Property(t => t.StatisticalSignificance)
            .HasColumnName("statistical_significance")
            .HasPrecision(5, 4);

        builder.Property(t => t.TrafficSplitPercentage)
            .HasColumnName("traffic_split_percentage")
            .HasDefaultValue(50)
            .IsRequired();

        builder.Property(t => t.MinimumSampleSize)
            .HasColumnName("minimum_sample_size");

        builder.Property(t => t.Configuration)
            .HasColumnName("configuration")
            .HasColumnType("jsonb");

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(t => t.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(t => t.BusinessId)
            .HasDatabaseName("ix_ab_tests_business_id");

        builder.HasIndex(t => t.Status)
            .HasDatabaseName("ix_ab_tests_status");

        builder.HasIndex(t => t.StartedAt)
            .HasDatabaseName("ix_ab_tests_started_at");

        builder.HasIndex(t => t.EndedAt)
            .HasDatabaseName("ix_ab_tests_ended_at");

        // Soft delete query filter
        builder.HasQueryFilter(t => t.DeletedAt == null);

        // Relationships
        builder.HasOne(t => t.Business)
            .WithMany()
            .HasForeignKey(t => t.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Variants)
            .WithOne(v => v.AbTest)
            .HasForeignKey(v => v.AbTestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
