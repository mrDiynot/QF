using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.CRM.Services;

/// <summary>
/// Service implementation for Deal business logic and pipeline management.
/// </summary>
public partial class DealService(
    IDealRepository dealRepository,
    IContactRepository contactRepository,
    ICurrentUserService currentUserService,
    ILogger<DealService> logger) : IDealService
{
    /// <inheritdoc />
    public async Task<Deal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        LogGettingDeal(logger, id);

        var deal = await dealRepository.GetByIdAsync(id, cancellationToken);

        // Verify deal belongs to current business (multi-tenancy check)
        if (deal != null && deal.BusinessId != currentUserService.GetBusinessId())
        {
            LogUnauthorizedAccess(logger, id, deal.BusinessId, currentUserService.GetBusinessId());
            return null;
        }

        return deal;
    }

    /// <inheritdoc />
    public Task<IEnumerable<Deal>> GetAllAsync(
        DealStage? stage = null,
        Guid? contactId = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingAllDeals(logger, businessId, stage, contactId, assignedToUserId);

        return dealRepository.GetAllAsync(businessId, stage, contactId, assignedToUserId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<IEnumerable<Deal>> GetPipelineAsync(CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingPipeline(logger, businessId);

        return dealRepository.GetPipelineAsync(businessId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<IEnumerable<Deal>> GetByStageAsync(DealStage stage, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingDealsByStage(logger, businessId, stage);

        return dealRepository.GetByStageAsync(businessId, stage, cancellationToken);
    }

    /// <inheritdoc />
    public Task<IEnumerable<Deal>> GetByContactAsync(Guid contactId, CancellationToken cancellationToken = default)
    {
        LogGettingDealsByContact(logger, contactId);

        return dealRepository.GetByContactAsync(contactId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Deal> CreateAsync(Deal deal, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        deal.BusinessId = businessId;

        LogCreatingDeal(logger, businessId, deal.Title);

        // Verify contact belongs to current business
        var contact = await contactRepository.GetByIdAsync(deal.ContactId, cancellationToken);
        if (contact == null || contact.BusinessId != businessId)
        {
            LogInvalidContact(logger, deal.ContactId, businessId);
            throw new InvalidOperationException($"Contact {deal.ContactId} not found or does not belong to current business.");
        }

        // Ensure probability is between 0-100
        if (deal.Probability < 0 || deal.Probability > 100)
        {
            LogInvalidProbability(logger, deal.Probability);
            throw new ArgumentException("Probability must be between 0 and 100.", nameof(deal));
        }

        var created = await dealRepository.CreateAsync(deal, cancellationToken);

        LogDealCreated(logger, created.Id, businessId);

        return created;
    }

    /// <inheritdoc />
    public async Task<Deal> UpdateAsync(Deal deal, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogUpdatingDeal(logger, deal.Id, businessId);

        // Verify deal belongs to current business
        var existing = await dealRepository.GetByIdAsync(deal.Id, cancellationToken);
        if (existing == null || existing.BusinessId != businessId)
        {
            LogUnauthorizedUpdate(logger, deal.Id, businessId);
            throw new UnauthorizedAccessException($"Deal {deal.Id} not found or does not belong to current business.");
        }

        // Verify contact belongs to current business if changed
        if (existing.ContactId != deal.ContactId)
        {
            var contact = await contactRepository.GetByIdAsync(deal.ContactId, cancellationToken);
            if (contact == null || contact.BusinessId != businessId)
            {
                LogInvalidContact(logger, deal.ContactId, businessId);
                throw new InvalidOperationException($"Contact {deal.ContactId} not found or does not belong to current business.");
            }
        }

        // Ensure probability is between 0-100
        if (deal.Probability < 0 || deal.Probability > 100)
        {
            LogInvalidProbability(logger, deal.Probability);
            throw new ArgumentException("Probability must be between 0 and 100.", nameof(deal));
        }

        var updated = await dealRepository.UpdateAsync(deal, cancellationToken);

        LogDealUpdated(logger, deal.Id, businessId);

        return updated;
    }

    /// <inheritdoc />
    public async Task<Deal> MoveToStageAsync(
        Guid id,
        DealStage newStage,
        string? lossReason = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogMovingDeal(logger, id, newStage);

        // Verify deal belongs to current business
        var deal = await dealRepository.GetByIdAsync(id, cancellationToken);
        if (deal == null || deal.BusinessId != businessId)
        {
            LogUnauthorizedUpdate(logger, id, businessId);
            throw new UnauthorizedAccessException($"Deal {id} not found or does not belong to current business.");
        }

        // Validate loss reason if moving to Lost
        if (newStage == DealStage.Lost && string.IsNullOrWhiteSpace(lossReason))
        {
            LogMissingLossReason(logger, id);
            throw new ArgumentException("Loss reason is required when moving a deal to Lost stage.", nameof(lossReason));
        }

        // Set loss reason if provided
        if (newStage == DealStage.Lost && !string.IsNullOrWhiteSpace(lossReason))
        {
            deal.LossReason = lossReason;
            await dealRepository.UpdateAsync(deal, cancellationToken);
        }

        var updated = await dealRepository.MoveToStageAsync(id, newStage, cancellationToken);

        LogDealMoved(logger, id, deal.Stage, newStage);

        return updated;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        LogDeletingDeal(logger, id, businessId);

        // Verify deal belongs to current business
        var deal = await dealRepository.GetByIdAsync(id, cancellationToken);
        if (deal == null || deal.BusinessId != businessId)
        {
            LogUnauthorizedDelete(logger, id, businessId);
            throw new UnauthorizedAccessException($"Deal {id} not found or does not belong to current business.");
        }

        await dealRepository.DeleteAsync(id, cancellationToken);

        LogDealDeleted(logger, id, businessId);
    }

    /// <inheritdoc />
    public Task<decimal> GetTotalPipelineValueAsync(CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingTotalPipelineValue(logger, businessId);

        return dealRepository.GetTotalPipelineValueAsync(businessId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<decimal> GetWeightedPipelineValueAsync(CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingWeightedPipelineValue(logger, businessId);

        return dealRepository.GetWeightedPipelineValueAsync(businessId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<decimal> GetWinRateAsync(CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingWinRate(logger, businessId);

        return dealRepository.GetWinRateAsync(businessId, cancellationToken);
    }

    // ============================================================================
    // LoggerMessage Source Generators
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deal {DealId}")]
    private static partial void LogGettingDeal(ILogger logger, Guid dealId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting all deals for business {BusinessId} with stage={Stage}, contactId={ContactId}, assignedTo={AssignedToUserId}")]
    private static partial void LogGettingAllDeals(ILogger logger, Guid businessId, DealStage? stage, Guid? contactId, Guid? assignedToUserId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting pipeline for business {BusinessId}")]
    private static partial void LogGettingPipeline(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deals by stage {Stage} for business {BusinessId}")]
    private static partial void LogGettingDealsByStage(ILogger logger, Guid businessId, DealStage stage);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deals for contact {ContactId}")]
    private static partial void LogGettingDealsByContact(ILogger logger, Guid contactId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating deal for business {BusinessId}: {Title}")]
    private static partial void LogCreatingDeal(ILogger logger, Guid businessId, string title);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deal {DealId} created for business {BusinessId}")]
    private static partial void LogDealCreated(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating deal {DealId} for business {BusinessId}")]
    private static partial void LogUpdatingDeal(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deal {DealId} updated for business {BusinessId}")]
    private static partial void LogDealUpdated(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Moving deal {DealId} to stage {NewStage}")]
    private static partial void LogMovingDeal(ILogger logger, Guid dealId, DealStage newStage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deal {DealId} moved from {OldStage} to {NewStage}")]
    private static partial void LogDealMoved(ILogger logger, Guid dealId, DealStage oldStage, DealStage newStage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting deal {DealId} for business {BusinessId}")]
    private static partial void LogDeletingDeal(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deal {DealId} deleted for business {BusinessId}")]
    private static partial void LogDealDeleted(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting total pipeline value for business {BusinessId}")]
    private static partial void LogGettingTotalPipelineValue(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting weighted pipeline value for business {BusinessId}")]
    private static partial void LogGettingWeightedPipelineValue(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting win rate for business {BusinessId}")]
    private static partial void LogGettingWinRate(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized access to deal {DealId}. Deal business: {DealBusinessId}, Current business: {CurrentBusinessId}")]
    private static partial void LogUnauthorizedAccess(ILogger logger, Guid dealId, Guid dealBusinessId, Guid currentBusinessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized update attempt for deal {DealId} by business {BusinessId}")]
    private static partial void LogUnauthorizedUpdate(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unauthorized delete attempt for deal {DealId} by business {BusinessId}")]
    private static partial void LogUnauthorizedDelete(ILogger logger, Guid dealId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid contact {ContactId} for business {BusinessId}")]
    private static partial void LogInvalidContact(ILogger logger, Guid contactId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid probability {Probability}. Must be between 0-100")]
    private static partial void LogInvalidProbability(ILogger logger, int probability);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Missing loss reason for deal {DealId}")]
    private static partial void LogMissingLossReason(ILogger logger, Guid dealId);
}
