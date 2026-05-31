using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for FormSubmission entity.
/// </summary>
public class FormSubmissionConfiguration : IEntityTypeConfiguration<FormSubmission>
{
    /// <summary>
    /// Configures the FormSubmission entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<FormSubmission> builder)
    {
        // Table name
        builder.ToTable("form_submissions");

        // Primary key
        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.BusinessId)
            .IsRequired();

        builder.Property(s => s.FormId)
            .IsRequired();

        builder.Property(s => s.LeadId)
            .IsRequired(false);

        builder.Property(s => s.SubmittedData)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(s => s.IpAddress)
            .IsRequired(false)
            .HasMaxLength(45); // IPv6 max length

        builder.Property(s => s.UserAgent)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(s => s.ReferrerUrl)
            .IsRequired(false)
            .HasMaxLength(2000)
            .HasConversion(
                uri => uri != null ? uri.ToString() : null,
                str => !string.IsNullOrEmpty(str) ? new Uri(str) : null);

        builder.Property(s => s.SubmittedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.IsProcessed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.ProcessedAt)
            .IsRequired(false);

        builder.Property(s => s.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(s => s.UpdatedAt)
            .IsRequired(false);

        builder.Property(s => s.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(s => s.BusinessId)
            .HasDatabaseName("ix_form_submissions_business_id")
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(s => s.FormId)
            .HasDatabaseName("ix_form_submissions_form_id");

        builder.HasIndex(s => s.LeadId)
            .HasDatabaseName("ix_form_submissions_lead_id")
            .HasFilter("lead_id IS NOT NULL");

        builder.HasIndex(s => s.SubmittedAt)
            .HasDatabaseName("ix_form_submissions_submitted_at");

        builder.HasIndex(s => s.IsProcessed)
            .HasDatabaseName("ix_form_submissions_is_processed");

        builder.HasIndex(s => new { s.FormId, s.SubmittedAt })
            .HasDatabaseName("ix_form_submissions_form_id_submitted_at");

        // Relationships
        builder.HasOne(s => s.Business)
            .WithMany(b => b.FormSubmissions)
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Form)
            .WithMany(f => f.Submissions)
            .HasForeignKey(s => s.FormId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Lead)
            .WithMany(l => l.FormSubmissions)
            .HasForeignKey(s => s.LeadId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

