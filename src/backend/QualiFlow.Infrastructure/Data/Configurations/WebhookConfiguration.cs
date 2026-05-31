using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the Webhook entity.
/// </summary>
public class WebhookConfiguration : IEntityTypeConfiguration<Webhook>
{
    public void Configure(EntityTypeBuilder<Webhook> builder)
    {
        builder.ToTable("webhooks");

        // Primary key
        builder.HasKey(w => w.Id);

        // Properties
        builder.Property(w => w.BusinessId)
            .IsRequired();

        builder.Property(w => w.Url)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(w => w.Events)
            .IsRequired()
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() as ICollection<string>)
            .HasColumnType("text")
            .Metadata.SetValueComparer(
                new ValueComparer<ICollection<string>>(
                    (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode(StringComparison.Ordinal))),
                    c => c.ToList()));

        builder.Property(w => w.Secret)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(w => w.Description)
            .HasMaxLength(500);

        builder.Property(w => w.ConsecutiveFailures)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(w => w.LastSuccessAt)
            .IsRequired(false);

        builder.Property(w => w.LastFailureAt)
            .IsRequired(false);

        builder.Property(w => w.CreatedAt)
            .IsRequired();

        builder.Property(w => w.UpdatedAt)
            .IsRequired(false);

        builder.Property(w => w.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(w => w.BusinessId)
            .HasDatabaseName("ix_webhooks_business_id");

        builder.HasIndex(w => w.Status)
            .HasDatabaseName("ix_webhooks_status");

        builder.HasIndex(w => new { w.BusinessId, w.Status })
            .HasDatabaseName("ix_webhooks_business_id_status");

        // Relationships
        builder.HasOne(w => w.Business)
            .WithMany()
            .HasForeignKey(w => w.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.Deliveries)
            .WithOne(d => d.Webhook)
            .HasForeignKey(d => d.WebhookId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

