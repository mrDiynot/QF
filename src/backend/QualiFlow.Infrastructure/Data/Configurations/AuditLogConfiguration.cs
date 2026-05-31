// <copyright file="AuditLogConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the AuditLog entity.
/// </summary>
public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        // Primary key
        builder.HasKey(a => a.Id);

        // Properties
        builder.Property(a => a.BusinessId)
            .IsRequired();

        builder.Property(a => a.UserId)
            .IsRequired();

        builder.Property(a => a.Username)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.EntityId)
            .IsRequired();

        builder.Property(a => a.OldValues)
            .HasColumnType("jsonb");

        builder.Property(a => a.NewValues)
            .HasColumnType("jsonb");

        builder.Property(a => a.IpAddress)
            .IsRequired()
            .HasMaxLength(45); // IPv6 max length

        builder.Property(a => a.UserAgent)
            .HasMaxLength(500);

        builder.Property(a => a.HttpMethod)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(a => a.RequestPath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Metadata)
            .HasColumnType("jsonb");

        // Indexes for performance
        builder.HasIndex(a => a.BusinessId)
            .HasDatabaseName("ix_audit_logs_business_id");

        builder.HasIndex(a => a.UserId)
            .HasDatabaseName("ix_audit_logs_user_id");

        builder.HasIndex(a => a.EntityType)
            .HasDatabaseName("ix_audit_logs_entity_type");

        builder.HasIndex(a => a.EntityId)
            .HasDatabaseName("ix_audit_logs_entity_id");

        builder.HasIndex(a => a.Action)
            .HasDatabaseName("ix_audit_logs_action");

        builder.HasIndex(a => a.CreatedAt)
            .HasDatabaseName("ix_audit_logs_created_at");

        // Composite index for common queries
        builder.HasIndex(a => new { a.BusinessId, a.EntityType, a.EntityId })
            .HasDatabaseName("ix_audit_logs_business_entity");

        builder.HasIndex(a => new { a.BusinessId, a.UserId, a.CreatedAt })
            .HasDatabaseName("ix_audit_logs_business_user_date");

        // Relationships
        builder.HasOne(a => a.Business)
            .WithMany()
            .HasForeignKey(a => a.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Ignore computed property
        builder.Ignore(a => a.Timestamp);
    }
}

