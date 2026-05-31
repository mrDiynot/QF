namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// DTO for onboarding progress response.
/// </summary>
public record OnboardingProgressDto
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string? BusinessName { get; set; }

    /// <summary>
    /// Gets or sets the current step (1-10).
    /// </summary>
    public int CurrentStep { get; set; }

    /// <summary>
    /// Gets or sets the list of completed step numbers.
    /// </summary>
    public IReadOnlyList<int> CompletedSteps { get; set; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether onboarding is complete.
    /// </summary>
    public bool IsComplete { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether onboarding was skipped.
    /// </summary>
    public bool IsSkipped { get; set; }

    /// <summary>
    /// Gets or sets the date when onboarding was started.
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Gets or sets the date when onboarding was completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the date when onboarding was skipped.
    /// </summary>
    public DateTime? SkippedAt { get; set; }

    /// <summary>
    /// Gets or sets the progress percentage (0-100).
    /// </summary>
    public int ProgressPercentage { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the business has onboarding support.
    /// True if the business purchased the onboarding package or has a plan with mandatory onboarding.
    /// </summary>
    public bool HasOnboardingSupport { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the onboarding call has been scheduled.
    /// </summary>
    public bool OnboardingCallScheduled { get; set; }

    /// <summary>
    /// Gets or sets the date when the onboarding call was scheduled.
    /// </summary>
    public DateTime? OnboardingCallScheduledAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the onboarding call has been completed.
    /// </summary>
    public bool OnboardingCallCompleted { get; set; }

    /// <summary>
    /// Gets or sets the date when the onboarding call was completed.
    /// </summary>
    public DateTime? OnboardingCallCompletedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the onboarding call was cancelled.
    /// </summary>
    public bool OnboardingCallCancelled { get; set; }

    /// <summary>
    /// Gets or sets the date when the onboarding call was cancelled.
    /// </summary>
    public DateTime? OnboardingCallCancelledAt { get; set; }
}
