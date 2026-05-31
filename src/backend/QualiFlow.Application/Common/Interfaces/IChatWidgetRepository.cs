// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for ChatWidget entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IChatWidgetRepository
{
    /// <summary>
    /// Gets a chat widget by ID within the specified business context.
    /// </summary>
    /// <returns>The chat widget if found; otherwise, null.</returns>
    Task<ChatWidget?> GetByIdAsync(Guid businessId, Guid widgetId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a chat widget by widget key (public access).
    /// </summary>
    /// <returns>The chat widget if found; otherwise, null.</returns>
    Task<ChatWidget?> GetByWidgetKeyAsync(string widgetKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all chat widgets for a business with optional filtering.
    /// </summary>
    /// <returns>A list of chat widgets.</returns>
    Task<IReadOnlyList<ChatWidget>> GetAllAsync(
        Guid businessId,
        bool? isActive = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of chat widgets for a business.
    /// </summary>
    /// <returns>The count of chat widgets.</returns>
    Task<int> GetCountAsync(Guid businessId, bool? isActive = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new chat widget to the database.
    /// </summary>
    /// <returns>The added chat widget.</returns>
    Task<ChatWidget> AddAsync(ChatWidget widget, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing chat widget.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(ChatWidget widget, CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft deletes a chat widget.
    /// </summary>
    /// <returns>True if deleted; otherwise, false.</returns>
    Task<bool> DeleteAsync(Guid businessId, Guid widgetId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a widget key already exists.
    /// </summary>
    /// <returns>True if exists; otherwise, false.</returns>
    Task<bool> WidgetKeyExistsAsync(string widgetKey, CancellationToken cancellationToken = default);
}

