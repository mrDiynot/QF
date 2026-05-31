using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for OnboardingProgress entity operations.
/// All operations are automatically scoped to the current user's business (tenant) via global query filters.
/// Multi-tenancy is enforced at the EF Core level - no manual BusinessId filtering required.
/// </summary>
public interface IOnboardingRepository
{
    /// <summary>
    /// Gets the onboarding progress for the current business.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The onboarding progress if found; otherwise, null.</returns>
    Task<OnboardingProgress?> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new onboarding progress record for a business.
    /// BusinessId is automatically set from the current user's context in SaveChangesAsync.
    /// </summary>
    /// <param name="progress">The onboarding progress to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created onboarding progress with generated ID.</returns>
    Task<OnboardingProgress> CreateAsync(OnboardingProgress progress, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing onboarding progress record.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="progress">The onboarding progress to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    Task<OnboardingProgress> UpdateAsync(OnboardingProgress progress, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if onboarding is complete for the specified business.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if onboarding is complete; otherwise, false.</returns>
    Task<bool> IsOnboardingCompleteAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the onboarding progress by Cal.com booking UID.
    /// Used by webhooks to update onboarding call status.
    /// This method bypasses multi-tenancy filters as it's called from webhooks.
    /// </summary>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The onboarding progress if found; otherwise, null.</returns>
    Task<OnboardingProgress?> GetByBookingUidAsync(string bookingUid, CancellationToken cancellationToken = default);
}
