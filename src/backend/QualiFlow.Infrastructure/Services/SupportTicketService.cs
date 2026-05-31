// -----------------------------------------------------------------------
// <copyright file="SupportTicketService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Support;
using QualiFlow.Application.Features.Support.DTOs;
using QualiFlow.Domain.Entities.Support;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for support ticket operations.
/// </summary>
public partial class SupportTicketService : ISupportTicketService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<SupportTicketService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SupportTicketService"/> class.
    /// </summary>
    public SupportTicketService(
        QualiFlowDbContext context,
        ILogger<SupportTicketService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<SupportTicketDto> CreateTicketAsync(
        CreateTicketRequest request,
        Guid? userId,
        Guid? businessId,
        CancellationToken cancellationToken = default)
    {
        // Get reporter info
        string reporterEmail;
        string reporterName;

        if (userId.HasValue)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

            if (user != null)
            {
                reporterEmail = user.Email ?? request.ReporterEmail ?? "unknown@unknown.com";
                reporterName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(reporterName))
                {
                    reporterName = request.ReporterName ?? "Unknown";
                }
            }
            else
            {
                reporterEmail = request.ReporterEmail ?? "unknown@unknown.com";
                reporterName = request.ReporterName ?? "Unknown";
            }
        }
        else
        {
            reporterEmail = request.ReporterEmail ?? throw new ArgumentException("Reporter email is required for unauthenticated tickets", nameof(request));
            reporterName = request.ReporterName ?? throw new ArgumentException("Reporter name is required for unauthenticated tickets", nameof(request));
        }

        // Generate ticket number
        var ticketNumber = await GenerateTicketNumberAsync(cancellationToken);

        // Get SLA policy for priority
        var slaPolicy = await _context.SlaPolicies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Priority == request.Priority && p.IsActive && p.DeletedAt == null, cancellationToken);

        var now = DateTime.UtcNow;
        DateTime? firstResponseDue = null;
        DateTime? resolutionDue = null;

        if (slaPolicy != null)
        {
            firstResponseDue = now.AddMinutes(slaPolicy.FirstResponseMinutes);
            resolutionDue = now.AddMinutes(slaPolicy.ResolutionMinutes);
        }

        var ticket = new SupportTicket
        {
            TicketNumber = ticketNumber,
            BusinessId = businessId,
            ReportedByUserId = userId,
            ReporterEmail = reporterEmail,
            ReporterName = reporterName,
            Category = request.Category,
            Priority = request.Priority,
            Status = TicketStatus.New,
            Subject = request.Subject,
            Description = request.Description,
            FirstResponseDue = firstResponseDue,
            ResolutionDue = resolutionDue,
            CreatedAt = now,
        };

        await _context.SupportTickets.AddAsync(ticket, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        LogTicketCreated(_logger, ticket.Id, ticketNumber, request.Priority.ToString());

        return await GetTicketAsync(ticket.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve created ticket");
    }

    /// <inheritdoc/>
    public async Task<SupportTicketDto?> GetTicketAsync(
        Guid ticketId,
        CancellationToken cancellationToken = default)
    {
        return await _context.SupportTickets
            .Include(t => t.Business)
            .Include(t => t.AssignedToAdmin)
            .Include(t => t.Messages)
            .Where(t => t.Id == ticketId && t.DeletedAt == null)
            .Select(t => MapToDto(t))
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SupportTicketDto?> GetTicketByNumberAsync(
        string ticketNumber,
        CancellationToken cancellationToken = default)
    {
        return await _context.SupportTickets
            .Include(t => t.Business)
            .Include(t => t.AssignedToAdmin)
            .Include(t => t.Messages)
            .Where(t => t.TicketNumber == ticketNumber && t.DeletedAt == null)
            .Select(t => MapToDto(t))
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<PagedResult<SupportTicketDto>> GetTicketsAsync(
        TicketQuery query,
        CancellationToken cancellationToken = default)
    {
        var queryable = _context.SupportTickets
            .Include(t => t.Business)
            .Include(t => t.AssignedToAdmin)
            .Include(t => t.Messages)
            .Where(t => t.DeletedAt == null)
            .AsNoTracking();

        queryable = ApplyFilters(queryable, query);

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => MapToDto(t))
            .ToListAsync(cancellationToken);

        return new PagedResult<SupportTicketDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    /// <inheritdoc/>
    public async Task<PagedResult<SupportTicketDto>> GetUserTicketsAsync(
        Guid userId,
        TicketQuery query,
        CancellationToken cancellationToken = default)
    {
        var queryable = _context.SupportTickets
            .Include(t => t.Business)
            .Include(t => t.AssignedToAdmin)
            .Include(t => t.Messages)
            .Where(t => t.ReportedByUserId == userId && t.DeletedAt == null)
            .AsNoTracking();

        queryable = ApplyFilters(queryable, query);

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => MapToDto(t))
            .ToListAsync(cancellationToken);

        return new PagedResult<SupportTicketDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    /// <inheritdoc/>
    public async Task<PagedResult<SupportTicketDto>> GetBusinessTicketsAsync(
        Guid businessId,
        TicketQuery query,
        CancellationToken cancellationToken = default)
    {
        var queryable = _context.SupportTickets
            .Include(t => t.Business)
            .Include(t => t.AssignedToAdmin)
            .Include(t => t.Messages)
            .Where(t => t.BusinessId == businessId && t.DeletedAt == null)
            .AsNoTracking();

        queryable = ApplyFilters(queryable, query);

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => MapToDto(t))
            .ToListAsync(cancellationToken);

        return new PagedResult<SupportTicketDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    /// <inheritdoc/>
    public async Task<TicketMessageDto> AddMessageAsync(
        Guid ticketId,
        AddTicketMessageRequest request,
        Guid? senderUserId,
        Guid? senderAdminId,
        string senderName,
        string senderEmail,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _context.SupportTickets
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Ticket {ticketId} not found");

        var now = DateTime.UtcNow;

        var message = new TicketMessage
        {
            TicketId = ticketId,
            Content = request.Content,
            IsInternal = request.IsInternal,
            SentByUserId = senderUserId,
            SentByAdminId = senderAdminId,
            SenderName = senderName,
            SenderEmail = senderEmail,
            Type = request.IsInternal ? TicketMessageType.InternalNote : TicketMessageType.Reply,
            CreatedAt = now,
        };

        await _context.TicketMessages.AddAsync(message, cancellationToken);

        // Track first response from admin
        if (senderAdminId.HasValue && !ticket.FirstResponseAt.HasValue && !request.IsInternal)
        {
            ticket.FirstResponseAt = now;
        }

        // Update ticket status if customer replied
        if (senderUserId.HasValue && ticket.Status == TicketStatus.AwaitingCustomer)
        {
            ticket.Status = TicketStatus.Open;
        }

        ticket.UpdatedAt = now;
        await _context.SaveChangesAsync(cancellationToken);

        LogMessageAdded(_logger, message.Id, ticketId, request.IsInternal);

        return MapMessageToDto(message);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<TicketMessageDto>> GetMessagesAsync(
        Guid ticketId,
        bool includeInternal = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.TicketMessages
            .Include(m => m.Attachments)
            .Where(m => m.TicketId == ticketId && m.DeletedAt == null)
            .AsNoTracking();

        if (!includeInternal)
        {
            query = query.Where(m => !m.IsInternal);
        }

        return await query
            .OrderBy(m => m.CreatedAt)
            .Select(m => MapMessageToDto(m))
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SupportTicketDto> UpdateStatusAsync(
        Guid ticketId,
        UpdateTicketStatusRequest request,
        Guid adminId,
        string adminName,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _context.SupportTickets
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Ticket {ticketId} not found");

        var oldStatus = ticket.Status;
        var now = DateTime.UtcNow;

        ticket.Status = request.Status;
        ticket.UpdatedAt = now;

        if (request.Status == TicketStatus.Resolved && !ticket.ResolvedAt.HasValue)
        {
            ticket.ResolvedAt = now;
        }

        // Add status change message
        var statusMessage = new TicketMessage
        {
            TicketId = ticketId,
            Content = $"Status changed from {oldStatus} to {request.Status}" +
                     (string.IsNullOrEmpty(request.Note) ? string.Empty : $": {request.Note}"),
            IsInternal = false,
            SentByAdminId = adminId,
            SenderName = adminName,
            SenderEmail = "system@qualiflow.ai",
            Type = TicketMessageType.StatusChange,
            CreatedAt = now,
        };

        await _context.TicketMessages.AddAsync(statusMessage, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        LogStatusUpdated(_logger, ticketId, oldStatus.ToString(), request.Status.ToString());

        return await GetTicketAsync(ticketId, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve updated ticket");
    }

    /// <inheritdoc/>
    public async Task<SupportTicketDto> AssignTicketAsync(
        Guid ticketId,
        AssignTicketRequest request,
        Guid assignedByAdminId,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _context.SupportTickets
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Ticket {ticketId} not found");

        var assignee = await _context.AdminUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.AdminId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin {request.AdminId} not found");

        ticket.AssignedToAdminId = request.AdminId;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (ticket.Status == TicketStatus.New)
        {
            ticket.Status = TicketStatus.Open;
        }

        await _context.SaveChangesAsync(cancellationToken);

        LogTicketAssigned(_logger, ticketId, request.AdminId, assignee.FullName);

        return await GetTicketAsync(ticketId, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve updated ticket");
    }

    /// <inheritdoc/>
    public async Task<SupportTicketDto> UpdatePriorityAsync(
        Guid ticketId,
        UpdateTicketPriorityRequest request,
        Guid adminId,
        string adminName,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _context.SupportTickets
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Ticket {ticketId} not found");

        var oldPriority = ticket.Priority;
        var now = DateTime.UtcNow;

        ticket.Priority = request.Priority;
        ticket.UpdatedAt = now;

        // Recalculate SLA based on new priority
        var slaPolicy = await _context.SlaPolicies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Priority == request.Priority && p.IsActive && p.DeletedAt == null, cancellationToken);

        if (slaPolicy != null)
        {
            // Only update if not already responded/resolved
            if (!ticket.FirstResponseAt.HasValue)
            {
                ticket.FirstResponseDue = ticket.CreatedAt.AddMinutes(slaPolicy.FirstResponseMinutes);
            }

            if (!ticket.ResolvedAt.HasValue)
            {
                ticket.ResolutionDue = ticket.CreatedAt.AddMinutes(slaPolicy.ResolutionMinutes);
            }
        }

        // Add priority change message
        var priorityMessage = new TicketMessage
        {
            TicketId = ticketId,
            Content = $"Priority changed from {oldPriority} to {request.Priority}" +
                     (string.IsNullOrEmpty(request.Reason) ? string.Empty : $": {request.Reason}"),
            IsInternal = true,
            SentByAdminId = adminId,
            SenderName = adminName,
            SenderEmail = "system@qualiflow.ai",
            Type = TicketMessageType.System,
            CreatedAt = now,
        };

        await _context.TicketMessages.AddAsync(priorityMessage, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        LogPriorityUpdated(_logger, ticketId, oldPriority.ToString(), request.Priority.ToString());

        return await GetTicketAsync(ticketId, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve updated ticket");
    }

    /// <inheritdoc/>
    public async Task<TicketDashboardStats> GetDashboardStatsAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;

        var openStatuses = new[]
        {
            TicketStatus.New,
            TicketStatus.Open,
            TicketStatus.AwaitingCustomer,
            TicketStatus.AwaitingInternal,
            TicketStatus.InProgress,
            TicketStatus.OnHold,
        };

        var tickets = await _context.SupportTickets
            .Where(t => t.DeletedAt == null)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalOpen = tickets.Count(t => openStatuses.Contains(t.Status));
        var newToday = tickets.Count(t => t.CreatedAt >= todayStart);
        var awaitingResponse = tickets.Count(t => t.Status == TicketStatus.AwaitingCustomer);
        var slaBreached = tickets.Count(t => t.SlaBreached && openStatuses.Contains(t.Status));
        var unassigned = tickets.Count(t => !t.AssignedToAdminId.HasValue && openStatuses.Contains(t.Status));
        var resolvedToday = tickets.Count(t => t.ResolvedAt.HasValue && t.ResolvedAt.Value >= todayStart);

        var byPriority = tickets
            .Where(t => openStatuses.Contains(t.Status))
            .GroupBy(t => t.Priority)
            .ToDictionary(g => g.Key, g => g.Count());

        var byCategory = tickets
            .Where(t => openStatuses.Contains(t.Status))
            .GroupBy(t => t.Category)
            .ToDictionary(g => g.Key, g => g.Count());

        return new TicketDashboardStats
        {
            TotalOpen = totalOpen,
            NewToday = newToday,
            AwaitingResponse = awaitingResponse,
            SlaBreached = slaBreached,
            Unassigned = unassigned,
            ResolvedToday = resolvedToday,
            ByPriority = byPriority,
            ByCategory = byCategory,
        };
    }

    /// <inheritdoc/>
    public async Task<int> CheckSlaBreachesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var openStatuses = new[]
        {
            TicketStatus.New,
            TicketStatus.Open,
            TicketStatus.AwaitingCustomer,
            TicketStatus.AwaitingInternal,
            TicketStatus.InProgress,
            TicketStatus.OnHold,
        };

        var ticketsToCheck = await _context.SupportTickets
            .Where(t => t.DeletedAt == null &&
                       !t.SlaBreached &&
                       openStatuses.Contains(t.Status))
            .ToListAsync(cancellationToken);

        var breachedCount = 0;

        foreach (var ticket in ticketsToCheck)
        {
            var breached = false;

            // Check first response SLA
            if (!ticket.FirstResponseAt.HasValue &&
                ticket.FirstResponseDue.HasValue &&
                now > ticket.FirstResponseDue.Value)
            {
                breached = true;
            }

            // Check resolution SLA
            if (!ticket.ResolvedAt.HasValue &&
                ticket.ResolutionDue.HasValue &&
                now > ticket.ResolutionDue.Value)
            {
                breached = true;
            }

            if (breached)
            {
                ticket.SlaBreached = true;
                ticket.UpdatedAt = now;
                breachedCount++;

                LogSlaBreach(_logger, ticket.Id, ticket.TicketNumber);
            }
        }

        if (breachedCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return breachedCount;
    }

    private async Task<string> GenerateTicketNumberAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"TKT-{year}-";

        var lastTicket = await _context.SupportTickets
            .Where(t => t.TicketNumber.StartsWith(prefix))
            .OrderByDescending(t => t.TicketNumber)
            .Select(t => t.TicketNumber)
            .FirstOrDefaultAsync(cancellationToken);

        int nextNumber;
        if (lastTicket != null)
        {
            var numberPart = lastTicket[prefix.Length..];
            if (int.TryParse(numberPart, CultureInfo.InvariantCulture, out var lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
            else
            {
                nextNumber = 1;
            }
        }
        else
        {
            nextNumber = 1;
        }

        return $"{prefix}{nextNumber:D5}";
    }

    private static IQueryable<SupportTicket> ApplyFilters(
        IQueryable<SupportTicket> query,
        TicketQuery filter)
    {
        if (filter.Status.HasValue)
        {
            query = query.Where(t => t.Status == filter.Status.Value);
        }

        if (filter.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == filter.Priority.Value);
        }

        if (filter.Category.HasValue)
        {
            query = query.Where(t => t.Category == filter.Category.Value);
        }

        if (filter.AssignedToAdminId.HasValue)
        {
            query = query.Where(t => t.AssignedToAdminId == filter.AssignedToAdminId.Value);
        }

        if (filter.BusinessId.HasValue)
        {
            query = query.Where(t => t.BusinessId == filter.BusinessId.Value);
        }

        if (filter.SlaBreached.HasValue)
        {
            query = query.Where(t => t.SlaBreached == filter.SlaBreached.Value);
        }

        if (filter.Unassigned == true)
        {
            query = query.Where(t => t.AssignedToAdminId == null);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            query = query.Where(t =>
                t.TicketNumber.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.Subject.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.ReporterEmail.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.ReporterName.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase));
        }

        return query;
    }

    private static SupportTicketDto MapToDto(SupportTicket ticket)
    {
        return new SupportTicketDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            BusinessId = ticket.BusinessId,
            BusinessName = ticket.Business?.Name,
            ReporterEmail = ticket.ReporterEmail,
            ReporterName = ticket.ReporterName,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            Subject = ticket.Subject,
            Description = ticket.Description,
            FirstResponseDue = ticket.FirstResponseDue,
            ResolutionDue = ticket.ResolutionDue,
            FirstResponseAt = ticket.FirstResponseAt,
            ResolvedAt = ticket.ResolvedAt,
            SlaBreached = ticket.SlaBreached,
            AssignedToAdminId = ticket.AssignedToAdminId,
            AssignedToAdminName = ticket.AssignedToAdmin?.FullName,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            MessageCount = ticket.Messages.Count,
        };
    }

    private static TicketMessageDto MapMessageToDto(TicketMessage message)
    {
        return new TicketMessageDto
        {
            Id = message.Id,
            TicketId = message.TicketId,
            Content = message.Content,
            IsInternal = message.IsInternal,
            SenderName = message.SenderName,
            SenderEmail = message.SenderEmail,
            Type = message.Type,
            IsSentByAdmin = message.SentByAdminId.HasValue,
            CreatedAt = message.CreatedAt,
            Attachments = message.Attachments
                .Select(a => new TicketAttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    ContentType = a.ContentType,
                    FileSizeBytes = a.FileSizeBytes,
                    CreatedAt = a.CreatedAt,
                })
                .ToList(),
        };
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Created ticket {TicketId} with number {TicketNumber} and priority {Priority}")]
    private static partial void LogTicketCreated(ILogger logger, Guid ticketId, string ticketNumber, string priority);

    [LoggerMessage(Level = LogLevel.Information, Message = "Added message {MessageId} to ticket {TicketId}, internal: {IsInternal}")]
    private static partial void LogMessageAdded(ILogger logger, Guid messageId, Guid ticketId, bool isInternal);

    [LoggerMessage(Level = LogLevel.Information, Message = "Ticket {TicketId} status updated from {OldStatus} to {NewStatus}")]
    private static partial void LogStatusUpdated(ILogger logger, Guid ticketId, string oldStatus, string newStatus);

    [LoggerMessage(Level = LogLevel.Information, Message = "Ticket {TicketId} assigned to admin {AdminId} ({AdminName})")]
    private static partial void LogTicketAssigned(ILogger logger, Guid ticketId, Guid adminId, string adminName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Ticket {TicketId} priority updated from {OldPriority} to {NewPriority}")]
    private static partial void LogPriorityUpdated(ILogger logger, Guid ticketId, string oldPriority, string newPriority);

    [LoggerMessage(Level = LogLevel.Warning, Message = "SLA breach detected for ticket {TicketId} ({TicketNumber})")]
    private static partial void LogSlaBreach(ILogger logger, Guid ticketId, string ticketNumber);
}
