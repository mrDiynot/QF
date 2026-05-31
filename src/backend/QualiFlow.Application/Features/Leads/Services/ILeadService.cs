using QualiFlow.Application.Features.Leads.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.Services;

/// <summary>
/// Service interface for lead business logic operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface ILeadService
{
    /// <summary>
    /// Gets a paginated list of leads for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of leads.</returns>
    Task<PagedLeadResponse> GetLeadsAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 10,
        LeadStatus? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a lead by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The lead if found; otherwise, null.</returns>
    Task<LeadResponse?> GetLeadByIdAsync(
        Guid businessId,
        Guid leadId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new lead for the specified business.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="request">The lead creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created lead.</returns>
    Task<LeadResponse> CreateLeadAsync(
        Guid businessId,
        CreateLeadRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing lead.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID to update.</param>
    /// <param name="request">The lead update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated lead if found; otherwise, null.</returns>
    Task<LeadResponse?> UpdateLeadAsync(
        Guid businessId,
        Guid leadId,
        UpdateLeadRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a lead (soft delete).
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the lead was deleted; otherwise, false.</returns>
    Task<bool> DeleteLeadAsync(
        Guid businessId,
        Guid leadId,
        CancellationToken cancellationToken = default);
}

