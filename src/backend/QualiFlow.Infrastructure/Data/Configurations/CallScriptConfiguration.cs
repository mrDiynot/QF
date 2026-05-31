// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for the CallScript entity.
/// </summary>
public class CallScriptConfiguration : IEntityTypeConfiguration<CallScript>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<CallScript> builder)
    {
        builder.ToTable("call_scripts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(x => x.GreetingMessage)
            .HasColumnName("greeting_message")
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.VoicemailMessage)
            .HasColumnName("voicemail_message")
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.ClosingMessage)
            .HasColumnName("closing_message")
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.QuestionsJson)
            .HasColumnName("questions_json")
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(x => x.VoiceSettingsJson)
            .HasColumnName("voice_settings_json")
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");

        builder.Property(x => x.SystemPrompt)
            .HasColumnName("system_prompt");

        builder.Property(x => x.IsDefault)
            .HasColumnName("is_default")
            .HasDefaultValue(false);

        builder.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(x => x.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(x => x.BusinessId).HasDatabaseName("ix_call_scripts_business_id");
        builder.HasIndex(x => new { x.BusinessId, x.IsDefault })
            .HasDatabaseName("ix_call_scripts_business_id_is_default");

        // Relationships
        builder.HasOne(x => x.Business)
            .WithMany(b => b.CallScripts)
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        // Global query filter for soft delete
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}

