// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Features.ChatWidgets.DTOs;

namespace QualiFlow.Application.Features.ChatWidgets.Services;

/// <summary>
/// Service interface for chat widget operations.
/// </summary>
public interface IChatWidgetService
{
    /// <summary>
    /// Creates a new chat widget.
    /// </summary>
    /// <returns>The created chat widget DTO.</returns>
    Task<ChatWidgetDto> CreateAsync(
        Guid businessId,
        CreateChatWidgetRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing chat widget.
    /// </summary>
    /// <returns>The updated chat widget DTO, or null if not found.</returns>
    Task<ChatWidgetDto?> UpdateAsync(
        Guid businessId,
        Guid widgetId,
        UpdateChatWidgetRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a chat widget by ID.
    /// </summary>
    /// <returns>The chat widget DTO, or null if not found.</returns>
    Task<ChatWidgetDto?> GetByIdAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all chat widgets for a business.
    /// </summary>
    /// <returns>A list of chat widget DTOs.</returns>
    Task<IReadOnlyList<ChatWidgetDto>> GetAllAsync(
        Guid businessId,
        bool? isActive = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the public configuration for a widget by key.
    /// </summary>
    /// <returns>The public widget configuration, or null if not found.</returns>
    Task<PublicChatWidgetConfigDto?> GetPublicConfigAsync(
        string widgetKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a chat widget.
    /// </summary>
    /// <returns>True if deleted; otherwise, false.</returns>
    Task<bool> DeleteAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Regenerates the widget key.
    /// </summary>
    /// <returns>The new widget key, or null if not found.</returns>
    Task<string?> RegenerateKeyAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the embed code for a widget.
    /// </summary>
    /// <returns>The embed code HTML snippet.</returns>
    Task<string?> GetEmbedCodeAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default);
}

