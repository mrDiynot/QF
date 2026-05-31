// <copyright file="ExternalUsageLogConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the ExternalUsageLog entity.
/// Tracks external service usage (OpenAI, Twilio) for billing and analytics.
/// </summary>
public class ExternalUsageLogConfiguration : IEntityTypeConfiguration<ExternalUsageLog>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<ExternalUsageLog> builder)
    {
        builder.ToTable("external_usage_logs");

        // Primary key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.BusinessId)
            .IsRequired();

        builder.Property(e => e.ServiceType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.OperationType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.InputTokens)
            .IsRequired(false);

        builder.Property(e => e.OutputTokens)
            .IsRequired(false);

        // TotalTokens is a computed property, ignore it
        builder.Ignore(e => e.TotalTokens);

        builder.Property(e => e.Model)
            .HasMaxLength(50);

        builder.Property(e => e.DurationSeconds)
            .IsRequired(false);

        builder.Property(e => e.Direction)
            .HasMaxLength(20);

        builder.Property(e => e.EstimatedCost)
            .HasPrecision(18, 6)
            .IsRequired();

        builder.Property(e => e.ConversationId)
            .IsRequired(false);

        builder.Property(e => e.MessageId)
            .IsRequired(false);

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        // Indexes for performance
        builder.HasIndex(e => e.BusinessId)
            .HasDatabaseName("ix_external_usage_logs_business_id");

        builder.HasIndex(e => e.ServiceType)
            .HasDatabaseName("ix_external_usage_logs_service_type");

        builder.HasIndex(e => e.OperationType)
            .HasDatabaseName("ix_external_usage_logs_operation_type");

        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("ix_external_usage_logs_created_at");

        builder.HasIndex(e => e.ConversationId)
            .HasDatabaseName("ix_external_usage_logs_conversation_id");

        // Composite indexes for common queries
        builder.HasIndex(e => new { e.BusinessId, e.ServiceType, e.CreatedAt })
            .HasDatabaseName("ix_external_usage_logs_business_service_date");

        builder.HasIndex(e => new { e.BusinessId, e.CreatedAt })
            .HasDatabaseName("ix_external_usage_logs_business_date");

        // Relationships
        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Conversation)
            .WithMany()
            .HasForeignKey(e => e.ConversationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Message)
            .WithMany()
            .HasForeignKey(e => e.MessageId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
