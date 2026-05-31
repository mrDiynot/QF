using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities.CMS;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for BlogPost entity.
/// </summary>
public class BlogPostConfiguration : IEntityTypeConfiguration<BlogPost>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<BlogPost> builder)
    {
        builder.ToTable("blog_posts");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Slug)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Excerpt)
            .HasMaxLength(500);

        builder.Property(p => p.Content)
            .IsRequired();

        builder.Property(p => p.FeaturedImagePath)
            .HasMaxLength(500);

        builder.Property(p => p.AuthorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.AuthorAvatarPath)
            .HasMaxLength(500);

        builder.Property(p => p.Category)
            .HasMaxLength(100);

        builder.Property(p => p.Tags)
            .HasMaxLength(500);

        builder.Property(p => p.MetaTitle)
            .HasMaxLength(200);

        builder.Property(p => p.MetaDescription)
            .HasMaxLength(500);

        builder.HasIndex(p => p.Slug)
            .IsUnique();

        builder.HasIndex(p => p.IsPublished);
        builder.HasIndex(p => p.IsFeatured);
        builder.HasIndex(p => p.Category);
        builder.HasIndex(p => p.PublishedAt);
    }
}

