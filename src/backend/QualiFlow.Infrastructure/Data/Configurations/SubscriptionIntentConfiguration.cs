// <copyright file="SubscriptionIntentConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for SubscriptionIntent entity.
/// Tracks user's subscription intent before Stripe payment for reconciliation.
/// </summary>
public class SubscriptionIntentConfiguration : IEntityTypeConfiguration<SubscriptionIntent>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<SubscriptionIntent> builder)
    {
        builder.ToTable("subscription_intents");

        builder.HasKey(si => si.Id);

        // ========================================================================
        // Properties
        // ========================================================================

        builder.Property(si => si.BusinessId)
            .IsRequired();

        builder.Property(si => si.IntendedPlanId)
            .IsRequired();

        builder.Property(si => si.BillingInterval)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("monthly");

        builder.Property(si => si.IncludeOnboarding)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(si => si.StripeCheckoutSessionId)
            .HasMaxLength(255);

        builder.Property(si => si.StripeCustomerId)
            .HasMaxLength(255);

        builder.Property(si => si.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(SubscriptionIntentStatus.Pending);

        builder.Property(si => si.CompletedAt)
            .IsRequired(false);

        builder.Property(si => si.FailureReason)
            .HasMaxLength(1000);

        builder.Property(si => si.ExpiresAt)
            .IsRequired();

        builder.Property(si => si.Source)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("registration");

        builder.Property(si => si.UserId)
            .IsRequired(false);

        builder.Property(si => si.AmountCents)
            .IsRequired(false);

        builder.Property(si => si.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(si => si.MetadataJson)
            .HasColumnType("jsonb");

        builder.Property(si => si.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(si => si.UpdatedAt)
            .IsRequired(false);

        builder.Property(si => si.DeletedAt)
            .IsRequired(false);

        // ========================================================================
        // Indexes
        // ========================================================================

        // Unique index on Stripe checkout session ID for fast lookup
        builder.HasIndex(si => si.StripeCheckoutSessionId)
            .HasDatabaseName("ix_subscription_intents_stripe_checkout_session_id")
            .IsUnique()
            .HasFilter("stripe_checkout_session_id IS NOT NULL");

        // Business ID for multi-tenancy
        builder.HasIndex(si => si.BusinessId)
            .HasDatabaseName("ix_subscription_intents_business_id");

        // Status for finding pending intents
        builder.HasIndex(si => si.Status)
            .HasDatabaseName("ix_subscription_intents_status");

        // Composite index for pending intents cleanup
        builder.HasIndex(si => new { si.Status, si.ExpiresAt })
            .HasDatabaseName("ix_subscription_intents_status_expires_at")
            .HasFilter("status = 'Pending'");

        // User ID for looking up user's intents
        builder.HasIndex(si => si.UserId)
            .HasDatabaseName("ix_subscription_intents_user_id")
            .HasFilter("user_id IS NOT NULL");

        // ========================================================================
        // Relationships
        // ========================================================================

        builder.HasOne(si => si.Business)
            .WithMany()
            .HasForeignKey(si => si.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(si => si.IntendedPlan)
            .WithMany()
            .HasForeignKey(si => si.IntendedPlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(si => si.User)
            .WithMany()
            .HasForeignKey(si => si.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

