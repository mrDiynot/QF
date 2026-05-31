// -----------------------------------------------------------------------
// <copyright file="SupportTicketConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using QualiFlow.Domain.Entities.Support;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the SupportTicket entity.
/// </summary>
public class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<SupportTicket> builder)
    {
        builder.ToTable("support_tickets");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");

        builder.Property(t => t.TicketNumber)
            .HasColumnName("ticket_number")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.BusinessId)
            .HasColumnName("business_id");

        builder.Property(t => t.ReportedByUserId)
            .HasColumnName("reported_by_user_id");

        builder.Property(t => t.ReporterEmail)
            .HasColumnName("reporter_email")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(t => t.ReporterName)
            .HasColumnName("reporter_name")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(t => t.Category)
            .HasColumnName("category")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.Priority)
            .HasColumnName("priority")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.Subject)
            .HasColumnName("subject")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description")
            .IsRequired();

        builder.Property(t => t.FirstResponseDue)
            .HasColumnName("first_response_due");

        builder.Property(t => t.ResolutionDue)
            .HasColumnName("resolution_due");

        builder.Property(t => t.FirstResponseAt)
            .HasColumnName("first_response_at");

        builder.Property(t => t.ResolvedAt)
            .HasColumnName("resolved_at");

        builder.Property(t => t.SlaBreached)
            .HasColumnName("sla_breached")
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.AssignedToAdminId)
            .HasColumnName("assigned_to_admin_id");

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(t => t.DeletedAt)
            .HasColumnName("deleted_at");

        // Relationships
        builder.HasOne(t => t.Business)
            .WithMany()
            .HasForeignKey(t => t.BusinessId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.ReportedByUser)
            .WithMany()
            .HasForeignKey(t => t.ReportedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.AssignedToAdmin)
            .WithMany()
            .HasForeignKey(t => t.AssignedToAdminId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(t => t.Messages)
            .WithOne(m => m.Ticket)
            .HasForeignKey(m => m.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Attachments)
            .WithOne(a => a.Ticket)
            .HasForeignKey(a => a.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.TicketNumber)
            .IsUnique()
            .HasDatabaseName("ix_support_tickets_ticket_number");

        builder.HasIndex(t => t.Status)
            .HasDatabaseName("ix_support_tickets_status");

        builder.HasIndex(t => t.Priority)
            .HasDatabaseName("ix_support_tickets_priority");

        builder.HasIndex(t => t.BusinessId)
            .HasDatabaseName("ix_support_tickets_business_id");

        builder.HasIndex(t => t.AssignedToAdminId)
            .HasDatabaseName("ix_support_tickets_assigned_to_admin_id");

        builder.HasIndex(t => t.SlaBreached)
            .HasDatabaseName("ix_support_tickets_sla_breached")
            .HasFilter("sla_breached = true");

        builder.HasIndex(t => t.CreatedAt)
            .HasDatabaseName("ix_support_tickets_created_at");
    }
}
