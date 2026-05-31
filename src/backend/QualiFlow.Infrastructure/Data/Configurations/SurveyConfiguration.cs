// <copyright file="SurveyConfiguration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for Survey entity.
/// </summary>
public class SurveyConfiguration : IEntityTypeConfiguration<Survey>
{
    public void Configure(EntityTypeBuilder<Survey> builder)
    {
        builder.ToTable("surveys");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("draft");

        builder.Property(e => e.Questions)
            .IsRequired()
            .HasColumnType("jsonb");

        builder.Property(e => e.AverageScore)
            .HasPrecision(5, 2);

        builder.HasIndex(e => e.BusinessId);
        builder.HasIndex(e => e.Status);

        builder.HasOne(e => e.Business)
            .WithMany()
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Responses)
            .WithOne(e => e.Survey)
            .HasForeignKey(e => e.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}

/// <summary>
/// Entity Framework configuration for SurveyResponse entity.
/// </summary>
public class SurveyResponseConfiguration : IEntityTypeConfiguration<SurveyResponse>
{
    public void Configure(EntityTypeBuilder<SurveyResponse> builder)
    {
        builder.ToTable("survey_responses");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Email)
            .HasMaxLength(255);

        builder.Property(e => e.Answers)
            .IsRequired()
            .HasColumnType("jsonb");

        builder.Property(e => e.Score)
            .HasPrecision(5, 2);

        builder.Property(e => e.IpAddress)
            .HasMaxLength(45);

        builder.Property(e => e.UserAgent)
            .HasMaxLength(500);

        builder.HasIndex(e => e.SurveyId);

        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
