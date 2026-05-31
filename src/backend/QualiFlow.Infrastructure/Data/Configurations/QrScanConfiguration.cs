using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for QR scans.
/// </summary>
public class QrScanConfiguration : IEntityTypeConfiguration<QrScan>
{
    public void Configure(EntityTypeBuilder<QrScan> builder)
    {
        builder.ToTable("qr_scans");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(s => s.CampaignId)
            .HasColumnName("campaign_id")
            .IsRequired();

        builder.Property(s => s.ScannedAt)
            .HasColumnName("scanned_at")
            .IsRequired();

        builder.Property(s => s.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45); // IPv6 max length

        builder.Property(s => s.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(s => s.DeviceType)
            .HasColumnName("device_type")
            .HasMaxLength(50);

        builder.Property(s => s.OperatingSystem)
            .HasColumnName("operating_system")
            .HasMaxLength(50);

        builder.Property(s => s.Browser)
            .HasColumnName("browser")
            .HasMaxLength(50);

        builder.Property(s => s.LocationCity)
            .HasColumnName("location_city")
            .HasMaxLength(100);

        builder.Property(s => s.LocationState)
            .HasColumnName("location_state")
            .HasMaxLength(100);

        builder.Property(s => s.LocationCountry)
            .HasColumnName("location_country")
            .HasMaxLength(2); // ISO 3166-1 alpha-2

        builder.Property(s => s.Latitude)
            .HasColumnName("latitude")
            .HasPrecision(10, 7);

        builder.Property(s => s.Longitude)
            .HasColumnName("longitude")
            .HasPrecision(10, 7);

        builder.Property(s => s.Referrer)
            .HasColumnName("referrer")
            .HasMaxLength(500);

        builder.Property(s => s.UtmSource)
            .HasColumnName("utm_source")
            .HasMaxLength(100);

        builder.Property(s => s.UtmMedium)
            .HasColumnName("utm_medium")
            .HasMaxLength(100);

        builder.Property(s => s.UtmCampaign)
            .HasColumnName("utm_campaign")
            .HasMaxLength(100);

        builder.Property(s => s.Converted)
            .HasColumnName("converted")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(s => s.ConvertedAt)
            .HasColumnName("converted_at");

        builder.Property(s => s.ConversionType)
            .HasColumnName("conversion_type")
            .HasMaxLength(50);

        builder.Property(s => s.ConversionValue)
            .HasColumnName("conversion_value")
            .HasMaxLength(255);

        builder.Property(s => s.SessionId)
            .HasColumnName("session_id")
            .HasMaxLength(255);

        builder.Property(s => s.IsUnique)
            .HasColumnName("is_unique")
            .HasDefaultValue(true)
            .IsRequired();

        // Indexes
        builder.HasIndex(s => s.CampaignId)
            .HasDatabaseName("ix_qr_scans_campaign_id");

        builder.HasIndex(s => s.ScannedAt)
            .HasDatabaseName("ix_qr_scans_scanned_at");

        builder.HasIndex(s => s.SessionId)
            .HasDatabaseName("ix_qr_scans_session_id");

        builder.HasIndex(s => s.Converted)
            .HasDatabaseName("ix_qr_scans_converted");

        builder.HasIndex(s => new { s.CampaignId, s.ScannedAt })
            .HasDatabaseName("ix_qr_scans_campaign_scanned");

        builder.HasIndex(s => s.LocationCountry)
            .HasDatabaseName("ix_qr_scans_location_country");

        builder.HasIndex(s => s.DeviceType)
            .HasDatabaseName("ix_qr_scans_device_type");

        // Relationships
        builder.HasOne(s => s.Campaign)
            .WithMany(c => c.Scans)
            .HasForeignKey(s => s.CampaignId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
