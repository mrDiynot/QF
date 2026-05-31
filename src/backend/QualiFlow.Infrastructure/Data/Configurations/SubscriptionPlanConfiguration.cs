// <copyright file="SubscriptionPlanConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for SubscriptionPlan entity.
/// </summary>
public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.ToTable("subscription_plans");

        builder.HasKey(sp => sp.Id);

        builder.Property(sp => sp.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(sp => sp.DisplayName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sp => sp.Description)
            .HasMaxLength(500);

        builder.Property(sp => sp.PriceMonthly)
            .IsRequired()
            .HasColumnType("decimal(10,2)");

        builder.Property(sp => sp.PriceQuarterly)
            .HasColumnType("decimal(10,2)");

        builder.Property(sp => sp.PriceYearly)
            .HasColumnType("decimal(10,2)");

        builder.Property(sp => sp.DiscountQuarterly)
            .IsRequired()
            .HasDefaultValue(10);

        builder.Property(sp => sp.DiscountAnnual)
            .IsRequired()
            .HasDefaultValue(20);

        builder.Property(sp => sp.OnboardingPrice)
            .HasColumnType("decimal(10,2)");

        builder.Property(sp => sp.OnboardingRequired)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(sp => sp.StripePriceIdMonthly)
            .HasMaxLength(100);

        builder.Property(sp => sp.StripePriceIdQuarterly)
            .HasMaxLength(100);

        builder.Property(sp => sp.StripePriceIdYearly)
            .HasMaxLength(100);

        builder.Property(sp => sp.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sp => sp.IsPublic)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sp => sp.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(sp => sp.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(sp => sp.Name)
            .IsUnique();

        builder.HasIndex(sp => sp.IsActive)
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(sp => sp.IsPublic)
            .HasFilter("is_active = true");

        builder.HasIndex(sp => sp.SortOrder);

        // Relationships
        builder.HasMany(sp => sp.Limits)
            .WithOne(pl => pl.Plan)
            .HasForeignKey(pl => pl.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(sp => sp.Features)
            .WithOne(pf => pf.Plan)
            .HasForeignKey(pf => pf.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(sp => sp.Subscriptions)
            .WithOne(s => s.Plan)
            .HasForeignKey(s => s.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

