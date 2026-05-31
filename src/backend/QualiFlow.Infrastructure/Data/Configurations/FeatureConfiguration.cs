// <copyright file="FeatureConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for Feature entity.
/// </summary>
public class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<Feature> builder)
    {
        builder.ToTable("features");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FeatureKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.DisplayName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.Description)
            .HasMaxLength(500);

        builder.Property(f => f.Category)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(f => f.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(f => f.FeatureKey)
            .IsUnique();

        builder.HasIndex(f => f.Category)
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(f => f.IsActive)
            .HasFilter("deleted_at IS NULL");

        // Relationships
        builder.HasMany(f => f.PlanFeatures)
            .WithOne(pf => pf.Feature)
            .HasForeignKey(pf => pf.FeatureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

