using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for form views.
/// </summary>
public class FormViewConfiguration : IEntityTypeConfiguration<FormView>
{
    public void Configure(EntityTypeBuilder<FormView> builder)
    {
        builder.ToTable("form_views");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(v => v.FormId)
            .HasColumnName("form_id")
            .IsRequired();

        builder.Property(v => v.ViewedAt)
            .HasColumnName("viewed_at")
            .IsRequired();

        builder.Property(v => v.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45);

        builder.Property(v => v.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(v => v.Referrer)
            .HasColumnName("referrer")
            .HasMaxLength(500);

        builder.Property(v => v.UtmSource)
            .HasColumnName("utm_source")
            .HasMaxLength(100);

        builder.Property(v => v.UtmMedium)
            .HasColumnName("utm_medium")
            .HasMaxLength(100);

        builder.Property(v => v.UtmCampaign)
            .HasColumnName("utm_campaign")
            .HasMaxLength(100);

        builder.Property(v => v.SessionId)
            .HasColumnName("session_id")
            .HasMaxLength(255);

        builder.Property(v => v.DeviceType)
            .HasColumnName("device_type")
            .HasMaxLength(50);

        builder.Property(v => v.Browser)
            .HasColumnName("browser")
            .HasMaxLength(50);

        builder.Property(v => v.OperatingSystem)
            .HasColumnName("operating_system")
            .HasMaxLength(50);

        builder.Property(v => v.Submitted)
            .HasColumnName("submitted")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(v => v.SubmissionId)
            .HasColumnName("submission_id");

        builder.Property(v => v.SubmittedAt)
            .HasColumnName("submitted_at");

        builder.Property(v => v.TimeSpentSeconds)
            .HasColumnName("time_spent_seconds");

        builder.Property(v => v.Bounced)
            .HasColumnName("bounced")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(v => v.FurthestFieldReached)
            .HasColumnName("furthest_field_reached")
            .HasMaxLength(255);

        builder.Property(v => v.CompletionPercentage)
            .HasColumnName("completion_percentage");

        // Indexes
        builder.HasIndex(v => v.FormId)
            .HasDatabaseName("ix_form_views_form_id");

        builder.HasIndex(v => v.ViewedAt)
            .HasDatabaseName("ix_form_views_viewed_at");

        builder.HasIndex(v => v.SessionId)
            .HasDatabaseName("ix_form_views_session_id");

        builder.HasIndex(v => v.Submitted)
            .HasDatabaseName("ix_form_views_submitted");

        builder.HasIndex(v => new { v.FormId, v.ViewedAt })
            .HasDatabaseName("ix_form_views_form_viewed");

        builder.HasIndex(v => v.SubmissionId)
            .HasDatabaseName("ix_form_views_submission_id");

        // Relationships
        builder.HasOne(v => v.Form)
            .WithMany()
            .HasForeignKey(v => v.FormId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.FieldInteractions)
            .WithOne(i => i.FormView)
            .HasForeignKey(i => i.FormViewId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
