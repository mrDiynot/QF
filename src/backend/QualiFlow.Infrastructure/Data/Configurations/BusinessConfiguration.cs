using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Business entity.
/// </summary>
public class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
    /// <summary>
    /// Configures the Business entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<Business> builder)
    {
        builder.ToTable("businesses");

        // ========================================================================
        // Primary Key
        // ========================================================================

        builder.HasKey(b => b.Id);

        // ========================================================================
        // Properties
        // ========================================================================

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(b => b.Phone)
            .IsRequired(false)
            .HasMaxLength(20);

        builder.Property(b => b.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(b => b.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(b => b.UpdatedAt)
            .IsRequired(false);

        builder.Property(b => b.DeletedAt)
            .IsRequired(false);

        // ========================================================================
        // Indexes
        // ========================================================================

        builder.HasIndex(b => b.Email)
            .IsUnique()
            .HasDatabaseName("ix_businesses_email");

        builder.HasIndex(b => b.IsActive)
            .HasDatabaseName("ix_businesses_is_active");

        builder.HasIndex(b => b.DeletedAt)
            .HasDatabaseName("ix_businesses_deleted_at");

        // ========================================================================
        // Computed Properties (Ignored)
        // ========================================================================

        builder.Ignore(b => b.IsDeleted);
    }
}

