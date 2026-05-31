// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for WaitlistEntry entity.
/// </summary>
public class WaitlistEntryConfiguration : IEntityTypeConfiguration<WaitlistEntry>
{
    public void Configure(EntityTypeBuilder<WaitlistEntry> builder)
    {
        builder.ToTable("waitlist_entries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id");

        builder.Property(e => e.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(e => e.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.Source)
            .HasColumnName("source")
            .HasMaxLength(50);

        builder.Property(e => e.ChatSessionId)
            .HasColumnName("chat_session_id");

        builder.Property(e => e.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45);

        builder.Property(e => e.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(e => e.PageUrl)
            .HasColumnName("page_url")
            .HasMaxLength(2048);

        builder.Property(e => e.ReferrerUrl)
            .HasColumnName("referrer_url")
            .HasMaxLength(2048);

        builder.Property(e => e.SignedUpAt)
            .HasColumnName("signed_up_at")
            .IsRequired();

        builder.Property(e => e.SyncedToBrevo)
            .HasColumnName("synced_to_brevo")
            .HasDefaultValue(false);

        builder.Property(e => e.SyncedAt)
            .HasColumnName("synced_at");

        builder.Property(e => e.MetadataJson)
            .HasColumnName("metadata_json")
            .HasColumnType("jsonb");

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(e => e.BusinessId)
            .HasDatabaseName("idx_waitlist_entries_business_id");

        builder.HasIndex(e => e.Email)
            .HasDatabaseName("idx_waitlist_entries_email");

        builder.HasIndex(e => e.SignedUpAt)
            .HasDatabaseName("idx_waitlist_entries_signed_up_at");

        builder.HasIndex(e => e.Source)
            .HasDatabaseName("idx_waitlist_entries_source");

        // Unique constraint on email per business
        builder.HasIndex(e => new { e.BusinessId, e.Email })
            .HasDatabaseName("idx_waitlist_entries_business_email")
            .IsUnique();

        // Relationships
        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ChatSession)
            .WithMany()
            .HasForeignKey(e => e.ChatSessionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Global query filter for soft delete
        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
