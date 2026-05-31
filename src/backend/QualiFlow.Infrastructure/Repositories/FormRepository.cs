using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Form entity operations.
/// Enforces multi-tenancy by filtering all queries by BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger instance.</param>
public partial class FormRepository(
    QualiFlowDbContext context,
    ILogger<FormRepository> logger) : IFormRepository
{
    /// <inheritdoc />
    public Task<Form?> GetByIdAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        LogGettingForm(logger, formId, businessId);

        // Sprint 19: Performance optimization - Don't load all submissions by default
        return context.Forms
            .AsNoTracking()
            .Where(f => f.BusinessId == businessId && f.Id == formId && f.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<Form?> GetBySlugAsync(
        Guid businessId,
        string slug,
        CancellationToken cancellationToken = default)
    {
        LogGettingFormBySlug(logger, slug, businessId);

        return context.Forms
            .AsNoTracking()
            .Where(f => f.BusinessId == businessId && f.Slug == slug && f.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Form>> GetAllAsync(
        Guid businessId,
        FormStatus? status = null,
        bool? isActive = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingForms(logger, businessId, status, isActive, skip, take);

        var query = context.Forms
            .AsNoTracking()
            .Where(f => f.BusinessId == businessId && f.DeletedAt == null);

        if (status.HasValue)
        {
            query = query.Where(f => f.Status == status.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(f => f.IsActive == isActive.Value);
        }

        return await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        FormStatus? status = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingFormCount(logger, businessId, status, isActive);

        var query = context.Forms
            .Where(f => f.BusinessId == businessId && f.DeletedAt == null);

        if (status.HasValue)
        {
            query = query.Where(f => f.Status == status.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(f => f.IsActive == isActive.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Form> AddAsync(Form form, CancellationToken cancellationToken = default)
    {
        LogAddingForm(logger, form.Name, form.BusinessId);

        await context.Forms.AddAsync(form, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return form;
    }

    /// <inheritdoc />
    public Task UpdateAsync(Form form, CancellationToken cancellationToken = default)
    {
        LogUpdatingForm(logger, form.Id, form.BusinessId);

        form.UpdatedAt = DateTime.UtcNow;
        context.Forms.Update(form);
        return context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingForm(logger, formId, businessId);

        var form = await context.Forms
            .Where(f => f.BusinessId == businessId && f.Id == formId && f.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (form == null)
        {
            LogFormNotFound(logger, formId, businessId);
            return false;
        }

        form.DeletedAt = DateTime.UtcNow;
        context.Forms.Update(form);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc />
    public Task<bool> SlugExistsAsync(
        Guid businessId,
        string slug,
        Guid? excludeFormId = null,
        CancellationToken cancellationToken = default)
    {
        LogCheckingSlugExists(logger, slug, businessId);

        var query = context.Forms
            .Where(f => f.BusinessId == businessId && f.Slug == slug && f.DeletedAt == null);

        if (excludeFormId.HasValue)
        {
            query = query.Where(f => f.Id != excludeFormId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<Form?> GetPublicFormBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        LogGettingPublicFormBySlug(logger, slug);

        return context.Forms
            .AsNoTracking()
            .Include(f => f.Business)
            .Where(f => f.Slug == slug &&
                        f.IsActive &&
                        f.Status == FormStatus.Published &&
                        f.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    // Logging methods

    [LoggerMessage(Level = LogLevel.Information, Message = "Getting public form by slug: {Slug}")]
    private static partial void LogGettingPublicFormBySlug(ILogger logger, string slug);
}

