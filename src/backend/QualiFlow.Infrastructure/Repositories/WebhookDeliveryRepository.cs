using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for WebhookDelivery entity operations.
/// Multi-tenancy is enforced automatically via EF Core global query filters through Webhook relationship.
/// All queries are automatically filtered by the current user's BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="currentUserService">Service for accessing current user context.</param>
/// <param name="logger">The logger instance.</param>
public partial class WebhookDeliveryRepository(
    QualiFlowDbContext context,
    ICurrentUserService currentUserService,
    ILogger<WebhookDeliveryRepository> logger) : IWebhookDeliveryRepository
{
    /// <inheritdoc />
    public Task<WebhookDelivery?> GetByIdAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingDelivery(logger, deliveryId, businessId);

        return context.WebhookDeliveries
            .AsNoTracking()
            .Include(d => d.Webhook)
            .Where(d => d.Id == deliveryId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<WebhookDelivery>> GetByWebhookIdAsync(
        Guid webhookId,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingDeliveriesByWebhook(logger, webhookId, businessId, skip, take);

        return await context.WebhookDeliveries
            .AsNoTracking()
            .Where(d => d.WebhookId == webhookId)
            .OrderByDescending(d => d.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method is called from a Hangfire background job without user context.
    /// It queries across ALL businesses (system-level job) and ignores tenant filtering.
    /// Multi-tenancy is not applicable here as this is a system maintenance job.
    /// </remarks>
    public async Task<IReadOnlyList<WebhookDelivery>> GetPendingRetriesAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        LogGettingPendingRetriesSystemJob(logger);

        // Use IgnoreQueryFilters to query across all businesses
        // This is a system-level job that processes retries for all tenants
        return await context.WebhookDeliveries
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(d => d.Webhook)
            .Where(d => d.DeletedAt == null &&
                       d.Status == WebhookDeliveryStatus.Failed &&
                       d.NextRetryAt != null &&
                       d.NextRetryAt <= now &&
                       d.Attempts < 5)
            .OrderBy(d => d.NextRetryAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddAsync(WebhookDelivery delivery, CancellationToken cancellationToken = default)
    {
        LogAddingDelivery(logger, delivery.Id, delivery.WebhookId);

        await context.WebhookDeliveries.AddAsync(delivery, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(WebhookDelivery delivery, CancellationToken cancellationToken = default)
    {
        LogUpdatingDelivery(logger, delivery.Id, delivery.WebhookId);

        context.WebhookDeliveries.Update(delivery);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> GetDeliveryCountAsync(
        Guid webhookId,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingDeliveryCount(logger, webhookId, businessId);

        return await context.WebhookDeliveries
            .Where(d => d.WebhookId == webhookId)
            .CountAsync(cancellationToken);
    }
}

