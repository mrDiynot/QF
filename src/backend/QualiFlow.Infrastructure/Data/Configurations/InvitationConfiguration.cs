// -----------------------------------------------------------------------
// <copyright file="InvitationConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the Invitation entity.
/// </summary>
public class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<Invitation> builder)
    {
        builder.ToTable("invitations");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(i => i.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(i => i.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(i => i.Role)
            .HasColumnName("role")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(i => i.InvitedByUserId)
            .HasColumnName("invited_by_user_id")
            .IsRequired();

        builder.Property(i => i.Token)
            .HasColumnName("token")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(i => i.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(i => i.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(InvitationStatus.Pending);

        builder.Property(i => i.AcceptedAt)
            .HasColumnName("accepted_at");

        builder.Property(i => i.AcceptedByUserId)
            .HasColumnName("accepted_by_user_id");

        builder.Property(i => i.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(i => i.UpdatedAt)
            .HasColumnName("updated_at");

        // Indexes
        builder.HasIndex(i => i.BusinessId)
            .HasDatabaseName("ix_invitations_business_id");

        builder.HasIndex(i => i.Token)
            .IsUnique()
            .HasDatabaseName("ix_invitations_token");

        builder.HasIndex(i => new { i.BusinessId, i.Email, i.Status })
            .HasDatabaseName("ix_invitations_business_email_status");

        builder.HasIndex(i => i.ExpiresAt)
            .HasDatabaseName("ix_invitations_expires_at");

        // Relationships
        builder.HasOne(i => i.Business)
            .WithMany()
            .HasForeignKey(i => i.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.InvitedByUser)
            .WithMany()
            .HasForeignKey(i => i.InvitedByUserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.AcceptedByUser)
            .WithMany()
            .HasForeignKey(i => i.AcceptedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

