// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.CallScripts.DTOs;

/// <summary>
/// DTO representing a call script.
/// </summary>
public record CallScriptDto
{
    /// <summary>
    /// Gets the script ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the business ID.
    /// </summary>
    public Guid BusinessId { get; init; }

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
    /// Gets a value indicating whether this is the default script.
    /// </summary>
    public bool IsDefault { get; init; }

    /// <summary>
    /// Gets a value indicating whether this script is active.
    /// </summary>
    public bool IsActive { get; init; }

    /// <summary>
    /// Gets when the script was created.
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets when the script was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Voice settings for AI calls.
/// </summary>
public record VoiceSettingsDto
{
    /// <summary>
    /// Gets the voice ID (e.g., "alloy", "echo", "fable", "onyx", "nova", "shimmer").
    /// </summary>
    public string VoiceId { get; init; } = "alloy";

    /// <summary>
    /// Gets the speech speed (0.25 to 4.0).
    /// </summary>
    public double Speed { get; init; } = 1.0;

    /// <summary>
    /// Gets the speech pitch (0.5 to 2.0).
    /// </summary>
    public double Pitch { get; init; } = 1.0;
}

