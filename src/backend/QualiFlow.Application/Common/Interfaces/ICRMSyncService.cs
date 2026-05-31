using System.Diagnostics.CodeAnalysis;

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for synchronizing contacts and deals with CRM systems.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public interface ICRMSyncService
{
    /// <summary>
    /// Syncs a contact to the active CRM system for the business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="contact">The contact to sync.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The external CRM ID.</returns>
    Task<string> SyncContactAsync(Guid businessId, Contact contact, CancellationToken cancellationToken = default);

    /// <summary>
    /// Syncs a deal to the active CRM system for the business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="deal">The deal to sync.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The external CRM ID.</returns>
    Task<string> SyncDealAsync(Guid businessId, Deal deal, CancellationToken cancellationToken = default);
}

