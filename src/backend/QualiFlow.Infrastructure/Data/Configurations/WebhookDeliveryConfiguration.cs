using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the WebhookDelivery entity.
/// </summary>
public class WebhookDeliveryConfiguration : IEntityTypeConfiguration<WebhookDelivery>
{
    public void Configure(EntityTypeBuilder<WebhookDelivery> builder)
    {
        builder.ToTable("webhook_deliveries");

        // Primary key
        builder.HasKey(wd => wd.Id);

        // Properties
        builder.Property(wd => wd.WebhookId)
            .IsRequired();

        builder.Property(wd => wd.EventType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(wd => wd.Payload)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(wd => wd.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(wd => wd.Attempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(wd => wd.NextRetryAt)
            .IsRequired(false);

        builder.Property(wd => wd.ResponseCode)
            .IsRequired(false);

        builder.Property(wd => wd.ResponseBody)
            .HasMaxLength(5000);

        builder.Property(wd => wd.ErrorMessage)
            .HasMaxLength(1000);

        builder.Property(wd => wd.DurationMs)
            .IsRequired(false);

        builder.Property(wd => wd.CompletedAt)
            .IsRequired(false);

        builder.Property(wd => wd.CreatedAt)
            .IsRequired();

        builder.Property(wd => wd.UpdatedAt)
            .IsRequired(false);

        builder.Property(wd => wd.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(wd => wd.WebhookId)
            .HasDatabaseName("ix_webhook_deliveries_webhook_id");

        builder.HasIndex(wd => wd.Status)
            .HasDatabaseName("ix_webhook_deliveries_status");

        builder.HasIndex(wd => wd.EventType)
            .HasDatabaseName("ix_webhook_deliveries_event_type");

        builder.HasIndex(wd => wd.NextRetryAt)
            .HasDatabaseName("ix_webhook_deliveries_next_retry_at")
            .HasFilter("next_retry_at IS NOT NULL");

        builder.HasIndex(wd => new { wd.WebhookId, wd.Status })
            .HasDatabaseName("ix_webhook_deliveries_webhook_id_status");

        // Relationships
        builder.HasOne(wd => wd.Webhook)
            .WithMany(w => w.Deliveries)
            .HasForeignKey(wd => wd.WebhookId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

