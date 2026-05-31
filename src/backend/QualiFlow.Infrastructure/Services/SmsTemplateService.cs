// -----------------------------------------------------------------------
// <copyright file="SmsTemplateService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.SmsTemplates.DTOs;
using QualiFlow.Application.Features.SmsTemplates.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for SMS template operations.
/// </summary>
public class SmsTemplateService : ISmsTemplateService
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="SmsTemplateService"/> class.
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    /// <param name="currentUserService">The current user service.</param>
    public SmsTemplateService(QualiFlowDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<SmsTemplateResponse>> GetAllAsync(string? category, string? search, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _dbContext.Set<SmsTemplate>()
            .Where(t => t.BusinessId == businessId && t.IsActive);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(t => t.Category == category);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(t => t.Name.Contains(search) || t.Content.Contains(search));
        }

        return await query
            .OrderByDescending(t => t.UsageCount)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => MapToResponse(t))
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SmsTemplateResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var template = await _dbContext.Set<SmsTemplate>()
            .Where(t => t.Id == id && t.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        return template == null ? null : MapToResponse(template);
    }

    /// <inheritdoc/>
    public async Task<SmsTemplateResponse> CreateAsync(CreateSmsTemplateRequest request, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var template = new SmsTemplate
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Name = request.Name,
            Content = request.Content,
            Category = request.Category,
            UsageCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.Set<SmsTemplate>().Add(template);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(template);
    }

    /// <inheritdoc/>
    public async Task<SmsTemplateResponse?> UpdateAsync(Guid id, UpdateSmsTemplateRequest request, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var template = await _dbContext.Set<SmsTemplate>()
            .FirstOrDefaultAsync(t => t.Id == id && t.BusinessId == businessId, cancellationToken);

        if (template == null)
        {
            return null;
        }

        if (request.Name != null)
        {
            template.Name = request.Name;
        }

        if (request.Content != null)
        {
            template.Content = request.Content;
        }

        if (request.Category != null)
        {
            template.Category = request.Category;
        }

        if (request.IsActive.HasValue)
        {
            template.IsActive = request.IsActive.Value;
        }

        template.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(template);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var template = await _dbContext.Set<SmsTemplate>()
            .FirstOrDefaultAsync(t => t.Id == id && t.BusinessId == businessId, cancellationToken);

        if (template == null)
        {
            return false;
        }

        _dbContext.Set<SmsTemplate>().Remove(template);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc/>
    public async Task<SmsTemplateResponse?> IncrementUsageAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var template = await _dbContext.Set<SmsTemplate>()
            .FirstOrDefaultAsync(t => t.Id == id && t.BusinessId == businessId, cancellationToken);

        if (template == null)
        {
            return null;
        }

        template.UsageCount++;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(template);
    }

    private static SmsTemplateResponse MapToResponse(SmsTemplate template)
    {
        return new SmsTemplateResponse(
            template.Id,
            template.Name,
            template.Content,
            template.Category,
            template.UsageCount,
            template.IsActive,
            template.CreatedAt,
            template.UpdatedAt);
    }
}
