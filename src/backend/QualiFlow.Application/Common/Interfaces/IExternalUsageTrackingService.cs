namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service for tracking external service usage (OpenAI, Twilio) per business.
/// </summary>
public interface IExternalUsageTrackingService
{
    /// <summary>
    /// Tracks OpenAI API usage for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="inputTokens">Number of input tokens used.</param>
    /// <param name="outputTokens">Number of output tokens used.</param>
    /// <param name="model">The model used (e.g., "gpt-4").</param>
    /// <param name="operationType">Type of operation (e.g., "qualification", "intent_detection").</param>
    /// <param name="conversationId">Optional conversation ID.</param>
    /// <param name="messageId">Optional message ID.</param>
    /// <param name="durationMs">Optional duration of the API call in milliseconds.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TrackOpenAIUsageAsync(
        Guid businessId,
        int inputTokens,
        int outputTokens,
        string model,
        string operationType,
        Guid? conversationId = null,
        Guid? messageId = null,
        double? durationMs = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tracks Twilio SMS usage for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="direction">Direction of the SMS ("inbound" or "outbound").</param>
    /// <param name="estimatedCost">Estimated cost of the SMS.</param>
    /// <param name="conversationId">Optional conversation ID.</param>
    /// <param name="messageId">Optional message ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TrackTwilioSmsAsync(
        Guid businessId,
        string direction,
        decimal estimatedCost,
        Guid? conversationId = null,
        Guid? messageId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tracks Twilio voice usage for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="durationSeconds">Duration of the call in seconds.</param>
    /// <param name="direction">Direction of the call ("inbound" or "outbound").</param>
    /// <param name="estimatedCost">Estimated cost of the call.</param>
    /// <param name="conversationId">Optional conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TrackTwilioVoiceAsync(
        Guid businessId,
        int durationSeconds,
        string direction,
        decimal estimatedCost,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a usage summary for a business within a date range.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="from">Start date (UTC).</param>
    /// <param name="to">End date (UTC).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The usage summary.</returns>
    Task<ExternalUsageSummary> GetUsageSummaryAsync(
        Guid businessId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets platform-wide usage summary for admin dashboard.
    /// </summary>
    /// <param name="from">Start date (UTC).</param>
    /// <param name="to">End date (UTC).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The platform-wide usage summary.</returns>
    Task<ExternalUsageSummary> GetPlatformUsageSummaryAsync(
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets usage summary for a specific business (admin view).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="from">Start date (UTC).</param>
    /// <param name="to">End date (UTC).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The business usage summary.</returns>
    Task<ExternalUsageSummary> GetBusinessUsageSummaryAsync(
        Guid businessId,
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets top businesses by usage for admin dashboard.
    /// </summary>
    /// <param name="from">Start date (UTC).</param>
    /// <param name="to">End date (UTC).</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of business usage summaries.</returns>
    Task<IReadOnlyList<BusinessUsageInfo>> GetTopBusinessesByUsageAsync(
        DateTime from,
        DateTime to,
        int limit = 10,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Business usage information for admin reports.
/// </summary>
public record BusinessUsageInfo
{
    /// <summary>
    /// Gets the business ID.
    /// </summary>
    public Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the business name.
    /// </summary>
    public string BusinessName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the total estimated cost.
    /// </summary>
    public decimal TotalEstimatedCost { get; init; }

    /// <summary>
    /// Gets the total OpenAI requests.
    /// </summary>
    public int TotalOpenAIRequests { get; init; }

    /// <summary>
    /// Gets the total SMS messages.
    /// </summary>
    public int TotalSmsMessages { get; init; }

    /// <summary>
    /// Gets the total voice minutes.
    /// </summary>
    public int TotalVoiceMinutes { get; init; }
}

/// <summary>
/// Summary of external service usage.
/// </summary>
public record ExternalUsageSummary
{
    /// <summary>
    /// Gets the total number of OpenAI API requests.
    /// </summary>
    public int TotalOpenAIRequests { get; init; }

    /// <summary>
    /// Gets the total input tokens used for OpenAI.
    /// </summary>
    public int TotalInputTokens { get; init; }

    /// <summary>
    /// Gets the total output tokens used for OpenAI.
    /// </summary>
    public int TotalOutputTokens { get; init; }

    /// <summary>
    /// Gets the estimated total cost for OpenAI usage in USD.
    /// </summary>
    public decimal EstimatedOpenAICost { get; init; }

    /// <summary>
    /// Gets the total number of inbound SMS messages.
    /// </summary>
    public int TotalSmsInbound { get; init; }

    /// <summary>
    /// Gets the total number of outbound SMS messages.
    /// </summary>
    public int TotalSmsOutbound { get; init; }

    /// <summary>
    /// Gets the total voice call minutes.
    /// </summary>
    public int TotalVoiceMinutes { get; init; }

    /// <summary>
    /// Gets the estimated total cost for Twilio usage in USD.
    /// </summary>
    public decimal EstimatedTwilioCost { get; init; }

    /// <summary>
    /// Gets the total estimated cost for all external services.
    /// </summary>
    public decimal TotalEstimatedCost => EstimatedOpenAICost + EstimatedTwilioCost;

    /// <summary>
    /// Gets the breakdown by operation type.
    /// </summary>
    public IReadOnlyDictionary<string, int>? OperationBreakdown { get; init; }
}
