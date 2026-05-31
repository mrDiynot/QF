using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the EmailOtp entity.
/// Configures table mapping, constraints, indexes, and relationships.
/// </summary>
public class EmailOtpConfiguration : IEntityTypeConfiguration<EmailOtp>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<EmailOtp> builder)
    {
        // Table mapping
        builder.ToTable("email_otps");

        // Primary key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.OtpCodeHash)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.ExpiresAt)
            .IsRequired();

        builder.Property(e => e.IsUsed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.FailedAttempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.RequestedByIp)
            .HasMaxLength(50);

        // Indexes for performance
        builder.HasIndex(e => e.UserId)
            .HasDatabaseName("ix_email_otps_user_id");

        builder.HasIndex(e => e.ExpiresAt)
            .HasDatabaseName("ix_email_otps_expires_at");

        builder.HasIndex(e => new { e.UserId, e.IsUsed, e.ExpiresAt })
            .HasDatabaseName("ix_email_otps_user_validity");

        // Relationships
        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore computed properties
        builder.Ignore(e => e.IsValid);
        builder.Ignore(e => e.IsExpired);
        builder.Ignore(e => e.IsLocked);
    }
}

