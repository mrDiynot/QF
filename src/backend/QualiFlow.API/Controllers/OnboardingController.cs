using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Onboarding.DTOs;
using QualiFlow.Application.Features.Onboarding.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing business onboarding workflow.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/onboarding")]
[Authorize]
public partial class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;
    private readonly IWelcomeEmailService _welcomeEmailService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<OnboardingController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="OnboardingController"/> class.
    /// </summary>
    /// <param name="onboardingService">The onboarding service.</param>
    /// <param name="welcomeEmailService">The welcome email service.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="logger">The logger instance.</param>
    public OnboardingController(
        IOnboardingService onboardingService,
        IWelcomeEmailService welcomeEmailService,
        ICurrentUserService currentUserService,
        ILogger<OnboardingController> logger)
    {
        _onboardingService = onboardingService;
        _welcomeEmailService = welcomeEmailService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the current onboarding progress for the business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The onboarding progress.</returns>
    [HttpGet("status")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OnboardingProgressDto>> GetOnboardingStatusAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingStatus(businessId);

        var progress = await _onboardingService.GetProgressAsync(businessId, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Updates business profile (Step 1 of onboarding).
    /// </summary>
    /// <param name="request">The business profile update request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("business-profile")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> UpdateBusinessProfileAsync(
        [FromBody] UpdateBusinessProfileRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogUpdatingProfile(businessId);

        var progress = await _onboardingService.UpdateBusinessProfileAsync(businessId, request, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Selects channels (Step 2 of onboarding).
    /// </summary>
    /// <param name="request">The channel selection request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("channels")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> SelectChannelsAsync(
        [FromBody] SelectChannelsRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogSelectingChannels(businessId);

        var progress = await _onboardingService.SelectChannelsAsync(businessId, request, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Configures AI settings (Step 3 of onboarding).
    /// </summary>
    /// <param name="request">The AI configuration request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("ai-configuration")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> ConfigureAIAsync(
        [FromBody] ConfigureAIRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogConfiguringAI(businessId);

        var progress = await _onboardingService.ConfigureAIAsync(businessId, request, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Configures CRM settings (Step 4 of onboarding).
    /// </summary>
    /// <param name="request">The CRM configuration request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("crm-configuration")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> ConfigureCrmAsync(
        [FromBody] ConfigureCrmRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogConfiguringCRM(businessId);

        var progress = await _onboardingService.ConfigureCrmAsync(businessId, request, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Completes the onboarding process (Step 11).
    /// Note: Welcome email is NOT sent here - it's sent after successful payment.
    /// For free tier users who skip payment, use the complete-with-free-tier endpoint.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The completed onboarding progress.</returns>
    [HttpPost("complete")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> CompleteOnboardingAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogCompletingOnboarding(businessId);

        var progress = await _onboardingService.CompleteOnboardingAsync(businessId, cancellationToken);

        // NOTE: Welcome email is NOT sent here - it's sent after successful payment
        // via the complete-with-payment endpoint

        return Ok(progress);
    }

    /// <summary>
    /// Completes the onboarding process after successful payment.
    /// Sends the welcome email to the business owner.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The completed onboarding progress.</returns>
    [HttpPost("complete-with-payment")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> CompleteOnboardingWithPaymentAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogCompletingOnboarding(businessId);

        var progress = await _onboardingService.GetProgressAsync(businessId, cancellationToken);

        // Send welcome email to the business owner - AWAIT to ensure it's sent before response
        // We use CancellationToken.None to ensure the email is sent even if the HTTP request is cancelled
        try
        {
            _logger.LogInformation("Sending welcome email for business {BusinessId}...", businessId);
            var emailSent = await _welcomeEmailService.SendWelcomeEmailAsync(businessId, CancellationToken.None);
            _logger.LogInformation("Welcome email sent successfully for business {BusinessId}: {Result}", businessId, emailSent);
        }
        catch (Exception ex)
        {
            // Log but don't fail the request - email sending is non-critical
            _logger.LogError(ex, "Failed to send welcome email for business {BusinessId}", businessId);
        }

        return Ok(progress);
    }

    /// <summary>
    /// Completes onboarding with the free tier plan (7-day trial).
    /// This is used when a user cancels payment or chooses to continue with the free plan.
    /// Ensures the free plan subscription is active and sends the welcome email.
    /// </summary>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The completed onboarding progress.</returns>
    [HttpPost("complete-with-free-tier")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> CompleteOnboardingWithFreeTierAsync(
        [FromServices] ISubscriptionService subscriptionService,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogCompletingOnboarding(businessId);

        // Ensure the free plan subscription is active (creates if doesn't exist)
        await subscriptionService.CreateDefaultSubscriptionAsync(businessId, cancellationToken);

        // Get the onboarding progress
        var progress = await _onboardingService.GetProgressAsync(businessId, cancellationToken);

        // Send welcome email to the business owner - AWAIT to ensure it's sent before response
        // We use CancellationToken.None to ensure the email is sent even if the HTTP request is cancelled
        try
        {
            _logger.LogInformation("Sending welcome email for business {BusinessId}...", businessId);
            var emailSent = await _welcomeEmailService.SendWelcomeEmailAsync(businessId, CancellationToken.None);
            _logger.LogInformation("Welcome email sent successfully for business {BusinessId}: {Result}", businessId, emailSent);
        }
        catch (Exception ex)
        {
            // Log but don't fail the request - email sending is non-critical
            _logger.LogError(ex, "Failed to send welcome email for business {BusinessId}", businessId);
        }

        _logger.LogInformation(
            "Completed onboarding with free tier for business {BusinessId}",
            businessId);

        return Ok(progress);
    }

    /// <summary>
    /// Gets industry-specific AI configuration defaults for the business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The recommended AI configuration based on business industry.</returns>
    [HttpGet("industry-defaults")]
    [ProducesResponseType(typeof(ConfigureAIRequest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConfigureAIRequest>> GetIndustryDefaultsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingDefaults(businessId);

        var defaults = await _onboardingService.GetIndustryDefaultsAsync(businessId, cancellationToken);

        return Ok(defaults);
    }

    /// <summary>
    /// Skips the onboarding process and saves partial data.
    /// Allows users to access the dashboard immediately and resume onboarding later.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The skipped onboarding progress.</returns>
    [HttpPost("skip")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> SkipOnboardingAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogSkippingOnboarding(businessId);

        var progress = await _onboardingService.SkipOnboardingAsync(businessId, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Resumes a previously skipped onboarding process.
    /// Clears the skipped status and allows the user to continue from where they left off.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The resumed onboarding progress.</returns>
    [HttpPost("resume")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> ResumeOnboardingAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogResumingOnboarding(businessId);

        var progress = await _onboardingService.ResumeOnboardingAsync(businessId, cancellationToken);

        return Ok(progress);
    }

    /// <summary>
    /// Updates the current step for progress tracking.
    /// </summary>
    /// <param name="step">The step number (1-10).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("step/{step:int}")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> UpdateCurrentStepAsync(
        int step,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogUpdatingStep(businessId, step);

        var progress = await _onboardingService.UpdateCurrentStepAsync(businessId, step, cancellationToken);

        return Ok(progress);
    }

    // Logger message delegates

    [LoggerMessage(EventId = 7001, Level = LogLevel.Information, Message = "Getting onboarding status for business {BusinessId}")]
    private partial void LogGettingStatus(Guid businessId);

    [LoggerMessage(EventId = 7002, Level = LogLevel.Information, Message = "Updating business profile for business {BusinessId}")]
    private partial void LogUpdatingProfile(Guid businessId);

    [LoggerMessage(EventId = 7003, Level = LogLevel.Information, Message = "Selecting channels for business {BusinessId}")]
    private partial void LogSelectingChannels(Guid businessId);

    [LoggerMessage(EventId = 7004, Level = LogLevel.Information, Message = "Configuring AI for business {BusinessId}")]
    private partial void LogConfiguringAI(Guid businessId);

    [LoggerMessage(EventId = 7007, Level = LogLevel.Information, Message = "Configuring CRM for business {BusinessId}")]
    private partial void LogConfiguringCRM(Guid businessId);

    [LoggerMessage(EventId = 7005, Level = LogLevel.Information, Message = "Completing onboarding for business {BusinessId}")]
    private partial void LogCompletingOnboarding(Guid businessId);

    [LoggerMessage(EventId = 7006, Level = LogLevel.Information, Message = "Getting industry defaults for business {BusinessId}")]
    private partial void LogGettingDefaults(Guid businessId);

    [LoggerMessage(EventId = 7008, Level = LogLevel.Information, Message = "Skipping onboarding for business {BusinessId}")]
    private partial void LogSkippingOnboarding(Guid businessId);

    [LoggerMessage(EventId = 7009, Level = LogLevel.Information, Message = "Resuming onboarding for business {BusinessId}")]
    private partial void LogResumingOnboarding(Guid businessId);

    [LoggerMessage(EventId = 7010, Level = LogLevel.Information, Message = "Updating current step to {Step} for business {BusinessId}")]
    private partial void LogUpdatingStep(Guid businessId, int step);

    /// <summary>
    /// Gets the onboarding preferences for the current business.
    /// Used to display onboarding choices in the settings page.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The onboarding preferences.</returns>
    [HttpGet("preferences")]
    [ProducesResponseType(typeof(OnboardingPreferencesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OnboardingPreferencesDto>> GetPreferencesAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        LogGettingPreferences(businessId);

        var preferences = await _onboardingService.GetPreferencesAsync(businessId, cancellationToken);

        if (preferences == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Onboarding not found",
                Detail = "No onboarding data found for this business."
            });
        }

        return Ok(preferences);
    }

    [LoggerMessage(EventId = 7011, Level = LogLevel.Information, Message = "Getting onboarding preferences for business {BusinessId}")]
    private partial void LogGettingPreferences(Guid businessId);

    // ============================================================================
    // Onboarding Call Booking Endpoints (Cal.com Integration)
    // ============================================================================

    /// <summary>
    /// Gets available time slots for onboarding calls.
    /// Returns slots for the next 2 weeks from QualiFlow's Cal.com account.
    /// </summary>
    /// <param name="timezone">The user's timezone (default: UTC).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of available time slots.</returns>
    [HttpGet("call/slots")]
    [ProducesResponseType(typeof(AvailableSlotsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AvailableSlotsResponse>> GetOnboardingCallSlotsAsync(
        [FromQuery] string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogGettingOnboardingCallSlots(businessId, timezone);

        var slots = await _onboardingService.GetOnboardingCallSlotsAsync(timezone, cancellationToken);
        return Ok(slots);
    }

    /// <summary>
    /// Books an onboarding call for the business.
    /// Creates a booking in QualiFlow's Cal.com account.
    /// </summary>
    /// <param name="request">The booking request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The booking response.</returns>
    [HttpPost("call/book")]
    [ProducesResponseType(typeof(BookOnboardingCallResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BookOnboardingCallResponse>> BookOnboardingCallAsync(
        [FromBody] BookOnboardingCallRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogBookingOnboardingCall(businessId, request.ScheduledAt);

        var response = await _onboardingService.BookOnboardingCallAsync(businessId, request, cancellationToken);

        if (!response.Success)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Booking failed",
                Detail = response.ErrorMessage
            });
        }

        return Ok(response);
    }

    /// <summary>
    /// Reschedules an existing onboarding call.
    /// </summary>
    /// <param name="request">The reschedule request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("call/reschedule")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> RescheduleOnboardingCallAsync(
        [FromBody] RescheduleOnboardingCallRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogReschedulingOnboardingCall(businessId, request.NewScheduledAt);

        try
        {
            var progress = await _onboardingService.RescheduleOnboardingCallAsync(businessId, request, cancellationToken);
            return Ok(progress);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Reschedule failed",
                Detail = ex.Message
            });
        }
    }

    /// <summary>
    /// Cancels an existing onboarding call.
    /// </summary>
    /// <param name="request">The cancel request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated onboarding progress.</returns>
    [HttpPost("call/cancel")]
    [ProducesResponseType(typeof(OnboardingProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OnboardingProgressDto>> CancelOnboardingCallAsync(
        [FromBody] CancelOnboardingCallRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogCancellingOnboardingCall(businessId);

        try
        {
            var progress = await _onboardingService.CancelOnboardingCallAsync(businessId, request, cancellationToken);
            return Ok(progress);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Cancel failed",
                Detail = ex.Message
            });
        }
    }

    [LoggerMessage(EventId = 7012, Level = LogLevel.Information, Message = "Getting onboarding call slots for business {BusinessId} in timezone {Timezone}")]
    private partial void LogGettingOnboardingCallSlots(Guid businessId, string timezone);

    [LoggerMessage(EventId = 7013, Level = LogLevel.Information, Message = "Booking onboarding call for business {BusinessId} at {ScheduledAt}")]
    private partial void LogBookingOnboardingCall(Guid businessId, DateTime scheduledAt);

    [LoggerMessage(EventId = 7014, Level = LogLevel.Information, Message = "Rescheduling onboarding call for business {BusinessId} to {NewScheduledAt}")]
    private partial void LogReschedulingOnboardingCall(Guid businessId, DateTime newScheduledAt);

    [LoggerMessage(EventId = 7015, Level = LogLevel.Information, Message = "Cancelling onboarding call for business {BusinessId}")]
    private partial void LogCancellingOnboardingCall(Guid businessId);
}
