using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the AdminUser entity.
/// AdminUser is now independent from ApplicationUser for security isolation.
/// </summary>
public class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.ToTable("admin_users");

        // Primary key
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");

        // Authentication properties
        builder.Property(a => a.Email)
            .HasColumnName("email")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(a => a.NormalizedEmail)
            .HasColumnName("normalized_email")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(a => a.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(a => a.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.Role)
            .HasColumnName("role")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(a => a.IpWhitelist)
            .HasColumnName("ip_whitelist")
            .HasColumnType("jsonb")
            .HasDefaultValue(Array.Empty<string>());

        builder.Property(a => a.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(a => a.MustChangePassword)
            .HasColumnName("must_change_password")
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.LastLoginAt)
            .HasColumnName("last_login_at");

        builder.Property(a => a.LastLoginIp)
            .HasColumnName("last_login_ip")
            .HasMaxLength(45); // IPv6 max length

        builder.Property(a => a.FailedLoginAttempts)
            .HasColumnName("failed_login_attempts")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(a => a.LockoutEndAt)
            .HasColumnName("lockout_end_at");

        builder.Property(a => a.TwoFactorSecret)
            .HasColumnName("two_factor_secret")
            .HasMaxLength(100);

        builder.Property(a => a.TwoFactorEnabled)
            .HasColumnName("two_factor_enabled")
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.RefreshToken)
            .HasColumnName("refresh_token")
            .HasMaxLength(512);

        builder.Property(a => a.RefreshTokenExpiresAt)
            .HasColumnName("refresh_token_expires_at");

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(a => a.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(a => a.DeletedAt)
            .HasColumnName("deleted_at");

        // Ignore computed properties
        builder.Ignore(a => a.FullName);
        builder.Ignore(a => a.IsLockedOut);

        // Unique constraint on Email (case-insensitive via NormalizedEmail)
        builder.HasIndex(a => a.NormalizedEmail)
            .IsUnique()
            .HasDatabaseName("ix_admin_users_normalized_email")
            .HasFilter("deleted_at IS NULL");

        // Index on Role
        builder.HasIndex(a => a.Role)
            .HasDatabaseName("ix_admin_users_role")
            .HasFilter("deleted_at IS NULL");

        // Index on IsActive
        builder.HasIndex(a => a.IsActive)
            .HasDatabaseName("ix_admin_users_is_active")
            .HasFilter("deleted_at IS NULL");
    }
}

