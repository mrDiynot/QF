// <copyright file="VoiceAgentDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.VoiceAgents.DTOs;

/// <summary>
/// DTO for voice agent data.
/// </summary>
public record VoiceAgentDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string VoiceType { get; init; } = string.Empty;
    public string Language { get; init; } = string.Empty;
    public string Personality { get; init; } = string.Empty;
    public decimal SpeakingSpeed { get; init; }
    public bool IsActive { get; init; }
    public int CallsToday { get; init; }
    public decimal SuccessRate { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request to create a voice agent.
/// </summary>
public record CreateVoiceAgentRequest
{
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string VoiceType { get; init; } = "Female - Professional";
    public string Language { get; init; } = "English (US)";
    public string Personality { get; init; } = "Friendly and Professional";
    public decimal SpeakingSpeed { get; init; } = 1.0m;
    public string? Script { get; init; }
}

/// <summary>
/// Request to update a voice agent.
/// </summary>
public record UpdateVoiceAgentRequest
{
    public string? Name { get; init; }
    public string? Role { get; init; }
    public string? VoiceType { get; init; }
    public string? Language { get; init; }
    public string? Personality { get; init; }
    public decimal? SpeakingSpeed { get; init; }
    public bool? IsActive { get; init; }
    public string? Script { get; init; }
}

/// <summary>
/// DTO for voice call data.
/// </summary>
public record VoiceCallDto
{
    public Guid Id { get; init; }
    public Guid VoiceAgentId { get; init; }
    public string AgentName { get; init; } = string.Empty;
    public string ContactName { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public string Direction { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? Outcome { get; init; }
    public int DurationSeconds { get; init; }
    public string Duration { get; init; } = string.Empty;
    public DateTime StartedAt { get; init; }
    public string? Transcript { get; init; }
    public string TimeAgo { get; init; } = string.Empty;
}

/// <summary>
/// Statistics for AI voice.
/// </summary>
public record VoiceStatsDto
{
    public int TotalCalls { get; init; }
    public string AverageDuration { get; init; } = string.Empty;
    public decimal SuccessRate { get; init; }
    public int MinutesUsed { get; init; }
    public int ActiveAgents { get; init; }
}
