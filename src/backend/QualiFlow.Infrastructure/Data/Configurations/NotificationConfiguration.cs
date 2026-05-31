// -----------------------------------------------------------------------
// <copyright file="NotificationConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the Notification entity.
/// </summary>
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        // Primary key
        builder.HasKey(n => n.Id);

        // Properties
        builder.Property(n => n.BusinessId)
            .IsRequired();

        builder.Property(n => n.UserId)
            .IsRequired(false);

        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.DataJson)
            .HasColumnType("text")
            .IsRequired(false);

        builder.Property(n => n.ActionUrl)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(n => n.IsRead)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(n => n.ReadAt)
            .IsRequired(false);

        builder.Property(n => n.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(NotificationPriority.Normal)
            .HasSentinel(NotificationPriority.Low);

        builder.Property(n => n.CreatedAt)
            .IsRequired();

        builder.Property(n => n.UpdatedAt)
            .IsRequired(false);

        builder.Property(n => n.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(n => n.BusinessId)
            .HasDatabaseName("ix_notifications_business_id");

        builder.HasIndex(n => n.UserId)
            .HasDatabaseName("ix_notifications_user_id");

        builder.HasIndex(n => new { n.BusinessId, n.IsRead })
            .HasDatabaseName("ix_notifications_business_id_is_read");

        builder.HasIndex(n => new { n.BusinessId, n.UserId, n.IsRead })
            .HasDatabaseName("ix_notifications_business_user_is_read");

        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("ix_notifications_created_at");

        // Relationships
        builder.HasOne(n => n.Business)
            .WithMany()
            .HasForeignKey(n => n.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

