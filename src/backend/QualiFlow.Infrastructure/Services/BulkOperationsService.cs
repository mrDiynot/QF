// <copyright file="BulkOperationsService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.BulkOperations.DTOs;
using QualiFlow.Application.Features.BulkOperations.Services;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for bulk operations on entities.
/// </summary>
public partial class BulkOperationsService(
    QualiFlowDbContext context,
    ILogger<BulkOperationsService> logger) : IBulkOperationsService
{
    private const int MaxBatchSize = 1000;

    /// <inheritdoc/>
    public async Task<BulkOperationResult> BulkUpdateLeadsAsync(
        Guid businessId,
        BulkUpdateLeadsRequest request,
        CancellationToken cancellationToken = default)
    {
        LogBulkUpdateStarted(logger, businessId, "Lead", request.LeadIds.Count);

        if (request.LeadIds.Count > MaxBatchSize)
        {
            throw new InvalidOperationException($"Cannot update more than {MaxBatchSize} leads at once.");
        }

        var errors = new List<BulkOperationError>();
        var successCount = 0;

        // Fetch all leads in a single query
        var leads = await context.Leads
            .Where(l => l.BusinessId == businessId && request.LeadIds.Contains(l.Id))
            .ToListAsync(cancellationToken);

        if (leads.Count != request.LeadIds.Count)
        {
            var foundIds = leads.Select(l => l.Id).ToHashSet();
            var missingIds = request.LeadIds.Where(id => !foundIds.Contains(id));
            foreach (var missingId in missingIds)
            {
                errors.Add(new BulkOperationError
                {
                    EntityId = missingId,
                    ErrorMessage = "Lead not found or access denied.",
                });
            }
        }

        // Apply updates
        foreach (var lead in leads)
        {
            try
            {
                if (request.Status.HasValue)
                {
                    lead.Status = request.Status.Value;
                }

                // Note: AssignedUserId, Tags, and CustomFields would require additional entity relationships
                // For now, we'll skip them as they're not in the current Lead entity

                lead.UpdatedAt = DateTime.UtcNow;
                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError
                {
                    EntityId = lead.Id,
                    ErrorMessage = ex.Message,
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        LogBulkUpdateCompleted(logger, businessId, "Lead", successCount, errors.Count);

        return new BulkOperationResult
        {
            TotalProcessed = request.LeadIds.Count,
            SuccessCount = successCount,
            FailureCount = errors.Count,
            Errors = errors.Count > 0 ? errors : null,
            IsAsync = false,
        };
    }

    /// <inheritdoc/>
    public async Task<BulkOperationResult> BulkDeleteLeadsAsync(
        Guid businessId,
        BulkDeleteRequest request,
        CancellationToken cancellationToken = default)
    {
        LogBulkDeleteStarted(logger, businessId, "Lead", request.EntityIds.Count, request.HardDelete);

        if (request.EntityIds.Count > MaxBatchSize)
        {
            throw new InvalidOperationException($"Cannot delete more than {MaxBatchSize} leads at once.");
        }

        var errors = new List<BulkOperationError>();
        var successCount = 0;

        var leads = await context.Leads
            .Where(l => l.BusinessId == businessId && request.EntityIds.Contains(l.Id))
            .ToListAsync(cancellationToken);

        foreach (var lead in leads)
        {
            try
            {
                if (request.HardDelete)
                {
                    context.Leads.Remove(lead);
                }
                else
                {
                    lead.DeletedAt = DateTime.UtcNow;
                }

                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError
                {
                    EntityId = lead.Id,
                    ErrorMessage = ex.Message,
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        LogBulkDeleteCompleted(logger, businessId, "Lead", successCount, errors.Count);

        return new BulkOperationResult
        {
            TotalProcessed = request.EntityIds.Count,
            SuccessCount = successCount,
            FailureCount = errors.Count,
            Errors = errors.Count > 0 ? errors : null,
            IsAsync = false,
        };
    }

    /// <inheritdoc/>
    public async Task<BulkOperationResult> BulkDeleteConversationsAsync(
        Guid businessId,
        BulkDeleteRequest request,
        CancellationToken cancellationToken = default)
    {
        LogBulkDeleteStarted(logger, businessId, "Conversation", request.EntityIds.Count, request.HardDelete);

        if (request.EntityIds.Count > MaxBatchSize)
        {
            throw new InvalidOperationException($"Cannot delete more than {MaxBatchSize} conversations at once.");
        }

        var errors = new List<BulkOperationError>();
        var successCount = 0;

        var conversations = await context.Conversations
            .Where(c => c.BusinessId == businessId && request.EntityIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        foreach (var conversation in conversations)
        {
            try
            {
                if (request.HardDelete)
                {
                    context.Conversations.Remove(conversation);
                }
                else
                {
                    conversation.DeletedAt = DateTime.UtcNow;
                }

                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError
                {
                    EntityId = conversation.Id,
                    ErrorMessage = ex.Message,
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        LogBulkDeleteCompleted(logger, businessId, "Conversation", successCount, errors.Count);

        return new BulkOperationResult
        {
            TotalProcessed = request.EntityIds.Count,
            SuccessCount = successCount,
            FailureCount = errors.Count,
            Errors = errors.Count > 0 ? errors : null,
            IsAsync = false,
        };
    }

    /// <inheritdoc/>
    public async Task<BulkOperationResult> BulkDeleteContactsAsync(
        Guid businessId,
        BulkDeleteRequest request,
        CancellationToken cancellationToken = default)
    {
        LogBulkDeleteStarted(logger, businessId, "Contact", request.EntityIds.Count, request.HardDelete);

        if (request.EntityIds.Count > MaxBatchSize)
        {
            throw new InvalidOperationException($"Cannot delete more than {MaxBatchSize} contacts at once.");
        }

        var errors = new List<BulkOperationError>();
        var successCount = 0;

        var contacts = await context.Contacts
            .Where(c => c.BusinessId == businessId && request.EntityIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        foreach (var contact in contacts)
        {
            try
            {
                if (request.HardDelete)
                {
                    context.Contacts.Remove(contact);
                }
                else
                {
                    contact.DeletedAt = DateTime.UtcNow;
                }

                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add(new BulkOperationError
                {
                    EntityId = contact.Id,
                    ErrorMessage = ex.Message,
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        LogBulkDeleteCompleted(logger, businessId, "Contact", successCount, errors.Count);

        return new BulkOperationResult
        {
            TotalProcessed = request.EntityIds.Count,
            SuccessCount = successCount,
            FailureCount = errors.Count,
            Errors = errors.Count > 0 ? errors : null,
            IsAsync = false,
        };
    }
}

