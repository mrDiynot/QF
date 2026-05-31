using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.DTOs.Admin;
using QualiFlow.Application.Interfaces.Admin;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for admin dashboard operations.
/// </summary>
public class AdminDashboardService : IAdminDashboardService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminDashboardService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminDashboardService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public AdminDashboardService(
        QualiFlowDbContext context,
        ILogger<AdminDashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<AdminDashboardMetricsDto> GetDashboardMetricsAsync(
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Calculating admin dashboard metrics");

        var now = DateTime.UtcNow;
        var sevenDaysAgo = now.AddDays(-7);
        var fourteenDaysAgo = now.AddDays(-14);

        // Admin queries use IgnoreQueryFilters() for cross-tenant platform-wide access
        // Get total counts
        var totalBusinesses = await _context.Businesses
            .IgnoreQueryFilters()
            .CountAsync(b => b.DeletedAt == null, cancellationToken);

        var totalUsers = await _context.Users
            .IgnoreQueryFilters()
            .CountAsync(u => u.DeletedAt == null, cancellationToken);

        // Get subscription metrics — only count subscriptions with existing businesses (exclude orphans)
        var activeSubscriptions = await _context.Subscriptions
            .IgnoreQueryFilters()
            .Where(s => s.Status == SubscriptionStatus.Active && s.DeletedAt == null)
            .Where(s => _context.Businesses.Any(b => b.Id == s.BusinessId && b.DeletedAt == null))
            .CountAsync(cancellationToken);

        var mrr = await _context.Subscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.Status == SubscriptionStatus.Active && s.DeletedAt == null)
            .Where(s => _context.Businesses.Any(b => b.Id == s.BusinessId && b.DeletedAt == null))
            .SumAsync(s => s.Plan.PriceMonthly, cancellationToken);

        // Get new signups in last 7 days
        var newSignups7d = await _context.Businesses
            .IgnoreQueryFilters()
            .CountAsync(
                b => b.CreatedAt >= sevenDaysAgo && b.DeletedAt == null,
                cancellationToken);

        // Calculate growth percentages
        var businessesLastWeek = await _context.Businesses
            .IgnoreQueryFilters()
            .CountAsync(
                b => b.CreatedAt >= fourteenDaysAgo && b.CreatedAt < sevenDaysAgo && b.DeletedAt == null,
                cancellationToken);

        var usersLastWeek = await _context.Users
            .IgnoreQueryFilters()
            .CountAsync(
                u => u.CreatedAt >= fourteenDaysAgo && u.CreatedAt < sevenDaysAgo && u.DeletedAt == null,
                cancellationToken);

        var signupsLastWeek = await _context.Businesses
            .IgnoreQueryFilters()
            .CountAsync(
                b => b.CreatedAt >= fourteenDaysAgo && b.CreatedAt < sevenDaysAgo && b.DeletedAt == null,
                cancellationToken);

        var businessGrowth = CalculateGrowth(newSignups7d, businessesLastWeek);
        var usersThisWeek = await _context.Users
            .IgnoreQueryFilters()
            .CountAsync(u => u.CreatedAt >= sevenDaysAgo && u.DeletedAt == null, cancellationToken);
        var userGrowth = CalculateGrowth(usersThisWeek, usersLastWeek);
        var signupGrowth = CalculateGrowth(newSignups7d, signupsLastWeek);

        // Get subscription breakdown
        var subscriptionsByPlan = await GetSubscriptionBreakdownAsync(cancellationToken);

        // Get recent activity
        var recentActivity = await GetRecentActivityAsync(10, cancellationToken);

        return new AdminDashboardMetricsDto
        {
            TotalBusinesses = totalBusinesses,
            TotalUsers = totalUsers,
            ActiveSubscriptions = activeSubscriptions,
            Mrr = mrr,
            NewSignups7d = newSignups7d,
            BusinessGrowth = businessGrowth,
            UserGrowth = userGrowth,
            SignupGrowth = signupGrowth,
            SubscriptionsByPlan = subscriptionsByPlan.ToList(),
            RecentActivity = recentActivity.ToList(),
        };
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminActivityItemDto>> GetRecentActivityAsync(
        int limit = 20,
        CancellationToken cancellationToken = default)
    {
        var activities = new List<AdminActivityItemDto>();

        // Admin queries use IgnoreQueryFilters() for cross-tenant platform-wide access
        // Get recent business creations
        var recentBusinesses = await _context.Businesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(b => b.DeletedAt == null)
            .OrderByDescending(b => b.CreatedAt)
            .Take(limit / 3)
            .Select(b => new AdminActivityItemDto
            {
                Id = b.Id,
                Type = "business_created",
                Description = $"New business registered: {b.Name}",
                EntityType = "Business",
                EntityId = b.Id,
                Timestamp = b.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentBusinesses);

        // Get recent user signups
        var recentUsers = await _context.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(u => u.DeletedAt == null)
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit / 3)
            .Select(u => new AdminActivityItemDto
            {
                Id = u.Id,
                Type = "user_signup",
                Description = $"New user signed up: {u.Email}",
                EntityType = "User",
                EntityId = u.Id,
                Timestamp = u.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentUsers);

        // Get recent subscription changes — exclude orphaned subscriptions
        var recentSubscriptions = await _context.Subscriptions
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(s => s.Business)
            .Include(s => s.Plan)
            .Where(s => s.DeletedAt == null && s.Business != null && s.Business.DeletedAt == null)
            .OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
            .Take(limit / 3)
            .Select(s => new AdminActivityItemDto
            {
                Id = s.Id,
                Type = "subscription_updated",
                Description = $"{s.Business.Name} subscribed to {s.Plan.DisplayName}",
                EntityType = "Subscription",
                EntityId = s.Id,
                Timestamp = s.UpdatedAt ?? s.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        activities.AddRange(recentSubscriptions);

        return activities
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToList();
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<SubscriptionPlanMetricDto>> GetSubscriptionBreakdownAsync(
        CancellationToken cancellationToken = default)
    {
        // Admin queries — exclude orphaned subscriptions
        var subscriptionData = await _context.Subscriptions
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.Status == SubscriptionStatus.Active && s.DeletedAt == null)
            .Where(s => _context.Businesses.Any(b => b.Id == s.BusinessId && b.DeletedAt == null))
            .Select(s => new
            {
                PlanId = s.Plan.Id,
                PlanName = s.Plan.DisplayName,
                PriceMonthly = s.Plan.PriceMonthly,
            })
            .ToListAsync(cancellationToken);

        var breakdown = subscriptionData
            .GroupBy(s => new { s.PlanId, s.PlanName, s.PriceMonthly })
            .Select(g => new
            {
                PlanName = g.Key.PlanName,
                Count = g.Count(),
                Revenue = g.Sum(s => s.PriceMonthly),
            })
            .ToList();

        var totalSubscriptions = breakdown.Sum(b => b.Count);

        return breakdown.Select(b => new SubscriptionPlanMetricDto
        {
            PlanName = b.PlanName,
            Count = b.Count,
            Revenue = b.Revenue,
            Percentage = totalSubscriptions > 0
                ? Math.Round((decimal)b.Count / totalSubscriptions * 100, 1)
                : 0,
        }).ToList();
    }

    private static decimal CalculateGrowth(int current, int previous)
    {
        if (previous == 0)
        {
            return current > 0 ? 100 : 0;
        }

        return Math.Round((decimal)(current - previous) / previous * 100, 1);
    }
}

