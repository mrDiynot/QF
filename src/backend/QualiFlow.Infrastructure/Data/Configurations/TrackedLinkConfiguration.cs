// <copyright file="TrackedLinkConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for TrackedLink entity.
/// </summary>
public class TrackedLinkConfiguration : IEntityTypeConfiguration<TrackedLink>
{
    public void Configure(EntityTypeBuilder<TrackedLink> builder)
    {
        builder.ToTable("tracked_links");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.DestinationUrl)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.Slug)
            .IsUnique();

        builder.HasIndex(e => e.BusinessId);

        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
