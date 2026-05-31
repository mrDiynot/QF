// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ChatMessage entity.
/// </summary>
public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    /// <summary>
    /// Configures the ChatMessage entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("chat_messages");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.BusinessId)
            .IsRequired();

        builder.Property(m => m.ChatSessionId)
            .IsRequired();

        builder.Property(m => m.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(m => m.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(m => m.SenderId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(m => m.SenderName)
            .HasMaxLength(200);

        builder.Property(m => m.SentAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(m => m.AttachmentsJson)
            .HasColumnType("jsonb");

        builder.Property(m => m.DetectedIntent)
            .HasMaxLength(100);

        builder.Property(m => m.MetadataJson)
            .HasColumnType("jsonb");

        builder.Property(m => m.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        // Indexes
        builder.HasIndex(m => m.BusinessId)
            .HasDatabaseName("ix_chat_messages_business_id");

        builder.HasIndex(m => m.ChatSessionId)
            .HasDatabaseName("ix_chat_messages_session_id");

        builder.HasIndex(m => m.SentAt)
            .HasDatabaseName("ix_chat_messages_sent_at");

        builder.HasIndex(m => new { m.ChatSessionId, m.SentAt })
            .HasDatabaseName("ix_chat_messages_session_id_sent_at");

        builder.HasIndex(m => m.Type)
            .HasDatabaseName("ix_chat_messages_type");

        // Relationships
        builder.HasOne(m => m.Business)
            .WithMany()
            .HasForeignKey(m => m.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.ChatSession)
            .WithMany(s => s.Messages)
            .HasForeignKey(m => m.ChatSessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

