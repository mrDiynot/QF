namespace QualiFlow.Application.Features.InboundMessages.Services;

/// <summary>
/// Background job service interface for AI qualification processing.
/// Implemented in the Infrastructure layer with Hangfire retry policies.
/// </summary>
public interface IAiQualificationJobService
{
    /// <summary>
    /// Processes AI qualification for a lead based on an inbound message or other trigger.
    /// This method is called as a background job.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">The lead ID to qualify.</param>
    /// <param name="triggerId">The trigger ID (message ID, form submission ID, etc.) that triggered qualification.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ProcessAiQualificationAsync(Guid businessId, Guid leadId, Guid triggerId);
}

