using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Features.Admin.BusinessManagement;
using QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing businesses (tenants) by administrators.
/// </summary>
public class AdminBusinessManagementService : IAdminBusinessManagementService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminBusinessManagementService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminBusinessManagementService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="logger">Logger.</param>
    public AdminBusinessManagementService(
        QualiFlowDbContext context,
        ILogger<AdminBusinessManagementService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<AdminBusinessListDto>> GetAllBusinessesAsync(
        AdminBusinessQuery query,
        CancellationToken cancellationToken)
    {
        var queryable = _context.Businesses
            .AsNoTracking()
            .Include(b => b.Subscription)
                .ThenInclude(s => s!.Plan)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            queryable = queryable.Where(b =>
                b.Name.Contains(query.Search, StringComparison.OrdinalIgnoreCase) ||
                (b.Email != null && b.Email.Contains(query.Search, StringComparison.OrdinalIgnoreCase)) ||
                (b.Phone != null && b.Phone.Contains(query.Search, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(query.SubscriptionTier))
        {
            queryable = queryable.Where(b => b.Subscription != null && b.Subscription.Plan.Name == query.SubscriptionTier);
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(b => b.IsActive == query.IsActive.Value);
        }

        // Get total count
        var totalItems = await queryable.CountAsync(cancellationToken);

        // Get paginated results
        var businesses = await queryable
            .OrderByDescending(b => b.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(b => new
            {
                Business = b,
                TotalUsers = _context.Users.Count(u => u.BusinessId == b.Id),
                TotalLeads = _context.Leads.Count(l => l.BusinessId == b.Id),
            })
            .ToListAsync(cancellationToken);

        // Get all business IDs
        var businessIds = businesses.Select(b => b.Business.Id).ToList();

        // Get all owners in one query
        var owners = await _context.Users
            .AsNoTracking()
            .Where(u => businessIds.Contains(u.BusinessId))
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.User, Role = r })
            .Where(x => x.Role.Name == ApplicationRole.Owner)
            .Select(x => new { x.User.BusinessId, x.User.Email, x.User.FirstName, x.User.LastName })
            .ToListAsync(cancellationToken);

        var ownerLookup = owners.ToDictionary(o => o.BusinessId);

        var items = businesses.Select(b =>
        {
            var owner = ownerLookup.GetValueOrDefault(b.Business.Id);
            return new AdminBusinessListDto
            {
                Id = b.Business.Id,
                Name = b.Business.Name,
                OwnerEmail = owner?.Email ?? string.Empty,
                OwnerName = owner != null ? $"{owner.FirstName} {owner.LastName}" : string.Empty,
                SubscriptionTier = b.Business.Subscription?.Plan?.DisplayName,
                TotalUsers = b.TotalUsers,
                TotalLeads = b.TotalLeads,
                IsActive = b.Business.IsActive,
                CreatedAt = b.Business.CreatedAt,
            };
        }).ToList();

        return new PagedResult<AdminBusinessListDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    /// <inheritdoc/>
    public async Task<AdminBusinessDetailDto?> GetBusinessByIdAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .AsNoTracking()
            .Include(b => b.Subscription)
                .ThenInclude(s => s!.Plan)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business == null)
        {
            return null;
        }

        // Get owner information
        var owner = await _context.Users
            .AsNoTracking()
            .Where(u => u.BusinessId == businessId)
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.User, Role = r })
            .Where(x => x.Role.Name == ApplicationRole.Owner)
            .Select(x => new { x.User.Id, x.User.Email, x.User.FirstName, x.User.LastName })
            .FirstOrDefaultAsync(cancellationToken);

        // Get statistics
        var totalUsers = await _context.Users.CountAsync(u => u.BusinessId == businessId, cancellationToken);
        var totalLeads = await _context.Leads.CountAsync(l => l.BusinessId == businessId, cancellationToken);
        var totalConversations = await _context.Conversations.CountAsync(c => c.BusinessId == businessId, cancellationToken);
        var totalMessages = await _context.Messages.CountAsync(m => m.Conversation.BusinessId == businessId, cancellationToken);

        return new AdminBusinessDetailDto
        {
            Id = business.Id,
            Name = business.Name,
            Email = business.Email,
            Phone = business.Phone,
            Industry = business.Industry,
            Size = business.CompanySize,
            OwnerId = owner?.Id ?? Guid.Empty,
            OwnerEmail = owner?.Email ?? string.Empty,
            OwnerName = owner != null ? $"{owner.FirstName} {owner.LastName}" : string.Empty,
            SubscriptionTier = business.Subscription?.Plan?.DisplayName,
            SubscriptionStatus = business.Subscription?.Status.ToString(),
            SubscriptionStartDate = business.Subscription?.CurrentPeriodStart,
            SubscriptionEndDate = business.Subscription?.CurrentPeriodEnd,
            IsActive = business.IsActive,
            SuspensionReason = null, // Business entity doesn't have SuspensionReason field
            CreatedAt = business.CreatedAt,
            UpdatedAt = business.UpdatedAt,
            TotalUsers = totalUsers,
            TotalLeads = totalLeads,
            TotalConversations = totalConversations,
            TotalMessages = totalMessages,
        };
    }

    /// <inheritdoc/>
    public async Task<AdminBusinessDetailDto> UpdateBusinessAsync(
        Guid businessId,
        UpdateBusinessRequest request,
        CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business with ID {businessId} not found");

        // Update properties
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            business.Name = request.Name;
        }

        if (request.Email != null)
        {
            business.Email = request.Email;
        }

        if (request.Phone != null)
        {
            business.Phone = request.Phone;
        }

        if (request.Industry != null)
        {
            business.Industry = request.Industry;
        }

        if (request.Size != null)
        {
            business.CompanySize = request.Size;
        }

        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Business {BusinessId} updated by admin", businessId);

        return (await GetBusinessByIdAsync(businessId, cancellationToken))!;
    }

    /// <inheritdoc/>
    public async Task SuspendBusinessAsync(
        Guid businessId,
        string reason,
        CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business with ID {businessId} not found");

        business.IsActive = false;
        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("Business {BusinessId} suspended by admin. Reason: {Reason}", businessId, reason);
    }

    /// <inheritdoc/>
    public async Task ReactivateBusinessAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business with ID {businessId} not found");

        business.IsActive = true;
        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Business {BusinessId} reactivated by admin", businessId);
    }

    /// <inheritdoc/>
    public async Task DeleteBusinessAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business with ID {businessId} not found");

        business.DeletedAt = DateTime.UtcNow;
        business.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("Business {BusinessId} deleted by admin", businessId);
    }

    /// <inheritdoc/>
    public async Task<PagedResult<BusinessActivityItemDto>> GetBusinessActivityAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        // Verify business exists
        var businessExists = await _context.Businesses.AnyAsync(b => b.Id == businessId, cancellationToken);
        if (!businessExists)
        {
            throw new InvalidOperationException($"Business with ID {businessId} not found");
        }

        // Query audit logs that reference this business
        var queryable = _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId)
            .OrderByDescending(a => a.CreatedAt);

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new BusinessActivityItemDto
            {
                Id = a.Id,
                Action = a.Action.ToString(),
                Actor = a.Username,
                ActorEmail = a.User != null ? a.User.Email : null,
                Timestamp = a.CreatedAt,
                Details = a.EntityType + ": " + a.EntityId.ToString(),
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<BusinessActivityItemDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
        };
    }
}

