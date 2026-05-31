using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework Core configuration for AdminAuditLog entity.
/// </summary>
public class AdminAuditLogConfiguration : IEntityTypeConfiguration<AdminAuditLog>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<AdminAuditLog> builder)
    {
        builder.ToTable("admin_audit_logs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(a => a.AdminUserId)
            .HasColumnName("admin_user_id")
            .IsRequired();

        builder.Property(a => a.Action)
            .HasColumnName("action")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.EntityType)
            .HasColumnName("entity_type")
            .HasMaxLength(100);

        builder.Property(a => a.EntityId)
            .HasColumnName("entity_id")
            .HasMaxLength(100);

        builder.Property(a => a.OldValues)
            .HasColumnName("old_values")
            .HasColumnType("jsonb");

        builder.Property(a => a.NewValues)
            .HasColumnName("new_values")
            .HasColumnType("jsonb");

        builder.Property(a => a.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45)
            .IsRequired();

        builder.Property(a => a.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(a => a.HttpMethod)
            .HasColumnName("http_method")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(a => a.RequestPath)
            .HasColumnName("request_path")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(a => a.StatusCode)
            .HasColumnName("status_code")
            .IsRequired();

        builder.Property(a => a.Success)
            .HasColumnName("success")
            .IsRequired();

        builder.Property(a => a.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(1000);

        builder.Property(a => a.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(a => a.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(a => a.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(a => a.AdminUserId)
            .HasDatabaseName("ix_admin_audit_logs_admin_user_id");

        builder.HasIndex(a => a.Action)
            .HasDatabaseName("ix_admin_audit_logs_action");

        builder.HasIndex(a => a.EntityType)
            .HasDatabaseName("ix_admin_audit_logs_entity_type");

        builder.HasIndex(a => a.CreatedAt)
            .HasDatabaseName("ix_admin_audit_logs_created_at");

        builder.HasIndex(a => new { a.EntityType, a.EntityId })
            .HasDatabaseName("ix_admin_audit_logs_entity_type_entity_id");

        // Relationships
        builder.HasOne(a => a.AdminUser)
            .WithMany()
            .HasForeignKey(a => a.AdminUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

