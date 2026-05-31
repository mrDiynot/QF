// <copyright file="OverageAlertSettingsConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for OverageAlertSettings entity.
/// </summary>
public class OverageAlertSettingsConfiguration : IEntityTypeConfiguration<OverageAlertSettings>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<OverageAlertSettings> builder)
    {
        builder.ToTable("overage_alert_settings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(s => s.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(s => s.IsEnabled)
            .HasColumnName("is_enabled")
            .HasDefaultValue(true);

        builder.Property(s => s.EmailNotificationsEnabled)
            .HasColumnName("email_notifications_enabled")
            .HasDefaultValue(true);

        builder.Property(s => s.InAppNotificationsEnabled)
            .HasColumnName("in_app_notifications_enabled")
            .HasDefaultValue(true);

        builder.Property(s => s.AlertAt50Percent)
            .HasColumnName("alert_at_50_percent")
            .HasDefaultValue(false);

        builder.Property(s => s.AlertAt75Percent)
            .HasColumnName("alert_at_75_percent")
            .HasDefaultValue(true);

        builder.Property(s => s.AlertAt90Percent)
            .HasColumnName("alert_at_90_percent")
            .HasDefaultValue(true);

        builder.Property(s => s.AlertAt100Percent)
            .HasColumnName("alert_at_100_percent")
            .HasDefaultValue(true);

        builder.Property(s => s.LastAlertAt50Percent)
            .HasColumnName("last_alert_at_50_percent");

        builder.Property(s => s.LastAlertAt75Percent)
            .HasColumnName("last_alert_at_75_percent");

        builder.Property(s => s.LastAlertAt90Percent)
            .HasColumnName("last_alert_at_90_percent");

        builder.Property(s => s.LastAlertAt100Percent)
            .HasColumnName("last_alert_at_100_percent");

        builder.Property(s => s.NotifyEmailsJson)
            .HasColumnName("notify_emails_json")
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(s => s.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(s => s.DeletedAt)
            .HasColumnName("deleted_at");

        // Unique index on BusinessId - one settings per business
        builder.HasIndex(s => s.BusinessId)
            .IsUnique()
            .HasDatabaseName("ix_overage_alert_settings_business_id");

        // Soft delete filter
        builder.HasQueryFilter(s => s.DeletedAt == null);

        // Navigation to Business
        builder.HasOne(s => s.Business)
            .WithOne()
            .HasForeignKey<OverageAlertSettings>(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
