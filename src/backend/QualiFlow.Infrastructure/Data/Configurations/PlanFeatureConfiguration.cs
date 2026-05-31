// <copyright file="PlanFeatureConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for PlanFeature entity (junction table).
/// </summary>
public class PlanFeatureConfiguration : IEntityTypeConfiguration<PlanFeature>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<PlanFeature> builder)
    {
        builder.ToTable("plan_features");

        builder.HasKey(pf => pf.Id);

        builder.Property(pf => pf.PlanId)
            .IsRequired();

        builder.Property(pf => pf.FeatureId)
            .IsRequired();

        // Indexes
        builder.HasIndex(pf => pf.PlanId);

        builder.HasIndex(pf => pf.FeatureId);

        builder.HasIndex(pf => new { pf.PlanId, pf.FeatureId })
            .IsUnique();

        // Relationships
        builder.HasOne(pf => pf.Plan)
            .WithMany(sp => sp.Features)
            .HasForeignKey(pf => pf.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pf => pf.Feature)
            .WithMany(f => f.PlanFeatures)
            .HasForeignKey(pf => pf.FeatureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

