// -----------------------------------------------------------------------
// <copyright file="AdminExportController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for data export operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/export")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminExportController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminExportController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminExportController"/> class.
    /// </summary>
    public AdminExportController(
        QualiFlowDbContext context,
        ILogger<AdminExportController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Exports business usage data as CSV.
    /// </summary>
    /// <param name="from">Start date for the export.</param>
    /// <param name="to">End date for the export.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file with business usage data.</returns>
    [HttpGet("businesses")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportBusinessUsageAsync(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin exporting business usage data");

        var startDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = to ?? DateTime.UtcNow;

        var businesses = await _context.Businesses
            .AsNoTracking()
            .Where(b => b.DeletedAt == null)
            .Select(b => new
            {
                b.Id,
                b.Name,
                b.CreatedAt,
                UserCount = _context.Users.Count(u => u.BusinessId == b.Id && u.DeletedAt == null),
                LeadCount = _context.Leads.Count(l => l.BusinessId == b.Id && l.DeletedAt == null),
                ConversationCount = _context.Conversations.Count(c => c.BusinessId == b.Id),
                MessageCount = _context.Messages.Count(m => m.Conversation.BusinessId == b.Id && m.CreatedAt >= startDate && m.CreatedAt <= endDate),
                FormCount = _context.Forms.Count(f => f.BusinessId == b.Id && f.DeletedAt == null),
                SubmissionCount = _context.FormSubmissions.Count(fs => fs.Form.BusinessId == b.Id && fs.SubmittedAt >= startDate && fs.SubmittedAt <= endDate),
            })
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Business ID,Business Name,Created At,Users,Leads,Conversations,Messages (Period),Forms,Submissions (Period)");

        foreach (var b in businesses)
        {
            csv.AppendLine(CultureInfo.InvariantCulture, $"{b.Id},{EscapeCsv(b.Name)},{b.CreatedAt:yyyy-MM-dd},{b.UserCount},{b.LeadCount},{b.ConversationCount},{b.MessageCount},{b.FormCount},{b.SubmissionCount}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"business-usage-{startDate:yyyyMMdd}-{endDate:yyyyMMdd}.csv");
    }

    /// <summary>
    /// Exports user activity data as CSV.
    /// </summary>
    /// <param name="from">Start date for the export.</param>
    /// <param name="to">End date for the export.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file with user activity data.</returns>
    [HttpGet("users")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportUserActivityAsync(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin exporting user activity data");

        var startDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = to ?? DateTime.UtcNow;

        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.DeletedAt == null)
            .Include(u => u.Business)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                BusinessName = u.Business.Name,
                u.CreatedAt,
                u.LastLoginAt,
                u.IsActive,
            })
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("User ID,Email,First Name,Last Name,Business,Created At,Last Login,Active");

        foreach (var u in users)
        {
            csv.AppendLine(CultureInfo.InvariantCulture, $"{u.Id},{EscapeCsv(u.Email ?? string.Empty)},{EscapeCsv(u.FirstName)},{EscapeCsv(u.LastName)},{EscapeCsv(u.BusinessName)},{u.CreatedAt:yyyy-MM-dd},{u.LastLoginAt?.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture) ?? "Never"},{u.IsActive}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"user-activity-{startDate:yyyyMMdd}-{endDate:yyyyMMdd}.csv");
    }

    /// <summary>
    /// Exports AI usage data as CSV.
    /// </summary>
    /// <param name="from">Start date for the export.</param>
    /// <param name="to">End date for the export.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file with AI usage data.</returns>
    [HttpGet("ai-usage")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportAIUsageAsync(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin exporting AI usage data");

        var startDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = to ?? DateTime.UtcNow;

        var usageLogs = await _context.ExternalUsageLogs
            .AsNoTracking()
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .Include(l => l.Business)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new
            {
                l.Id,
                BusinessName = l.Business != null ? l.Business.Name : "Unknown",
                l.ServiceType,
                l.OperationType,
                l.InputTokens,
                l.OutputTokens,
                l.EstimatedCost,
                l.CreatedAt,
            })
            .Take(10000)
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Log ID,Business,Service,Operation,Input Tokens,Output Tokens,Est. Cost,Timestamp");

        foreach (var l in usageLogs)
        {
            csv.AppendLine(CultureInfo.InvariantCulture, $"{l.Id},{EscapeCsv(l.BusinessName)},{l.ServiceType},{l.OperationType},{l.InputTokens},{l.OutputTokens},{l.EstimatedCost:F4},{l.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"ai-usage-{startDate:yyyyMMdd}-{endDate:yyyyMMdd}.csv");
    }

    /// <summary>
    /// Exports subscription data as CSV.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file with subscription data.</returns>
    [HttpGet("subscriptions")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportSubscriptionsAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin exporting subscription data");

        var subscriptions = await _context.Subscriptions
            .AsNoTracking()
            .Include(s => s.Business)
            .Include(s => s.Plan)
            .Select(s => new
            {
                s.Id,
                BusinessName = s.Business != null ? s.Business.Name : "Unknown",
                PlanName = s.Plan != null ? s.Plan.Name : "Unknown",
                s.Status,
                StartDate = s.CurrentPeriodStart,
                EndDate = s.CurrentPeriodEnd,
                MonthlyPrice = s.Plan != null ? s.Plan.PriceMonthly : 0,
            })
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Subscription ID,Business,Plan,Status,Start Date,End Date,Monthly Price");

        foreach (var s in subscriptions)
        {
            csv.AppendLine(CultureInfo.InvariantCulture, $"{s.Id},{EscapeCsv(s.BusinessName)},{EscapeCsv(s.PlanName)},{s.Status},{s.StartDate:yyyy-MM-dd},{s.EndDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? "N/A"},{s.MonthlyPrice:F2}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"subscriptions-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    /// <summary>
    /// Gets available export options.
    /// </summary>
    /// <returns>List of available exports with descriptions.</returns>
    [HttpGet("options")]
    [ProducesResponseType(typeof(List<ExportOption>), StatusCodes.Status200OK)]
    public ActionResult<List<ExportOption>> GetExportOptions()
    {
        var options = new List<ExportOption>
        {
            new() { Id = "businesses", Name = "Business Usage", Description = "Export all businesses with usage metrics", SupportsDateRange = true },
            new() { Id = "users", Name = "User Activity", Description = "Export all users with activity data", SupportsDateRange = true },
            new() { Id = "ai-usage", Name = "AI Usage Logs", Description = "Export OpenAI/Twilio usage logs", SupportsDateRange = true },
            new() { Id = "subscriptions", Name = "Subscriptions", Description = "Export all subscription data", SupportsDateRange = false },
        };

        return Ok(options);
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        if (value.Contains(',', StringComparison.Ordinal) ||
            value.Contains('"', StringComparison.Ordinal) ||
            value.Contains('\n', StringComparison.Ordinal))
        {
            return $"\"{value.Replace("\"", "\"\"", StringComparison.Ordinal)}\"";
        }

        return value;
    }
}

/// <summary>
/// Represents an available export option.
/// </summary>
public class ExportOption
{
    /// <summary>
    /// Gets or sets the export identifier.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the export name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the export description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this export supports date range filtering.
    /// </summary>
    public bool SupportsDateRange { get; set; }
}
