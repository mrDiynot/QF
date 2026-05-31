using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ApplicationUser entity.
/// </summary>
public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    /// <summary>
    /// Configures the ApplicationUser entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        // Table name is already configured in QualiFlowDbContext.OnModelCreating
        // builder.ToTable("users");

        // ========================================================================
        // Properties
        // ========================================================================

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.BusinessId)
            .IsRequired();

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(u => u.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(u => u.UpdatedAt)
            .IsRequired(false);

        builder.Property(u => u.DeletedAt)
            .IsRequired(false);

        // ========================================================================
        // Indexes
        // ========================================================================

        // Index on BusinessId for multi-tenancy queries
        builder.HasIndex(u => u.BusinessId)
            .HasDatabaseName("ix_users_business_id");

        // Index on Email for login queries
        builder.HasIndex(u => u.Email)
            .HasDatabaseName("ix_users_email");

        // Index on IsActive for filtering active users
        builder.HasIndex(u => u.IsActive)
            .HasDatabaseName("ix_users_is_active");

        // Composite index on BusinessId and Email for tenant-scoped queries
        builder.HasIndex(u => new { u.BusinessId, u.Email })
            .HasDatabaseName("ix_users_business_id_email");

        // Index on DeletedAt for soft delete queries
        builder.HasIndex(u => u.DeletedAt)
            .HasDatabaseName("ix_users_deleted_at");

        // ========================================================================
        // Relationships
        // ========================================================================

        // ApplicationUser -> Business (Many-to-One)
        builder.HasOne(u => u.Business)
            .WithMany(b => b.Users)
            .HasForeignKey(u => u.BusinessId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        // ========================================================================
        // Computed Properties (Ignored)
        // ========================================================================

        builder.Ignore(u => u.IsDeleted);
        builder.Ignore(u => u.FullName);
    }
}

