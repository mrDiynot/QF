using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Lead entity operations.
/// All operations are automatically scoped to the current user's business (tenant) via global query filters.
/// Multi-tenancy is enforced at the EF Core level - no manual BusinessId filtering required.
/// </summary>
public interface ILeadRepository
{
    /// <summary>
    /// Gets a lead by ID.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lead if found; otherwise, null.</returns>
    Task<Lead?> GetByIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a lead by email.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="email">The lead's email address.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lead if found; otherwise, null.</returns>
    Task<Lead?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all leads with optional filtering and pagination.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of leads.</returns>
    Task<IReadOnlyList<Lead>> GetAllAsync(
        LeadStatus? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of leads with optional filtering.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of leads.</returns>
    Task<int> GetCountAsync(
        LeadStatus? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new lead to the database.
    /// BusinessId is automatically set from the current user's context in SaveChangesAsync.
    /// </summary>
    /// <param name="lead">The lead to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added lead with generated ID.</returns>
    Task<Lead> AddAsync(Lead lead, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing lead in the database.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="lead">The lead to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Lead lead, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a lead from the database (soft delete).
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="leadId">The lead ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the lead was deleted; otherwise, false.</returns>
    Task<bool> DeleteAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a lead with the given email exists.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="email">The email to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if a lead with the email exists; otherwise, false.</returns>
    Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a lead by phone number for a specific business.
    /// This method bypasses the current user context to allow webhook processing.
    /// </summary>
    /// <param name="businessId">The business ID to scope the search.</param>
    /// <param name="phoneNumber">The phone number (E.164 format).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lead if found; otherwise, null.</returns>
    Task<Lead?> GetByPhoneNumberAsync(Guid businessId, string phoneNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a lead by email for a specific business.
    /// This method bypasses the current user context to allow form submission processing.
    /// </summary>
    /// <param name="businessId">The business ID to scope the search.</param>
    /// <param name="email">The email address.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lead if found; otherwise, null.</returns>
    Task<Lead?> GetByEmailForBusinessAsync(Guid businessId, string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new lead for a specific business.
    /// This method bypasses the current user context to allow webhook processing.
    /// </summary>
    /// <param name="lead">The lead to add (must have BusinessId set).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added lead with generated ID.</returns>
    Task<Lead> AddForBusinessAsync(Lead lead, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a lead by ID for a specific business.
    /// This method bypasses the current user context to allow background job processing.
    /// </summary>
    /// <param name="businessId">The business ID to scope the search.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lead if found; otherwise, null.</returns>
    Task<Lead?> GetByIdForBusinessAsync(Guid businessId, Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a lead for a specific business.
    /// This method bypasses the current user context to allow background job processing.
    /// </summary>
    /// <param name="businessId">The business ID for validation.</param>
    /// <param name="lead">The lead to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateForBusinessAsync(Guid businessId, Lead lead, CancellationToken cancellationToken = default);
}

