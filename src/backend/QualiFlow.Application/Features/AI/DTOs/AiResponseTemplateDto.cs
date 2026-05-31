// <copyright file="AiResponseTemplateDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// DTO for AI response template data.
/// </summary>
public record AiResponseTemplateDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Category { get; init; } = "general";
    public string Prompt { get; init; } = string.Empty;
    public IReadOnlyList<string> Variables { get; init; } = [];
    public string Tone { get; init; } = "professional";
    public int MaxTokens { get; init; } = 150;
    public bool IsActive { get; init; } = true;
    public int SortOrder { get; init; }
    public int UsageCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create an AI response template.
/// </summary>
public record CreateAiResponseTemplateRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Category { get; init; } = "general";
    public string Prompt { get; init; } = string.Empty;
    public IReadOnlyList<string> Variables { get; init; } = [];
    public string Tone { get; init; } = "professional";
    public int MaxTokens { get; init; } = 150;
    public int SortOrder { get; init; }
}

/// <summary>
/// Request to update an AI response template.
/// </summary>
public record UpdateAiResponseTemplateRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Category { get; init; }
    public string? Prompt { get; init; }
    public IReadOnlyList<string>? Variables { get; init; }
    public string? Tone { get; init; }
    public int? MaxTokens { get; init; }
    public bool? IsActive { get; init; }
    public int? SortOrder { get; init; }
}

/// <summary>
/// Response for generating AI text using a template.
/// </summary>
public record GenerateFromTemplateResponse
{
    public string GeneratedText { get; init; } = string.Empty;
    public int TokensUsed { get; init; }
    public Guid TemplateId { get; init; }
}
