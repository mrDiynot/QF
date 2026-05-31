// -----------------------------------------------------------------------
// <copyright file="SlaPolicyConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using QualiFlow.Domain.Entities.Support;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the SlaPolicy entity.
/// Includes seed data for default SLA policies.
/// </summary>
public class SlaPolicyConfiguration : IEntityTypeConfiguration<SlaPolicy>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<SlaPolicy> builder)
    {
        builder.ToTable("sla_policies");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.Property(p => p.Priority)
            .HasColumnName("priority")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.FirstResponseMinutes)
            .HasColumnName("first_response_minutes")
            .IsRequired();

        builder.Property(p => p.ResolutionMinutes)
            .HasColumnName("resolution_minutes")
            .IsRequired();

        builder.Property(p => p.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(p => p.DeletedAt)
            .HasColumnName("deleted_at");

        // Unique constraint on Priority (only one active policy per priority)
        builder.HasIndex(p => p.Priority)
            .IsUnique()
            .HasDatabaseName("ix_sla_policies_priority")
            .HasFilter("deleted_at IS NULL AND is_active = true");

        // Seed default SLA policies
        builder.HasData(
            new SlaPolicy
            {
                Id = Guid.Parse("00000000-0000-0000-0001-000000000001"),
                Priority = TicketPriority.Critical,
                FirstResponseMinutes = 60,      // 1 hour
                ResolutionMinutes = 240,        // 4 hours
                IsActive = true,
                Description = "Critical priority: 1 hour first response, 4 hours resolution",
                CreatedAt = new DateTime(2025, 12, 12, 0, 0, 0, DateTimeKind.Utc),
            },
            new SlaPolicy
            {
                Id = Guid.Parse("00000000-0000-0000-0001-000000000002"),
                Priority = TicketPriority.High,
                FirstResponseMinutes = 240,     // 4 hours
                ResolutionMinutes = 1440,       // 24 hours
                IsActive = true,
                Description = "High priority: 4 hours first response, 24 hours resolution",
                CreatedAt = new DateTime(2025, 12, 12, 0, 0, 0, DateTimeKind.Utc),
            },
            new SlaPolicy
            {
                Id = Guid.Parse("00000000-0000-0000-0001-000000000003"),
                Priority = TicketPriority.Medium,
                FirstResponseMinutes = 1440,    // 24 hours
                ResolutionMinutes = 4320,       // 72 hours (3 days)
                IsActive = true,
                Description = "Medium priority: 24 hours first response, 72 hours resolution",
                CreatedAt = new DateTime(2025, 12, 12, 0, 0, 0, DateTimeKind.Utc),
            },
            new SlaPolicy
            {
                Id = Guid.Parse("00000000-0000-0000-0001-000000000004"),
                Priority = TicketPriority.Low,
                FirstResponseMinutes = 4320,    // 72 hours (3 days)
                ResolutionMinutes = 10080,      // 7 days
                IsActive = true,
                Description = "Low priority: 72 hours first response, 7 days resolution",
                CreatedAt = new DateTime(2025, 12, 12, 0, 0, 0, DateTimeKind.Utc),
            });
    }
}
