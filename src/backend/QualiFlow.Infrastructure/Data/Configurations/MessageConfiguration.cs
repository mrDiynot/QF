using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Message entity.
/// </summary>
public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    /// <summary>
    /// Configures the Message entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        ConfigureTable(builder);
        ConfigureProperties(builder);
        ConfigureIndexes(builder);
        ConfigureRelationships(builder);
        ConfigureIgnoredProperties(builder);
    }

    private static void ConfigureTable(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages");
        builder.HasKey(m => m.Id);
    }

    private static void ConfigureProperties(EntityTypeBuilder<Message> builder)
    {
        builder.Property(m => m.ConversationId).IsRequired();
        builder.Property(m => m.Content).IsRequired().HasMaxLength(4000);
        builder.Property(m => m.Direction).IsRequired().HasConversion<string>();
        builder.Property(m => m.SentAt).IsRequired().HasDefaultValueSql("NOW()");
        builder.Property(m => m.DeliveredAt).IsRequired(false);
        builder.Property(m => m.ReadAt).IsRequired(false);
        builder.Property(m => m.ParentMessageId).IsRequired(false);
        builder.Property(m => m.IsSimulated).IsRequired().HasDefaultValue(false);

        // Delivery tracking fields (Sprint 2.3)
        builder.Property(m => m.DeliveryStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(Domain.Enums.DeliveryStatus.Queued)
            .HasMaxLength(50);

        builder.Property(m => m.RetryCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(m => m.LastRetryAt).IsRequired(false);

        builder.Property(m => m.FailureReason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(m => m.ExternalMessageId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(m => m.CreatedAt).IsRequired().HasDefaultValueSql("NOW()");
        builder.Property(m => m.UpdatedAt).IsRequired(false);
        builder.Property(m => m.DeletedAt).IsRequired(false);
    }

    private static void ConfigureIndexes(EntityTypeBuilder<Message> builder)
    {
        builder.HasIndex(m => m.ConversationId)
            .HasDatabaseName("ix_messages_conversation_id");

        builder.HasIndex(m => m.SentAt)
            .HasDatabaseName("ix_messages_sent_at");

        builder.HasIndex(m => new { m.ConversationId, m.SentAt })
            .HasDatabaseName("ix_messages_conversation_id_sent_at");

        builder.HasIndex(m => m.ParentMessageId)
            .HasDatabaseName("ix_messages_parent_message_id")
            .HasFilter("parent_message_id IS NOT NULL");

        builder.HasIndex(m => new { m.ConversationId, m.ParentMessageId })
            .HasDatabaseName("ix_messages_conversation_id_parent_message_id");

        // Delivery tracking indexes (Sprint 2.3)
        builder.HasIndex(m => m.DeliveryStatus)
            .HasDatabaseName("ix_messages_delivery_status");

        builder.HasIndex(m => m.ExternalMessageId)
            .HasDatabaseName("ix_messages_external_message_id")
            .HasFilter("external_message_id IS NOT NULL");

        builder.HasIndex(m => new { m.DeliveryStatus, m.LastRetryAt })
            .HasDatabaseName("ix_messages_delivery_status_last_retry_at")
            .HasFilter("delivery_status = 'Failed'"); // For finding messages that need retry
    }

    private static void ConfigureRelationships(EntityTypeBuilder<Message> builder)
    {
        builder.HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.ParentMessage)
            .WithMany(m => m.Replies)
            .HasForeignKey(m => m.ParentMessageId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureIgnoredProperties(EntityTypeBuilder<Message> builder)
    {
        builder.Ignore(m => m.IsReply);
        builder.Ignore(m => m.HasReplies);
    }
}

