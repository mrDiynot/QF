using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for field interactions.
/// </summary>
public class FieldInteractionConfiguration : IEntityTypeConfiguration<FieldInteraction>
{
    public void Configure(EntityTypeBuilder<FieldInteraction> builder)
    {
        builder.ToTable("field_interactions");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .HasColumnName("id")
            .IsRequired();

        builder.Property(i => i.FormViewId)
            .HasColumnName("form_view_id")
            .IsRequired();

        builder.Property(i => i.FieldId)
            .HasColumnName("field_id")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(i => i.FieldLabel)
            .HasColumnName("field_label")
            .HasMaxLength(255);

        builder.Property(i => i.FieldType)
            .HasColumnName("field_type")
            .HasMaxLength(50);

        builder.Property(i => i.EventType)
            .HasColumnName("event_type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(i => i.EventAt)
            .HasColumnName("event_at")
            .IsRequired();

        builder.Property(i => i.TimeSpentSeconds)
            .HasColumnName("time_spent_seconds");

        builder.Property(i => i.CharactersEntered)
            .HasColumnName("characters_entered");

        builder.Property(i => i.EditCount)
            .HasColumnName("edit_count");

        builder.Property(i => i.HadValidationError)
            .HasColumnName("had_validation_error")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(i => i.ValidationErrorMessage)
            .HasColumnName("validation_error_message")
            .HasMaxLength(500);

        builder.Property(i => i.AbandonedAtField)
            .HasColumnName("abandoned_at_field")
            .HasDefaultValue(false)
            .IsRequired();

        // Indexes
        builder.HasIndex(i => i.FormViewId)
            .HasDatabaseName("ix_field_interactions_form_view_id");

        builder.HasIndex(i => i.FieldId)
            .HasDatabaseName("ix_field_interactions_field_id");

        builder.HasIndex(i => i.EventType)
            .HasDatabaseName("ix_field_interactions_event_type");

        builder.HasIndex(i => i.EventAt)
            .HasDatabaseName("ix_field_interactions_event_at");

        builder.HasIndex(i => i.AbandonedAtField)
            .HasDatabaseName("ix_field_interactions_abandoned");

        builder.HasIndex(i => new { i.FormViewId, i.FieldId, i.EventType })
            .HasDatabaseName("ix_field_interactions_view_field_event");

        // Relationships
        builder.HasOne(i => i.FormView)
            .WithMany(v => v.FieldInteractions)
            .HasForeignKey(i => i.FormViewId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
