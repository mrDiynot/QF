// <copyright file="SubscriptionConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for Subscription entity.
/// </summary>
public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("subscription");

        builder.HasKey(s => s.Id);

        // ========================================================================
        // Properties
        // ========================================================================

        builder.Property(s => s.BusinessId)
            .IsRequired();

        builder.Property(s => s.PlanId)
            .IsRequired();

        builder.Property(s => s.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion<string>();

        builder.Property(s => s.BillingCycle)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion<string>();

        builder.Property(s => s.CurrentPeriodStart)
            .IsRequired();

        builder.Property(s => s.CurrentPeriodEnd)
            .IsRequired();

        builder.Property(s => s.TrialStart)
            .IsRequired(false);

        builder.Property(s => s.TrialEnd)
            .IsRequired(false);

        builder.Property(s => s.CancelledAt)
            .IsRequired(false);

        builder.Property(s => s.CancelAtPeriodEnd)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.MonthlyAmount)
            .IsRequired()
            .HasColumnType("decimal(10,2)");

        builder.Property(s => s.AnnualAmount)
            .IsRequired(false)
            .HasColumnType("decimal(10,2)");

        builder.Property(s => s.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(s => s.StripeCustomerId)
            .HasMaxLength(100);

        builder.Property(s => s.StripeSubscriptionId)
            .HasMaxLength(100);

        builder.Property(s => s.StripePriceId)
            .HasMaxLength(100);

        builder.Property(s => s.ScheduledPlanId)
            .IsRequired(false);

        builder.Property(s => s.ScheduledChangeDate)
            .IsRequired(false);

        builder.Property(s => s.PlanVersion)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(s => s.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.UpdatedAt)
            .IsRequired(false);

        builder.Property(s => s.DeletedAt)
            .IsRequired(false);

        // ========================================================================
        // Indexes
        // ========================================================================

        // Single column indexes
        builder.HasIndex(s => s.BusinessId)
            .HasDatabaseName("ix_subscriptions_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(s => s.PlanId)
            .HasDatabaseName("ix_subscriptions_plan_id");

        builder.HasIndex(s => s.Status)
            .HasDatabaseName("ix_subscriptions_status");

        builder.HasIndex(s => s.CurrentPeriodEnd)
            .HasDatabaseName("ix_subscriptions_current_period_end");

        builder.HasIndex(s => s.TrialEnd)
            .HasDatabaseName("ix_subscriptions_trial_end")
            .HasFilter("trial_end IS NOT NULL");

        // Composite indexes for common queries
        builder.HasIndex(s => new { s.BusinessId, s.Status })
            .HasDatabaseName("ix_subscriptions_business_id_status");

        builder.HasIndex(s => new { s.Status, s.CurrentPeriodEnd })
            .HasDatabaseName("ix_subscriptions_status_period_end")
            .HasFilter("status = 'Active'");

        builder.HasIndex(s => new { s.Status, s.TrialEnd })
            .HasDatabaseName("ix_subscriptions_status_trial_end")
            .HasFilter("status = 'Trialing' AND trial_end IS NOT NULL");

        // ========================================================================
        // Relationships
        // ========================================================================

        builder.HasOne(s => s.Business)
            .WithOne(b => b.Subscription)
            .HasForeignKey<Subscription>(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Plan)
            .WithMany(p => p.Subscriptions)
            .HasForeignKey(s => s.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.ScheduledPlan)
            .WithMany()
            .HasForeignKey(s => s.ScheduledPlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

