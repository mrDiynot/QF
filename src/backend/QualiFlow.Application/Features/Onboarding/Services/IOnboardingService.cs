using QualiFlow.Application.Features.Onboarding.DTOs;

namespace QualiFlow.Application.Features.Onboarding.Services;

/// <summary>
/// Service interface for onboarding business logic operations.
/// </summary>
public interface IOnboardingService
{
    /// <summary>
    /// Gets the onboarding progress for the current business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The onboarding progress.</returns>
    Task<OnboardingProgressDto> GetProgressAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates business profile (Step 1 of onboarding).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The business profile update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> UpdateBusinessProfileAsync(
        Guid businessId,
        UpdateBusinessProfileRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Selects channels (Step 2 of onboarding).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The channel selection request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> SelectChannelsAsync(
        Guid businessId,
        SelectChannelsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configures AI settings (Step 3 of onboarding).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The AI configuration request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> ConfigureAIAsync(
        Guid businessId,
        ConfigureAIRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configures CRM settings (Step 4 of onboarding).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The CRM configuration request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> ConfigureCrmAsync(
        Guid businessId,
        ConfigureCrmRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Completes the onboarding process (Step 10).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The completed onboarding progress.</returns>
    Task<OnboardingProgressDto> CompleteOnboardingAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Skips the onboarding process and saves partial data.
    /// Marks onboarding as skipped but not complete, allowing users to resume later.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The skipped onboarding progress.</returns>
    Task<OnboardingProgressDto> SkipOnboardingAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Resets skipped onboarding to allow user to resume.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The reset onboarding progress.</returns>
    Task<OnboardingProgressDto> ResumeOnboardingAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets industry-specific AI configuration defaults for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The recommended AI configuration based on business industry.</returns>
    Task<ConfigureAIRequest> GetIndustryDefaultsAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the current step number for onboarding progress tracking.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="step">The step number (1-10).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> UpdateCurrentStepAsync(Guid businessId, int step, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the onboarding preferences for display in settings.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The onboarding preferences.</returns>
    Task<OnboardingPreferencesDto?> GetPreferencesAsync(Guid businessId, CancellationToken cancellationToken = default);

    // ============================================================================
    // Onboarding Call Booking (Cal.com Integration)
    // ============================================================================

    /// <summary>
    /// Gets available time slots for onboarding calls for the next 2 weeks.
    /// Uses QualiFlow's platform-level Cal.com account.
    /// </summary>
    /// <param name="timezone">The user's timezone.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available time slots.</returns>
    Task<AvailableSlotsResponse> GetOnboardingCallSlotsAsync(
        string timezone = "UTC",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Books an onboarding call for the business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The booking request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The booking response.</returns>
    Task<BookOnboardingCallResponse> BookOnboardingCallAsync(
        Guid businessId,
        BookOnboardingCallRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reschedules an existing onboarding call.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The reschedule request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> RescheduleOnboardingCallAsync(
        Guid businessId,
        RescheduleOnboardingCallRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels an existing onboarding call.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The cancel request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgressDto> CancelOnboardingCallAsync(
        Guid businessId,
        CancelOnboardingCallRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks an onboarding call as completed. Called by Cal.com webhook.
    /// </summary>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the call was marked as completed.</returns>
    Task<bool> MarkOnboardingCallCompletedAsync(
        string bookingUid,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks an onboarding call as cancelled. Called by Cal.com webhook.
    /// </summary>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the call was marked as cancelled.</returns>
    Task<bool> MarkOnboardingCallCancelledByWebhookAsync(
        string bookingUid,
        CancellationToken cancellationToken = default);
}
