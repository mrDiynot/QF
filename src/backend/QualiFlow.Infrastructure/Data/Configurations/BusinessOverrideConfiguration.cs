// <copyright file="BusinessOverrideConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for BusinessOverride entity.
/// </summary>
public class BusinessOverrideConfiguration : IEntityTypeConfiguration<BusinessOverride>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<BusinessOverride> builder)
    {
        builder.ToTable("business_overrides");

        builder.HasKey(bo => bo.Id);

        builder.Property(bo => bo.BusinessId)
            .IsRequired();

        builder.Property(bo => bo.OverrideType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(bo => bo.OverrideKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(bo => bo.OverrideValue)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(bo => bo.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(bo => bo.ExpiresAt);

        builder.Property(bo => bo.CreatedBy)
            .IsRequired();

        // Indexes
        builder.HasIndex(bo => bo.BusinessId);

        builder.HasIndex(bo => bo.ExpiresAt)
            .HasFilter("expires_at IS NOT NULL");

        builder.HasIndex(bo => new { bo.BusinessId, bo.OverrideType, bo.OverrideKey })
            .IsUnique();

        // Relationships
        builder.HasOne(bo => bo.Business)
            .WithMany()
            .HasForeignKey(bo => bo.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

