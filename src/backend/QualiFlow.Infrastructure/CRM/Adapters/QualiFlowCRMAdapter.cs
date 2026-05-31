using System.Diagnostics.CodeAnalysis;

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.CRM.Adapters;

/// <summary>
/// Built-in QualiFlow CRM adapter.
/// Uses the QualiFlow database directly (no external API calls).
/// This is the default CRM for all businesses.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public class QualiFlowCRMAdapter : ICRMAdapter
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="QualiFlowCRMAdapter"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public QualiFlowCRMAdapter(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public CRMProviderType ProviderType => CRMProviderType.QualiFlow;

    /// <inheritdoc/>
    public async Task<string> SyncContactAsync(Contact contact, CancellationToken cancellationToken = default)
    {
        // For built-in CRM, "sync" means save to database
        if (contact.Id == Guid.Empty)
        {
            contact.Id = Guid.NewGuid();
            await _context.Contacts.AddAsync(contact, cancellationToken);
        }
        else
        {
            _context.Contacts.Update(contact);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Return QualiFlow ID as "external" ID
        return contact.Id.ToString();
    }

    /// <inheritdoc/>
    public async Task<string> SyncDealAsync(Deal deal, CancellationToken cancellationToken = default)
    {
        // For built-in CRM, "sync" means save to database
        if (deal.Id == Guid.Empty)
        {
            deal.Id = Guid.NewGuid();
            await _context.Deals.AddAsync(deal, cancellationToken);
        }
        else
        {
            _context.Deals.Update(deal);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Return QualiFlow ID as "external" ID
        return deal.Id.ToString();
    }

    /// <inheritdoc/>
    public async Task<Contact?> GetContactAsync(string externalId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(externalId, out var contactId))
        {
            return null;
        }

        return await _context.Contacts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == contactId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<Deal?> GetDealAsync(string externalId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(externalId, out var dealId))
        {
            return null;
        }

        return await _context.Deals
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == dealId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Contact>> GetContactsModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default)
    {
        return await _context.Contacts
            .AsNoTracking()
            .Where(c => c.UpdatedAt != null && c.UpdatedAt >= since)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Deal>> GetDealsModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default)
    {
        return await _context.Deals
            .AsNoTracking()
            .Where(d => d.UpdatedAt != null && d.UpdatedAt >= since)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task<bool> ValidateConnectionAsync(CancellationToken cancellationToken = default)
    {
        // Built-in CRM is always valid (uses local database)
        return Task.FromResult(true);
    }
}

