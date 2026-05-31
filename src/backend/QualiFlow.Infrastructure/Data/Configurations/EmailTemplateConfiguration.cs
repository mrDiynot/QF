using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the EmailTemplate entity.
/// </summary>
public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    /// <inheritdoc />
#pragma warning disable MA0051 // Method is too long
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.ToTable("email_templates");

        // Primary key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.BusinessId)
            .IsRequired();

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.HtmlBody)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(e => e.TextBody)
            .HasColumnType("text");

        builder.Property(e => e.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired(false);

        builder.Property(e => e.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(e => e.BusinessId)
            .HasDatabaseName("ix_email_templates_business_id");

        builder.HasIndex(e => e.Type)
            .HasDatabaseName("ix_email_templates_type");

        builder.HasIndex(e => new { e.BusinessId, e.Type })
            .HasDatabaseName("ix_email_templates_business_id_type");

        builder.HasIndex(e => new { e.BusinessId, e.IsActive })
            .HasDatabaseName("ix_email_templates_business_id_is_active");

        // Relationships
        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.EmailLogs)
            .WithOne(l => l.EmailTemplate)
            .HasForeignKey(l => l.EmailTemplateId)
            .OnDelete(DeleteBehavior.SetNull);
    }
#pragma warning restore MA0051
}
