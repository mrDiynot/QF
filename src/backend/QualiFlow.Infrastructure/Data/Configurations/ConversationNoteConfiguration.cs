using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for ConversationNote entity.
/// </summary>
public class ConversationNoteConfiguration : IEntityTypeConfiguration<ConversationNote>
{
    /// <summary>
    /// Configures the ConversationNote entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<ConversationNote> builder)
    {
        builder.ToTable("conversation_notes");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.BusinessId)
            .IsRequired();

        builder.Property(n => n.ConversationId)
            .IsRequired();

        builder.Property(n => n.CreatedByUserId)
            .IsRequired();

        builder.Property(n => n.Content)
            .IsRequired()
            .HasMaxLength(5000);

        builder.Property(n => n.IsPinned)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(n => n.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(n => n.UpdatedAt)
            .IsRequired(false);

        builder.Property(n => n.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(n => n.BusinessId)
            .HasDatabaseName("ix_conversation_notes_business_id");

        builder.HasIndex(n => n.ConversationId)
            .HasDatabaseName("ix_conversation_notes_conversation_id");

        builder.HasIndex(n => new { n.ConversationId, n.IsPinned })
            .HasDatabaseName("ix_conversation_notes_conversation_id_is_pinned");

        // Relationships
        builder.HasOne(n => n.Business)
            .WithMany()
            .HasForeignKey(n => n.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(n => n.CreatedByUser)
            .WithMany()
            .HasForeignKey(n => n.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

