// <copyright file="SavedSearchConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for SavedSearch entity (S15-BE-003).
/// </summary>
public class SavedSearchConfiguration : IEntityTypeConfiguration<SavedSearch>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<SavedSearch> builder)
    {
        builder.ToTable("saved_searches");

        // Primary key
        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.BusinessId)
            .IsRequired();

        builder.Property(s => s.UserId)
            .IsRequired();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(500);

        builder.Property(s => s.EntityType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.SearchCriteriaJson)
            .IsRequired()
            .HasColumnType("jsonb"); // PostgreSQL JSONB for efficient querying

        builder.Property(s => s.IsShared)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.UsageCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.LastUsedAt)
            .IsRequired(false);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .IsRequired(false);

        builder.Property(s => s.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(s => s.BusinessId)
            .HasDatabaseName("ix_saved_searches_business_id");

        builder.HasIndex(s => s.UserId)
            .HasDatabaseName("ix_saved_searches_user_id");

        builder.HasIndex(s => new { s.BusinessId, s.EntityType })
            .HasDatabaseName("ix_saved_searches_business_id_entity_type");

        builder.HasIndex(s => new { s.BusinessId, s.IsShared })
            .HasDatabaseName("ix_saved_searches_business_id_is_shared");

        // Relationships
        builder.HasOne(s => s.Business)
            .WithMany()
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

