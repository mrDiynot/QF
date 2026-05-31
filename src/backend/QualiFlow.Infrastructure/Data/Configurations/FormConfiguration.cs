using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for Form entity.
/// </summary>
public class FormConfiguration : IEntityTypeConfiguration<Form>
{
    /// <summary>
    /// Configures the Form entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<Form> builder)
    {
        // Table name
        builder.ToTable("forms");

        // Primary key
        builder.HasKey(f => f.Id);

        // Properties
        builder.Property(f => f.BusinessId)
            .IsRequired();

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.Description)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(f => f.Fields)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(f => f.Styling)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(f => f.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasDefaultValue(FormStatus.Draft);

        builder.Property(f => f.IsActive)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(f => f.Slug)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(f => f.ThankYouMessage)
            .IsRequired(false)
            .HasMaxLength(2000);

        builder.Property(f => f.RedirectUrl)
            .IsRequired(false)
            .HasMaxLength(500)
            .HasConversion(
                uri => uri != null ? uri.ToString() : null,
                str => !string.IsNullOrEmpty(str) ? new Uri(str) : null);

        builder.Property(f => f.NotifyOnSubmission)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(f => f.NotificationEmails)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(f => f.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(f => f.UpdatedAt)
            .IsRequired(false);

        builder.Property(f => f.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(f => f.BusinessId)
            .HasDatabaseName("ix_forms_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(f => f.Slug)
            .HasDatabaseName("ix_forms_slug")
            .IsUnique()
            .HasFilter("slug IS NOT NULL AND deleted_at IS NULL");

        builder.HasIndex(f => f.Status)
            .HasDatabaseName("ix_forms_status");

        builder.HasIndex(f => new { f.BusinessId, f.Status })
            .HasDatabaseName("ix_forms_business_id_status");

        builder.HasIndex(f => f.CreatedAt)
            .HasDatabaseName("ix_forms_created_at");

        // Relationships
        builder.HasOne(f => f.Business)
            .WithMany(b => b.Forms)
            .HasForeignKey(f => f.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(f => f.Submissions)
            .WithOne(s => s.Form)
            .HasForeignKey(s => s.FormId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

