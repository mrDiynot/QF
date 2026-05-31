using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for QuickReply entity.
/// </summary>
public class QuickReplyConfiguration : IEntityTypeConfiguration<QuickReply>
{
    /// <summary>
    /// Configures the QuickReply entity.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Minor Code Smell", "MA0051:Method is too long", Justification = "Entity configuration requires comprehensive setup")]
    public void Configure(EntityTypeBuilder<QuickReply> builder)
    {
        builder.ToTable("quick_replies");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.BusinessId)
            .IsRequired();

        builder.Property(q => q.Shortcut)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(q => q.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(q => q.Content)
            .IsRequired()
            .HasMaxLength(5000);

        builder.Property(q => q.Category)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(q => q.IsGlobal)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(q => q.CreatedByUserId)
            .IsRequired(false);

        builder.Property(q => q.UsageCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(q => q.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");

        builder.Property(q => q.UpdatedAt)
            .IsRequired(false);

        builder.Property(q => q.DeletedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(q => q.BusinessId)
            .HasDatabaseName("ix_quick_replies_business_id");

        builder.HasIndex(q => new { q.BusinessId, q.Shortcut })
            .HasDatabaseName("ix_quick_replies_business_id_shortcut")
            .IsUnique();

        builder.HasIndex(q => q.Category)
            .HasDatabaseName("ix_quick_replies_category");

        // Relationships
        builder.HasOne(q => q.Business)
            .WithMany()
            .HasForeignKey(q => q.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.CreatedByUser)
            .WithMany()
            .HasForeignKey(q => q.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

