using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the MessageAttachment entity.
/// </summary>
public class MessageAttachmentConfiguration : IEntityTypeConfiguration<MessageAttachment>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<MessageAttachment> builder)
    {
        builder.ToTable("message_attachments");
        builder.HasKey(a => a.Id);

        ConfigureProperties(builder);
        ConfigureAuditProperties(builder);
        ConfigureIndexes(builder);
        ConfigureRelationships(builder);
    }

    private static void ConfigureProperties(EntityTypeBuilder<MessageAttachment> builder)
    {
        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.MessageId).HasColumnName("message_id").IsRequired();
        builder.Property(a => a.FileName).HasColumnName("file_name").IsRequired().HasMaxLength(255);
        builder.Property(a => a.ContentType).HasColumnName("content_type").IsRequired().HasMaxLength(100);
        builder.Property(a => a.FileSize).HasColumnName("file_size").IsRequired();
        builder.Property(a => a.BlobUrl).HasColumnName("blob_url").IsRequired().HasMaxLength(2048);
        builder.Property(a => a.BlobName).HasColumnName("blob_name").IsRequired().HasMaxLength(500);
        builder.Property(a => a.ContainerName).HasColumnName("container_name").IsRequired().HasMaxLength(100);
    }

    private static void ConfigureAuditProperties(EntityTypeBuilder<MessageAttachment> builder)
    {
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("NOW()");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");
        builder.Property(a => a.DeletedAt).HasColumnName("deleted_at");
    }

    private static void ConfigureIndexes(EntityTypeBuilder<MessageAttachment> builder)
    {
        builder.HasIndex(a => a.MessageId).HasDatabaseName("ix_message_attachments_message_id");
    }

    private static void ConfigureRelationships(EntityTypeBuilder<MessageAttachment> builder)
    {
        builder.HasOne(a => a.Message)
            .WithMany(m => m.Attachments)
            .HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

