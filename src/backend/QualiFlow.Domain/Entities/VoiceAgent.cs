// <copyright file="VoiceAgent.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an AI voice agent for automated calling.
/// </summary>
public class VoiceAgent : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the agent's display name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the agent's role (e.g., Lead Qualifier, Appointment Setter).
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the voice type (e.g., Female - Professional).
    /// </summary>
    public string VoiceType { get; set; } = "Female - Professional";

    /// <summary>
    /// Gets or sets the language.
    /// </summary>
    public string Language { get; set; } = "English (US)";

    /// <summary>
    /// Gets or sets the personality description.
    /// </summary>
    public string Personality { get; set; } = "Friendly and Professional";

    /// <summary>
    /// Gets or sets the speaking speed (0.5 to 2.0).
    /// </summary>
    public decimal SpeakingSpeed { get; set; } = 1.0m;

    /// <summary>
    /// Gets or sets a value indicating whether the agent is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the agent's script/prompt as JSON.
    /// </summary>
    public string? Script { get; set; }

    /// <summary>
    /// Gets or sets additional configuration as JSON.
    /// </summary>
    public string? Configuration { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this agent belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the voice calls made by this agent.
    /// </summary>
    public ICollection<VoiceCall> Calls { get; } = new List<VoiceCall>();
}
