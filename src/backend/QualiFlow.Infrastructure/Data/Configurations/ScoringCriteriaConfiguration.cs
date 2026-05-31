// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the ScoringCriteria entity.
/// </summary>
public class ScoringCriteriaConfiguration : IEntityTypeConfiguration<ScoringCriteria>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<ScoringCriteria> builder)
    {
        builder.ToTable("scoring_criteria");

        builder.HasKey(sc => sc.Id);

        builder.Property(sc => sc.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sc => sc.Description)
            .HasMaxLength(500);

        builder.Property(sc => sc.Weight)
            .IsRequired();

        builder.Property(sc => sc.ExtractionHint)
            .HasMaxLength(500);

        builder.Property(sc => sc.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sc => sc.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(sc => sc.MinimumScore)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(sc => sc.Category)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Custom");

        builder.Property(sc => sc.AiQuestions)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(sc => sc.BusinessId);
        builder.HasIndex(sc => new { sc.BusinessId, sc.Name }).IsUnique();
        builder.HasIndex(sc => new { sc.BusinessId, sc.IsActive });

        // Relationships
        builder.HasOne(sc => sc.Business)
            .WithMany()
            .HasForeignKey(sc => sc.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

