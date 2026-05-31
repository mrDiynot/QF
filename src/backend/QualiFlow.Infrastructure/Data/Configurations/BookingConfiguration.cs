using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Booking entity.
/// </summary>
public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    /// <summary>
    /// Configures the Booking entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        // Table name
        builder.ToTable("bookings");

        // Primary key
        builder.HasKey(b => b.Id);

        // Properties
        builder.Property(b => b.BusinessId)
            .IsRequired();

        builder.Property(b => b.LeadId)
            .IsRequired();

        builder.Property(b => b.ConversationId)
            .IsRequired(false);

        builder.Property(b => b.AssignedToUserId)
            .IsRequired(false);

        builder.Property(b => b.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .IsRequired(false)
            .HasMaxLength(2000);

        builder.Property(b => b.ScheduledAt)
            .IsRequired();

        builder.Property(b => b.Duration)
            .IsRequired()
            .HasDefaultValue(30);

        builder.Property(b => b.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(BookingStatus.Pending);

        builder.Property(b => b.MeetingUrl)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(b => b.CalComEventTypeId)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(b => b.CalComBookingUid)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(b => b.Timezone)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("UTC");

        builder.Property(b => b.ConfirmationSentAt)
            .IsRequired(false);

        builder.Property(b => b.ReminderSentAt)
            .IsRequired(false);

        builder.Property(b => b.CancellationReason)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(b => b.CancelledAt)
            .IsRequired(false);

        builder.Property(b => b.Notes)
            .IsRequired(false)
            .HasMaxLength(2000);

        builder.Property(b => b.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(b => b.UpdatedAt)
            .IsRequired(false);

        builder.Property(b => b.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(b => b.BusinessId)
            .HasDatabaseName("ix_bookings_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(b => b.LeadId)
            .HasDatabaseName("ix_bookings_lead_id");

        builder.HasIndex(b => b.ScheduledAt)
            .HasDatabaseName("ix_bookings_scheduled_at");

        builder.HasIndex(b => b.Status)
            .HasDatabaseName("ix_bookings_status");

        builder.HasIndex(b => new { b.BusinessId, b.LeadId })
            .HasDatabaseName("ix_bookings_business_id_lead_id");

        builder.HasIndex(b => new { b.BusinessId, b.Status })
            .HasDatabaseName("ix_bookings_business_id_status");

        builder.HasIndex(b => new { b.BusinessId, b.ScheduledAt })
            .HasDatabaseName("ix_bookings_business_id_scheduled_at");

        builder.HasIndex(b => b.CalComBookingUid)
            .HasDatabaseName("ix_bookings_calcom_booking_uid");

        builder.HasIndex(b => b.AssignedToUserId)
            .HasDatabaseName("ix_bookings_assigned_to_user_id");

        // Relationships
        builder.HasOne(b => b.Business)
            .WithMany(bus => bus.Bookings)
            .HasForeignKey(b => b.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Lead)
            .WithMany(l => l.Bookings)
            .HasForeignKey(b => b.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Conversation)
            .WithMany()
            .HasForeignKey(b => b.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.AssignedToUser)
            .WithMany()
            .HasForeignKey(b => b.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

