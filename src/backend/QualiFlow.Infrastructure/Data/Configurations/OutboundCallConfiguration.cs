// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for the OutboundCall entity.
/// </summary>
public class OutboundCallConfiguration : IEntityTypeConfiguration<OutboundCall>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<OutboundCall> builder)
    {
        builder.ToTable("outbound_calls");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(x => x.LeadId)
            .HasColumnName("lead_id")
            .IsRequired();

        builder.Property(x => x.ConversationId)
            .HasColumnName("conversation_id");

        builder.Property(x => x.CallScriptId)
            .HasColumnName("call_script_id");

        builder.Property(x => x.TwilioCallSid)
            .HasColumnName("twilio_call_sid")
            .HasMaxLength(100);

        builder.Property(x => x.FromPhoneNumber)
            .HasColumnName("from_phone_number")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.ToPhoneNumber)
            .HasColumnName("to_phone_number")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Outcome)
            .HasColumnName("outcome")
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.ScheduledAt)
            .HasColumnName("scheduled_at");

        builder.Property(x => x.InitiatedAt)
            .HasColumnName("initiated_at");

        builder.Property(x => x.ConnectedAt)
            .HasColumnName("connected_at");

        builder.Property(x => x.EndedAt)
            .HasColumnName("ended_at");

        builder.Property(x => x.DurationSeconds)
            .HasColumnName("duration_seconds");

        builder.Property(x => x.RecordingUrl)
            .HasColumnName("recording_url")
            .HasMaxLength(500);

        builder.Property(x => x.RecordingSid)
            .HasColumnName("recording_sid")
            .HasMaxLength(100);

        builder.Property(x => x.Transcription)
            .HasColumnName("transcription");

        builder.Property(x => x.RetryAttempt)
            .HasColumnName("retry_attempt")
            .HasDefaultValue(0);

        builder.Property(x => x.MaxRetries)
            .HasColumnName("max_retries")
            .HasDefaultValue(3);

        builder.Property(x => x.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(1000);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(x => x.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(x => x.BusinessId).HasDatabaseName("ix_outbound_calls_business_id");
        builder.HasIndex(x => x.LeadId).HasDatabaseName("ix_outbound_calls_lead_id");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_outbound_calls_status");
        builder.HasIndex(x => x.ScheduledAt).HasDatabaseName("ix_outbound_calls_scheduled_at");
        builder.HasIndex(x => x.TwilioCallSid).HasDatabaseName("ix_outbound_calls_twilio_call_sid");

        // Relationships
        builder.HasOne(x => x.Business)
            .WithMany(b => b.OutboundCalls)
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lead)
            .WithMany(l => l.OutboundCalls)
            .HasForeignKey(x => x.LeadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Conversation)
            .WithMany()
            .HasForeignKey(x => x.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.CallScript)
            .WithMany(cs => cs.OutboundCalls)
            .HasForeignKey(x => x.CallScriptId)
            .OnDelete(DeleteBehavior.SetNull);

        // Global query filter for soft delete
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}

