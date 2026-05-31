using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Analytics.DTOs;
using QualiFlow.Application.Features.Analytics.Services;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for form analytics operations.
/// </summary>
public class FormAnalyticsService : IFormAnalyticsService
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<FormAnalyticsService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="FormAnalyticsService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="currentUserService">Current user service.</param>
    /// <param name="logger">Logger instance.</param>
    public FormAnalyticsService(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<FormAnalyticsService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<FormAnalyticsDto?> GetFormAnalyticsAsync(
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var form = await _context.Forms
            .Where(f => f.Id == formId && f.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (form == null)
        {
            return null;
        }

        var views = await _context.FormViews
            .Where(v => v.FormId == formId)
            .ToListAsync(cancellationToken);

        var totalViews = views.Count;
        var totalSubmissions = views.Count(v => v.Submitted);
        var completionRate = totalViews > 0 ? (decimal)totalSubmissions / totalViews : 0;
        var avgCompletionTime = views
            .Where(v => v.Submitted && v.TimeSpentSeconds.HasValue)
            .Select(v => v.TimeSpentSeconds!.Value)
            .DefaultIfEmpty(0)
            .Average();
        var bounceRate = totalViews > 0 ? (decimal)views.Count(v => v.Bounced) / totalViews : 0;
        var lastSubmission = views
            .Where(v => v.Submitted)
            .OrderByDescending(v => v.SubmittedAt)
            .FirstOrDefault();

        var result = new FormAnalyticsDto
        {
            FormId = formId,
            FormName = form.Name,
            TotalViews = totalViews,
            TotalSubmissions = totalSubmissions,
            CompletionRate = completionRate,
            AvgCompletionTime = (int)avgCompletionTime,
            BounceRate = bounceRate,
            LastSubmissionAt = lastSubmission?.SubmittedAt
        };

        _logger.LogInformation(
            "Retrieved analytics for form {FormId}: {Views} views, {Submissions} submissions",
            formId,
            totalViews,
            totalSubmissions);

        return result;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AbTestResultDto>> GetAbTestResultsAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var tests = await _context.AbTests
            .Where(t => t.BusinessId == businessId)
            .Include(t => t.Variants)
            .ToListAsync(cancellationToken);

        var results = tests.Select(test => new AbTestResultDto
        {
            TestId = test.Id,
            TestName = test.TestName,
            Status = test.Status.ToString(),
            Variants = test.Variants.Select(v => new AbTestVariantResultDto
            {
                VariantId = v.VariantId,
                VariantName = v.VariantName,
                FormId = v.FormId,
                Views = v.Views,
                Conversions = v.Conversions,
                ConversionRate = v.ConversionRate,
                AvgCompletionTime = v.AvgCompletionTime,
                BounceRate = v.BounceRate
            }).ToList(),
            WinnerVariant = test.WinnerVariant,
            ConfidenceLevel = test.ConfidenceLevel,
            StartedAt = test.StartedAt,
            EndedAt = test.EndedAt
        }).ToList();

        _logger.LogInformation(
            "Retrieved {Count} A/B tests for business {BusinessId}",
            results.Count,
            businessId);

        return results;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<FieldDropOffDto>> GetFieldDropOffAnalysisAsync(
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var form = await _context.Forms
            .Where(f => f.Id == formId && f.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (form == null)
        {
            return Array.Empty<FieldDropOffDto>();
        }

        var interactions = await _context.FieldInteractions
            .Include(i => i.FormView)
            .Where(i => i.FormView.FormId == formId)
            .ToListAsync(cancellationToken);

        var dropOffData = interactions
            .GroupBy(i => new { i.FieldId, i.FieldLabel, i.FieldType })
            .Select(g =>
            {
                var viewsReached = g.Select(i => i.FormViewId).Distinct().Count();
                var abandons = g.Count(i => i.AbandonedAtField);
                var dropOffRate = viewsReached > 0 ? (decimal)abandons / viewsReached : 0;
                var avgTimeSpent = g
                    .Where(i => i.TimeSpentSeconds.HasValue)
                    .Select(i => i.TimeSpentSeconds!.Value)
                    .DefaultIfEmpty(0)
                    .Average();
                var validationErrors = g.Count(i => i.HadValidationError);

                return new FieldDropOffDto
                {
                    FieldId = g.Key.FieldId,
                    FieldLabel = g.Key.FieldLabel ?? string.Empty,
                    FieldType = g.Key.FieldType ?? string.Empty,
                    ViewsReached = viewsReached,
                    Abandons = abandons,
                    DropOffRate = dropOffRate,
                    AvgTimeSpent = (int)avgTimeSpent,
                    ValidationErrors = validationErrors
                };
            })
            .OrderByDescending(d => d.DropOffRate)
            .ToList();

        _logger.LogInformation(
            "Retrieved drop-off analysis for form {FormId}: {Count} fields analyzed",
            formId,
            dropOffData.Count);

        return dropOffData;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<FormSubmissionTimelineDto>> GetFormSubmissionTimelineAsync(
        Guid formId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var form = await _context.Forms
            .Where(f => f.Id == formId && f.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (form == null)
        {
            return Array.Empty<FormSubmissionTimelineDto>();
        }

        var timeline = await _context.FormViews
            .Where(v => v.FormId == formId &&
                       v.ViewedAt >= startDate &&
                       v.ViewedAt <= endDate)
            .GroupBy(v => v.ViewedAt.Date)
            .Select(g => new FormSubmissionTimelineDto
            {
                Date = g.Key,
                Views = g.Count(),
                Submissions = g.Count(v => v.Submitted),
                CompletionRate = g.Any() ? (decimal)g.Count(v => v.Submitted) / g.Count() : 0
            })
            .OrderBy(t => t.Date)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Retrieved submission timeline for form {FormId}: {Count} data points",
            formId,
            timeline.Count);

        return timeline;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QrToFormAttributionDto>> GetQrToFormAttributionAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Get all QR campaigns with linked forms
        var campaigns = await _context.QrCampaigns
            .Where(c => c.BusinessId == businessId && c.LinkedFormId != null)
            .Include(c => c.LinkedForm)
            .Include(c => c.Scans)
            .ToListAsync(cancellationToken);

        var attributionData = new List<QrToFormAttributionDto>();

        foreach (var campaign in campaigns)
        {
            if (campaign.LinkedForm == null)
            {
                continue;
            }

            // Get scans for this campaign
            var scans = campaign.Scans.ToList();
            var totalScans = scans.Count;

            // Get form views that came from QR scans (matched by session ID or timestamp proximity)
            var scanSessionIds = scans
                .Where(s => !string.IsNullOrEmpty(s.SessionId))
                .Select(s => s.SessionId)
                .ToHashSet();

            var formViews = await _context.FormViews
                .Where(v => v.FormId == campaign.LinkedFormId &&
                           scanSessionIds.Contains(v.SessionId!))
                .ToListAsync(cancellationToken);

            var formSubmissions = formViews.Count(v => v.Submitted);

            // Calculate attribution metrics
            var scanToViewRate = totalScans > 0 ? (decimal)formViews.Count / totalScans : 0;
            var scanToSubmissionRate = totalScans > 0 ? (decimal)formSubmissions / totalScans : 0;

            // Calculate average time from scan to submission
            var submittedViews = formViews.Where(v => v.Submitted && v.SubmittedAt.HasValue).ToList();
            int? avgTimeToSubmission = null;

            if (submittedViews.Count > 0)
            {
                var times = new List<int>();
                foreach (var view in submittedViews)
                {
                    var matchingScan = scans
                        .Where(s => s.SessionId == view.SessionId)
                        .OrderBy(s => s.ScannedAt)
                        .FirstOrDefault();

                    if (matchingScan != null && view.SubmittedAt.HasValue)
                    {
                        var timeToSubmission = (int)(view.SubmittedAt.Value - matchingScan.ScannedAt).TotalSeconds;
                        times.Add(timeToSubmission);
                    }
                }

                if (times.Count > 0)
                {
                    avgTimeToSubmission = (int)times.Average();
                }
            }

            attributionData.Add(new QrToFormAttributionDto
            {
                CampaignId = campaign.Id,
                CampaignName = campaign.Name,
                FormId = campaign.LinkedFormId!.Value,
                FormName = campaign.LinkedForm.Name,
                Scans = totalScans,
                FormViews = formViews.Count,
                FormSubmissions = formSubmissions,
                ScanToViewRate = scanToViewRate,
                ScanToSubmissionRate = scanToSubmissionRate,
                AvgTimeToSubmission = avgTimeToSubmission
            });
        }

        _logger.LogInformation(
            "Retrieved QR-to-Form attribution for {Count} campaigns",
            attributionData.Count);

        return attributionData;
    }
}
