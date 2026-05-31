namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Represents time-to-conversion metrics.
/// </summary>
public record TimeToConversionDto
{
    /// <summary>
    /// Gets the average time from lead creation to first conversation.
    /// </summary>
    public required TimeSpan AverageTimeToFirstContact { get; init; }

    /// <summary>
    /// Gets the average time from lead creation to qualification.
    /// </summary>
    public required TimeSpan AverageTimeToQualification { get; init; }

    /// <summary>
    /// Gets the average time from lead creation to booking.
    /// </summary>
    public required TimeSpan AverageTimeToBooking { get; init; }

    /// <summary>
    /// Gets the average time from lead creation to conversion.
    /// </summary>
    public required TimeSpan AverageTimeToConversion { get; init; }

    /// <summary>
    /// Gets the median time to conversion.
    /// </summary>
    public required TimeSpan MedianTimeToConversion { get; init; }

    /// <summary>
    /// Gets the fastest conversion time.
    /// </summary>
    public required TimeSpan FastestConversion { get; init; }

    /// <summary>
    /// Gets the slowest conversion time.
    /// </summary>
    public required TimeSpan SlowestConversion { get; init; }

    /// <summary>
    /// Gets the total number of conversions analyzed.
    /// </summary>
    public required int TotalConversions { get; init; }
}

