// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for ChatWidgetEvent entity.
/// </summary>
public class ChatWidgetEventConfiguration : IEntityTypeConfiguration<ChatWidgetEvent>
{
    public void Configure(EntityTypeBuilder<ChatWidgetEvent> builder)
    {
        builder.ToTable("chat_widget_events");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id");

        builder.Property(e => e.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(e => e.ChatSessionId)
            .HasColumnName("chat_session_id");

        builder.Property(e => e.EventType)
            .HasColumnName("event_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.EventData)
            .HasColumnName("event_data")
            .HasColumnType("jsonb");

        builder.Property(e => e.VisitorToken)
            .HasColumnName("visitor_token")
            .HasMaxLength(100);

        builder.Property(e => e.PageUrl)
            .HasColumnName("page_url")
            .HasMaxLength(2048);

        builder.Property(e => e.OccurredAt)
            .HasColumnName("occurred_at")
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(e => e.BusinessId)
            .HasDatabaseName("idx_chat_widget_events_business_id");

        builder.HasIndex(e => e.ChatSessionId)
            .HasDatabaseName("idx_chat_widget_events_chat_session_id");

        builder.HasIndex(e => e.EventType)
            .HasDatabaseName("idx_chat_widget_events_event_type");

        builder.HasIndex(e => e.OccurredAt)
            .HasDatabaseName("idx_chat_widget_events_occurred_at");

        // Composite index for common queries
        builder.HasIndex(e => new { e.BusinessId, e.EventType, e.OccurredAt })
            .HasDatabaseName("idx_chat_widget_events_business_type_time");

        // Relationships
        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ChatSession)
            .WithMany()
            .HasForeignKey(e => e.ChatSessionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Global query filter for soft delete
        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
