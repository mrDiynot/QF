using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ApplicationRole entity.
/// </summary>
public class ApplicationRoleConfiguration : IEntityTypeConfiguration<ApplicationRole>
{
    /// <summary>
    /// Configures the ApplicationRole entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<ApplicationRole> builder)
    {
        // Table name is already configured in QualiFlowDbContext.OnModelCreating
        // builder.ToTable("roles");

        // ========================================================================
        // Properties
        // ========================================================================

        builder.Property(r => r.Description)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        // ========================================================================
        // Seed Data (4 predefined roles)
        // ========================================================================

        builder.HasData(
            new ApplicationRole
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = ApplicationRole.Owner,
                NormalizedName = ApplicationRole.Owner.ToUpperInvariant(),
                Description = "Full access to all features and settings. Can manage users, billing, and delete the business.",
                CreatedAt = new DateTime(2025, 12, 3, 0, 0, 0, DateTimeKind.Utc),
                ConcurrencyStamp = "00000000-0000-0000-0000-000000000001",
            },
            new ApplicationRole
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Name = ApplicationRole.Admin,
                NormalizedName = ApplicationRole.Admin.ToUpperInvariant(),
                Description = "Administrative access to most features. Can manage users, leads, conversations, and settings.",
                CreatedAt = new DateTime(2025, 12, 3, 0, 0, 0, DateTimeKind.Utc),
                ConcurrencyStamp = "00000000-0000-0000-0000-000000000002",
            },
            new ApplicationRole
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Name = ApplicationRole.Manager,
                NormalizedName = ApplicationRole.Manager.ToUpperInvariant(),
                Description = "Operational access to leads and conversations. Can view and manage leads, conversations, and workflows.",
                CreatedAt = new DateTime(2025, 12, 3, 0, 0, 0, DateTimeKind.Utc),
                ConcurrencyStamp = "00000000-0000-0000-0000-000000000003",
            },
            new ApplicationRole
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                Name = ApplicationRole.Viewer,
                NormalizedName = ApplicationRole.Viewer.ToUpperInvariant(),
                Description = "Read-only access to leads and conversations. Can view leads, conversations, and analytics.",
                CreatedAt = new DateTime(2025, 12, 3, 0, 0, 0, DateTimeKind.Utc),
                ConcurrencyStamp = "00000000-0000-0000-0000-000000000004",
            });
    }
}

