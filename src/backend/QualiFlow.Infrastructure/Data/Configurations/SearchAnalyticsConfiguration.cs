// <copyright file="SearchAnalyticsConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for SearchAnalytics entity (S15-BE-004).
/// </summary>
public class SearchAnalyticsConfiguration : IEntityTypeConfiguration<SearchAnalytics>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<SearchAnalytics> builder)
    {
        builder.ToTable("search_analytics");

        // Primary key
        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.BusinessId)
            .IsRequired();

        builder.Property(s => s.UserId)
            .IsRequired();

        builder.Property(s => s.SearchQuery)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.EntityType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.ResultsCount)
            .IsRequired();

        builder.Property(s => s.ExecutionTimeMs)
            .IsRequired();

        builder.Property(s => s.FiltersJson)
            .HasColumnType("jsonb"); // PostgreSQL JSONB

        builder.Property(s => s.SearchedAt)
            .IsRequired();

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        // Indexes for analytics queries
        builder.HasIndex(s => s.BusinessId)
            .HasDatabaseName("ix_search_analytics_business_id");

        builder.HasIndex(s => s.UserId)
            .HasDatabaseName("ix_search_analytics_user_id");

        builder.HasIndex(s => new { s.BusinessId, s.SearchedAt })
            .HasDatabaseName("ix_search_analytics_business_id_searched_at");

        builder.HasIndex(s => new { s.BusinessId, s.EntityType })
            .HasDatabaseName("ix_search_analytics_business_id_entity_type");

        builder.HasIndex(s => new { s.BusinessId, s.ResultsCount })
            .HasDatabaseName("ix_search_analytics_business_id_results_count")
            .HasFilter("results_count = 0"); // Partial index for zero-result searches

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

