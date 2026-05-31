using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Deal entity operations.
/// </summary>
public partial class DealRepository(
    QualiFlowDbContext context,
    ILogger<DealRepository> logger) : IDealRepository
{
    /// <inheritdoc />
    public Task<Deal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        LogGetById(logger, id);

        return context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public Task<Deal?> GetByExternalIdAsync(Guid businessId, string externalCRMId, CancellationToken cancellationToken = default)
    {
        LogGetByExternalId(logger, businessId, externalCRMId);

        return context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .FirstOrDefaultAsync(d => d.BusinessId == businessId && d.ExternalCRMId == externalCRMId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Deal>> GetAllAsync(
        Guid businessId,
        DealStage? stage = null,
        Guid? contactId = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default)
    {
        LogGetAll(logger, businessId, stage, contactId, assignedToUserId);

        var query = context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId);

        if (stage.HasValue)
        {
            query = query.Where(d => d.Stage == stage.Value);
        }

        if (contactId.HasValue)
        {
            query = query.Where(d => d.ContactId == contactId.Value);
        }

        if (assignedToUserId.HasValue)
        {
            query = query.Where(d => d.AssignedToUserId == assignedToUserId.Value);
        }

        return await query
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Deal>> GetPipelineAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGetPipeline(logger, businessId);

        return await context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId)
            .Where(d => d.Stage != DealStage.Won && d.Stage != DealStage.Lost)
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .OrderBy(d => d.Stage)
            .ThenByDescending(d => d.Value)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Deal>> GetByStageAsync(Guid businessId, DealStage stage, CancellationToken cancellationToken = default)
    {
        LogGetByStage(logger, businessId, stage);

        return await context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId)
            .Where(d => d.Stage == stage)
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .OrderByDescending(d => d.Value)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Deal>> GetByContactAsync(Guid contactId, CancellationToken cancellationToken = default)
    {
        LogGetByContact(logger, contactId);

        return await context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Where(d => d.ContactId == contactId)
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Deal>> GetModifiedSinceAsync(Guid businessId, DateTime since, CancellationToken cancellationToken = default)
    {
        LogGetModifiedSince(logger, businessId, since);

        return await context.Deals
            .AsNoTracking()
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId)
            .Where(d => d.UpdatedAt >= since)
            .Include(d => d.Business)
            .Include(d => d.Contact)
            .Include(d => d.AssignedToUser)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Deal> CreateAsync(Deal deal, CancellationToken cancellationToken = default)
    {
        LogCreate(logger, deal.BusinessId, deal.Title);

        context.Deals.Add(deal);
        await context.SaveChangesAsync(cancellationToken);

        LogCreated(logger, deal.Id, deal.BusinessId);

        return deal;
    }

    /// <inheritdoc />
    public async Task<Deal> UpdateAsync(Deal deal, CancellationToken cancellationToken = default)
    {
        LogUpdate(logger, deal.Id, deal.BusinessId);

        deal.UpdatedAt = DateTime.UtcNow;
        context.Deals.Update(deal);
        await context.SaveChangesAsync(cancellationToken);

        LogUpdated(logger, deal.Id, deal.BusinessId);

        return deal;
    }

    /// <inheritdoc />
    public async Task<Deal> MoveToStageAsync(Guid id, DealStage newStage, CancellationToken cancellationToken = default)
    {
        LogMoveToStage(logger, id, newStage);

        var deal = await context.Deals
            .FirstOrDefaultAsync(d => d.Id == id && d.DeletedAt == null, cancellationToken);

        if (deal == null)
        {
            throw new InvalidOperationException($"Deal {id} not found or already deleted.");
        }

        var oldStage = deal.Stage;
        deal.Stage = newStage;
        deal.UpdatedAt = DateTime.UtcNow;

        // Set ActualCloseDate when moving to Won or Lost
        if ((newStage == DealStage.Won || newStage == DealStage.Lost) && deal.ActualCloseDate == null)
        {
            deal.ActualCloseDate = DateTime.UtcNow;
        }

        // Clear ActualCloseDate if moving back from Won/Lost to an open stage
        if (oldStage is DealStage.Won or DealStage.Lost &&
            newStage is not DealStage.Won and not DealStage.Lost)
        {
            deal.ActualCloseDate = null;
        }

        await context.SaveChangesAsync(cancellationToken);

        LogMovedToStage(logger, id, oldStage, newStage);

        return deal;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        LogDelete(logger, id);

        var deal = await context.Deals
            .FirstOrDefaultAsync(d => d.Id == id && d.DeletedAt == null, cancellationToken);

        if (deal != null)
        {
            deal.DeletedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);

            LogDeleted(logger, id, deal.BusinessId);
        }
    }

    /// <inheritdoc />
    public Task<int> CountAsync(Guid businessId, DealStage? stage = null, CancellationToken cancellationToken = default)
    {
        LogCount(logger, businessId, stage);

        var query = context.Deals
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId);

        if (stage.HasValue)
        {
            query = query.Where(d => d.Stage == stage.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<decimal> GetTotalPipelineValueAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGetTotalPipelineValue(logger, businessId);

        var total = await context.Deals
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId)
            .Where(d => d.Stage != DealStage.Won && d.Stage != DealStage.Lost)
            .SumAsync(d => d.Value, cancellationToken);

        return total;
    }

    /// <inheritdoc />
    public async Task<decimal> GetWeightedPipelineValueAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGetWeightedPipelineValue(logger, businessId);

        var deals = await context.Deals
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId)
            .Where(d => d.Stage != DealStage.Won && d.Stage != DealStage.Lost)
            .Select(d => new { d.Value, d.Probability })
            .ToListAsync(cancellationToken);

        var weightedValue = deals.Sum(d => d.Value * (d.Probability / 100m));

        return weightedValue;
    }

    /// <inheritdoc />
    public async Task<decimal> GetWinRateAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGetWinRate(logger, businessId);

        var closedDeals = await context.Deals
            .Where(d => d.DeletedAt == null)
            .Where(d => d.BusinessId == businessId)
            .Where(d => d.Stage == DealStage.Won || d.Stage == DealStage.Lost)
            .ToListAsync(cancellationToken);

        if (closedDeals.Count == 0)
        {
            return 0;
        }

        var wonDeals = closedDeals.Count(d => d.Stage == DealStage.Won);
        var winRate = (decimal)wonDeals / closedDeals.Count * 100;

        return Math.Round(winRate, 2);
    }

    // ============================================================================
    // LoggerMessage Source Generators (High Performance Logging)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deal by ID: {DealId}")]
    private static partial void LogGetById(ILogger logger, Guid dealId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deal by external CRM ID for business {BusinessId}: {ExternalCRMId}")]
    private static partial void LogGetByExternalId(ILogger logger, Guid businessId, string externalCRMId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting all deals for business {BusinessId} with stage={Stage}, contactId={ContactId}, assignedTo={AssignedToUserId}")]
    private static partial void LogGetAll(ILogger logger, Guid businessId, DealStage? stage, Guid? contactId, Guid? assignedToUserId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting pipeline deals for business {BusinessId}")]
    private static partial void LogGetPipeline(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deals by stage for business {BusinessId}: {Stage}")]
    private static partial void LogGetByStage(ILogger logger, Guid businessId, DealStage stage);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deals for contact {ContactId}")]
    private static partial void LogGetByContact(ILogger logger, Guid contactId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deals modified since {Since} for business {BusinessId}")]
    private static partial void LogGetModifiedSince(ILogger logger, Guid businessId, DateTime since);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating deal for business {BusinessId}: {Title}")]
    private static partial void LogCreate(ILogger logger, Guid businessId, string title);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created deal {DealId} for business {BusinessId}")]
    private static partial void LogCreated(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating deal {DealId} for business {BusinessId}")]
    private static partial void LogUpdate(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated deal {DealId} for business {BusinessId}")]
    private static partial void LogUpdated(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Moving deal {DealId} to stage {NewStage}")]
    private static partial void LogMoveToStage(ILogger logger, Guid dealId, DealStage newStage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Moved deal {DealId} from {OldStage} to {NewStage}")]
    private static partial void LogMovedToStage(ILogger logger, Guid dealId, DealStage oldStage, DealStage newStage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleting deal {DealId}")]
    private static partial void LogDelete(ILogger logger, Guid dealId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleted deal {DealId} for business {BusinessId}")]
    private static partial void LogDeleted(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Counting deals for business {BusinessId} with stage={Stage}")]
    private static partial void LogCount(ILogger logger, Guid businessId, DealStage? stage);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting total pipeline value for business {BusinessId}")]
    private static partial void LogGetTotalPipelineValue(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting weighted pipeline value for business {BusinessId}")]
    private static partial void LogGetWeightedPipelineValue(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting win rate for business {BusinessId}")]
    private static partial void LogGetWinRate(ILogger logger, Guid businessId);
}
