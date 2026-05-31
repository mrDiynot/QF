// -----------------------------------------------------------------------
// <copyright file="UsageSnapshotConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the UsageSnapshot entity.
/// </summary>
public class UsageSnapshotConfiguration : IEntityTypeConfiguration<UsageSnapshot>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<UsageSnapshot> builder)
    {
        builder.ToTable("usage_snapshots");

        // Primary key
        builder.HasKey(u => u.Id);

        // Properties
        builder.Property(u => u.BusinessId)
            .IsRequired();

        builder.Property(u => u.SnapshotDate)
            .IsRequired();

        builder.Property(u => u.PlanId)
            .IsRequired(false);

        builder.Property(u => u.PlanName)
            .HasMaxLength(100)
            .IsRequired(false);

        // Current counts
        builder.Property(u => u.CurrentLeadsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.CurrentChannelsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.CurrentPhoneNumbersCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.CurrentSeatsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.CurrentWorkflowsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.CurrentCrmContactsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.CurrentAiVoiceAgentsCount).IsRequired().HasDefaultValue(0);

        // Monthly counts
        builder.Property(u => u.MonthlyMessagesCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.MonthlyAiConversationsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.MonthlyAiSmsCount).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.MonthlyAiVoiceMinutes).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.MonthlyApiCallsCount).IsRequired().HasDefaultValue(0);

        // Storage
        builder.Property(u => u.StorageUsedBytes).IsRequired().HasDefaultValue(0L);
        builder.Property(u => u.KnowledgeBaseStorageBytes).IsRequired().HasDefaultValue(0L);

        // Ignore computed property
        builder.Ignore(u => u.StorageUsedGB);

        // Billing cycle
        builder.Property(u => u.BillingCycleStart).IsRequired(false);
        builder.Property(u => u.BillingCycleEnd).IsRequired(false);

        builder.Property(u => u.CreatedAt).IsRequired();
        builder.Property(u => u.UpdatedAt).IsRequired(false);
        builder.Property(u => u.DeletedAt).IsRequired(false);

        // Indexes
        builder.HasIndex(u => u.BusinessId)
            .HasDatabaseName("ix_usage_snapshots_business_id");

        builder.HasIndex(u => u.SnapshotDate)
            .HasDatabaseName("ix_usage_snapshots_snapshot_date");

        builder.HasIndex(u => new { u.BusinessId, u.SnapshotDate })
            .IsUnique()
            .HasDatabaseName("ix_usage_snapshots_business_date_unique");

        // Relationships
        builder.HasOne(u => u.Business)
            .WithMany()
            .HasForeignKey(u => u.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

