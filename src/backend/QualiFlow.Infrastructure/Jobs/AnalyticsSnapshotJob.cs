// <copyright file="AnalyticsSnapshotJob.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Analytics.DTOs;
using QualiFlow.Application.Features.Analytics.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to pre-compute analytics metrics for consistent dashboard display.
/// Runs hourly to ensure near real-time metrics while reducing database load.
/// </summary>
public sealed partial class AnalyticsSnapshotJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsSnapshotJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AnalyticsSnapshotJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="analyticsService">The analytics service.</param>
    /// <param name="logger">The logger.</param>
    public AnalyticsSnapshotJob(
        QualiFlowDbContext context,
        IAnalyticsService analyticsService,
        ILogger<AnalyticsSnapshotJob> logger)
    {
        _context = context;
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the analytics snapshot job.
    /// Computes and stores dashboard metrics for all active businesses.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        LogStartingJob(_logger);

        var now = DateTime.UtcNow;
        var snapshotDate = new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0, DateTimeKind.Utc);

        // Get all active businesses
        var businesses = await _context.Businesses
            .AsNoTracking()
            .Where(b => b.IsActive && b.DeletedAt == null)
            .Select(b => b.Id)
            .ToListAsync();

        LogFoundBusinesses(_logger, businesses.Count);

        var createdCount = 0;
        var updatedCount = 0;
        var errorCount = 0;

        foreach (var businessId in businesses)
        {
            try
            {
                await ComputeAndStoreSnapshotAsync(businessId, snapshotDate);

                // Check if snapshot already exists
                var existingSnapshot = await _context.AnalyticsSnapshots
                    .FirstOrDefaultAsync(s =>
                        s.BusinessId == businessId &&
                        s.SnapshotDate == snapshotDate &&
                        s.Period == SnapshotPeriod.Hourly);

                if (existingSnapshot != null)
                {
                    updatedCount++;
                }
                else
                {
                    createdCount++;
                }
            }
            catch (Exception ex)
            {
                LogSnapshotError(_logger, businessId, ex.Message);
                errorCount++;
            }
        }

        LogJobCompleted(_logger, createdCount, updatedCount, errorCount);
    }

    private async Task ComputeAndStoreSnapshotAsync(Guid businessId, DateTime snapshotDate)
    {
        // Define date ranges
        var last24Hours = new DateRange
        {
            Start = DateTime.UtcNow.AddHours(-24),
            End = DateTime.UtcNow,
        };

        var last30Days = new DateRange
        {
            Start = DateTime.UtcNow.AddDays(-30),
            End = DateTime.UtcNow,
        };

        // Compute dashboard metrics
        var dashboardMetrics = await _analyticsService.GetDashboardMetricsAsync(
            businessId, last30Days, CancellationToken.None);

        // Compute channel performance
        var channelPerformance = await _analyticsService.GetChannelPerformanceAsync(
            businessId, last30Days, CancellationToken.None);

        // Compute conversion funnel
        var conversionFunnel = await _analyticsService.GetConversionFunnelAsync(
            businessId, last30Days, CancellationToken.None);

        // Calculate AI metrics
        var aiInteractions = await _context.Set<ExternalUsageLog>()
            .Where(u => u.BusinessId == businessId &&
                       u.CreatedAt >= last24Hours.Start &&
                       u.ServiceType == "openai")
            .CountAsync();

        var aiCoverageRate = dashboardMetrics.TotalConversations > 0
            ? Math.Min(100m, (decimal)aiInteractions / dashboardMetrics.TotalConversations * 100)
            : 0m;

        var aiQualificationRate = dashboardMetrics.TotalLeads > 0
            ? (decimal)dashboardMetrics.QualifiedLeads / dashboardMetrics.TotalLeads * 100
            : 0m;

        // Check for existing snapshot
        var existingSnapshot = await _context.AnalyticsSnapshots
            .FirstOrDefaultAsync(s =>
                s.BusinessId == businessId &&
                s.SnapshotDate == snapshotDate &&
                s.Period == SnapshotPeriod.Hourly);

        if (existingSnapshot != null)
        {
            // Update existing snapshot
            existingSnapshot.TotalLeads = dashboardMetrics.TotalLeads;
            existingSnapshot.QualifiedLeads = dashboardMetrics.QualifiedLeads;
            existingSnapshot.TotalConversations = dashboardMetrics.TotalConversations;
            existingSnapshot.TotalMessages = dashboardMetrics.TotalMessages;
            existingSnapshot.AverageResponseTime = (decimal)dashboardMetrics.AverageResponseTime;
            existingSnapshot.ConversionRate = dashboardMetrics.ConversionRate;
            existingSnapshot.ActiveChannels = dashboardMetrics.ActiveChannels;
            existingSnapshot.ChannelPerformanceJson = JsonSerializer.Serialize(channelPerformance);
            existingSnapshot.TotalAIInteractions = aiInteractions;
            existingSnapshot.AICoverageRate = Math.Round(aiCoverageRate, 2);
            existingSnapshot.AIQualificationRate = Math.Round(aiQualificationRate, 2);
            existingSnapshot.LeadsWithConversation = conversionFunnel.LeadsWithConversation;
            existingSnapshot.LeadsWithBooking = conversionFunnel.LeadsWithBooking;
            existingSnapshot.ConvertedLeads = conversionFunnel.ConvertedLeads;
            existingSnapshot.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new snapshot
            var snapshot = new AnalyticsSnapshot
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                SnapshotDate = snapshotDate,
                Period = SnapshotPeriod.Hourly,
                TotalLeads = dashboardMetrics.TotalLeads,
                QualifiedLeads = dashboardMetrics.QualifiedLeads,
                TotalConversations = dashboardMetrics.TotalConversations,
                TotalMessages = dashboardMetrics.TotalMessages,
                AverageResponseTime = (decimal)dashboardMetrics.AverageResponseTime,
                ConversionRate = dashboardMetrics.ConversionRate,
                ActiveChannels = dashboardMetrics.ActiveChannels,
                ChannelPerformanceJson = JsonSerializer.Serialize(channelPerformance),
                TotalAIInteractions = aiInteractions,
                AICoverageRate = Math.Round(aiCoverageRate, 2),
                AIQualificationRate = Math.Round(aiQualificationRate, 2),
                LeadsWithConversation = conversionFunnel.LeadsWithConversation,
                LeadsWithBooking = conversionFunnel.LeadsWithBooking,
                ConvertedLeads = conversionFunnel.ConvertedLeads,
                CreatedAt = DateTime.UtcNow,
            };

            _context.AnalyticsSnapshots.Add(snapshot);
        }

        await _context.SaveChangesAsync();

        LogSnapshotComputed(
            _logger,
            businessId,
            dashboardMetrics.TotalLeads,
            dashboardMetrics.TotalConversations,
            dashboardMetrics.ConversionRate);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting analytics snapshot job")]
    private static partial void LogStartingJob(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Found {Count} active businesses")]
    private static partial void LogFoundBusinesses(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Computed snapshot for business {BusinessId}: {LeadsCount} leads, {ConversationsCount} conversations, {ConversionRate}% conversion")]
    private static partial void LogSnapshotComputed(ILogger logger, Guid businessId, int leadsCount, int conversationsCount, decimal conversionRate);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to compute snapshot for business {BusinessId}: {Error}")]
    private static partial void LogSnapshotError(ILogger logger, Guid businessId, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "Analytics snapshot job completed. Created {CreatedCount}, updated {UpdatedCount}, errors {ErrorCount}")]
    private static partial void LogJobCompleted(ILogger logger, int createdCount, int updatedCount, int errorCount);
}
