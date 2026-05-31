using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for FormSubmission entity operations.
/// Enforces multi-tenancy by filtering all queries by BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger instance.</param>
public partial class FormSubmissionRepository(
    QualiFlowDbContext context,
    ILogger<FormSubmissionRepository> logger) : IFormSubmissionRepository
{
    /// <inheritdoc />
    public Task<FormSubmission?> GetByIdAsync(
        Guid businessId,
        Guid submissionId,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubmission(logger, submissionId, businessId);

        return context.FormSubmissions
            .AsNoTracking()
            .Include(s => s.Form)
            .Include(s => s.Lead)
            .Where(s => s.BusinessId == businessId && s.Id == submissionId && s.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<FormSubmission>> GetByFormIdAsync(
        Guid businessId,
        Guid formId,
        bool? isProcessed = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubmissionsByForm(logger, formId, businessId, isProcessed, skip, take);

        var query = context.FormSubmissions
            .AsNoTracking()
            .Include(s => s.Lead)
            .Where(s => s.BusinessId == businessId && s.FormId == formId && s.DeletedAt == null);

        if (isProcessed.HasValue)
        {
            query = query.Where(s => s.IsProcessed == isProcessed.Value);
        }

        return await query
            .OrderByDescending(s => s.SubmittedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountByFormIdAsync(
        Guid businessId,
        Guid formId,
        bool? isProcessed = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubmissionCountByForm(logger, formId, businessId, isProcessed);

        var query = context.FormSubmissions
            .Where(s => s.BusinessId == businessId && s.FormId == formId && s.DeletedAt == null);

        if (isProcessed.HasValue)
        {
            query = query.Where(s => s.IsProcessed == isProcessed.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<FormSubmission>> GetAllAsync(
        Guid businessId,
        Guid? formId = null,
        bool? isProcessed = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubmissions(logger, businessId, formId, isProcessed, dateFrom, dateTo, skip, take);

        var query = context.FormSubmissions
            .AsNoTracking()
            .Include(s => s.Form)
            .Include(s => s.Lead)
            .Where(s => s.BusinessId == businessId && s.DeletedAt == null);

        query = ApplyFilters(query, formId, isProcessed, dateFrom, dateTo);

        return await query
            .OrderByDescending(s => s.SubmittedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        Guid? formId = null,
        bool? isProcessed = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubmissionCount(logger, businessId, formId, isProcessed, dateFrom, dateTo);

        var query = context.FormSubmissions
            .Where(s => s.BusinessId == businessId && s.DeletedAt == null);

        query = ApplyFilters(query, formId, isProcessed, dateFrom, dateTo);

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<FormSubmission> AddAsync(
        FormSubmission submission,
        CancellationToken cancellationToken = default)
    {
        LogAddingSubmission(logger, submission.FormId, submission.BusinessId);

        await context.FormSubmissions.AddAsync(submission, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return submission;
    }

    /// <inheritdoc />
    public Task UpdateAsync(FormSubmission submission, CancellationToken cancellationToken = default)
    {
        LogUpdatingSubmission(logger, submission.Id, submission.BusinessId);

        submission.UpdatedAt = DateTime.UtcNow;
        context.FormSubmissions.Update(submission);
        return context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> MarkAsProcessedAsync(
        Guid businessId,
        Guid submissionId,
        CancellationToken cancellationToken = default)
    {
        LogMarkingAsProcessed(logger, submissionId, businessId);

        var submission = await context.FormSubmissions
            .Where(s => s.BusinessId == businessId && s.Id == submissionId && s.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (submission == null)
        {
            LogSubmissionNotFound(logger, submissionId, businessId);
            return false;
        }

        submission.IsProcessed = true;
        submission.ProcessedAt = DateTime.UtcNow;
        submission.UpdatedAt = DateTime.UtcNow;
        context.FormSubmissions.Update(submission);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static IQueryable<FormSubmission> ApplyFilters(
        IQueryable<FormSubmission> query,
        Guid? formId,
        bool? isProcessed,
        DateTime? dateFrom,
        DateTime? dateTo)
    {
        if (formId.HasValue)
        {
            query = query.Where(s => s.FormId == formId.Value);
        }

        if (isProcessed.HasValue)
        {
            query = query.Where(s => s.IsProcessed == isProcessed.Value);
        }

        if (dateFrom.HasValue)
        {
            query = query.Where(s => s.SubmittedAt >= dateFrom.Value);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(s => s.SubmittedAt <= dateTo.Value);
        }

        return query;
    }
}

