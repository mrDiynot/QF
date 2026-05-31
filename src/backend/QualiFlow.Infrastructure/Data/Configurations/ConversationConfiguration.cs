using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Conversation entity.
/// </summary>
public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    /// <summary>
    /// Configures the Conversation entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        // Table name
        builder.ToTable("conversations");

        // Primary key
        builder.HasKey(c => c.Id);

        // Properties
        builder.Property(c => c.BusinessId)
            .IsRequired();

        builder.Property(c => c.LeadId)
            .IsRequired();

        builder.Property(c => c.Channel)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(ConversationStatus.Open);

        builder.Property(c => c.StartedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(c => c.EndedAt)
            .IsRequired(false);

        builder.Property(c => c.AssignedToUserId)
            .IsRequired(false);

        builder.Property(c => c.AssignedAt)
            .IsRequired(false);

        builder.Property(c => c.Priority)
            .IsRequired()
            .HasDefaultValue(3);

        builder.Property(c => c.Tags)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(c => c.UpdatedAt)
            .IsRequired(false);

        builder.Property(c => c.DeletedAt)
            .IsRequired(false);

        builder.Property(c => c.IsSimulated)
            .IsRequired()
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(c => c.BusinessId)
            .HasDatabaseName("ix_conversations_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(c => c.AssignedToUserId)
            .HasDatabaseName("ix_conversations_assigned_to_user_id");

        builder.HasIndex(c => c.LeadId)
            .HasDatabaseName("ix_conversations_lead_id");

        builder.HasIndex(c => c.Channel)
            .HasDatabaseName("ix_conversations_channel");

        builder.HasIndex(c => c.Status)
            .HasDatabaseName("ix_conversations_status");

        builder.HasIndex(c => new { c.BusinessId, c.LeadId })
            .HasDatabaseName("ix_conversations_business_id_lead_id");

        builder.HasIndex(c => new { c.BusinessId, c.Status })
            .HasDatabaseName("ix_conversations_business_id_status");

        // Relationships
        builder.HasOne(c => c.Business)
            .WithMany(b => b.Conversations)
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Lead)
            .WithMany(l => l.Conversations)
            .HasForeignKey(c => c.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Messages)
            .WithOne(m => m.Conversation)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.AssignedToUser)
            .WithMany()
            .HasForeignKey(c => c.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Notes)
            .WithOne(n => n.Conversation)
            .HasForeignKey(n => n.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

