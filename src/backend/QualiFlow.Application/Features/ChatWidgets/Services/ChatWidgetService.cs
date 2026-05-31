// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.ChatWidgets.Services;

/// <summary>
/// Service for chat widget operations.
/// </summary>
public partial class ChatWidgetService : IChatWidgetService
{
    private readonly IChatWidgetRepository _repository;
    private readonly ILogger<ChatWidgetService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ChatWidgetService"/> class.
    /// </summary>
    public ChatWidgetService(
        IChatWidgetRepository repository,
        ILogger<ChatWidgetService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ChatWidgetDto> CreateAsync(
        Guid businessId,
        CreateChatWidgetRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingWidget(_logger, businessId, request.Name);

        var widgetKey = await GenerateUniqueWidgetKeyAsync(cancellationToken);

        var widget = new ChatWidget
        {
            BusinessId = businessId,
            Name = request.Name,
            WidgetKey = widgetKey,
            IsActive = true,
            AllowedDomains = request.AllowedDomains ?? string.Empty,
            PrimaryColor = request.PrimaryColor ?? "#3B82F6",
            Position = request.Position ?? "bottom-right",
            GreetingMessage = request.GreetingMessage ?? "Hello! How can we help you today?",
            OfflineMessage = request.OfflineMessage ?? "We're currently offline. Leave a message!",
            ShowPreChatForm = request.ShowPreChatForm,
            PreChatFormFieldsJson = request.PreChatFormFieldsJson ?? "[]",
            EnableAIResponse = request.EnableAIResponse,
            SessionTimeoutMinutes = request.SessionTimeoutMinutes,
            BusinessHoursJson = request.BusinessHoursJson ?? "{}",
            CustomCss = request.CustomCss ?? string.Empty,
        };

        await _repository.AddAsync(widget, cancellationToken);
        LogWidgetCreated(_logger, widget.Id, widgetKey);
        return MapToDto(widget);
    }

    /// <inheritdoc />
    public async Task<ChatWidgetDto?> UpdateAsync(
        Guid businessId,
        Guid widgetId,
        UpdateChatWidgetRequest request,
        CancellationToken cancellationToken = default)
    {
        var widget = await _repository.GetByIdAsync(businessId, widgetId, cancellationToken);
        if (widget == null)
        {
            return null;
        }

        if (request.Name != null)
        {
            widget.Name = request.Name;
        }

        if (request.IsActive.HasValue)
        {
            widget.IsActive = request.IsActive.Value;
        }

        if (request.AllowedDomains != null)
        {
            widget.AllowedDomains = request.AllowedDomains;
        }

        if (request.PrimaryColor != null)
        {
            widget.PrimaryColor = request.PrimaryColor;
        }

        if (request.Position != null)
        {
            widget.Position = request.Position;
        }

        if (request.GreetingMessage != null)
        {
            widget.GreetingMessage = request.GreetingMessage;
        }

        if (request.OfflineMessage != null)
        {
            widget.OfflineMessage = request.OfflineMessage;
        }

        if (request.ShowPreChatForm.HasValue)
        {
            widget.ShowPreChatForm = request.ShowPreChatForm.Value;
        }

        if (request.PreChatFormFieldsJson != null)
        {
            widget.PreChatFormFieldsJson = request.PreChatFormFieldsJson;
        }

        if (request.EnableAIResponse.HasValue)
        {
            widget.EnableAIResponse = request.EnableAIResponse.Value;
        }

        if (request.SessionTimeoutMinutes.HasValue)
        {
            widget.SessionTimeoutMinutes = request.SessionTimeoutMinutes.Value;
        }

        if (request.BusinessHoursJson != null)
        {
            widget.BusinessHoursJson = request.BusinessHoursJson;
        }

        if (request.CustomCss != null)
        {
            widget.CustomCss = request.CustomCss;
        }

        await _repository.UpdateAsync(widget, cancellationToken);
        LogWidgetUpdated(_logger, widgetId);
        return MapToDto(widget);
    }

    /// <inheritdoc />
    public async Task<ChatWidgetDto?> GetByIdAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        var widget = await _repository.GetByIdAsync(businessId, widgetId, cancellationToken);
        return widget != null ? MapToDto(widget) : null;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatWidgetDto>> GetAllAsync(
        Guid businessId,
        bool? isActive = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        var widgets = await _repository.GetAllAsync(businessId, isActive, skip, take, cancellationToken);
        return widgets.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<PublicChatWidgetConfigDto?> GetPublicConfigAsync(
        string widgetKey,
        CancellationToken cancellationToken = default)
    {
        var widget = await _repository.GetByWidgetKeyAsync(widgetKey, cancellationToken);
        if (widget == null || !widget.IsActive)
        {
            return null;
        }

        var preChatFields = !string.IsNullOrEmpty(widget.PreChatFormFieldsJson)
            ? JsonSerializer.Deserialize<List<PreChatFormField>>(widget.PreChatFormFieldsJson)
            : null;

        return new PublicChatWidgetConfigDto
        {
            WidgetKey = widget.WidgetKey,
            PrimaryColor = widget.PrimaryColor,
            Position = widget.Position,
            GreetingMessage = widget.GreetingMessage,
            OfflineMessage = widget.OfflineMessage,
            ShowPreChatForm = widget.ShowPreChatForm,
            PreChatFormFields = preChatFields,
            IsOnline = IsWithinBusinessHours(widget.BusinessHoursJson),
            CustomCss = widget.CustomCss,
        };
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        var result = await _repository.DeleteAsync(businessId, widgetId, cancellationToken);
        if (result)
        {
            LogWidgetDeleted(_logger, widgetId);
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<string?> RegenerateKeyAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        var widget = await _repository.GetByIdAsync(businessId, widgetId, cancellationToken);
        if (widget == null)
        {
            return null;
        }

        var newKey = await GenerateUniqueWidgetKeyAsync(cancellationToken);
        widget.WidgetKey = newKey;
        await _repository.UpdateAsync(widget, cancellationToken);
        LogWidgetKeyRegenerated(_logger, widgetId, newKey);
        return newKey;
    }

    /// <inheritdoc />
    public async Task<string?> GetEmbedCodeAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        var widget = await _repository.GetByIdAsync(businessId, widgetId, cancellationToken);
        if (widget == null)
        {
            return null;
        }

        return $$"""
            <!-- QualiFlow Chat Widget -->
            <script>
              (function(w,d,s,o,f,js,fjs){
                w['QualiFlowWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
                js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
                js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
              }(window,document,'script','qf','https://widget.qualiflow.com/widget.js'));
              qf('init', '{{widget.WidgetKey}}');
            </script>
            """;
    }

    private async Task<string> GenerateUniqueWidgetKeyAsync(CancellationToken cancellationToken)
    {
        string key;
        do
        {
            key = $"qf_{Convert.ToHexString(RandomNumberGenerator.GetBytes(12)).ToLowerInvariant()}";
        }
        while (await _repository.WidgetKeyExistsAsync(key, cancellationToken));

        return key;
    }

    private static bool IsWithinBusinessHours(string? businessHoursJson)
    {
        // Simplified: always online if no business hours configured
        // Business hours checking will be implemented in a future sprint
        if (string.IsNullOrEmpty(businessHoursJson) || businessHoursJson == "{}")
        {
            return true;
        }

        // For now, always return true - business hours parsing to be added later
        return true;
    }

    private static ChatWidgetDto MapToDto(ChatWidget widget)
    {
        return new ChatWidgetDto
        {
            Id = widget.Id,
            Name = widget.Name,
            WidgetKey = widget.WidgetKey,
            IsActive = widget.IsActive,
            AllowedDomains = widget.AllowedDomains,
            PrimaryColor = widget.PrimaryColor,
            Position = widget.Position,
            GreetingMessage = widget.GreetingMessage,
            OfflineMessage = widget.OfflineMessage,
            ShowPreChatForm = widget.ShowPreChatForm,
            PreChatFormFieldsJson = widget.PreChatFormFieldsJson,
            EnableAIResponse = widget.EnableAIResponse,
            SessionTimeoutMinutes = widget.SessionTimeoutMinutes,
            BusinessHoursJson = widget.BusinessHoursJson,
            CreatedAt = widget.CreatedAt,
            UpdatedAt = widget.UpdatedAt,
        };
    }

    [LoggerMessage(EventId = 24001, Level = LogLevel.Information, Message = "Creating chat widget for business {BusinessId}: {Name}")]
    private static partial void LogCreatingWidget(ILogger logger, Guid businessId, string name);

    [LoggerMessage(EventId = 24002, Level = LogLevel.Information, Message = "Chat widget {WidgetId} created with key {WidgetKey}")]
    private static partial void LogWidgetCreated(ILogger logger, Guid widgetId, string widgetKey);

    [LoggerMessage(EventId = 24003, Level = LogLevel.Information, Message = "Chat widget {WidgetId} updated")]
    private static partial void LogWidgetUpdated(ILogger logger, Guid widgetId);

    [LoggerMessage(EventId = 24004, Level = LogLevel.Information, Message = "Chat widget {WidgetId} deleted")]
    private static partial void LogWidgetDeleted(ILogger logger, Guid widgetId);

    [LoggerMessage(EventId = 24005, Level = LogLevel.Information, Message = "Chat widget {WidgetId} key regenerated to {NewKey}")]
    private static partial void LogWidgetKeyRegenerated(ILogger logger, Guid widgetId, string newKey);
}

