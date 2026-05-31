using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the Proposal entity.
/// </summary>
public class ProposalConfiguration : IEntityTypeConfiguration<Proposal>
{
    public void Configure(EntityTypeBuilder<Proposal> builder)
    {
        builder.ToTable("proposals");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id");

        builder.Property(p => p.BusinessId)
            .HasColumnName("business_id")
            .IsRequired();

        builder.Property(p => p.LeadId)
            .HasColumnName("lead_id");

        builder.Property(p => p.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.ClientName)
            .HasColumnName("client_name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.ClientEmail)
            .HasColumnName("client_email")
            .HasMaxLength(255);

        builder.Property(p => p.ClientCompany)
            .HasColumnName("client_company")
            .HasMaxLength(200);

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasMaxLength(50)
            .HasDefaultValue("draft");

        builder.Property(p => p.Amount)
            .HasColumnName("amount")
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .HasColumnName("currency")
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(p => p.Content)
            .HasColumnName("content")
            .HasColumnType("jsonb");

        builder.Property(p => p.TemplateId)
            .HasColumnName("template_id")
            .HasMaxLength(100);

        builder.Property(p => p.ValidUntil)
            .HasColumnName("valid_until");

        builder.Property(p => p.SentAt)
            .HasColumnName("sent_at");

        builder.Property(p => p.ViewedAt)
            .HasColumnName("viewed_at");

        builder.Property(p => p.ViewCount)
            .HasColumnName("view_count")
            .HasDefaultValue(0);

        builder.Property(p => p.AcceptedAt)
            .HasColumnName("accepted_at");

        builder.Property(p => p.DeclinedAt)
            .HasColumnName("declined_at");

        builder.Property(p => p.DeclineReason)
            .HasColumnName("decline_reason")
            .HasMaxLength(1000);

        builder.Property(p => p.SignatureData)
            .HasColumnName("signature_data");

        builder.Property(p => p.SignerName)
            .HasColumnName("signer_name")
            .HasMaxLength(200);

        builder.Property(p => p.SignerIpAddress)
            .HasColumnName("signer_ip_address")
            .HasMaxLength(45);

        builder.Property(p => p.Notes)
            .HasColumnName("notes")
            .HasMaxLength(2000);

        builder.Property(p => p.AccessToken)
            .HasColumnName("access_token")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(p => p.DeletedAt)
            .HasColumnName("deleted_at");

        // Indexes
        builder.HasIndex(p => p.BusinessId);
        builder.HasIndex(p => p.LeadId);
        builder.HasIndex(p => p.AccessToken).IsUnique();
        builder.HasIndex(p => p.Status);

        // Relationships
        builder.HasOne(p => p.Business)
            .WithMany()
            .HasForeignKey(p => p.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Lead)
            .WithMany()
            .HasForeignKey(p => p.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        // Query filter for soft delete
        builder.HasQueryFilter(p => p.DeletedAt == null);
    }
}
