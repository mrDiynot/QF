namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Represents a date range for analytics queries.
/// </summary>
public record DateRange
{
    /// <summary>
    /// Gets the start date of the range (inclusive).
    /// </summary>
    public DateTime Start { get; init; }

    /// <summary>
    /// Gets the end date of the range (exclusive).
    /// </summary>
    public DateTime End { get; init; }

    /// <summary>
    /// Gets the total number of days in the range.
    /// </summary>
    public int TotalDays => (End - Start).Days;

    /// <summary>
    /// Creates a date range for today.
    /// </summary>
    /// <returns>A date range representing today.</returns>
    public static DateRange Today()
    {
        var today = DateTime.UtcNow.Date;
        return new DateRange { Start = today, End = today.AddDays(1) };
    }

    /// <summary>
    /// Creates a date range for the last N days.
    /// </summary>
    /// <param name="days">The number of days to include in the range.</param>
    /// <returns>A date range for the last N days.</returns>
    public static DateRange LastNDays(int days)
    {
        var end = DateTime.UtcNow.Date.AddDays(1);
        var start = end.AddDays(-days);
        return new DateRange { Start = start, End = end };
    }

    /// <summary>
    /// Creates a date range for the current month.
    /// </summary>
    /// <returns>A date range representing the current month.</returns>
    public static DateRange CurrentMonth()
    {
        var now = DateTime.UtcNow;
        var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);
        return new DateRange { Start = start, End = end };
    }

    /// <summary>
    /// Creates a date range for the previous month.
    /// </summary>
    /// <returns>A date range representing the previous month.</returns>
    public static DateRange PreviousMonth()
    {
        var now = DateTime.UtcNow;
        var firstDayPrevMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-1);
        var firstDayCurrentMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        return new DateRange { Start = firstDayPrevMonth, End = firstDayCurrentMonth };
    }
}
