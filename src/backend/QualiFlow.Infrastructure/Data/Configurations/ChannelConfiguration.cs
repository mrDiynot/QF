using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Channel entity.
/// </summary>
public class ChannelConfiguration : IEntityTypeConfiguration<Channel>
{
    /// <summary>
    /// Configures the Channel entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<Channel> builder)
    {
        // Table name
        builder.ToTable("channels");

        // Primary key
        builder.HasKey(c => c.Id);

        // Properties
        builder.Property(c => c.BusinessId)
            .IsRequired();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.Configuration)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(c => c.ExternalAccountId)
            .IsRequired(false)
            .HasMaxLength(255);

        builder.Property(c => c.ExternalId)
            .IsRequired(false)
            .HasMaxLength(255);

        builder.Property(c => c.EncryptedCredentials)
            .IsRequired(false);

        builder.Property(c => c.Credentials)
            .IsRequired(false);

        builder.Property(c => c.Metadata)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(c => c.UpdatedAt)
            .IsRequired(false);

        builder.Property(c => c.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(c => c.BusinessId)
            .HasDatabaseName("ix_channels_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(c => c.Type)
            .HasDatabaseName("ix_channels_type");

        builder.HasIndex(c => c.IsActive)
            .HasDatabaseName("ix_channels_is_active");

        builder.HasIndex(c => new { c.BusinessId, c.Type })
            .HasDatabaseName("ix_channels_business_id_type");

        builder.HasIndex(c => new { c.BusinessId, c.IsActive })
            .HasDatabaseName("ix_channels_business_id_is_active");

        builder.HasIndex(c => new { c.Type, c.ExternalId })
            .HasDatabaseName("ix_channels_type_external_id")
            .HasFilter("external_id IS NOT NULL AND deleted_at IS NULL");

        // Relationships
        builder.HasOne(c => c.Business)
            .WithMany(b => b.Channels)
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

