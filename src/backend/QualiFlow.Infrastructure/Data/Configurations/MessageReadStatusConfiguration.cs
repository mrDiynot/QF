using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for MessageReadStatus entity.
/// </summary>
public class MessageReadStatusConfiguration : IEntityTypeConfiguration<MessageReadStatus>
{
    /// <summary>
    /// Configures the MessageReadStatus entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<MessageReadStatus> builder)
    {
        builder.ToTable("message_read_statuses");

        builder.HasKey(mrs => mrs.Id);

        builder.Property(mrs => mrs.MessageId)
            .IsRequired();

        builder.Property(mrs => mrs.UserId)
            .IsRequired();

        builder.Property(mrs => mrs.ReadAt)
            .IsRequired();

        builder.Property(mrs => mrs.CreatedAt)
            .IsRequired();

        builder.Property(mrs => mrs.UpdatedAt);

        builder.Property(mrs => mrs.DeletedAt);

        // Indexes
        builder.HasIndex(mrs => mrs.MessageId)
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(mrs => mrs.UserId)
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(mrs => new { mrs.MessageId, mrs.UserId })
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        // Relationships
        builder.HasOne(mrs => mrs.Message)
            .WithMany(m => m.ReadStatuses)
            .HasForeignKey(mrs => mrs.MessageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mrs => mrs.User)
            .WithMany()
            .HasForeignKey(mrs => mrs.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

