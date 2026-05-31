using System.Diagnostics.CodeAnalysis;

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Unified interface for all CRM adapters (built-in and external).
/// Implements the Adapter Pattern to support multiple CRM systems.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public interface ICRMAdapter
{
    /// <summary>
    /// Gets the CRM provider type.
    /// </summary>
    CRMProviderType ProviderType { get; }

    /// <summary>
    /// Syncs a contact to the CRM system.
    /// For built-in CRM, this saves to the database.
    /// For external CRMs, this calls the external API.
    /// </summary>
    /// <param name="contact">The contact to sync.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The external CRM ID (or QualiFlow ID for built-in CRM).</returns>
    Task<string> SyncContactAsync(Contact contact, CancellationToken cancellationToken = default);

    /// <summary>
    /// Syncs a deal to the CRM system.
    /// </summary>
    /// <param name="deal">The deal to sync.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The external CRM ID (or QualiFlow ID for built-in CRM).</returns>
    Task<string> SyncDealAsync(Deal deal, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a contact from the CRM system by external ID.
    /// </summary>
    /// <param name="externalId">The external CRM ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The contact, or null if not found.</returns>
    Task<Contact?> GetContactAsync(string externalId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a deal from the CRM system by external ID.
    /// </summary>
    /// <param name="externalId">The external CRM ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The deal, or null if not found.</returns>
    Task<Deal?> GetDealAsync(string externalId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets contacts modified since a specific date (for incremental sync).
    /// </summary>
    /// <param name="since">The date to get contacts modified since.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of modified contacts.</returns>
    Task<IEnumerable<Contact>> GetContactsModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets deals modified since a specific date (for incremental sync).
    /// </summary>
    /// <param name="since">The date to get deals modified since.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of modified deals.</returns>
    Task<IEnumerable<Deal>> GetDealsModifiedSinceAsync(DateTime since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates the CRM connection (OAuth token, API key, etc.).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if connection is valid, false otherwise.</returns>
    Task<bool> ValidateConnectionAsync(CancellationToken cancellationToken = default);
}

