using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for the CalComIntegration entity.
/// </summary>
public class CalComIntegrationConfiguration : IEntityTypeConfiguration<CalComIntegration>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<CalComIntegration> builder)
    {
        builder.ToTable("cal_com_integrations");

        // Primary key
        builder.HasKey(c => c.Id);

        // Relationships
        builder.HasOne(c => c.Business)
            .WithMany()
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.ConnectedByUser)
            .WithMany()
            .HasForeignKey(c => c.ConnectedByUserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
