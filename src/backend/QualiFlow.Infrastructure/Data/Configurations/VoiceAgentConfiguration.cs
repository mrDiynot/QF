// <copyright file="VoiceAgentConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for VoiceAgent entity.
/// </summary>
public class VoiceAgentConfiguration : IEntityTypeConfiguration<VoiceAgent>
{
    public void Configure(EntityTypeBuilder<VoiceAgent> builder)
    {
        builder.ToTable("voice_agents");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Role)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.VoiceType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Language)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Personality)
            .HasMaxLength(200);

        builder.Property(e => e.SpeakingSpeed)
            .HasPrecision(3, 2)
            .HasDefaultValue(1.0m);

        builder.Property(e => e.Script)
            .HasColumnType("jsonb");

        builder.Property(e => e.Configuration)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.BusinessId);

        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Calls)
            .WithOne(e => e.VoiceAgent)
            .HasForeignKey(e => e.VoiceAgentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}

/// <summary>
/// Entity Framework configuration for VoiceCall entity.
/// </summary>
public class VoiceCallConfiguration : IEntityTypeConfiguration<VoiceCall>
{
    public void Configure(EntityTypeBuilder<VoiceCall> builder)
    {
        builder.ToTable("voice_calls");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ContactName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Direction)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("outbound");

        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Outcome)
            .HasMaxLength(50);

        builder.Property(e => e.Transcript)
            .HasColumnType("text");

        builder.Property(e => e.RecordingUrl)
            .HasMaxLength(500);

        builder.Property(e => e.ExternalCallSid)
            .HasMaxLength(100);

        builder.HasIndex(e => e.BusinessId);
        builder.HasIndex(e => e.VoiceAgentId);
        builder.HasIndex(e => e.StartedAt);

        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Lead)
            .WithMany()
            .HasForeignKey(e => e.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
