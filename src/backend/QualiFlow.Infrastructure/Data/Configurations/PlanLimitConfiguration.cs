// <copyright file="PlanLimitConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for PlanLimit entity.
/// </summary>
public class PlanLimitConfiguration : IEntityTypeConfiguration<PlanLimit>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<PlanLimit> builder)
    {
        builder.ToTable("plan_limits");

        builder.HasKey(pl => pl.Id);

        builder.Property(pl => pl.PlanId)
            .IsRequired();

        builder.Property(pl => pl.LimitKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pl => pl.LimitValue)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pl => pl.LimitType)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("integer");

        // Indexes
        builder.HasIndex(pl => pl.PlanId);

        builder.HasIndex(pl => pl.LimitKey);

        builder.HasIndex(pl => new { pl.PlanId, pl.LimitKey })
            .IsUnique();

        // Relationships
        builder.HasOne(pl => pl.Plan)
            .WithMany(sp => sp.Limits)
            .HasForeignKey(pl => pl.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

