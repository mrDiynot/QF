using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for A/B test variants.
/// </summary>
public class AbTestVariantConfiguration : IEntityTypeConfiguration<AbTestVariant>
{
    public void Configure(EntityTypeBuilder<AbTestVariant> builder)
    {
        builder.ToTable("ab_test_variants");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(v => v.AbTestId)
            .HasColumnName("ab_test_id")
            .IsRequired();

        builder.Property(v => v.VariantId)
            .HasColumnName("variant_id")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(v => v.VariantName)
            .HasColumnName("variant_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(v => v.FormId)
            .HasColumnName("form_id")
            .IsRequired();

        builder.Property(v => v.Views)
            .HasColumnName("views")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(v => v.Conversions)
            .HasColumnName("conversions")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(v => v.ConversionRate)
            .HasColumnName("conversion_rate")
            .HasPrecision(5, 4)
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(v => v.AvgCompletionTime)
            .HasColumnName("avg_completion_time");

        builder.Property(v => v.BounceRate)
            .HasColumnName("bounce_rate")
            .HasPrecision(5, 4);

        builder.Property(v => v.Configuration)
            .HasColumnName("configuration")
            .HasColumnType("jsonb");

        builder.Property(v => v.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(v => v.UpdatedAt)
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(v => v.AbTestId)
            .HasDatabaseName("ix_ab_test_variants_ab_test_id");

        builder.HasIndex(v => v.FormId)
            .HasDatabaseName("ix_ab_test_variants_form_id");

        builder.HasIndex(v => new { v.AbTestId, v.VariantId })
            .HasDatabaseName("ix_ab_test_variants_test_variant")
            .IsUnique();

        // Relationships
        builder.HasOne(v => v.AbTest)
            .WithMany(t => t.Variants)
            .HasForeignKey(v => v.AbTestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.Form)
            .WithMany()
            .HasForeignKey(v => v.FormId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
