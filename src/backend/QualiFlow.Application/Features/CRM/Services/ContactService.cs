using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.CRM.Services;

/// <summary>
/// Service implementation for Contact business logic.
/// </summary>
public partial class ContactService(
    IContactRepository contactRepository,
    ICurrentUserService currentUserService,
    ILogger<ContactService> logger) : IContactService
{
    /// <inheritdoc />
    public async Task<Contact?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        LogGettingContact(logger, id);

        var contact = await contactRepository.GetByIdAsync(id, cancellationToken);

        // Verify contact belongs to current business (multi-tenancy check)
        if (contact != null && contact.BusinessId != currentUserService.GetBusinessId())
        {
            LogUnauthorizedAccess(logger, id, contact.BusinessId, currentUserService.GetBusinessId());
            return null;
        }

        return contact;
    }

    /// <inheritdoc />
    public Task<Contact?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingContactByEmail(logger, businessId, email);

        return contactRepository.GetByEmailAsync(businessId, email, cancellationToken);
    }

    /// <inheritdoc />
    public Task<IEnumerable<Contact>> GetAllAsync(
        ContactStatus? status = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingAllContacts(logger, businessId, status, assignedToUserId);

        return contactRepository.GetAllAsync(businessId, status, assignedToUserId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<IEnumerable<Contact>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogSearchingContacts(logger, businessId, query);

        return contactRepository.SearchAsync(businessId, query, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Contact> CreateAsync(Contact contact, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        contact.BusinessId = businessId;

        LogCreatingContact(logger, businessId, contact.Email);

        // Check for duplicate email
        var existing = await contactRepository.GetByEmailAsync(businessId, contact.Email, cancellationToken);
        if (existing != null)
        {
            LogDuplicateEmail(logger, contact.Email, businessId);
            throw new InvalidOperationException($"A contact with email '{contact.Email}' already exists.");
        }

        var created = await contactRepository.CreateAsync(contact, cancellationToken);

        LogContactCreated(logger, created.Id, businessId);

        return created;
    }

    /// <inheritdoc />
    public async Task<Contact> UpdateAsync(Contact contact, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogUpdatingContact(logger, contact.Id, businessId);

        // Verify contact belongs to current business
        var existing = await contactRepository.GetByIdAsync(contact.Id, cancellationToken);
        if (existing == null || existing.BusinessId != businessId)
        {
            LogUnauthorizedUpdate(logger, contact.Id, businessId);
            throw new UnauthorizedAccessException($"Contact {contact.Id} not found or does not belong to current business.");
        }

        // Check for duplicate email if email changed
        if (!string.Equals(existing.Email, contact.Email, StringComparison.OrdinalIgnoreCase))
        {
            var duplicate = await contactRepository.GetByEmailAsync(businessId, contact.Email, cancellationToken);
            if (duplicate != null && duplicate.Id != contact.Id)
            {
                LogDuplicateEmail(logger, contact.Email, businessId);
                throw new InvalidOperationException($"A contact with email '{contact.Email}' already exists.");
            }
        }

        var updated = await contactRepository.UpdateAsync(contact, cancellationToken);

        LogContactUpdated(logger, contact.Id, businessId);

        return updated;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogDeletingContact(logger, id, businessId);

        // Verify contact belongs to current business
        var contact = await contactRepository.GetByIdAsync(id, cancellationToken);
        if (contact == null || contact.BusinessId != businessId)
        {
            LogUnauthorizedDelete(logger, id, businessId);
            throw new UnauthorizedAccessException($"Contact {id} not found or does not belong to current business.");
        }

        await contactRepository.DeleteAsync(id, cancellationToken);

        LogContactDeleted(logger, id, businessId);
    }

    /// <inheritdoc />
    public Task<Contact> ConvertFromLeadAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogConvertingLead(logger, leadId, businessId);

        // Lead conversion depends on ILeadRepository and mapping rules not yet implemented in this sprint.
        // Expose clear unsupported operation to satisfy analyzers and avoid misleading async behavior.
        throw new NotSupportedException("Converting a lead to a contact is not supported yet. This operation will be implemented when lead-to-contact mapping and repositories are available.");
    }

    /// <inheritdoc />
    public Task<int> CountAsync(ContactStatus? status = null, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogCountingContacts(logger, businessId, status);

        return contactRepository.CountAsync(businessId, status, cancellationToken);
    }

    // ============================================================================
    // LoggerMessage Source Generators
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact {ContactId}")]
    private static partial void LogGettingContact(ILogger logger, Guid contactId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting contact by email for business {BusinessId}: {Email}")]
    private static partial void LogGettingContactByEmail(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting all contacts for business {BusinessId} with status={Status}, assignedTo={AssignedToUserId}")]
    private static partial void LogGettingAllContacts(ILogger logger, Guid businessId, ContactStatus? status, Guid? assignedToUserId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Searching contacts for business {BusinessId} with query: {Query}")]
    private static partial void LogSearchingContacts(ILogger logger, Guid businessId, string query);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating contact for business {BusinessId}: {Email}")]
    private static partial void LogCreatingContact(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Contact {ContactId} created for business {BusinessId}")]
    private static partial void LogContactCreated(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating contact {ContactId} for business {BusinessId}")]
    private static partial void LogUpdatingContact(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Contact {ContactId} updated for business {BusinessId}")]
    private static partial void LogContactUpdated(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting contact {ContactId} for business {BusinessId}")]
    private static partial void LogDeletingContact(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Contact {ContactId} deleted for business {BusinessId}")]
    private static partial void LogContactDeleted(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Converting lead {LeadId} to contact for business {BusinessId}")]
    private static partial void LogConvertingLead(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Counting contacts for business {BusinessId} with status={Status}")]
    private static partial void LogCountingContacts(ILogger logger, Guid businessId, ContactStatus? status);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized access to contact {ContactId}. Contact business: {ContactBusinessId}, Current business: {CurrentBusinessId}")]
    private static partial void LogUnauthorizedAccess(ILogger logger, Guid contactId, Guid contactBusinessId, Guid currentBusinessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized update attempt for contact {ContactId} by business {BusinessId}")]
    private static partial void LogUnauthorizedUpdate(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized delete attempt for contact {ContactId} by business {BusinessId}")]
    private static partial void LogUnauthorizedDelete(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Duplicate email {Email} for business {BusinessId}")]
    private static partial void LogDuplicateEmail(ILogger logger, string email, Guid businessId);
}
