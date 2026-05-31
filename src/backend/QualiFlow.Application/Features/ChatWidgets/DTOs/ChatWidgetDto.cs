// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.ChatWidgets.DTOs;

/// <summary>
/// DTO for chat widget response.
/// </summary>
public record ChatWidgetDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string WidgetKey { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public string? AllowedDomains { get; init; }
    public string? PrimaryColor { get; init; }
    public string? Position { get; init; }
    public string? GreetingMessage { get; init; }
    public string? OfflineMessage { get; init; }
    public bool ShowPreChatForm { get; init; }
    public string? PreChatFormFieldsJson { get; init; }
    public bool EnableAIResponse { get; init; }
    public int SessionTimeoutMinutes { get; init; }
    public string? BusinessHoursJson { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create a chat widget.
/// </summary>
public record CreateChatWidgetRequest
{
    public string Name { get; init; } = string.Empty;
    public string? AllowedDomains { get; init; }
    public string? PrimaryColor { get; init; }
    public string? Position { get; init; }
    public string? GreetingMessage { get; init; }
    public string? OfflineMessage { get; init; }
    public bool ShowPreChatForm { get; init; } = true;
    public string? PreChatFormFieldsJson { get; init; }
    public bool EnableAIResponse { get; init; } = true;
    public int SessionTimeoutMinutes { get; init; } = 30;
    public string? BusinessHoursJson { get; init; }
    public string? CustomCss { get; init; }
}

/// <summary>
/// Request to update a chat widget.
/// </summary>
public record UpdateChatWidgetRequest
{
    public string? Name { get; init; }
    public bool? IsActive { get; init; }
    public string? AllowedDomains { get; init; }
    public string? PrimaryColor { get; init; }
    public string? Position { get; init; }
    public string? GreetingMessage { get; init; }
    public string? OfflineMessage { get; init; }
    public bool? ShowPreChatForm { get; init; }
    public string? PreChatFormFieldsJson { get; init; }
    public bool? EnableAIResponse { get; init; }
    public int? SessionTimeoutMinutes { get; init; }
    public string? BusinessHoursJson { get; init; }
    public string? CustomCss { get; init; }
}

/// <summary>
/// Public widget configuration for embedding.
/// </summary>
public record PublicChatWidgetConfigDto
{
    public string WidgetKey { get; init; } = string.Empty;
    public string? PrimaryColor { get; init; }
    public string? Position { get; init; }
    public string? GreetingMessage { get; init; }
    public string? OfflineMessage { get; init; }
    public bool ShowPreChatForm { get; init; }
    public IReadOnlyCollection<PreChatFormField>? PreChatFormFields { get; init; }
    public bool IsOnline { get; init; }
    public string? CustomCss { get; init; }
}

/// <summary>
/// Pre-chat form field definition.
/// </summary>
public record PreChatFormField
{
    public string Name { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Type { get; init; } = "text";
    public bool Required { get; init; }
    public string? Placeholder { get; init; }
    public IReadOnlyCollection<string>? Options { get; init; }
}

