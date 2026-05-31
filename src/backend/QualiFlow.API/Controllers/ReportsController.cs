// -----------------------------------------------------------------------
// <copyright file="ReportsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for custom reports, ROI calculator, and revenue tracking.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ReportsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ReportsController"/> class.
    /// </summary>
    public ReportsController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ReportsController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    // ============================================================================
    // ROI CALCULATOR
    // ============================================================================

    /// <summary>
    /// Calculates ROI metrics for the business.
    /// </summary>
    /// <param name="from">Start date.</param>
    /// <param name="to">End date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>ROI metrics.</returns>
    [HttpGet("roi")]
    [CacheControl(CacheStrategies.MediumTerm, "Authorization")]
    [ProducesResponseType(typeof(RoiMetrics), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoiMetrics>> GetRoiMetricsAsync(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var startDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = to ?? DateTime.UtcNow;

        _logger.LogInformation("Calculating ROI for business {BusinessId} from {Start} to {End}", businessId, startDate, endDate);

        // Get leads in period
        var leads = await _context.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null && l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        // Get deals/revenue
        var deals = await _context.Deals
            .AsNoTracking()
            .Where(d => d.BusinessId == businessId && d.DeletedAt == null && d.CreatedAt >= startDate && d.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        // Get subscription cost
        var subscription = await _context.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        var monthlyCost = subscription?.Plan?.PriceMonthly ?? 0;
        var periodMonths = Math.Max(1, (endDate - startDate).TotalDays / 30);
        var totalCost = monthlyCost * (decimal)periodMonths;

        // Calculate metrics
        var totalLeads = leads.Count;
        var qualifiedLeads = leads.Count(l => l.Score >= 50);
        var wonDeals = deals.Count(d => d.Stage == DealStage.Won);
        var totalRevenue = deals.Where(d => d.Stage == DealStage.Won).Sum(d => d.Value);
        var conversionRate = totalLeads > 0 ? (decimal)wonDeals / totalLeads * 100 : 0;
        var costPerLead = totalLeads > 0 ? totalCost / totalLeads : 0;
        var roi = totalCost > 0 ? (totalRevenue - totalCost) / totalCost * 100 : 0;

        return Ok(new RoiMetrics
        {
            TotalLeads = totalLeads,
            QualifiedLeads = qualifiedLeads,
            WonDeals = wonDeals,
            TotalRevenue = totalRevenue,
            TotalCost = totalCost,
            CostPerLead = Math.Round(costPerLead, 2),
            ConversionRate = Math.Round(conversionRate, 2),
            Roi = Math.Round(roi, 2),
            PeriodStart = startDate,
            PeriodEnd = endDate,
        });
    }

    // ============================================================================
    // REVENUE TRACKING
    // ============================================================================

    /// <summary>
    /// Gets revenue tracking data.
    /// </summary>
    /// <param name="from">Start date.</param>
    /// <param name="to">End date.</param>
    /// <param name="groupBy">Grouping (day, week, month).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Revenue data.</returns>
    [HttpGet("revenue")]
    [ProducesResponseType(typeof(RevenueTrackingResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RevenueTrackingResponse>> GetRevenueTrackingAsync(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string groupBy = "day",
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var startDate = from ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = to ?? DateTime.UtcNow;

        var deals = await _context.Deals
            .AsNoTracking()
            .Where(d => d.BusinessId == businessId && d.DeletedAt == null && d.CreatedAt >= startDate && d.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        var wonDeals = deals.Where(d => d.Stage == DealStage.Won).ToList();

        // Group by period
        var dataPoints = groupBy.ToLowerInvariant() switch
        {
            "week" => wonDeals
                .GroupBy(d => CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(d.CreatedAt, CalendarWeekRule.FirstDay, DayOfWeek.Monday))
                .Select(g => new RevenueDataPoint
                {
                    Period = $"Week {g.Key}",
                    Revenue = g.Sum(d => d.Value),
                    DealCount = g.Count(),
                })
                .ToList(),
            "month" => wonDeals
                .GroupBy(d => new { d.CreatedAt.Year, d.CreatedAt.Month })
                .Select(g => new RevenueDataPoint
                {
                    Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(d => d.Value),
                    DealCount = g.Count(),
                })
                .ToList(),
            _ => wonDeals
                .GroupBy(d => d.CreatedAt.Date)
                .Select(g => new RevenueDataPoint
                {
                    Period = g.Key.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    Revenue = g.Sum(d => d.Value),
                    DealCount = g.Count(),
                })
                .ToList()
        };

        // Calculate summary
        var totalRevenue = wonDeals.Sum(d => d.Value);
        var avgDealSize = wonDeals.Count > 0 ? totalRevenue / wonDeals.Count : 0;
        var pipelineValue = deals.Where(d => d.Stage != DealStage.Won && d.Stage != DealStage.Lost).Sum(d => d.Value);

        return Ok(new RevenueTrackingResponse
        {
            TotalRevenue = totalRevenue,
            WonDeals = wonDeals.Count,
            AverageDealSize = Math.Round(avgDealSize, 2),
            PipelineValue = pipelineValue,
            DataPoints = dataPoints,
            PeriodStart = startDate,
            PeriodEnd = endDate,
        });
    }

    // ============================================================================
    // CUSTOM REPORTS
    // ============================================================================

    /// <summary>
    /// Gets available report templates.
    /// </summary>
    /// <returns>List of report templates.</returns>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(IEnumerable<ReportTemplate>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<ReportTemplate>> GetReportTemplates()
    {
        var templates = new List<ReportTemplate>
        {
            new() { Id = "leads_overview", Name = "Leads Overview", Description = "Summary of leads by status, source, and score", Category = "Leads" },
            new() { Id = "leads_by_source", Name = "Leads by Source", Description = "Lead breakdown by acquisition source", Category = "Leads" },
            new() { Id = "leads_by_score", Name = "Lead Scoring Analysis", Description = "Distribution of lead scores over time", Category = "Leads" },
            new() { Id = "conversion_funnel", Name = "Conversion Funnel", Description = "Lead to customer conversion analysis", Category = "Sales" },
            new() { Id = "revenue_by_source", Name = "Revenue by Source", Description = "Revenue attribution by lead source", Category = "Sales" },
            new() { Id = "deal_pipeline", Name = "Deal Pipeline", Description = "Current deal pipeline status", Category = "Sales" },
            new() { Id = "team_performance", Name = "Team Performance", Description = "Sales team activity and results", Category = "Team" },
            new() { Id = "channel_performance", Name = "Channel Performance", Description = "Message and response metrics by channel", Category = "Channels" },
            new() { Id = "ai_usage", Name = "AI Usage Report", Description = "AI interactions and qualification metrics", Category = "AI" },
            new() { Id = "response_times", Name = "Response Time Analysis", Description = "Average response times by channel", Category = "Performance" },
        };

        return Ok(templates);
    }

    /// <summary>
    /// Generates a custom report.
    /// </summary>
    /// <param name="request">Report generation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated report data.</returns>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(CustomReportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomReportResult>> GenerateReportAsync(
        [FromBody] GenerateReportRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var startDate = request.From ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = request.To ?? DateTime.UtcNow;

        _logger.LogInformation("Generating report {TemplateId} for business {BusinessId}", request.TemplateId, businessId);

        var report = request.TemplateId switch
        {
            "leads_overview" => await GenerateLeadsOverviewReportAsync(businessId, startDate, endDate, cancellationToken),
            "leads_by_source" => await GenerateLeadsBySourceReportAsync(businessId, startDate, endDate, cancellationToken),
            "conversion_funnel" => await GenerateConversionFunnelReportAsync(businessId, startDate, endDate, cancellationToken),
            "deal_pipeline" => await GenerateDealPipelineReportAsync(businessId, startDate, endDate, cancellationToken),
            "channel_performance" => await GenerateChannelPerformanceReportAsync(businessId, startDate, endDate, cancellationToken),
            _ => null,
        };

        if (report == null)
        {
            return BadRequest(new { message = $"Unknown report template: {request.TemplateId}" });
        }

        return Ok(report);
    }

    // ============================================================================
    // EXPORT TO PDF/EXCEL
    // ============================================================================

    /// <summary>
    /// Exports report data to Excel format.
    /// </summary>
    /// <param name="request">Export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Excel file.</returns>
    [HttpPost("export/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportToExcelAsync(
        [FromBody] ExportReportRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var startDate = request.From ?? DateTime.UtcNow.AddMonths(-1);
        var endDate = request.To ?? DateTime.UtcNow;

        // Generate CSV (Excel-compatible)
        var csv = new StringBuilder();

        switch (request.ReportType)
        {
            case "leads":
                var leads = await _context.Leads
                    .AsNoTracking()
                    .Where(l => l.BusinessId == businessId && l.DeletedAt == null && l.CreatedAt >= startDate && l.CreatedAt <= endDate)
                    .ToListAsync(cancellationToken);

                csv.AppendLine("ID,Name,Email,Phone,Status,Score,Source,Created At");
                foreach (var lead in leads)
                {
                    csv.AppendLine(CultureInfo.InvariantCulture, $"{lead.Id},{EscapeCsv(lead.Name)},{EscapeCsv(lead.Email)},{EscapeCsv(lead.Phone ?? string.Empty)},{lead.Status},{lead.Score},{lead.SourceChannel},{lead.CreatedAt:yyyy-MM-dd HH:mm}");
                }

                break;

            case "deals":
                var deals = await _context.Deals
                    .AsNoTracking()
                    .Where(d => d.BusinessId == businessId && d.DeletedAt == null && d.CreatedAt >= startDate && d.CreatedAt <= endDate)
                    .ToListAsync(cancellationToken);

                csv.AppendLine("ID,Title,Value,Stage,Created At");
                foreach (var deal in deals)
                {
                    csv.AppendLine(CultureInfo.InvariantCulture, $"{deal.Id},{EscapeCsv(deal.Title)},{deal.Value},{deal.Stage},{deal.CreatedAt:yyyy-MM-dd HH:mm}");
                }

                break;

            case "conversations":
                var conversations = await _context.Conversations
                    .AsNoTracking()
                    .Where(c => c.BusinessId == businessId && c.CreatedAt >= startDate && c.CreatedAt <= endDate)
                    .ToListAsync(cancellationToken);

                csv.AppendLine("ID,Channel,Status,Created At");
                foreach (var conv in conversations)
                {
                    csv.AppendLine(CultureInfo.InvariantCulture, $"{conv.Id},{conv.Channel},{conv.Status},{conv.CreatedAt:yyyy-MM-dd HH:mm}");
                }

                break;

            default:
                return BadRequest(new { message = $"Unknown report type: {request.ReportType}" });
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{request.ReportType}-report-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    /// <summary>
    /// Exports report data to CSV format.
    /// </summary>
    /// <param name="request">Export request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file.</returns>
    [HttpPost("export/csv")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportToCsvAsync(
        [FromBody] ExportReportRequest request,
        CancellationToken cancellationToken)
    {
        // Reuse Excel export logic (already generates CSV)
        return await ExportToExcelAsync(request, cancellationToken);
    }

    // ============================================================================
    // PRIVATE HELPERS
    // ============================================================================

    private async Task<CustomReportResult> GenerateLeadsOverviewReportAsync(Guid businessId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var leads = await _context.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null && l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        var byStatus = leads.GroupBy(l => l.Status).Select(g => new { Status = g.Key.ToString(), Count = g.Count() }).ToList();
        var byScore = new[]
        {
            new { Range = "0-25 (Cold)", Count = leads.Count(l => l.Score < 25) },
            new { Range = "25-50 (Warm)", Count = leads.Count(l => l.Score >= 25 && l.Score < 50) },
            new { Range = "50-75 (Hot)", Count = leads.Count(l => l.Score >= 50 && l.Score < 75) },
            new { Range = "75-100 (Very Hot)", Count = leads.Count(l => l.Score >= 75) },
        };

        return new CustomReportResult
        {
            Title = "Leads Overview",
            GeneratedAt = DateTime.UtcNow,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            Summary = new Dictionary<string, object>
            {
                ["totalLeads"] = leads.Count,
                ["averageScore"] = leads.Count > 0 ? Math.Round(leads.Average(l => l.Score), 1) : 0,
            },
            Data = new Dictionary<string, object>
            {
                ["byStatus"] = byStatus,
                ["byScore"] = byScore,
            },
        };
    }

    private async Task<CustomReportResult> GenerateLeadsBySourceReportAsync(Guid businessId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var leads = await _context.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null && l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        var bySource = leads
            .GroupBy(l => l.SourceChannel)
            .Select(g => new { Source = g.Key, Count = g.Count(), AvgScore = Math.Round(g.Average(l => l.Score), 1) })
            .OrderByDescending(x => x.Count)
            .ToList();

        return new CustomReportResult
        {
            Title = "Leads by Source",
            GeneratedAt = DateTime.UtcNow,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            Summary = new Dictionary<string, object>
            {
                ["totalLeads"] = leads.Count,
                ["topSource"] = bySource.FirstOrDefault()?.Source ?? "N/A",
            },
            Data = new Dictionary<string, object>
            {
                ["bySource"] = bySource,
            },
        };
    }

    private async Task<CustomReportResult> GenerateConversionFunnelReportAsync(Guid businessId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var leads = await _context.Leads
            .AsNoTracking()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null && l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        var deals = await _context.Deals
            .AsNoTracking()
            .Where(d => d.BusinessId == businessId && d.DeletedAt == null && d.CreatedAt >= startDate && d.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        var totalLeads = leads.Count;
        var qualifiedLeads = leads.Count(l => l.Score >= 50);
        var dealsCreated = deals.Count;
        var wonDeals = deals.Count(d => d.Stage == DealStage.Won);

        return new CustomReportResult
        {
            Title = "Conversion Funnel",
            GeneratedAt = DateTime.UtcNow,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            Summary = new Dictionary<string, object>
            {
                ["overallConversion"] = totalLeads > 0 ? Math.Round((decimal)wonDeals / totalLeads * 100, 2) : 0,
            },
            Data = new Dictionary<string, object>
            {
                ["funnel"] = new object[]
                {
                    new { Stage = "Total Leads", Count = totalLeads, Percentage = 100m },
                    new { Stage = "Qualified", Count = qualifiedLeads, Percentage = totalLeads > 0 ? Math.Round((decimal)qualifiedLeads / totalLeads * 100, 1) : 0m },
                    new { Stage = "Deals Created", Count = dealsCreated, Percentage = totalLeads > 0 ? Math.Round((decimal)dealsCreated / totalLeads * 100, 1) : 0m },
                    new { Stage = "Won", Count = wonDeals, Percentage = totalLeads > 0 ? Math.Round((decimal)wonDeals / totalLeads * 100, 1) : 0m },
                },
            },
        };
    }

    private async Task<CustomReportResult> GenerateDealPipelineReportAsync(Guid businessId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var deals = await _context.Deals
            .AsNoTracking()
            .Where(d => d.BusinessId == businessId && d.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var byStage = deals
            .GroupBy(d => d.Stage)
            .Select(g => new { Stage = g.Key, Count = g.Count(), Value = g.Sum(d => d.Value) })
            .ToList();

        return new CustomReportResult
        {
            Title = "Deal Pipeline",
            GeneratedAt = DateTime.UtcNow,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            Summary = new Dictionary<string, object>
            {
                ["totalDeals"] = deals.Count,
                ["totalValue"] = deals.Sum(d => d.Value),
            },
            Data = new Dictionary<string, object>
            {
                ["byStage"] = byStage,
            },
        };
    }

    private async Task<CustomReportResult> GenerateChannelPerformanceReportAsync(Guid businessId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var conversations = await _context.Conversations
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.CreatedAt >= startDate && c.CreatedAt <= endDate)
            .ToListAsync(cancellationToken);

        var byChannel = conversations
            .GroupBy(c => c.Channel)
            .Select(g => new { Channel = g.Key.ToString(), Count = g.Count() })
            .ToList();

        return new CustomReportResult
        {
            Title = "Channel Performance",
            GeneratedAt = DateTime.UtcNow,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            Summary = new Dictionary<string, object>
            {
                ["totalConversations"] = conversations.Count,
            },
            Data = new Dictionary<string, object>
            {
                ["byChannel"] = byChannel,
            },
        };
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

// ============================================================================
// DTOs
// ============================================================================

/// <summary>
/// ROI metrics response.
/// </summary>
public class RoiMetrics
{
    public int TotalLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int WonDeals { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal CostPerLead { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal Roi { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

/// <summary>
/// Revenue tracking response.
/// </summary>
public class RevenueTrackingResponse
{
    public decimal TotalRevenue { get; set; }
    public int WonDeals { get; set; }
    public decimal AverageDealSize { get; set; }
    public decimal PipelineValue { get; set; }
    public IReadOnlyList<RevenueDataPoint> DataPoints { get; init; } = [];
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

/// <summary>
/// Revenue data point.
/// </summary>
public class RevenueDataPoint
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int DealCount { get; set; }
}

/// <summary>
/// Report template definition.
/// </summary>
public class ReportTemplate
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

/// <summary>
/// Request to generate a custom report.
/// </summary>
public class GenerateReportRequest
{
    public string TemplateId { get; set; } = string.Empty;
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public IReadOnlyDictionary<string, string>? Filters { get; init; }
}

/// <summary>
/// Custom report result.
/// </summary>
public class CustomReportResult
{
    public string Title { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public IReadOnlyDictionary<string, object> Summary { get; init; } = new Dictionary<string, object>();
    public IReadOnlyDictionary<string, object> Data { get; init; } = new Dictionary<string, object>();
}

/// <summary>
/// Request to export a report.
/// </summary>
public class ExportReportRequest
{
    public string ReportType { get; set; } = string.Empty;
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
