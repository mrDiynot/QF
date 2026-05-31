// -----------------------------------------------------------------------
// <copyright file="NotificationPreferenceConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for NotificationPreference entity.
/// </summary>
public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("notification_preferences");

        // Primary key
        builder.HasKey(np => np.Id);

        // Properties
        builder.Property(np => np.BusinessId)
            .IsRequired();

        builder.Property(np => np.UserId)
            .IsRequired();

        builder.Property(np => np.PushEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(np => np.SoundEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(np => np.EmailEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(np => np.SmsEnabled)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(np => np.SoundVolume)
            .IsRequired()
            .HasDefaultValue(70);

        builder.Property(np => np.QuietHoursEnabled)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(np => np.QuietHoursStart)
            .HasMaxLength(10)
            .IsRequired(false);

        builder.Property(np => np.QuietHoursEnd)
            .HasMaxLength(10)
            .IsRequired(false);

        builder.Property(np => np.CategoryPreferencesJson)
            .HasColumnType("jsonb")
            .IsRequired()
            .HasDefaultValue("{}");

        builder.Property(np => np.CreatedAt)
            .IsRequired();

        builder.Property(np => np.UpdatedAt)
            .IsRequired(false);

        builder.Property(np => np.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(np => np.BusinessId)
            .HasDatabaseName("ix_notification_preferences_business_id");

        builder.HasIndex(np => np.UserId)
            .HasDatabaseName("ix_notification_preferences_user_id");

        // Unique constraint: one preference per user per business
        builder.HasIndex(np => new { np.BusinessId, np.UserId })
            .IsUnique()
            .HasDatabaseName("ix_notification_preferences_business_user");

        // Relationships
        builder.HasOne(np => np.Business)
            .WithMany()
            .HasForeignKey(np => np.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(np => np.User)
            .WithMany()
            .HasForeignKey(np => np.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(np => np.DeletedAt == null);
    }
}

