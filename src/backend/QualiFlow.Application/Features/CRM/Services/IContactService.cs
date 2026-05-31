using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.CRM.Services;

/// <summary>
/// Service interface for Contact business logic.
/// </summary>
public interface IContactService
{
    /// <summary>
    /// Gets a contact by ID.
    /// </summary>
    /// <param name="id">The contact ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The contact if found and belongs to current business, otherwise null.</returns>
    Task<Contact?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a contact by email within the current business.
    /// </summary>
    /// <param name="email">The contact email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The contact if found, otherwise null.</returns>
    Task<Contact?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all contacts for the current business with optional filters.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="assignedToUserId">Optional assigned user filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of contacts.</returns>
    Task<IEnumerable<Contact>> GetAllAsync(
        ContactStatus? status = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches contacts by name, email, or company.
    /// </summary>
    /// <param name="query">Search query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of matching contacts.</returns>
    Task<IEnumerable<Contact>> SearchAsync(string query, CancellationToken cancellationToken = default);

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
    /// Deletes a contact.
    /// </summary>
    /// <param name="id">The contact ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Converts a lead to a contact.
    /// </summary>
    /// <param name="leadId">The lead ID to convert.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created contact.</returns>
    Task<Contact> ConvertFromLeadAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Counts contacts for the current business with optional status filter.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Count of contacts.</returns>
    Task<int> CountAsync(ContactStatus? status = null, CancellationToken cancellationToken = default);
}
