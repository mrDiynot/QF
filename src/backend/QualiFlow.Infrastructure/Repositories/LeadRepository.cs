using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Lead entity operations.
/// Multi-tenancy is enforced automatically via EF Core global query filters.
/// All queries are automatically filtered by the current user's BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="currentUserService">Service for accessing current user context.</param>
/// <param name="logger">The logger instance.</param>
public partial class LeadRepository(
    QualiFlowDbContext context,
    ICurrentUserService currentUserService,
    ILogger<LeadRepository> logger) : ILeadRepository
{
    /// <inheritdoc />
    public Task<Lead?> GetByIdAsync(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingLead(logger, leadId, businessId);

        // Sprint 19: Performance optimization - Use AsSplitQuery for multiple collections
        return context.Leads
            .AsNoTracking()
            .Include(l => l.Conversations)
            .Include(l => l.Qualifications)
            .Include(l => l.Bookings)
            .AsSplitQuery() // Prevents cartesian explosion with multiple collections
            .Where(l => l.Id == leadId && l.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<Lead?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingLeadByEmail(logger, email, businessId);

        return context.Leads
            .AsNoTracking()
            .Where(l => l.Email == email && l.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Lead>> GetAllAsync(
        LeadStatus? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingLeads(logger, businessId, status, skip, take);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        // This supplements the EF Core global query filter to ensure tenant isolation
        var query = context.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null);

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        return await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        LeadStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogGettingLeadCount(logger, businessId, status);

        // MULTI-TENANCY: Explicit BusinessId filtering for defense-in-depth
        // This supplements the EF Core global query filter to ensure tenant isolation
        var query = context.Leads
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null);

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Lead> AddAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogAddingLead(logger, lead.Email, businessId);

        await context.Leads.AddAsync(lead, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return lead;
    }

    /// <inheritdoc />
    public Task UpdateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogUpdatingLead(logger, lead.Id, businessId);

        lead.UpdatedAt = DateTime.UtcNow;
        context.Leads.Update(lead);
        return context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogDeletingLead(logger, leadId, businessId);

        var lead = await context.Leads
            .Where(l => l.Id == leadId && l.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (lead == null)
        {
            LogLeadNotFound(logger, leadId, businessId);
            return false;
        }

        lead.DeletedAt = DateTime.UtcNow;
        context.Leads.Update(lead);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc />
    public Task<bool> ExistsAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        LogCheckingLeadExists(logger, email, businessId);

        return context.Leads
            .AnyAsync(l => l.Email == email && l.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc />
    public Task<Lead?> GetByPhoneNumberAsync(
        Guid businessId,
        string phoneNumber,
        CancellationToken cancellationToken = default)
    {
        LogGettingLeadByPhone(logger, phoneNumber, businessId);

        // Normalize phone number for consistent lookup
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);

        // Bypass global query filter to use explicit businessId
        return context.Leads
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId &&
                        l.Phone != null &&
                        l.Phone == normalizedPhone &&
                        l.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<Lead?> GetByEmailForBusinessAsync(
        Guid businessId,
        string email,
        CancellationToken cancellationToken = default)
    {
        LogGettingLeadByEmail(logger, email, businessId);

        // Normalize email for consistent lookup (lowercase)
        var normalizedEmail = email.Trim().ToLowerInvariant();

        // Bypass global query filter to use explicit businessId
        // Note: ToLower() in LINQ correctly translates to SQL LOWER() function
#pragma warning disable CA1304, CA1311, CA1862, MA0011 // ToLower() translates to SQL LOWER() in EF Core
        return context.Leads
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId &&
                        l.Email != null &&
                        l.Email.ToLower() == normalizedEmail &&
                        l.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
#pragma warning restore CA1304, CA1311, CA1862, MA0011
    }

    /// <inheritdoc />
    public async Task<Lead> AddForBusinessAsync(
        Lead lead,
        CancellationToken cancellationToken = default)
    {
        LogAddingLeadForBusiness(logger, lead.Email ?? lead.Phone ?? "unknown", lead.BusinessId);

        await context.Leads.AddAsync(lead, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return lead;
    }

    /// <inheritdoc />
    public Task<Lead?> GetByIdForBusinessAsync(
        Guid businessId,
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        LogGettingLead(logger, leadId, businessId);

        return context.Leads
            .AsNoTracking()
            .Include(l => l.Conversations)
            .Include(l => l.Qualifications)
            .Include(l => l.Bookings)
            .AsSplitQuery()
            .Where(l => l.Id == leadId && l.BusinessId == businessId && l.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateForBusinessAsync(
        Guid businessId,
        Lead lead,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingLead(logger, lead.Id, businessId);

        if (lead.BusinessId != businessId)
        {
            throw new UnauthorizedAccessException($"Lead {lead.Id} does not belong to business {businessId}");
        }

        context.Leads.Update(lead);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Normalizes a phone number to E.164 format for consistent lookup.
    /// </summary>
    private static string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            return phoneNumber;
        }

        // Remove all non-numeric characters except the leading +
        var normalized = phoneNumber.Trim();
        if (normalized.StartsWith('+'))
        {
            return "+" + new string(normalized.Skip(1).Where(char.IsDigit).ToArray());
        }

        return new string(normalized.Where(char.IsDigit).ToArray());
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting lead {LeadId} for business {BusinessId}")]
    private static partial void LogGettingLead(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting lead by email {Email} for business {BusinessId}")]
    private static partial void LogGettingLeadByEmail(ILogger logger, string email, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting leads for business {BusinessId} with status {Status}, skip {Skip}, take {Take}")]
    private static partial void LogGettingLeads(ILogger logger, Guid businessId, LeadStatus? status, int skip, int take);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting lead count for business {BusinessId} with status {Status}")]
    private static partial void LogGettingLeadCount(ILogger logger, Guid businessId, LeadStatus? status);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding new lead {LeadEmail} for business {BusinessId}")]
    private static partial void LogAddingLead(ILogger logger, string leadEmail, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating lead {LeadId} for business {BusinessId}")]
    private static partial void LogUpdatingLead(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleting lead {LeadId} for business {BusinessId}")]
    private static partial void LogDeletingLead(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Lead {LeadId} not found for business {BusinessId}")]
    private static partial void LogLeadNotFound(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Checking if lead exists with email {Email} for business {BusinessId}")]
    private static partial void LogCheckingLeadExists(ILogger logger, string email, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting lead by phone {Phone} for business {BusinessId}")]
    private static partial void LogGettingLeadByPhone(ILogger logger, string phone, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding new lead {LeadIdentifier} for business {BusinessId} (webhook context)")]
    private static partial void LogAddingLeadForBusiness(ILogger logger, string leadIdentifier, Guid businessId);
}

