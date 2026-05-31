// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.CallScripts.DTOs;

/// <summary>
/// Request to update an existing call script.
/// </summary>
public record UpdateCallScriptRequest
{
    /// <summary>
    /// Gets the script name.
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// Gets the script description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the greeting message.
    /// </summary>
    public string? GreetingMessage { get; init; }

    /// <summary>
    /// Gets the voicemail message.
    /// </summary>
    public string? VoicemailMessage { get; init; }

    /// <summary>
    /// Gets the closing message.
    /// </summary>
    public string? ClosingMessage { get; init; }

    /// <summary>
    /// Gets the qualifying questions.
    /// </summary>
    public IReadOnlyList<string>? Questions { get; init; }

    /// <summary>
    /// Gets the voice settings.
    /// </summary>
    public VoiceSettingsDto? VoiceSettings { get; init; }

    /// <summary>
    /// Gets the AI system prompt.
    /// </summary>
    public string? SystemPrompt { get; init; }

    /// <summary>
    /// Gets whether this should be the default script.
    /// </summary>
    public bool? IsDefault { get; init; }

    /// <summary>
    /// Gets whether this script is active.
    /// </summary>
    public bool? IsActive { get; init; }
}

