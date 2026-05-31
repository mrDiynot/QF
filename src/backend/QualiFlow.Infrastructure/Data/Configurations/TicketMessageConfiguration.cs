// -----------------------------------------------------------------------
// <copyright file="TicketMessageConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using QualiFlow.Domain.Entities.Support;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the TicketMessage entity.
/// </summary>
public class TicketMessageConfiguration : IEntityTypeConfiguration<TicketMessage>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<TicketMessage> builder)
    {
        builder.ToTable("ticket_messages");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");

        builder.Property(m => m.TicketId)
            .HasColumnName("ticket_id")
            .IsRequired();

        builder.Property(m => m.Content)
            .HasColumnName("content")
            .IsRequired();

        builder.Property(m => m.IsInternal)
            .HasColumnName("is_internal")
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(m => m.SentByUserId)
            .HasColumnName("sent_by_user_id");

        builder.Property(m => m.SentByAdminId)
            .HasColumnName("sent_by_admin_id");

        builder.Property(m => m.SenderName)
            .HasColumnName("sender_name")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(m => m.SenderEmail)
            .HasColumnName("sender_email")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(m => m.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(m => m.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(m => m.DeletedAt)
            .HasColumnName("deleted_at");

        // Relationships
        builder.HasOne(m => m.SentByUser)
            .WithMany()
            .HasForeignKey(m => m.SentByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.SentByAdmin)
            .WithMany()
            .HasForeignKey(m => m.SentByAdminId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(m => m.Attachments)
            .WithOne(a => a.Message)
            .HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(m => m.TicketId)
            .HasDatabaseName("ix_ticket_messages_ticket_id");

        builder.HasIndex(m => m.IsInternal)
            .HasDatabaseName("ix_ticket_messages_is_internal");

        builder.HasIndex(m => m.CreatedAt)
            .HasDatabaseName("ix_ticket_messages_created_at");
    }
}
