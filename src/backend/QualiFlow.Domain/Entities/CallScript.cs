// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an AI call script configuration for a business.
/// </summary>
public class CallScript : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the script name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the script description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the greeting message the AI uses to start the call.
    /// </summary>
    public string GreetingMessage { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the voicemail message to leave if no one answers.
    /// </summary>
    public string VoicemailMessage { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the closing message the AI uses to end the call.
    /// </summary>
    public string ClosingMessage { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the qualifying questions as a JSON array.
    /// Example: ["What is your timeline?", "What is your budget?"].
    /// </summary>
    public string QuestionsJson { get; set; } = "[]";

    /// <summary>
    /// Gets or sets voice settings as a JSON object.
    /// Example: {"voiceId": "alloy", "speed": 1.0, "pitch": 1.0}.
    /// </summary>
    public string VoiceSettingsJson { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the AI system prompt for conversation context.
    /// </summary>
    public string? SystemPrompt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is the default script.
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this script is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this script belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the outbound calls that use this script.
    /// </summary>
    public ICollection<OutboundCall> OutboundCalls { get; } = [];
}

