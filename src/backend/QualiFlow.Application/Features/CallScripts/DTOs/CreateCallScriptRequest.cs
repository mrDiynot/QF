// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.CallScripts.DTOs;

/// <summary>
/// Request to create a new call script.
/// </summary>
public record CreateCallScriptRequest
{
    /// <summary>
    /// Gets the script name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the script description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the greeting message.
    /// </summary>
    public string GreetingMessage { get; init; } = string.Empty;

    /// <summary>
    /// Gets the voicemail message.
    /// </summary>
    public string VoicemailMessage { get; init; } = string.Empty;

    /// <summary>
    /// Gets the closing message.
    /// </summary>
    public string ClosingMessage { get; init; } = string.Empty;

    /// <summary>
    /// Gets the qualifying questions.
    /// </summary>
    public IReadOnlyList<string> Questions { get; init; } = [];

    /// <summary>
    /// Gets the voice settings.
    /// </summary>
    public VoiceSettingsDto? VoiceSettings { get; init; }

    /// <summary>
    /// Gets the AI system prompt.
    /// </summary>
    public string? SystemPrompt { get; init; }

    /// <summary>
    /// Gets a value indicating whether this should be the default script.
    /// </summary>
    public bool IsDefault { get; init; }
}

