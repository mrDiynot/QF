using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Contact entity operations.
/// </summary>
public interface IContactRepository
{
    /// <summary>
    /// Gets a contact by ID.
    /// </summary>
    /// <param name="id">The contact ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The contact if found, otherwise null.</returns>
    Task<Contact?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a contact by email within a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="email">The contact email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The contact if found, otherwise null.</returns>
    Task<Contact?> GetByEmailAsync(Guid businessId, string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a contact by external CRM ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="externalCRMId">The external CRM contact ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The contact if found, otherwise null.</returns>
    Task<Contact?> GetByExternalIdAsync(Guid businessId, string externalCRMId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all contacts for a business with optional filters.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="assignedToUserId">Optional assigned user filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of contacts.</returns>
    Task<IEnumerable<Contact>> GetAllAsync(
        Guid businessId,
        ContactStatus? status = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches contacts by name, email, or company.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="query">Search query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of matching contacts.</returns>
    Task<IEnumerable<Contact>> SearchAsync(Guid businessId, string query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets contacts modified since a specific date (for sync).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="since">The date to filter from.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of contacts modified since the specified date.</returns>
    Task<IEnumerable<Contact>> GetModifiedSinceAsync(Guid businessId, DateTime since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new contact.
    /// </summary>
    /// <param name="contact">The contact to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created contact.</returns>
    Task<Contact> CreateAsync(Contact contact, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing contact.
    /// </summary>
    /// <param name="contact">The contact to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated contact.</returns>
    Task<Contact> UpdateAsync(Contact contact, CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft deletes a contact.
    /// </summary>
    /// <param name="id">The contact ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Counts contacts for a business with optional status filter.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Count of contacts.</returns>
    Task<int> CountAsync(Guid businessId, ContactStatus? status = null, CancellationToken cancellationToken = default);
}
