using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the EmailLog entity.
/// </summary>
public class EmailLogConfiguration : IEntityTypeConfiguration<EmailLog>
{
    /// <inheritdoc />
#pragma warning disable MA0051 // Method is too long
    public void Configure(EntityTypeBuilder<EmailLog> builder)
    {
        builder.ToTable("email_logs");

        // Primary key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.BusinessId)
            .IsRequired();

        builder.Property(e => e.EmailTemplateId)
            .IsRequired(false);

        builder.Property(e => e.ResendEmailId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.ToEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.ToName)
            .HasMaxLength(200);

        builder.Property(e => e.FromEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.FromName)
            .HasMaxLength(200);

        builder.Property(e => e.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(e => e.SentAt)
            .IsRequired(false);

        builder.Property(e => e.DeliveredAt)
            .IsRequired(false);

        builder.Property(e => e.OpenedAt)
            .IsRequired(false);

        builder.Property(e => e.OpenCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.ClickedAt)
            .IsRequired(false);

        builder.Property(e => e.ClickCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.BouncedAt)
            .IsRequired(false);

        builder.Property(e => e.BounceReason)
            .HasMaxLength(500);

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(1000);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired(false);

        builder.Property(e => e.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(e => e.BusinessId)
            .HasDatabaseName("ix_email_logs_business_id");

        builder.HasIndex(e => e.ResendEmailId)
            .IsUnique()
            .HasDatabaseName("ix_email_logs_resend_email_id");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("ix_email_logs_status");

        builder.HasIndex(e => new { e.BusinessId, e.Status })
            .HasDatabaseName("ix_email_logs_business_id_status");

        builder.HasIndex(e => e.EmailTemplateId)
            .HasDatabaseName("ix_email_logs_email_template_id");

        builder.HasIndex(e => e.ToEmail)
            .HasDatabaseName("ix_email_logs_to_email");

        // Relationships
        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.EmailTemplate)
            .WithMany(t => t.EmailLogs)
            .HasForeignKey(e => e.EmailTemplateId)
            .OnDelete(DeleteBehavior.SetNull);
    }
#pragma warning restore MA0051
}
