// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Caching.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ChatWidget entity operations.
/// Enforces multi-tenancy by filtering all queries by BusinessId.
/// PERFORMANCE: Uses caching for widget key lookups to reduce DB hits.
/// </summary>
public partial class ChatWidgetRepository(
    QualiFlowDbContext context,
    ICacheService cacheService,
    ILogger<ChatWidgetRepository> logger) : IChatWidgetRepository
{
    private const string WidgetCacheKeyPrefix = "widget:key:";
    private static readonly TimeSpan WidgetCacheExpiration = TimeSpan.FromMinutes(5);

    /// <inheritdoc />
    public Task<ChatWidget?> GetByIdAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        LogGettingWidget(logger, widgetId, businessId);

        return context.ChatWidgets
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId && w.Id == widgetId && w.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ChatWidget?> GetByWidgetKeyAsync(
        string widgetKey,
        CancellationToken cancellationToken = default)
    {
        LogGettingWidgetByKey(logger, widgetKey);

        // PERFORMANCE: Check cache first for widget config
        var cacheKey = $"{WidgetCacheKeyPrefix}{widgetKey}";
        var cachedWidget = await cacheService.GetAsync<ChatWidget>(cacheKey, cancellationToken);
        if (cachedWidget != null)
        {
            return cachedWidget;
        }

        var widget = await context.ChatWidgets
            .AsNoTracking()
            .Where(w => w.WidgetKey == widgetKey && w.IsActive && w.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (widget != null)
        {
            await cacheService.SetAsync(cacheKey, widget, WidgetCacheExpiration, cancellationToken);
        }

        return widget;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatWidget>> GetAllAsync(
        Guid businessId,
        bool? isActive = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingWidgets(logger, businessId, isActive, skip, take);

        var query = context.ChatWidgets
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId && w.DeletedAt == null);

        if (isActive.HasValue)
        {
            query = query.Where(w => w.IsActive == isActive.Value);
        }

        return await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.ChatWidgets
            .Where(w => w.BusinessId == businessId && w.DeletedAt == null);

        if (isActive.HasValue)
        {
            query = query.Where(w => w.IsActive == isActive.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ChatWidget> AddAsync(
        ChatWidget widget,
        CancellationToken cancellationToken = default)
    {
        LogAddingWidget(logger, widget.Name, widget.BusinessId);

        context.ChatWidgets.Add(widget);
        await context.SaveChangesAsync(cancellationToken);

        return widget;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(
        ChatWidget widget,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingWidget(logger, widget.Id, widget.BusinessId);

        // PERFORMANCE: Invalidate cache on update
        await cacheService.RemoveAsync($"{WidgetCacheKeyPrefix}{widget.WidgetKey}", cancellationToken);

        widget.UpdatedAt = DateTime.UtcNow;
        context.ChatWidgets.Update(widget);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingWidget(logger, widgetId, businessId);

        var widget = await context.ChatWidgets
            .Where(w => w.BusinessId == businessId && w.Id == widgetId && w.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (widget == null)
        {
            return false;
        }

        // PERFORMANCE: Invalidate cache on delete
        await cacheService.RemoveAsync($"{WidgetCacheKeyPrefix}{widget.WidgetKey}", cancellationToken);

        widget.DeletedAt = DateTime.UtcNow;
        widget.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc />
    public Task<bool> WidgetKeyExistsAsync(
        string widgetKey,
        CancellationToken cancellationToken = default)
    {
        return context.ChatWidgets
            .AnyAsync(w => w.WidgetKey == widgetKey, cancellationToken);
    }
}

