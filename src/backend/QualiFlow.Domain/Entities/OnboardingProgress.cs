using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents the onboarding progress for a business in the QualiFlow system.
/// Tracks the multi-step onboarding wizard completion status.
/// </summary>
public class OnboardingProgress : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the current step in the onboarding wizard (1-10).
    /// Step 1: Industry Selection.
    /// Step 2: Team Size.
    /// Step 3: CRM Selection.
    /// Step 4: Lead Type.
    /// Step 5: Main Objective.
    /// Step 6: Communication Channels.
    /// Step 7: Automation Priorities.
    /// Step 8: Phone Number Assignment.
    /// Step 9: Phone Routing and Preferences.
    /// Step 10: AI Setup.
    /// </summary>
    public int CurrentStep { get; set; } = 1;

    /// <summary>
    /// Gets or sets the completed steps as a JSON array.
    /// Example: "[1,2,3]" indicates steps 1, 2, and 3 are complete.
    /// </summary>
    public string CompletedSteps { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the selected industry (Step 1).
    /// Options: "real-estate", "healthcare", "saas-technology", "consulting", "ecommerce", "other".
    /// </summary>
    public string? Industry { get; set; }

    /// <summary>
    /// Gets or sets the team size (Step 2).
    /// Options: "just-me", "2-5", "6-20", "21-50", "50+".
    /// </summary>
    public string? TeamSize { get; set; }

    /// <summary>
    /// Gets or sets the selected CRM provider (Step 3).
    /// Options: "salesforce", "hubspot", "pipedrive", "zoho", "qualiflow", "other".
    /// </summary>
    public string? SelectedCRMProvider { get; set; } = "qualiflow";

    /// <summary>
    /// Gets or sets the lead type (Step 4).
    /// Options: "b2b", "b2c", "both".
    /// </summary>
    public string? LeadType { get; set; }

    /// <summary>
    /// Gets or sets the main objective (Step 5).
    /// Options: "sales", "automation", "communication", "meetings", "proposals", "organization".
    /// </summary>
    public string? MainObjective { get; set; }

    /// <summary>
    /// Gets or sets the selected communication channels as JSON array (Step 6).
    /// Example: ["email", "sms", "phone", "chat"].
    /// </summary>
    public string SelectedChannels { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the selected automation priorities as JSON array (Step 7).
    /// Example: ["lead-qualification", "appointment-booking", "proposal-generation"].
    /// </summary>
    public string SelectedAutomations { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the phone number option (Step 8).
    /// Options: "existing", "new".
    /// </summary>
    public string? PhoneNumberOption { get; set; }

    /// <summary>
    /// Gets or sets the existing phone number if user chose "existing" option (Step 8).
    /// </summary>
    public string? ExistingPhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the selected AI phone number if user chose "new" option (Step 8).
    /// </summary>
    public string? SelectedAIPhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the call forwarding destination (Step 9).
    /// Options: "sales", "front-desk", "mobile", "voicemail".
    /// </summary>
    public string? CallForwardTo { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether missed-call SMS automation is enabled (Step 9).
    /// </summary>
    public bool MissedCallSMS { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether outbound AI calling is enabled (Step 9).
    /// </summary>
    public bool OutboundAICalling { get; set; }

    /// <summary>
    /// Gets or sets the AI persona/tone (Step 10).
    /// Options: "professional", "friendly", "casual", "formal".
    /// </summary>
    public string? AITone { get; set; }

    /// <summary>
    /// Gets or sets the business hours configuration (Step 10).
    /// </summary>
    public string? BusinessHours { get; set; }

    /// <summary>
    /// Gets or sets the follow-up preference (Step 10).
    /// </summary>
    public string? FollowUpPreference { get; set; }

    // ============================================================================
    // Step 11: Onboarding Support ($700 upsell)
    // ============================================================================

    /// <summary>
    /// Gets or sets a value indicating whether the business opted for onboarding support.
    /// This is set when the business purchases the $700 onboarding package during onboarding,
    /// or when their plan includes mandatory onboarding support (e.g., Enterprise).
    /// </summary>
    public bool HasOnboardingSupport { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the onboarding call has been scheduled.
    /// </summary>
    public bool OnboardingCallScheduled { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the onboarding call was scheduled (UTC).
    /// </summary>
    public DateTime? OnboardingCallScheduledAt { get; set; }

    /// <summary>
    /// Gets or sets the Cal.com booking UID for the onboarding call.
    /// Used to track the booking in Cal.com.
    /// </summary>
    public string? OnboardingCallBookingUid { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the onboarding call has been completed.
    /// </summary>
    public bool OnboardingCallCompleted { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the onboarding call was completed (UTC).
    /// </summary>
    public DateTime? OnboardingCallCompletedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the onboarding call was cancelled.
    /// </summary>
    public bool OnboardingCallCancelled { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the onboarding call was cancelled (UTC).
    /// </summary>
    public DateTime? OnboardingCallCancelledAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when onboarding was started (UTC).
    /// </summary>
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when onboarding was completed (UTC).
    /// Null indicates onboarding is not yet complete.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when onboarding was skipped (UTC).
    /// Null indicates onboarding was not skipped.
    /// </summary>
    public DateTime? SkippedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the welcome email was sent (UTC).
    /// Used to prevent duplicate welcome emails from being sent.
    /// Null indicates the welcome email has not been sent yet.
    /// </summary>
    public DateTime? WelcomeEmailSentAt { get; set; }

    /// <summary>
    /// Gets a value indicating whether onboarding is complete.
    /// </summary>
    public bool IsComplete => CompletedAt.HasValue;

    /// <summary>
    /// Gets a value indicating whether onboarding was skipped.
    /// </summary>
    public bool IsSkipped => SkippedAt.HasValue;

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the business this onboarding progress belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}
