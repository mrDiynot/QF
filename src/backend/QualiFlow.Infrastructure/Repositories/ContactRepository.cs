using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Contact entity operations.
/// </summary>
public partial class ContactRepository(
    QualiFlowDbContext context,
    ILogger<ContactRepository> logger) : IContactRepository
{
    /// <inheritdoc />
    public Task<Contact?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        LogGetById(logger, id);

        // Sprint 19: Performance optimization - Use AsSplitQuery for collection (Deals)
        return context.Contacts
            .AsNoTracking()
            .Where(c => c.DeletedAt == null)
            .Include(c => c.Business)
            .Include(c => c.AssignedToUser)
            .Include(c => c.OriginalLead)
            .Include(c => c.Deals)
            .AsSplitQuery() // Prevents cartesian explosion with Deals collection
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public Task<Contact?> GetByEmailAsync(Guid businessId, string email, CancellationToken cancellationToken = default)
    {
        LogGetByEmail(logger, businessId, email);

        return context.Contacts
            .AsNoTracking()
            .Where(c => c.DeletedAt == null)
            .Include(c => c.Business)
            .Include(c => c.AssignedToUser)
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.Email == email, cancellationToken);
    }

    /// <inheritdoc />
    public Task<Contact?> GetByExternalIdAsync(Guid businessId, string externalCRMId, CancellationToken cancellationToken = default)
    {
        LogGetByExternalId(logger, businessId, externalCRMId);

        return context.Contacts
            .AsNoTracking()
            .Where(c => c.DeletedAt == null)
            .Include(c => c.Business)
            .Include(c => c.AssignedToUser)
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.ExternalCRMId == externalCRMId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Contact>> GetAllAsync(
        Guid businessId,
        ContactStatus? status = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default)
    {
        LogGetAll(logger, businessId, status, assignedToUserId);

        var query = context.Contacts
            .AsNoTracking()
            .Where(c => c.DeletedAt == null)
            .Where(c => c.BusinessId == businessId);

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (assignedToUserId.HasValue)
        {
            query = query.Where(c => c.AssignedToUserId == assignedToUserId.Value);
        }

        return await query
            .Include(c => c.Business)
            .Include(c => c.AssignedToUser)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Globalization", "CA1308:Normalize strings to uppercase", Justification = "EF Core translates to SQL LOWER function")]
    public async Task<IEnumerable<Contact>> SearchAsync(Guid businessId, string query, CancellationToken cancellationToken = default)
    {
        LogSearch(logger, businessId, query);

        var searchTerm = query.Trim();

        // Use PostgreSQL full-text search for better performance (S14-BE-002)
        // Note: The search_vector column is a generated tsvector column in the database
        // For now, we'll use a simple ILIKE search until we can properly reference the generated column
        return await context.Contacts
            .AsNoTracking()
            .Where(c => c.DeletedAt == null)
            .Where(c => c.BusinessId == businessId)
            .Where(c =>
                EF.Functions.ILike(c.FirstName, $"%{searchTerm}%") ||
                EF.Functions.ILike(c.LastName, $"%{searchTerm}%") ||
                EF.Functions.ILike(c.Email, $"%{searchTerm}%") ||
                (c.Company != null && EF.Functions.ILike(c.Company, $"%{searchTerm}%")) ||
                (c.PhoneNumber != null && c.PhoneNumber.Contains(query)))
            .Include(c => c.Business)
            .Include(c => c.AssignedToUser)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Contact>> GetModifiedSinceAsync(Guid businessId, DateTime since, CancellationToken cancellationToken = default)
    {
        LogGetModifiedSince(logger, businessId, since);

        return await context.Contacts
            .AsNoTracking()
            .Where(c => c.DeletedAt == null)
            .Where(c => c.BusinessId == businessId)
            .Where(c => c.UpdatedAt >= since)
            .Include(c => c.Business)
            .Include(c => c.AssignedToUser)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Contact> CreateAsync(Contact contact, CancellationToken cancellationToken = default)
    {
        LogCreate(logger, contact.BusinessId, contact.Email);

        context.Contacts.Add(contact);
        await context.SaveChangesAsync(cancellationToken);

        LogCreated(logger, contact.Id, contact.BusinessId);

        return contact;
    }

    /// <inheritdoc />
    public async Task<Contact> UpdateAsync(Contact contact, CancellationToken cancellationToken = default)
    {
        LogUpdate(logger, contact.Id, contact.BusinessId);

        contact.UpdatedAt = DateTime.UtcNow;
        context.Contacts.Update(contact);
        await context.SaveChangesAsync(cancellationToken);

        LogUpdated(logger, contact.Id, contact.BusinessId);

        return contact;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        LogDelete(logger, id);

        var contact = await context.Contacts
            .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null, cancellationToken);

        if (contact != null)
        {
            contact.DeletedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);

            LogDeleted(logger, id, contact.BusinessId);
        }
    }

    /// <inheritdoc />
    public Task<int> CountAsync(Guid businessId, ContactStatus? status = null, CancellationToken cancellationToken = default)
    {
        LogCount(logger, businessId, status);

        var query = context.Contacts
            .Where(c => c.DeletedAt == null)
            .Where(c => c.BusinessId == businessId);

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    // ============================================================================
    // LoggerMessage Source Generators (High Performance Logging)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact by ID: {ContactId}")]
    private static partial void LogGetById(ILogger logger, Guid contactId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact by email for business {BusinessId}: {Email}")]
    private static partial void LogGetByEmail(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact by external CRM ID for business {BusinessId}: {ExternalCRMId}")]
    private static partial void LogGetByExternalId(ILogger logger, Guid businessId, string externalCRMId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting all contacts for business {BusinessId} with status={Status}, assignedTo={AssignedToUserId}")]
    private static partial void LogGetAll(ILogger logger, Guid businessId, ContactStatus? status, Guid? assignedToUserId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Searching contacts for business {BusinessId} with query: {Query}")]
    private static partial void LogSearch(ILogger logger, Guid businessId, string query);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contacts modified since {Since} for business {BusinessId}")]
    private static partial void LogGetModifiedSince(ILogger logger, Guid businessId, DateTime since);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating contact for business {BusinessId}: {Email}")]
    private static partial void LogCreate(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created contact {ContactId} for business {BusinessId}")]
    private static partial void LogCreated(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating contact {ContactId} for business {BusinessId}")]
    private static partial void LogUpdate(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated contact {ContactId} for business {BusinessId}")]
    private static partial void LogUpdated(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleting contact {ContactId}")]
    private static partial void LogDelete(ILogger logger, Guid contactId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleted contact {ContactId} for business {BusinessId}")]
    private static partial void LogDeleted(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Counting contacts for business {BusinessId} with status={Status}")]
    private static partial void LogCount(ILogger logger, Guid businessId, ContactStatus? status);
}
