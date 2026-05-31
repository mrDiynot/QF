// -----------------------------------------------------------------------
// <copyright file="SmsTemplateResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.SmsTemplates.DTOs;

/// <summary>
/// SMS Template response DTO.
/// </summary>
/// <param name="Id">The template ID.</param>
/// <param name="Name">The template name.</param>
/// <param name="Content">The template content.</param>
/// <param name="Category">The template category.</param>
/// <param name="UsageCount">The usage count.</param>
/// <param name="IsActive">Whether the template is active.</param>
/// <param name="CreatedAt">The creation date.</param>
/// <param name="UpdatedAt">The last update date.</param>
public record SmsTemplateResponse(
    Guid Id,
    string Name,
    string Content,
    string Category,
    int UsageCount,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

/// <summary>
/// Request to create an SMS template.
/// </summary>
/// <param name="Name">The template name.</param>
/// <param name="Content">The template content.</param>
/// <param name="Category">The template category.</param>
public record CreateSmsTemplateRequest(
    string Name,
    string Content,
    string Category);

/// <summary>
/// Request to update an SMS template.
/// </summary>
/// <param name="Name">The template name.</param>
/// <param name="Content">The template content.</param>
/// <param name="Category">The template category.</param>
/// <param name="IsActive">Whether the template is active.</param>
public record UpdateSmsTemplateRequest(
    string? Name,
    string? Content,
    string? Category,
    bool? IsActive);
