// <copyright file="AiResponseTemplateService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing AI response templates.
/// </summary>
public partial class AiResponseTemplateService : IAiResponseTemplateService
{
    private readonly QualiFlowDbContext _context;
    private readonly IOpenAIService _openAiService;
    private readonly ILogger<AiResponseTemplateService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AiResponseTemplateService"/> class.
    /// </summary>
    public AiResponseTemplateService(
        QualiFlowDbContext context,
        IOpenAIService openAiService,
        ILogger<AiResponseTemplateService> logger)
    {
        _context = context;
        _openAiService = openAiService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AiResponseTemplateDto>> GetAllAsync(
        Guid businessId,
        string? category = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<AiResponseTemplate>()
            .Where(t => t.BusinessId == businessId && t.DeletedAt == null);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(t => t.Category == category);
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        var templates = await query
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);

        return templates.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<AiResponseTemplateDto?> GetByIdAsync(
        Guid businessId,
        Guid templateId,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.Set<AiResponseTemplate>()
            .FirstOrDefaultAsync(
                t => t.Id == templateId && t.BusinessId == businessId && t.DeletedAt == null,
                cancellationToken);

        return template == null ? null : MapToDto(template);
    }

    /// <inheritdoc />
    public async Task<AiResponseTemplateDto> CreateAsync(
        Guid businessId,
        CreateAiResponseTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        var template = new AiResponseTemplate
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            Prompt = request.Prompt,
            VariablesJson = JsonSerializer.Serialize(request.Variables),
            Tone = request.Tone,
            MaxTokens = request.MaxTokens,
            SortOrder = request.SortOrder,
            IsActive = true,
        };

        _context.Set<AiResponseTemplate>().Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created AI response template {TemplateId} for business {BusinessId}",
            template.Id, businessId);

        return MapToDto(template);
    }

    /// <inheritdoc />
    public async Task<AiResponseTemplateDto?> UpdateAsync(
        Guid businessId,
        Guid templateId,
        UpdateAiResponseTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.Set<AiResponseTemplate>()
            .FirstOrDefaultAsync(
                t => t.Id == templateId && t.BusinessId == businessId && t.DeletedAt == null,
                cancellationToken);

        if (template == null)
        {
            return null;
        }

        if (request.Name != null)
        {
            template.Name = request.Name;
        }

        if (request.Description != null)
        {
            template.Description = request.Description;
        }

        if (request.Category != null)
        {
            template.Category = request.Category;
        }

        if (request.Prompt != null)
        {
            template.Prompt = request.Prompt;
        }

        if (request.Variables != null)
        {
            template.VariablesJson = JsonSerializer.Serialize(request.Variables);
        }

        if (request.Tone != null)
        {
            template.Tone = request.Tone;
        }

        if (request.MaxTokens.HasValue)
        {
            template.MaxTokens = request.MaxTokens.Value;
        }

        if (request.IsActive.HasValue)
        {
            template.IsActive = request.IsActive.Value;
        }

        if (request.SortOrder.HasValue)
        {
            template.SortOrder = request.SortOrder.Value;
        }

        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Updated AI response template {TemplateId} for business {BusinessId}",
            templateId, businessId);

        return MapToDto(template);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid templateId,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.Set<AiResponseTemplate>()
            .FirstOrDefaultAsync(
                t => t.Id == templateId && t.BusinessId == businessId && t.DeletedAt == null,
                cancellationToken);

        if (template == null)
        {
            return false;
        }

        template.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Deleted AI response template {TemplateId} for business {BusinessId}",
            templateId, businessId);

        return true;
    }

    /// <inheritdoc />
    public async Task<GenerateFromTemplateResponse> GenerateFromTemplateAsync(
        Guid businessId,
        Guid templateId,
        IDictionary<string, string> variables,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.Set<AiResponseTemplate>()
            .FirstOrDefaultAsync(
                t => t.Id == templateId && t.BusinessId == businessId && t.DeletedAt == null && t.IsActive,
                cancellationToken)
            ?? throw new InvalidOperationException($"Template {templateId} not found or inactive");

        // Replace variables in prompt
        var prompt = template.Prompt;
        foreach (var (key, value) in variables)
        {
            prompt = prompt.Replace($"{{{{{key}}}}}", value, StringComparison.OrdinalIgnoreCase);
        }

        // Add tone instruction
        var systemPrompt = $"You are a helpful assistant. Respond in a {template.Tone} tone. Be concise and helpful.";

        // Generate response using OpenAI
        var generatedText = await _openAiService.GenerateCompletionAsync(
            prompt,
            systemPrompt,
            template.MaxTokens,
            0.7f,
            cancellationToken);

        // Update usage count
        template.UsageCount++;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Generated response from template {TemplateId} for business {BusinessId}",
            templateId, businessId);

        return new GenerateFromTemplateResponse
        {
            GeneratedText = generatedText,
            TokensUsed = template.MaxTokens, // Approximate, actual tokens are tracked in OpenAI service
            TemplateId = templateId,
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<string>> GetCategoriesAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var categories = await _context.Set<AiResponseTemplate>()
            .Where(t => t.BusinessId == businessId && t.DeletedAt == null)
            .Select(t => t.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return categories;
    }

    private static AiResponseTemplateDto MapToDto(AiResponseTemplate template)
    {
        var variables = JsonSerializer.Deserialize<List<string>>(template.VariablesJson) ?? [];

        return new AiResponseTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Description = template.Description,
            Category = template.Category,
            Prompt = template.Prompt,
            Variables = variables,
            Tone = template.Tone,
            MaxTokens = template.MaxTokens,
            IsActive = template.IsActive,
            SortOrder = template.SortOrder,
            UsageCount = template.UsageCount,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
        };
    }
}
