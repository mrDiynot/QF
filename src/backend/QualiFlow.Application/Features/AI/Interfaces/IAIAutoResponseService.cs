namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for orchestrating AI auto-responses to inbound messages.
/// </summary>
public interface IAIAutoResponseService
{
    /// <summary>
    /// Processes an inbound message and generates an AI response.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="messageId">The inbound message ID.</param>
    /// <param name="channel">The communication channel (SMS, WhatsApp, Chat, etc.).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the auto-response operation.</returns>
    Task<AIAutoResponseResult> ProcessAndRespondAsync(
        Guid businessId,
        Guid conversationId,
        Guid messageId,
        string channel,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of an AI auto-response operation.
/// </summary>
public record AIAutoResponseResult
{
    /// <summary>
    /// Gets a value indicating whether the auto-response was successfully sent.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the generated response text (if successful).
    /// </summary>
    public string? Response { get; init; }

    /// <summary>
    /// Gets the ID of the response message that was created.
    /// </summary>
    public Guid? ResponseMessageId { get; init; }

    /// <summary>
    /// Gets the reason for failure (if not successful).
    /// </summary>
    public string? FailureReason { get; init; }

    /// <summary>
    /// Gets a value indicating whether the failure was due to exceeding usage limits.
    /// </summary>
    public bool LimitExceeded { get; init; }

    /// <summary>
    /// Gets a value indicating whether the message was handled by a human instead of AI.
    /// </summary>
    public bool HandledByHuman { get; init; }

    /// <summary>
    /// Gets the number of tokens used for this response.
    /// </summary>
    public int TokensUsed { get; init; }

    /// <summary>
    /// Gets the estimated cost of this response in USD.
    /// </summary>
    public decimal EstimatedCost { get; init; }

    /// <summary>
    /// Gets the detected intent of the inbound message.
    /// </summary>
    public string? DetectedIntent { get; init; }

    /// <summary>
    /// Gets the detected sentiment of the inbound message.
    /// </summary>
    public string? DetectedSentiment { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <returns>A successful auto-response result.</returns>
    public static AIAutoResponseResult Succeeded(
        string response,
        Guid responseMessageId,
        int tokensUsed,
        decimal estimatedCost,
        string? detectedIntent = null,
        string? detectedSentiment = null)
    {
        return new AIAutoResponseResult
        {
            Success = true,
            Response = response,
            ResponseMessageId = responseMessageId,
            TokensUsed = tokensUsed,
            EstimatedCost = estimatedCost,
            DetectedIntent = detectedIntent,
            DetectedSentiment = detectedSentiment,
        };
    }

    /// <summary>
    /// Creates a failed result due to limit exceeded.
    /// </summary>
    /// <param name="limitType">The type of limit that was exceeded.</param>
    /// <returns>A failed auto-response result with limit exceeded flag.</returns>
    public static AIAutoResponseResult LimitExceededFailure(string limitType)
    {
        return new AIAutoResponseResult
        {
            Success = false,
            LimitExceeded = true,
            FailureReason = $"{limitType} limit exceeded",
        };
    }

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    /// <param name="reason">The reason for the failure.</param>
    /// <returns>A failed auto-response result.</returns>
    public static AIAutoResponseResult Failed(string reason)
    {
        return new AIAutoResponseResult
        {
            Success = false,
            FailureReason = reason,
        };
    }

    /// <summary>
    /// Creates a result indicating the message was handled by a human.
    /// </summary>
    /// <returns>An auto-response result indicating human handling.</returns>
    public static AIAutoResponseResult HumanHandled()
    {
        return new AIAutoResponseResult
        {
            Success = true,
            HandledByHuman = true,
        };
    }
}
