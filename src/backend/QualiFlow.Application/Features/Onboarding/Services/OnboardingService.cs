using System.Text.Json;

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Onboarding.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Onboarding.Services;

/// <summary>
/// Service implementation for onboarding business logic operations.
/// </summary>
/// <param name="onboardingRepository">The onboarding repository.</param>
/// <param name="businessRepository">The business repository.</param>
/// <param name="industryDefaultsService">The industry defaults service.</param>
/// <param name="aiConfigurationRepository">The AI configuration repository.</param>
/// <param name="subscriptionService">The subscription service.</param>
/// <param name="calComService">The Cal.com service for onboarding call scheduling.</param>
/// <param name="currentUserService">The current user service.</param>
/// <param name="logger">The logger instance.</param>
public partial class OnboardingService(
    IOnboardingRepository onboardingRepository,
    IBusinessRepository businessRepository,
    IIndustryDefaultsService industryDefaultsService,
    IAIConfigurationRepository aiConfigurationRepository,
    ISubscriptionService subscriptionService,
    ICalComService calComService,
    ICurrentUserService currentUserService,
    ILogger<OnboardingService> logger) : IOnboardingService
{
    // Plan names that include onboarding support
    private static readonly HashSet<string> PlansWithOnboardingSupport = new(StringComparer.OrdinalIgnoreCase)
    {
        "ultraflow", "ultra-flow", "ultra flow",
        "enterprise",
    };

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> GetProgressAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingProgress(logger, businessId);

        var progress = await onboardingRepository.GetByBusinessIdAsync(businessId, cancellationToken);

        if (progress == null)
        {
            // Create initial progress if not exists
            progress = new OnboardingProgress
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                CurrentStep = 1,
                CompletedSteps = "[]",
                SelectedChannels = "[]",
                SelectedAutomations = "[]",
                StartedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            progress = await onboardingRepository.CreateAsync(progress, cancellationToken);
        }
        else if (progress.DeletedAt.HasValue)
        {
            // Restore soft-deleted record and reset it for new onboarding
            progress.DeletedAt = null;
            progress.CurrentStep = 1;
            progress.CompletedSteps = "[]";
            progress.CompletedAt = null;
            progress.SkippedAt = null;
            progress.StartedAt = DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;

            progress = await onboardingRepository.UpdateAsync(progress, cancellationToken);
        }

        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        var planName = await GetPlanNameAsync(businessId, cancellationToken);

        logger.LogInformation(
            "GetProgressAsync for business {BusinessId}: PlanName={PlanName}, HasOnboardingSupport={HasOnboardingSupport}, PlanIncludesSupport={PlanIncludesSupport}",
            businessId,
            planName ?? "null",
            progress.HasOnboardingSupport,
            !string.IsNullOrEmpty(planName) && PlansWithOnboardingSupport.Contains(planName.Replace(" ", string.Empty, StringComparison.Ordinal)));

        return MapToDto(progress, business?.Name, planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> UpdateBusinessProfileAsync(
        Guid businessId,
        UpdateBusinessProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingBusinessProfile(logger, businessId);

        // Update business entity
        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        if (business == null)
        {
            throw new InvalidOperationException($"Business with ID {businessId} not found");
        }

        // Only update business name if a non-empty value is provided
        // This prevents overwriting the name set during registration
        if (!string.IsNullOrWhiteSpace(request.BusinessName))
        {
            business.Name = request.BusinessName;
        }

        business.Industry = request.Industry;
        business.CompanySize = request.CompanySize;
        business.Timezone = request.Timezone;
        await businessRepository.UpdateAsync(business, cancellationToken);

        // Update onboarding progress with Steps 1-5 data
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Step 1: Industry
        progress.Industry = request.Industry;

        // Step 2: Team Size
        progress.TeamSize = request.CompanySize;

        // Step 3: CRM Platform
        if (!string.IsNullOrEmpty(request.CrmPlatform))
        {
            progress.SelectedCRMProvider = request.CrmPlatform;
        }

        // Step 4: Lead Type
        if (!string.IsNullOrEmpty(request.LeadType))
        {
            progress.LeadType = request.LeadType;
        }

        // Step 5: Main Objective
        if (!string.IsNullOrEmpty(request.MainObjective))
        {
            progress.MainObjective = request.MainObjective;
        }

        // Mark steps 1-5 as complete
        progress = await UpdateProgressStepsAsync(progress, [1, 2, 3, 4, 5], cancellationToken);

        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, planName: planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> SelectChannelsAsync(
        Guid businessId,
        SelectChannelsRequest request,
        CancellationToken cancellationToken = default)
    {
        LogSelectingChannels(logger, businessId, request.SelectedChannels.Count);

        // Update onboarding progress with Steps 6-7 data
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Step 6: Selected Channels
        progress.SelectedChannels = JsonSerializer.Serialize(request.SelectedChannels);

        // Step 7: Selected Automations
        progress.SelectedAutomations = JsonSerializer.Serialize(request.SelectedAutomations);

        // Mark steps 6-7 as complete
        progress = await UpdateProgressStepsAsync(progress, [6, 7], cancellationToken);

        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, planName: planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> ConfigureAIAsync(
        Guid businessId,
        ConfigureAIRequest request,
        CancellationToken cancellationToken = default)
    {
        LogConfiguringAI(logger, businessId);

        // Validate scoring weights sum to 100 (if provided and non-zero)
        var totalWeight = request.ScoringWeights.Budget +
                         request.ScoringWeights.Timeline +
                         request.ScoringWeights.Authority +
                         request.ScoringWeights.Need;

        if (totalWeight > 0 && totalWeight != 100)
        {
            throw new InvalidOperationException($"Scoring weights must sum to 100, but sum is {totalWeight}");
        }

        // Update onboarding progress with Steps 8-10 data
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Step 8: Phone Setup
        if (request.PhoneSetup != null)
        {
            progress.PhoneNumberOption = request.PhoneSetup.Type;
            progress.ExistingPhoneNumber = request.PhoneSetup.ExistingNumber;
            progress.SelectedAIPhoneNumber = request.PhoneSetup.NewNumber;
        }

        // Step 9: Call Handling
        if (request.CallHandling != null)
        {
            progress.CallForwardTo = request.CallHandling.ForwardNumber;
            progress.MissedCallSMS = request.CallHandling.SendSmsOnMissed;
            progress.OutboundAICalling = request.CallHandling.EnableOutboundAi;
        }

        // Step 10: AI Tone / Final Touches
        progress.AITone = request.Persona;
        progress.BusinessHours = request.BusinessHours;
        progress.FollowUpPreference = request.FollowUpPreference;

        // CRITICAL FIX: Save AI configuration to AIConfiguration table for production use
        logger.LogInformation("ConfigureAIAsync: EnableAutoResponse={EnableAutoResponse} for business {BusinessId}", request.EnableAutoResponse, businessId);
        var aiConfig = await aiConfigurationRepository.GetByBusinessIdAsync(businessId, cancellationToken);

        if (aiConfig == null)
        {
            // Create new AI configuration with all tracking flags set
            aiConfig = new AIConfiguration
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Persona = request.Persona ?? "professional",
                AITone = request.Persona ?? "professional",
                BusinessHours = request.BusinessHours ?? "9-5",
                FollowUpPreference = request.FollowUpPreference ?? "sms-first",
                QualificationThreshold = request.QualificationThreshold > 0 ? request.QualificationThreshold : 70,
                ScoringWeights = JsonSerializer.Serialize(request.ScoringWeights),
                GreetingMessage = request.GreetingMessage ?? "Hi! How can we help you today?",
                UseIndustryQuestions = true,
                IsAutoResponseEnabled = request.EnableAutoResponse,
                AutoResponseConfiguredAt = request.EnableAutoResponse ? DateTime.UtcNow : null,

                // Set tracking flags - user explicitly configured these during onboarding
                IsPersonaConfigured = !string.IsNullOrEmpty(request.Persona),
                PersonaConfiguredAt = !string.IsNullOrEmpty(request.Persona) ? DateTime.UtcNow : null,
                IsBantWeightsConfigured = request.ScoringWeights != null,
                BantWeightsConfiguredAt = request.ScoringWeights != null ? DateTime.UtcNow : null,
                IsQualificationThresholdConfigured = request.QualificationThreshold > 0,
                QualificationThresholdConfiguredAt = request.QualificationThreshold > 0 ? DateTime.UtcNow : null,
            };

            await aiConfigurationRepository.CreateAsync(aiConfig, cancellationToken);
            LogAIConfigurationCreated(logger, businessId, aiConfig.Persona);
        }
        else
        {
            // Update existing AI configuration with tracking flags
            aiConfig.Persona = request.Persona ?? aiConfig.Persona;
            aiConfig.AITone = request.Persona ?? aiConfig.AITone;
            aiConfig.BusinessHours = request.BusinessHours ?? aiConfig.BusinessHours;
            aiConfig.FollowUpPreference = request.FollowUpPreference ?? aiConfig.FollowUpPreference;
            aiConfig.QualificationThreshold = request.QualificationThreshold > 0 ? request.QualificationThreshold : aiConfig.QualificationThreshold;
            aiConfig.ScoringWeights = JsonSerializer.Serialize(request.ScoringWeights);
            aiConfig.IsAutoResponseEnabled = request.EnableAutoResponse;
            if (request.EnableAutoResponse && !aiConfig.AutoResponseConfiguredAt.HasValue)
            {
                aiConfig.AutoResponseConfiguredAt = DateTime.UtcNow;
            }

            // Set tracking flags if values are provided
            if (!string.IsNullOrEmpty(request.Persona) && !aiConfig.IsPersonaConfigured)
            {
                aiConfig.IsPersonaConfigured = true;
                aiConfig.PersonaConfiguredAt = DateTime.UtcNow;
            }

            if (request.ScoringWeights != null && !aiConfig.IsBantWeightsConfigured)
            {
                aiConfig.IsBantWeightsConfigured = true;
                aiConfig.BantWeightsConfiguredAt = DateTime.UtcNow;
            }

            if (request.QualificationThreshold > 0 && !aiConfig.IsQualificationThresholdConfigured)
            {
                aiConfig.IsQualificationThresholdConfigured = true;
                aiConfig.QualificationThresholdConfiguredAt = DateTime.UtcNow;
            }

            await aiConfigurationRepository.UpdateAsync(aiConfig, cancellationToken);
            LogAIConfigurationUpdated(logger, businessId, aiConfig.Persona);
        }

        // Mark steps 8-10 as complete
        progress = await UpdateProgressStepsAsync(progress, [8, 9, 10], cancellationToken);

        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, planName: planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> ConfigureCrmAsync(
        Guid businessId,
        ConfigureCrmRequest request,
        CancellationToken cancellationToken = default)
    {
        LogConfiguringCRM(logger, businessId, request.CrmProvider);

        // Validate CRM provider - extended list to match frontend options
        var validProviders = new[]
        {
            "QualiFlowCRM", "builtin", "HubSpot", "hubspot", "Salesforce", "salesforce",
            "pipedrive", "zoho", "monday", "activecampaign", "freshsales", "gohighlevel",
            "close", "copper", "other"
        };

        if (!validProviders.Contains(request.CrmProvider, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Invalid CRM provider: {request.CrmProvider}. Valid options: {string.Join(", ", validProviders)}");
        }

        // Update onboarding progress with CRM selection (Step 3)
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);
        progress.SelectedCRMProvider = request.CrmProvider;
        progress = await UpdateProgressStepsAsync(progress, [3], cancellationToken);

        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, planName: planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> CompleteOnboardingAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogCompletingOnboarding(logger, businessId);

        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Mark as complete - we're flexible about which steps are completed
        // since the frontend allows skipping and some steps are optional
        progress.CurrentStep = 10;
        progress.CompletedAt = DateTime.UtcNow;

        // Ensure all 10 steps are marked as complete
        var completedStepsJson = string.IsNullOrWhiteSpace(progress.CompletedSteps) ? "[]" : progress.CompletedSteps;
        var completedSteps = JsonSerializer.Deserialize<List<int>>(completedStepsJson) ?? [];
        for (int i = 1; i <= 10; i++)
        {
            if (!completedSteps.Contains(i))
            {
                completedSteps.Add(i);
            }
        }

        completedSteps.Sort();
        progress.CompletedSteps = JsonSerializer.Serialize(completedSteps);

        progress = await onboardingRepository.UpdateAsync(progress, cancellationToken);

        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, planName: planName);
    }

    /// <inheritdoc />
    public async Task<ConfigureAIRequest> GetIndustryDefaultsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingIndustryDefaults(logger, businessId);

        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        if (business == null)
        {
            throw new InvalidOperationException($"Business with ID {businessId} not found");
        }

        return industryDefaultsService.GetAIDefaultsForIndustry(business.Industry);
    }

    // ============================================================================
    // Logging Methods (must be before instance methods per SA1204)
    // ============================================================================

    [LoggerMessage(EventId = 6001, Level = LogLevel.Information, Message = "Getting onboarding progress for business {BusinessId}")]
    private static partial void LogGettingProgress(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 6002, Level = LogLevel.Information, Message = "Updating business profile for business {BusinessId}")]
    private static partial void LogUpdatingBusinessProfile(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 6003, Level = LogLevel.Information, Message = "Selecting {ChannelCount} channels for business {BusinessId}")]
    private static partial void LogSelectingChannels(ILogger logger, Guid businessId, int channelCount);

    [LoggerMessage(EventId = 6004, Level = LogLevel.Information, Message = "Configuring AI for business {BusinessId}")]
    private static partial void LogConfiguringAI(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 6010, Level = LogLevel.Information, Message = "Created AI configuration for business {BusinessId} with persona {Persona}")]
    private static partial void LogAIConfigurationCreated(ILogger logger, Guid businessId, string persona);

    [LoggerMessage(EventId = 6011, Level = LogLevel.Information, Message = "Updated AI configuration for business {BusinessId} with persona {Persona}")]
    private static partial void LogAIConfigurationUpdated(ILogger logger, Guid businessId, string persona);

    [LoggerMessage(EventId = 6007, Level = LogLevel.Information, Message = "Configuring CRM for business {BusinessId} with provider {CRMProvider}")]
    private static partial void LogConfiguringCRM(ILogger logger, Guid businessId, string crmProvider);

    [LoggerMessage(EventId = 6005, Level = LogLevel.Information, Message = "Completing onboarding for business {BusinessId}")]
    private static partial void LogCompletingOnboarding(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 6006, Level = LogLevel.Information, Message = "Getting industry defaults for business {BusinessId}")]
    private static partial void LogGettingIndustryDefaults(ILogger logger, Guid businessId);

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> SkipOnboardingAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogSkippingOnboarding(logger, businessId);

        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Mark as skipped but not complete - user can resume later
        progress.SkippedAt = DateTime.UtcNow;

        progress = await onboardingRepository.UpdateAsync(progress, cancellationToken);

        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        var planName = await GetPlanNameAsync(businessId, cancellationToken);

        return MapToDto(progress, business?.Name, planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> ResumeOnboardingAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogResumingOnboarding(logger, businessId);

        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Clear skipped status to allow resumption
        progress.SkippedAt = null;

        progress = await onboardingRepository.UpdateAsync(progress, cancellationToken);

        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        var planName = await GetPlanNameAsync(businessId, cancellationToken);

        return MapToDto(progress, business?.Name, planName);
    }

    [LoggerMessage(EventId = 6008, Level = LogLevel.Information, Message = "Skipping onboarding for business {BusinessId}")]
    private static partial void LogSkippingOnboarding(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 6009, Level = LogLevel.Information, Message = "Resuming onboarding for business {BusinessId}")]
    private static partial void LogResumingOnboarding(ILogger logger, Guid businessId);

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    private static OnboardingProgressDto MapToDto(
        OnboardingProgress progress,
        string? businessName = null,
        string? planName = null)
    {
        // Handle null, empty, or whitespace-only CompletedSteps to avoid JSON parsing error
        var completedStepsJson = string.IsNullOrWhiteSpace(progress.CompletedSteps) ? "[]" : progress.CompletedSteps;
        var completedSteps = JsonSerializer.Deserialize<List<int>>(completedStepsJson) ?? [];

        // Determine if the business has onboarding support:
        // 1. Explicitly purchased during onboarding (progress.HasOnboardingSupport)
        // 2. Included in their subscription plan (UltraFlow, Enterprise)
        var hasOnboardingSupport = progress.HasOnboardingSupport ||
            (!string.IsNullOrEmpty(planName) && PlansWithOnboardingSupport.Contains(planName.Replace(" ", string.Empty, StringComparison.Ordinal)));

        return new OnboardingProgressDto
        {
            BusinessId = progress.BusinessId,
            BusinessName = businessName,
            CurrentStep = progress.CurrentStep,
            CompletedSteps = completedSteps,
            IsComplete = progress.IsComplete,
            IsSkipped = progress.IsSkipped,
            StartedAt = progress.StartedAt,
            CompletedAt = progress.CompletedAt,
            SkippedAt = progress.SkippedAt,
            ProgressPercentage = (completedSteps.Count * 100) / 10, // 10 steps total
            HasOnboardingSupport = hasOnboardingSupport,
            OnboardingCallScheduled = progress.OnboardingCallScheduled,
            OnboardingCallScheduledAt = progress.OnboardingCallScheduledAt,
            OnboardingCallCompleted = progress.OnboardingCallCompleted,
            OnboardingCallCompletedAt = progress.OnboardingCallCompletedAt,
            OnboardingCallCancelled = progress.OnboardingCallCancelled,
            OnboardingCallCancelledAt = progress.OnboardingCallCancelledAt,
        };
    }

    private async Task<OnboardingProgress> GetOrCreateProgressAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var progress = await onboardingRepository.GetByBusinessIdAsync(businessId, cancellationToken);

        if (progress == null)
        {
            progress = new OnboardingProgress
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                CurrentStep = 1,
                CompletedSteps = "[]",
                SelectedChannels = "[]",
                SelectedAutomations = "[]",
                StartedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            progress = await onboardingRepository.CreateAsync(progress, cancellationToken);
        }
        else if (progress.DeletedAt.HasValue)
        {
            // Restore soft-deleted record and reset it for new onboarding
            progress.DeletedAt = null;
            progress.CurrentStep = 1;
            progress.CompletedSteps = "[]";
            progress.CompletedAt = null;
            progress.SkippedAt = null;
            progress.StartedAt = DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;

            progress = await onboardingRepository.UpdateAsync(progress, cancellationToken);
        }

        return progress;
    }

    private async Task<string?> GetPlanNameAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);
        return subscription?.Plan?.Name;
    }

    private Task<OnboardingProgress> UpdateProgressStepsAsync(
        OnboardingProgress progress,
        int[] stepNumbers,
        CancellationToken cancellationToken)
    {
        var completedStepsJson = string.IsNullOrWhiteSpace(progress.CompletedSteps) ? "[]" : progress.CompletedSteps;
        var completedSteps = JsonSerializer.Deserialize<List<int>>(completedStepsJson) ?? [];

        foreach (var stepNumber in stepNumbers)
        {
            if (!completedSteps.Contains(stepNumber))
            {
                completedSteps.Add(stepNumber);
            }
        }

        completedSteps.Sort();
        progress.CompletedSteps = JsonSerializer.Serialize(completedSteps);

        // Set current step to the highest completed step + 1 (max 10)
        var maxCompleted = completedSteps.Count > 0 ? completedSteps.Max() : 0;
        progress.CurrentStep = Math.Min(maxCompleted + 1, 10);

        return onboardingRepository.UpdateAsync(progress, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> UpdateCurrentStepAsync(
        Guid businessId,
        int step,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingCurrentStep(logger, businessId, step);

        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Validate step is in range
        if (step < 1 || step > 10)
        {
            throw new ArgumentOutOfRangeException(nameof(step), "Step must be between 1 and 10");
        }

        progress.CurrentStep = step;

        // Mark previous step as completed
        var completedStepsJson = string.IsNullOrWhiteSpace(progress.CompletedSteps) ? "[]" : progress.CompletedSteps;
        var completedSteps = JsonSerializer.Deserialize<List<int>>(completedStepsJson) ?? [];
        if (step > 1 && !completedSteps.Contains(step - 1))
        {
            completedSteps.Add(step - 1);
            completedSteps.Sort();
            progress.CompletedSteps = JsonSerializer.Serialize(completedSteps);
        }

        progress = await onboardingRepository.UpdateAsync(progress, cancellationToken);

        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, planName: planName);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating current step for business {BusinessId} to step {Step}")]
    private static partial void LogUpdatingCurrentStep(ILogger logger, Guid businessId, int step);

    /// <inheritdoc />
    public async Task<OnboardingPreferencesDto?> GetPreferencesAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var progress = await onboardingRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        if (progress == null)
        {
            return null;
        }

        // Parse JSON arrays
        var channelsJson = string.IsNullOrWhiteSpace(progress.SelectedChannels) ? "[]" : progress.SelectedChannels;
        var automationsJson = string.IsNullOrWhiteSpace(progress.SelectedAutomations) ? "[]" : progress.SelectedAutomations;

        return new OnboardingPreferencesDto
        {
            BusinessId = progress.BusinessId,
            Industry = progress.Industry,
            TeamSize = progress.TeamSize,
            CrmProvider = progress.SelectedCRMProvider,
            LeadType = progress.LeadType,
            MainObjective = progress.MainObjective,
            SelectedChannels = JsonSerializer.Deserialize<List<string>>(channelsJson) ?? [],
            SelectedAutomations = JsonSerializer.Deserialize<List<string>>(automationsJson) ?? [],
            PhoneNumberOption = progress.PhoneNumberOption,
            ExistingPhoneNumber = progress.ExistingPhoneNumber,
            AiPhoneNumber = progress.SelectedAIPhoneNumber,
            CallForwardTo = progress.CallForwardTo,
            MissedCallSmsEnabled = progress.MissedCallSMS,
            OutboundAiCallingEnabled = progress.OutboundAICalling,
            AiTone = progress.AITone,
            BusinessHours = progress.BusinessHours,
            FollowUpPreference = progress.FollowUpPreference,
            CompletedAt = progress.CompletedAt,
            IsComplete = progress.IsComplete
        };
    }

    // ============================================================================
    // Onboarding Call Booking Methods (Cal.com Integration)
    // ============================================================================

    /// <inheritdoc />
    public async Task<AvailableSlotsResponse> GetOnboardingCallSlotsAsync(
        string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(1); // Start from tomorrow
        var endDate = startDate.AddDays(14); // Next 2 weeks

        var slots = await calComService.GetPlatformOnboardingSlotsAsync(
            startDate,
            endDate,
            timezone,
            cancellationToken);

        return new AvailableSlotsResponse
        {
            Slots = slots.Select(s => new OnboardingCallSlotResponse
            {
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsAvailable = s.IsAvailable
            }).ToList()
        };
    }

    /// <inheritdoc />
    public async Task<BookOnboardingCallResponse> BookOnboardingCallAsync(
        Guid businessId,
        BookOnboardingCallRequest request,
        CancellationToken cancellationToken = default)
    {
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        // Check if already has an active booking
        if (progress.OnboardingCallScheduled && !progress.OnboardingCallCompleted && !progress.OnboardingCallCancelled)
        {
            return new BookOnboardingCallResponse
            {
                Success = false,
                ErrorMessage = "An onboarding call is already scheduled. Please cancel or reschedule the existing booking."
            };
        }

        // Get business and user info for the booking
        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        var userEmail = currentUserService.GetUserEmail() ?? business?.Email ?? "unknown@qualiflow.ai";
        var userName = business?.Name ?? "QualiFlow User";

        try
        {
            var bookingUid = await calComService.CreatePlatformOnboardingBookingAsync(
                request.ScheduledAt,
                userName,
                userEmail,
                request.Notes,
                request.Timezone,
                cancellationToken);

            // Update progress with booking info
            progress.OnboardingCallScheduled = true;
            progress.OnboardingCallScheduledAt = request.ScheduledAt;
            progress.OnboardingCallBookingUid = bookingUid;
            progress.OnboardingCallCompleted = false;
            progress.OnboardingCallCompletedAt = null;
            progress.OnboardingCallCancelled = false;
            progress.OnboardingCallCancelledAt = null;
            progress.UpdatedAt = DateTime.UtcNow;

            await onboardingRepository.UpdateAsync(progress, cancellationToken);

            logger.LogInformation(
                "Onboarding call booked for business {BusinessId}: BookingUid={BookingUid}, ScheduledAt={ScheduledAt}",
                businessId,
                bookingUid,
                request.ScheduledAt);

            return new BookOnboardingCallResponse
            {
                Success = true,
                BookingUid = bookingUid,
                ScheduledAt = request.ScheduledAt
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to book onboarding call for business {BusinessId}", businessId);
            return new BookOnboardingCallResponse
            {
                Success = false,
                ErrorMessage = "Failed to book the onboarding call. Please try again."
            };
        }
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> RescheduleOnboardingCallAsync(
        Guid businessId,
        RescheduleOnboardingCallRequest request,
        CancellationToken cancellationToken = default)
    {
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        if (string.IsNullOrEmpty(progress.OnboardingCallBookingUid))
        {
            throw new InvalidOperationException("No onboarding call booking found to reschedule.");
        }

        await calComService.ReschedulePlatformOnboardingBookingAsync(
            progress.OnboardingCallBookingUid,
            request.NewScheduledAt,
            request.Reason,
            cancellationToken);

        progress.OnboardingCallScheduledAt = request.NewScheduledAt;
        progress.UpdatedAt = DateTime.UtcNow;

        await onboardingRepository.UpdateAsync(progress, cancellationToken);

        logger.LogInformation(
            "Onboarding call rescheduled for business {BusinessId}: NewScheduledAt={NewScheduledAt}",
            businessId,
            request.NewScheduledAt);

        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, business?.Name, planName);
    }

    /// <inheritdoc />
    public async Task<OnboardingProgressDto> CancelOnboardingCallAsync(
        Guid businessId,
        CancelOnboardingCallRequest request,
        CancellationToken cancellationToken = default)
    {
        var progress = await GetOrCreateProgressAsync(businessId, cancellationToken);

        if (string.IsNullOrEmpty(progress.OnboardingCallBookingUid))
        {
            throw new InvalidOperationException("No onboarding call booking found to cancel.");
        }

        await calComService.CancelPlatformOnboardingBookingAsync(
            progress.OnboardingCallBookingUid,
            request.Reason,
            cancellationToken);

        progress.OnboardingCallScheduled = false;
        progress.OnboardingCallCancelled = true;
        progress.OnboardingCallCancelledAt = DateTime.UtcNow;
        progress.UpdatedAt = DateTime.UtcNow;

        await onboardingRepository.UpdateAsync(progress, cancellationToken);

        logger.LogInformation(
            "Onboarding call cancelled for business {BusinessId}",
            businessId);

        var business = await businessRepository.GetByIdAsync(businessId, cancellationToken);
        var planName = await GetPlanNameAsync(businessId, cancellationToken);
        return MapToDto(progress, business?.Name, planName);
    }

    /// <inheritdoc />
    public async Task<bool> MarkOnboardingCallCompletedAsync(
        string bookingUid,
        CancellationToken cancellationToken = default)
    {
        var progress = await onboardingRepository.GetByBookingUidAsync(bookingUid, cancellationToken);
        if (progress == null)
        {
            logger.LogWarning("No onboarding progress found for booking UID {BookingUid}", bookingUid);
            return false;
        }

        progress.OnboardingCallCompleted = true;
        progress.OnboardingCallCompletedAt = DateTime.UtcNow;
        progress.UpdatedAt = DateTime.UtcNow;

        await onboardingRepository.UpdateAsync(progress, cancellationToken);

        logger.LogInformation(
            "Onboarding call marked as completed for business {BusinessId}: BookingUid={BookingUid}",
            progress.BusinessId,
            bookingUid);

        return true;
    }

    /// <inheritdoc />
    public async Task<bool> MarkOnboardingCallCancelledByWebhookAsync(
        string bookingUid,
        CancellationToken cancellationToken = default)
    {
        var progress = await onboardingRepository.GetByBookingUidAsync(bookingUid, cancellationToken);
        if (progress == null)
        {
            logger.LogWarning("No onboarding progress found for booking UID {BookingUid}", bookingUid);
            return false;
        }

        progress.OnboardingCallScheduled = false;
        progress.OnboardingCallCancelled = true;
        progress.OnboardingCallCancelledAt = DateTime.UtcNow;
        progress.UpdatedAt = DateTime.UtcNow;

        await onboardingRepository.UpdateAsync(progress, cancellationToken);

        logger.LogInformation(
            "Onboarding call marked as cancelled by webhook for business {BusinessId}: BookingUid={BookingUid}",
            progress.BusinessId,
            bookingUid);

        return true;
    }
}
