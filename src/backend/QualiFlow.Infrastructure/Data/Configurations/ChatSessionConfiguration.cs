// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ChatSession entity.
/// </summary>
public class ChatSessionConfiguration : IEntityTypeConfiguration<ChatSession>
{
    /// <summary>
    /// Configures the ChatSession entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<ChatSession> builder)
    {
        builder.ToTable("chat_sessions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.BusinessId)
            .IsRequired();

        builder.Property(s => s.ChatWidgetId)
            .IsRequired();

        builder.Property(s => s.SessionToken)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(s => s.VisitorName)
            .HasMaxLength(200);

        builder.Property(s => s.VisitorEmail)
            .HasMaxLength(255);

        builder.Property(s => s.VisitorPhone)
            .HasMaxLength(20);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(s => s.IpAddress)
            .HasMaxLength(45);

        builder.Property(s => s.UserAgent)
            .HasMaxLength(500);

        builder.Property(s => s.PageUrl)
            .HasMaxLength(2000);

        builder.Property(s => s.ReferrerUrl)
            .HasMaxLength(2000);

        builder.Property(s => s.AssignedAgentId)
            .HasMaxLength(450);

        builder.Property(s => s.ExtractedDataJson)
            .HasColumnType("jsonb");

        builder.Property(s => s.StartedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.LastActivityAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        // Indexes
        builder.HasIndex(s => s.BusinessId)
            .HasDatabaseName("ix_chat_sessions_business_id");

        builder.HasIndex(s => s.ChatWidgetId)
            .HasDatabaseName("ix_chat_sessions_widget_id");

        builder.HasIndex(s => s.SessionToken)
            .IsUnique()
            .HasDatabaseName("ix_chat_sessions_session_token");

        builder.HasIndex(s => s.Status)
            .HasDatabaseName("ix_chat_sessions_status");

        builder.HasIndex(s => new { s.BusinessId, s.Status })
            .HasDatabaseName("ix_chat_sessions_business_id_status");

        builder.HasIndex(s => s.VisitorEmail)
            .HasDatabaseName("ix_chat_sessions_visitor_email");

        builder.HasIndex(s => s.LeadId)
            .HasDatabaseName("ix_chat_sessions_lead_id");

        // Relationships
        builder.HasOne(s => s.Business)
            .WithMany()
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.ChatWidget)
            .WithMany(w => w.Sessions)
            .HasForeignKey(s => s.ChatWidgetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Lead)
            .WithMany()
            .HasForeignKey(s => s.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.Conversation)
            .WithMany()
            .HasForeignKey(s => s.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

