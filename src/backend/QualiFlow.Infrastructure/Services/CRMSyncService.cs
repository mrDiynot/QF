using System.Diagnostics.CodeAnalysis;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for synchronizing contacts and deals with external CRM systems.
/// Supports real-time, scheduled, and bi-directional sync strategies.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
[SuppressMessage("Performance", "CA1848:Use the LoggerMessage delegates", Justification = "LoggerMessage delegates add complexity without significant performance benefit for this use case")]
public class CRMSyncService : ICRMSyncService
{
    private readonly QualiFlowDbContext _context;
    private readonly ICRMAdapterFactory _adapterFactory;
    private readonly ILogger<CRMSyncService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    /// <summary>
    /// Initializes a new instance of the <see cref="CRMSyncService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="adapterFactory">The CRM adapter factory.</param>
    /// <param name="logger">The logger.</param>
    public CRMSyncService(
        QualiFlowDbContext context,
        ICRMAdapterFactory adapterFactory,
        ILogger<CRMSyncService> logger)
    {
        _context = context;
        _adapterFactory = adapterFactory;
        _logger = logger;

        // Retry policy: 3 attempts with exponential backoff (2s, 4s, 8s)
        _retryPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TaskCanceledException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning(
                        exception,
                        "CRM sync retry {RetryCount} after {Delay}s",
                        retryCount,
                        timeSpan.TotalSeconds);
                });
    }

    /// <inheritdoc/>
    public async Task<string> SyncContactAsync(
        Guid businessId,
        Contact contact,
        CancellationToken cancellationToken = default)
    {
        var provider = await GetActiveCRMProviderAsync(businessId, cancellationToken);
        var adapter = _adapterFactory.CreateAdapter(provider);

        try
        {
            var externalId = await _retryPolicy.ExecuteAsync(async () =>
                await adapter.SyncContactAsync(contact, cancellationToken));

            // Update contact with external CRM ID
            contact.ExternalCRMId = externalId;
            contact.ExternalCRMUrl = null; // BuildExternalUrl(provider, "contact", externalId);

            await _context.SaveChangesAsync(cancellationToken);

            // Update last sync timestamp
            provider.LastSyncAt = DateTime.UtcNow;
            provider.LastSyncError = null;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Contact {ContactId} synced to {Provider} CRM with external ID {ExternalId}",
                contact.Id,
                provider.ProviderType,
                externalId);

            return externalId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync contact {ContactId} to {Provider} CRM", contact.Id, provider.ProviderType);

            // Update last sync error
            provider.LastSyncError = ex.Message;
            await _context.SaveChangesAsync(cancellationToken);

            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<string> SyncDealAsync(
        Guid businessId,
        Deal deal,
        CancellationToken cancellationToken = default)
    {
        var provider = await GetActiveCRMProviderAsync(businessId, cancellationToken);
        var adapter = _adapterFactory.CreateAdapter(provider);

        try
        {
            var externalId = await _retryPolicy.ExecuteAsync(async () =>
                await adapter.SyncDealAsync(deal, cancellationToken));

            // Update deal with external CRM ID
            deal.ExternalCRMId = externalId;
            deal.ExternalCRMUrl = null; // BuildExternalUrl(provider, "deal", externalId);

            await _context.SaveChangesAsync(cancellationToken);

            // Update last sync timestamp
            provider.LastSyncAt = DateTime.UtcNow;
            provider.LastSyncError = null;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Deal {DealId} synced to {Provider} CRM with external ID {ExternalId}",
                deal.Id,
                provider.ProviderType,
                externalId);

            return externalId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync deal {DealId} to {Provider} CRM", deal.Id, provider.ProviderType);

            // Update last sync error
            provider.LastSyncError = ex.Message;
            await _context.SaveChangesAsync(cancellationToken);

            throw;
        }
    }

    private async Task<CRMProvider> GetActiveCRMProviderAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var provider = await _context.CRMProviders
            .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.IsActive, cancellationToken);

        if (provider == null)
        {
            throw new InvalidOperationException($"No active CRM provider found for business {businessId}");
        }

        return provider;
    }
}

