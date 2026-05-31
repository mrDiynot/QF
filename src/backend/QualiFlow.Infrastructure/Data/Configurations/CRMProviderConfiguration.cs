using System.Diagnostics.CodeAnalysis;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the CRMProvider entity.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public class CRMProviderConfiguration : IEntityTypeConfiguration<CRMProvider>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<CRMProvider> builder)
    {
        builder.ToTable("crm_providers");

        // Primary key
        builder.HasKey(cp => cp.Id);

        // Properties
        builder.Property(cp => cp.BusinessId)
            .IsRequired();

        builder.Property(cp => cp.ProviderType)
            .IsRequired()
            .HasConversion<string>(); // Store enum as string

        builder.Property(cp => cp.IsActive)
            .IsRequired()
            .HasDefaultValue(value: true);

        builder.Property(cp => cp.SyncStrategy)
            .IsRequired()
            .HasConversion<string>() // Store enum as string
            .HasDefaultValue(CRMSyncStrategy.RealTime);

        builder.Property(cp => cp.AccessToken)
            .HasMaxLength(2000); // OAuth tokens can be long

        builder.Property(cp => cp.RefreshToken)
            .HasMaxLength(2000);

        builder.Property(cp => cp.ExternalAccountId)
            .HasMaxLength(255);

        builder.Property(cp => cp.ExternalAccountUrl)
            .HasMaxLength(500);

        builder.Property(cp => cp.LastSyncError)
            .HasMaxLength(1000);

        builder.Property(cp => cp.ConfigurationJson)
            .IsRequired()
            .HasDefaultValue("{}");

        // Indexes
        builder.HasIndex(cp => cp.BusinessId);
        builder.HasIndex(cp => new { cp.BusinessId, cp.IsActive });

        // Relationships
        builder.HasOne(cp => cp.Business)
            .WithMany()
            .HasForeignKey(cp => cp.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // Multi-tenancy: Global query filter (will be set by DbContext)
        // Note: Actual filtering is handled by QualiFlowDbContext global query filters
    }
}

