using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Webhook entity operations.
/// Multi-tenancy is enforced automatically via EF Core global query filters.
/// All queries are automatically filtered by the current user's BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="currentUserService">Service for accessing current user context.</param>
/// <param name="logger">The logger instance.</param>
public partial class WebhookRepository(
    QualiFlowDbContext context,
    ICurrentUserService currentUserService,
    ILogger<WebhookRepository> logger) : IWebhookRepository
{
    /// <inheritdoc />
    public Task<Webhook?> GetByIdAsync(
        Guid webhookId,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingWebhook(logger, webhookId, businessId);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        return context.Webhooks
            .AsNoTracking()
            .Include(w => w.Deliveries.OrderByDescending(d => d.CreatedAt).Take(10))
            .Where(w => w.BusinessId == businessId && w.Id == webhookId && w.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Webhook>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingAllWebhooks(logger, businessId);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        return await context.Webhooks
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId && w.DeletedAt == null)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Webhook>> GetActiveWebhooksAsync(CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingActiveWebhooks(logger, businessId);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        return await context.Webhooks
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId && w.Status == WebhookStatus.Active && w.DeletedAt == null)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Webhook>> GetByEventTypeAsync(
        string eventType,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingWebhooksByEvent(logger, eventType, businessId);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        return await context.Webhooks
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId &&
                       w.Status == WebhookStatus.Active &&
                       w.Events.Contains(eventType) &&
                       w.DeletedAt == null)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddAsync(Webhook webhook, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogAddingWebhook(logger, webhook.Id, businessId);

        await context.Webhooks.AddAsync(webhook, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Webhook webhook, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogUpdatingWebhook(logger, webhook.Id, businessId);

        context.Webhooks.Update(webhook);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Webhook webhook, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogDeletingWebhook(logger, webhook.Id, businessId);

        webhook.DeletedAt = DateTime.UtcNow;
        context.Webhooks.Update(webhook);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task IncrementFailureCountAsync(Guid webhookId, CancellationToken cancellationToken = default)
    {
        var webhook = await context.Webhooks
            .Where(w => w.Id == webhookId)
            .FirstOrDefaultAsync(cancellationToken);

        if (webhook == null)
        {
            return;
        }

        webhook.ConsecutiveFailures++;
        webhook.LastFailureAt = DateTime.UtcNow;

        // Auto-disable after 10 consecutive failures
        if (webhook.ConsecutiveFailures >= 10)
        {
            webhook.Status = WebhookStatus.Disabled;
            LogWebhookAutoDisabled(logger, webhookId, webhook.ConsecutiveFailures);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task ResetFailureCountAsync(Guid webhookId, CancellationToken cancellationToken = default)
    {
        var webhook = await context.Webhooks
            .Where(w => w.Id == webhookId)
            .FirstOrDefaultAsync(cancellationToken);

        if (webhook == null)
        {
            return;
        }

        webhook.ConsecutiveFailures = 0;
        webhook.LastSuccessAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
    }
}

