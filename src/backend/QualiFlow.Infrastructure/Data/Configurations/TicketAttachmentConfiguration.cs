// -----------------------------------------------------------------------
// <copyright file="TicketAttachmentConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using QualiFlow.Domain.Entities.Support;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the TicketAttachment entity.
/// </summary>
public class TicketAttachmentConfiguration : IEntityTypeConfiguration<TicketAttachment>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<TicketAttachment> builder)
    {
        builder.ToTable("ticket_attachments");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");

        builder.Property(a => a.TicketId)
            .HasColumnName("ticket_id")
            .IsRequired();

        builder.Property(a => a.MessageId)
            .HasColumnName("message_id");

        builder.Property(a => a.FileName)
            .HasColumnName("file_name")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(a => a.ContentType)
            .HasColumnName("content_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.FileSizeBytes)
            .HasColumnName("file_size_bytes")
            .IsRequired();

        builder.Property(a => a.StorageUrl)
            .HasColumnName("storage_url")
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(a => a.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(a => a.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(a => a.TicketId)
            .HasDatabaseName("ix_ticket_attachments_ticket_id");

        builder.HasIndex(a => a.MessageId)
            .HasDatabaseName("ix_ticket_attachments_message_id");
    }
}
