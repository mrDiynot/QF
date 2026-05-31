namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Represents revenue forecasting metrics.
/// </summary>
public record RevenueForecastDto
{
    /// <summary>
    /// Gets the forecast period (e.g., "Q1 2026", "January 2026").
    /// </summary>
    public required string Period { get; init; }

    /// <summary>
    /// Gets the total pipeline value (all open deals).
    /// </summary>
    public required decimal TotalPipelineValue { get; init; }

    /// <summary>
    /// Gets the weighted pipeline value (probability-adjusted).
    /// </summary>
    public required decimal WeightedPipelineValue { get; init; }

    /// <summary>
    /// Gets the committed revenue (high-probability deals).
    /// </summary>
    public required decimal CommittedRevenue { get; init; }

    /// <summary>
    /// Gets the best-case revenue (all deals won).
    /// </summary>
    public required decimal BestCaseRevenue { get; init; }

    /// <summary>
    /// Gets the worst-case revenue (only committed deals won).
    /// </summary>
    public required decimal WorstCaseRevenue { get; init; }

    /// <summary>
    /// Gets the expected revenue (weighted average).
    /// </summary>
    public required decimal ExpectedRevenue { get; init; }

    /// <summary>
    /// Gets the number of deals in pipeline.
    /// </summary>
    public required int TotalDeals { get; init; }

    /// <summary>
    /// Gets the average deal size.
    /// </summary>
    public required decimal AverageDealSize { get; init; }

    /// <summary>
    /// Gets the historical win rate (percentage).
    /// </summary>
    public required decimal HistoricalWinRate { get; init; }

    /// <summary>
    /// Gets the forecast confidence level (percentage).
    /// </summary>
    public required decimal ConfidenceLevel { get; init; }

    /// <summary>
    /// Gets the current month's actual revenue (closed deals this month).
    /// </summary>
    public decimal CurrentMonthRevenue { get; init; }

    /// <summary>
    /// Gets the projected monthly revenue based on pipeline and historical data.
    /// </summary>
    public decimal ProjectedMonthlyRevenue { get; init; }

    /// <summary>
    /// Gets the revenue growth rate compared to previous month (percentage).
    /// </summary>
    public decimal RevenueGrowthRate { get; init; }
}

