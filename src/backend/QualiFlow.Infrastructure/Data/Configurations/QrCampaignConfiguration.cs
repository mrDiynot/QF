using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for QR campaigns.
/// </summary>
public class QrCampaignConfiguration : IEntityTypeConfiguration<QrCampaign>
{
    public void Configure(EntityTypeBuilder<QrCampaign> builder)
    {
        builder.ToTable("qr_campaigns");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(c => c.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(c => c.QrCodeUrl)
            .HasColumnName("qr_code_url")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(c => c.DestinationUrl)
            .HasColumnName("destination_url")
            .HasMaxLength(1000);

        builder.Property(c => c.LinkedFormId)
            .HasColumnName("linked_form_id");

        builder.Property(c => c.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(c => c.QrCodeImageData)
            .HasColumnName("qr_code_image_data")
            .HasColumnType("text");

        builder.Property(c => c.CustomizationSettings)
            .HasColumnName("customization_settings")
            .HasColumnType("jsonb");

        builder.Property(c => c.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(c => c.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(c => c.BusinessId)
            .HasDatabaseName("ix_qr_campaigns_business_id");

        builder.HasIndex(c => c.LinkedFormId)
            .HasDatabaseName("ix_qr_campaigns_linked_form_id");

        builder.HasIndex(c => c.Status)
            .HasDatabaseName("ix_qr_campaigns_status");

        builder.HasIndex(c => c.CreatedAt)
            .HasDatabaseName("ix_qr_campaigns_created_at");

        // Soft delete query filter
        builder.HasQueryFilter(c => c.DeletedAt == null);

        // Relationships
        builder.HasOne(c => c.Business)
            .WithMany()
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.LinkedForm)
            .WithMany()
            .HasForeignKey(c => c.LinkedFormId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Scans)
            .WithOne(s => s.Campaign)
            .HasForeignKey(s => s.CampaignId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
