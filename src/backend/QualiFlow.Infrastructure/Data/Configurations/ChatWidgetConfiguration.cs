// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ChatWidget entity.
/// </summary>
public class ChatWidgetConfiguration : IEntityTypeConfiguration<ChatWidget>
{
    /// <summary>
    /// Configures the ChatWidget entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<ChatWidget> builder)
    {
        builder.ToTable("chat_widgets");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.BusinessId)
            .IsRequired();

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.WidgetKey)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(w => w.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(w => w.AllowedDomains)
            .HasMaxLength(2000);

        builder.Property(w => w.PrimaryColor)
            .HasMaxLength(20);

        builder.Property(w => w.Position)
            .HasMaxLength(20);

        builder.Property(w => w.GreetingMessage)
            .HasMaxLength(500);

        builder.Property(w => w.OfflineMessage)
            .HasMaxLength(500);

        builder.Property(w => w.PreChatFormFieldsJson)
            .HasColumnType("jsonb");

        builder.Property(w => w.BusinessHoursJson)
            .HasColumnType("jsonb");

        builder.Property(w => w.CustomCss)
            .HasMaxLength(10000);

        builder.Property(w => w.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        // Indexes
        builder.HasIndex(w => w.BusinessId)
            .HasDatabaseName("ix_chat_widgets_business_id");

        builder.HasIndex(w => w.WidgetKey)
            .IsUnique()
            .HasDatabaseName("ix_chat_widgets_widget_key");

        builder.HasIndex(w => new { w.BusinessId, w.IsActive })
            .HasDatabaseName("ix_chat_widgets_business_id_is_active");

        // Relationships
        builder.HasOne(w => w.Business)
            .WithMany()
            .HasForeignKey(w => w.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

