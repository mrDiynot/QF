// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.CallScripts.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.CallScripts.Services;

/// <summary>
/// Service for call script operations.
/// </summary>
public partial class CallScriptService : ICallScriptService
{
    private readonly ICallScriptRepository _repository;
    private readonly ILogger<CallScriptService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CallScriptService"/> class.
    /// </summary>
    public CallScriptService(
        ICallScriptRepository repository,
        ILogger<CallScriptService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<CallScriptDto> CreateAsync(
        Guid businessId,
        CreateCallScriptRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingScript(_logger, businessId, request.Name);

        var script = new CallScript
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            GreetingMessage = request.GreetingMessage,
            VoicemailMessage = request.VoicemailMessage,
            ClosingMessage = request.ClosingMessage,
            QuestionsJson = JsonSerializer.Serialize(request.Questions),
            VoiceSettingsJson = request.VoiceSettings != null
                ? JsonSerializer.Serialize(request.VoiceSettings)
                : "{}",
            SystemPrompt = request.SystemPrompt,
            IsDefault = request.IsDefault,
            IsActive = true,
        };

        // If this is the default, clear any existing default
        if (request.IsDefault)
        {
            await _repository.ClearDefaultAsync(businessId, cancellationToken);
        }

        await _repository.AddAsync(script, cancellationToken);
        LogScriptCreated(_logger, script.Id);
        return MapToDto(script);
    }

    /// <inheritdoc />
    public async Task<CallScriptDto?> UpdateAsync(
        Guid businessId,
        Guid scriptId,
        UpdateCallScriptRequest request,
        CancellationToken cancellationToken = default)
    {
        var script = await _repository.GetByIdAsync(scriptId, cancellationToken);
        if (script == null || script.BusinessId != businessId)
        {
            return null;
        }

        if (request.Name != null)
        {
            script.Name = request.Name;
        }

        if (request.Description != null)
        {
            script.Description = request.Description;
        }

        if (request.GreetingMessage != null)
        {
            script.GreetingMessage = request.GreetingMessage;
        }

        if (request.VoicemailMessage != null)
        {
            script.VoicemailMessage = request.VoicemailMessage;
        }

        if (request.ClosingMessage != null)
        {
            script.ClosingMessage = request.ClosingMessage;
        }

        if (request.Questions != null)
        {
            script.QuestionsJson = JsonSerializer.Serialize(request.Questions);
        }

        if (request.VoiceSettings != null)
        {
            script.VoiceSettingsJson = JsonSerializer.Serialize(request.VoiceSettings);
        }

        if (request.SystemPrompt != null)
        {
            script.SystemPrompt = request.SystemPrompt;
        }

        if (request.IsDefault.HasValue)
        {
            if (request.IsDefault.Value)
            {
                await _repository.ClearDefaultAsync(businessId, cancellationToken);
            }

            script.IsDefault = request.IsDefault.Value;
        }

        if (request.IsActive.HasValue)
        {
            script.IsActive = request.IsActive.Value;
        }

        await _repository.UpdateAsync(script, cancellationToken);
        LogScriptUpdated(_logger, scriptId);
        return MapToDto(script);
    }

    /// <inheritdoc />
    public async Task<CallScriptDto?> GetByIdAsync(
        Guid businessId,
        Guid scriptId,
        CancellationToken cancellationToken = default)
    {
        var script = await _repository.GetByIdAsync(scriptId, cancellationToken);
        if (script == null || script.BusinessId != businessId)
        {
            return null;
        }

        return MapToDto(script);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CallScriptDto>> GetAllAsync(
        Guid businessId,
        bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var scripts = await _repository.GetAllAsync(businessId, includeInactive, cancellationToken);
        return scripts.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<CallScriptDto?> GetDefaultAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var script = await _repository.GetDefaultAsync(businessId, cancellationToken);
        return script != null ? MapToDto(script) : null;
    }

    /// <inheritdoc />
    public async Task<bool> SetAsDefaultAsync(
        Guid businessId,
        Guid scriptId,
        CancellationToken cancellationToken = default)
    {
        var script = await _repository.GetByIdAsync(scriptId, cancellationToken);
        if (script == null || script.BusinessId != businessId)
        {
            return false;
        }

        await _repository.ClearDefaultAsync(businessId, cancellationToken);
        script.IsDefault = true;
        await _repository.UpdateAsync(script, cancellationToken);
        LogScriptSetAsDefault(_logger, scriptId);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid scriptId,
        CancellationToken cancellationToken = default)
    {
        var script = await _repository.GetByIdAsync(scriptId, cancellationToken);
        if (script == null || script.BusinessId != businessId)
        {
            return false;
        }

        await _repository.DeleteAsync(script, cancellationToken);
        LogScriptDeleted(_logger, scriptId);
        return true;
    }

    private static CallScriptDto MapToDto(CallScript script)
    {
        var questions = !string.IsNullOrEmpty(script.QuestionsJson)
            ? JsonSerializer.Deserialize<List<string>>(script.QuestionsJson) ?? []
            : [];

        VoiceSettingsDto? voiceSettings = null;
        if (!string.IsNullOrEmpty(script.VoiceSettingsJson))
        {
            voiceSettings = JsonSerializer.Deserialize<VoiceSettingsDto>(script.VoiceSettingsJson);
        }

        return new CallScriptDto
        {
            Id = script.Id,
            BusinessId = script.BusinessId,
            Name = script.Name,
            Description = script.Description,
            GreetingMessage = script.GreetingMessage,
            VoicemailMessage = script.VoicemailMessage,
            ClosingMessage = script.ClosingMessage,
            Questions = questions,
            VoiceSettings = voiceSettings,
            SystemPrompt = script.SystemPrompt,
            IsDefault = script.IsDefault,
            IsActive = script.IsActive,
            CreatedAt = script.CreatedAt,
            UpdatedAt = script.UpdatedAt,
        };
    }

    // LoggerMessage delegates

    [LoggerMessage(EventId = 23001, Level = LogLevel.Information, Message = "Creating call script for business {BusinessId}: {Name}")]
    private static partial void LogCreatingScript(ILogger logger, Guid businessId, string name);

    [LoggerMessage(EventId = 23002, Level = LogLevel.Information, Message = "Call script {ScriptId} created")]
    private static partial void LogScriptCreated(ILogger logger, Guid scriptId);

    [LoggerMessage(EventId = 23003, Level = LogLevel.Information, Message = "Call script {ScriptId} updated")]
    private static partial void LogScriptUpdated(ILogger logger, Guid scriptId);

    [LoggerMessage(EventId = 23004, Level = LogLevel.Information, Message = "Call script {ScriptId} set as default")]
    private static partial void LogScriptSetAsDefault(ILogger logger, Guid scriptId);

    [LoggerMessage(EventId = 23005, Level = LogLevel.Information, Message = "Call script {ScriptId} deleted")]
    private static partial void LogScriptDeleted(ILogger logger, Guid scriptId);
}

