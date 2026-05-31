using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Meta.Interfaces;
using QualiFlow.Domain.Constants;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Channels.Services;

/// <summary>
/// Service implementation for channel management operations.
/// </summary>
/// <param name="channelRepository">The channel repository.</param>
/// <param name="twilioService">The Twilio service for SMS/Voice/WhatsApp verification.</param>
/// <param name="metaApiClient">The Meta API client for Instagram/Facebook verification.</param>
/// <param name="metaOAuthService">The Meta OAuth service for social channel connections.</param>
/// <param name="onboardingRepository">The onboarding repository for getting channel preferences.</param>
/// <param name="subscriptionService">The subscription service for plan checks.</param>
/// <param name="usageLimitService">The usage limit service for channel limits.</param>
/// <param name="configuration">The configuration instance for environment-aware settings.</param>
/// <param name="logger">The logger instance.</param>
public partial class ChannelService(
    IChannelRepository channelRepository,
    ITwilioService twilioService,
    IMetaApiClient metaApiClient,
    IMetaOAuthService metaOAuthService,
    IOnboardingRepository onboardingRepository,
    ISubscriptionService subscriptionService,
    IUsageLimitService usageLimitService,
    IConfiguration configuration,
    ILogger<ChannelService> logger) : IChannelService
{
    /// <summary>
    /// Channel metadata for display and provisioning logic.
    /// Tuple: (DisplayName, Description, IconName, RequiresPhone, RequiresOAuth, MinPlan, ChannelType).
    /// Based on official product documentation - 7 core channels (QR Code is a feature of Web Forms, not a separate channel).
    /// </summary>
    private static readonly Dictionary<string, ChannelMetadataInfo> ChannelMetadata = new(StringComparer.OrdinalIgnoreCase)
    {
        ["sms"] = new("SMS Messaging", "Text messaging for instant communication", "MessageSquare", true, false, PlanConstants.FreeFlow, ChannelType.SMS),
        ["voice"] = new("AI Voice Calls", "Automated and live phone calls", "Phone", true, false, PlanConstants.FreeFlow, ChannelType.Voice),
        ["whatsapp"] = new("WhatsApp Business", "Rich messaging with 2B+ users", "MessageSquare", true, false, PlanConstants.SmartFlow, ChannelType.WhatsApp),
        ["chat_widget"] = new("Website Chat", "Live chat on your website", "MessageCircle", false, false, PlanConstants.FreeFlow, ChannelType.ChatWidget),
        ["web_forms"] = new("Web Forms", "Customizable lead capture forms (includes QR code feature)", "FileText", false, false, PlanConstants.FreeFlow, ChannelType.WebForm),
        ["social"] = new("Social Messaging", "Instagram & Facebook Messenger", "Share2", false, true, PlanConstants.SmartFlow, ChannelType.SocialMessaging),
        ["email"] = new("Email", "Email communication channel", "Mail", false, false, PlanConstants.SmartFlow, ChannelType.Email),
    };

    /// <summary>
    /// Maps onboarding channel type names to canonical backend channel type names.
    /// Onboarding uses different names (e.g., 'phone' instead of 'voice', 'web_chat' instead of 'chat_widget').
    /// </summary>
    private static readonly Dictionary<string, string> OnboardingChannelAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["phone"] = "voice",           // Onboarding uses 'phone', backend uses 'voice'
        ["web_chat"] = "chat_widget",  // Onboarding uses 'web_chat', backend uses 'chat_widget'
    };

    /// <summary>
    /// Normalizes a channel type from onboarding format to backend format.
    /// </summary>
    private static string NormalizeChannelType(string channelType)
    {
        return OnboardingChannelAliases.TryGetValue(channelType, out var normalized)
            ? normalized
            : channelType;
    }

    /// <inheritdoc />
    public async Task<ChannelDto?> GetByIdAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        LogGettingChannel(logger, channelId);

        var channel = await channelRepository.GetByIdAsync(channelId, cancellationToken);

        return channel == null ? null : MapToDto(channel);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChannelDto>> GetAllAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGettingAllChannels(logger, businessId);

        var channels = await channelRepository.GetByBusinessIdAsync(businessId, cancellationToken);

        return channels.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChannelDto>> GetByTypeAsync(
        Guid businessId,
        ChannelType type,
        CancellationToken cancellationToken = default)
    {
        LogGettingChannelsByType(logger, businessId, type);

        var channels = await channelRepository.GetByTypeAsync(businessId, type, cancellationToken);

        return channels.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChannelDto>> GetActiveAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGettingActiveChannels(logger, businessId);

        var channels = await channelRepository.GetActiveChannelsAsync(businessId, cancellationToken);

        return channels.Select(MapToDto).ToList();
    }

    /// <inheritdoc />
    public async Task<ChannelDto> CreateAsync(
        Guid businessId,
        CreateChannelRequest request,
        CancellationToken cancellationToken = default)
    {
        // Determine initial verification status based on channel type
        // Twilio-based channels (SMS, Voice, WhatsApp) start as "Pending" - require external provisioning
        // Standalone channels (ChatWidget, WebForm, Email, Social) are auto-verified - no external setup needed
        var requiresExternalProvisioning = request.Type is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp;
        var initialStatus = requiresExternalProvisioning ? "Pending" : "Verified";
        var verifiedAt = requiresExternalProvisioning ? (DateTime?)null : DateTime.UtcNow;

        return await CreateChannelWithStatusAsync(businessId, request, initialStatus, verifiedAt, cancellationToken);
    }

    /// <summary>
    /// Creates a new channel with a specific verification status.
    /// Used internally when we know the verification status at creation time.
    /// </summary>
    private async Task<ChannelDto> CreateChannelWithStatusAsync(
        Guid businessId,
        CreateChannelRequest request,
        string verificationStatus,
        DateTime? lastVerifiedAt,
        CancellationToken cancellationToken = default)
    {
        LogCreatingChannel(logger, businessId, request.Type);

        var channel = new Channel
        {
            BusinessId = businessId,
            Type = request.Type,
            Name = request.Name,
            PhoneNumber = request.PhoneNumber,
            Configuration = request.Configuration,
            ExternalAccountId = request.ExternalAccountId,
            EncryptedCredentials = request.EncryptedCredentials,
            WebhookUrl = request.WebhookUrl,
            IsActive = true,
            VerificationStatus = verificationStatus,
            LastVerifiedAt = lastVerifiedAt
        };

        var created = await channelRepository.CreateAsync(channel, cancellationToken);

        return MapToDto(created);
    }

    /// <inheritdoc />
    public async Task<ChannelDto> UpdateAsync(
        Guid channelId,
        UpdateChannelRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingChannel(logger, channelId);

        var channel = await channelRepository.GetByIdAsync(channelId, cancellationToken);
        if (channel == null)
        {
            throw new InvalidOperationException($"Channel with ID {channelId} not found");
        }

        if (request.Name != null)
        {
            channel.Name = request.Name;
        }

        if (request.IsActive.HasValue)
        {
            channel.IsActive = request.IsActive.Value;
        }

        if (request.PhoneNumber != null)
        {
            channel.PhoneNumber = request.PhoneNumber;
        }

        if (request.Configuration != null)
        {
            channel.Configuration = request.Configuration;
        }

        if (request.WebhookUrl != null)
        {
            channel.WebhookUrl = request.WebhookUrl;
        }

        if (request.EncryptedCredentials != null)
        {
            channel.EncryptedCredentials = request.EncryptedCredentials;
        }

        var updated = await channelRepository.UpdateAsync(channel, cancellationToken);

        return MapToDto(updated);
    }

    /// <inheritdoc />
    public Task DeleteAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        LogDeletingChannel(logger, channelId);

        return channelRepository.DeleteAsync(channelId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ChannelDto> VerifyAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        LogVerifyingChannel(logger, channelId);

        var channel = await channelRepository.GetByIdAsync(channelId, cancellationToken);
        if (channel == null)
        {
            throw new InvalidOperationException($"Channel with ID {channelId} not found");
        }

        // Verify channel based on type
        TwilioVerificationResultDto verificationResult;
        if (channel.Type is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp)
        {
            verificationResult = await VerifyTwilioChannelAsync(channel, cancellationToken);
        }
        else if (channel.Type is ChannelType.Instagram or ChannelType.Facebook)
        {
            verificationResult = await VerifyMetaChannelAsync(channel, cancellationToken);
        }
        else
        {
            throw new InvalidOperationException($"Unsupported channel type: {channel.Type}");
        }

        channel.VerificationStatus = verificationResult.Status;
        channel.LastVerifiedAt = DateTime.UtcNow;

        LogChannelVerified(logger, channelId, channel.VerificationStatus);

        var updated = await channelRepository.UpdateAsync(channel, cancellationToken);

        return MapToDto(updated);
    }

    // Private methods

    /// <summary>
    /// Verifies a Meta-based channel (Instagram, Facebook Messenger) by validating the access token.
    /// </summary>
    /// <param name="channel">The channel to verify.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The verification result.</returns>
    private async Task<TwilioVerificationResultDto> VerifyMetaChannelAsync(
        Channel channel,
        CancellationToken cancellationToken)
    {
        var details = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["ChannelType"] = channel.Type.ToString(),
        };

        // Check if we have credentials
        if (string.IsNullOrEmpty(channel.Credentials) && string.IsNullOrEmpty(channel.EncryptedCredentials))
        {
            return new TwilioVerificationResultDto
            {
                IsSuccessful = false,
                Status = "NotConnected",
                Message = "No access token configured. Please connect your Facebook/Instagram account.",
                VerifiedAt = DateTime.UtcNow,
                Details = details,
            };
        }

        var accessToken = channel.Credentials ?? channel.EncryptedCredentials;

        try
        {
            // Validate the token using Meta's debug_token endpoint
            var tokenDebug = await metaApiClient.DebugTokenAsync(accessToken!, cancellationToken);

            if (tokenDebug == null)
            {
                return new TwilioVerificationResultDto
                {
                    IsSuccessful = false,
                    Status = "Failed",
                    Message = "Unable to validate access token with Meta API.",
                    VerifiedAt = DateTime.UtcNow,
                    Details = details,
                };
            }

            if (!tokenDebug.IsValid)
            {
                var errorMessage = tokenDebug.Error?.Message ?? "Token is invalid or expired.";
                return new TwilioVerificationResultDto
                {
                    IsSuccessful = false,
                    Status = "TokenExpired",
                    Message = $"Access token is invalid: {errorMessage}",
                    VerifiedAt = DateTime.UtcNow,
                    Details = details,
                };
            }

            // Token is valid
            details["TokenExpiresAt"] = DateTimeOffset.FromUnixTimeSeconds(tokenDebug.ExpiresAt).ToString("O");
            details["Scopes"] = string.Join(", ", tokenDebug.Scopes);

            // Check if required messaging permissions are present
            var hasMessagingPermission = tokenDebug.Scopes.Any(s =>
                s.Contains("pages_messaging", StringComparison.OrdinalIgnoreCase) ||
                s.Contains("instagram_manage_messages", StringComparison.OrdinalIgnoreCase));

            if (!hasMessagingPermission)
            {
                return new TwilioVerificationResultDto
                {
                    IsSuccessful = false,
                    Status = "MissingPermissions",
                    Message = "Access token is missing required messaging permissions. Please reconnect with messaging permissions.",
                    VerifiedAt = DateTime.UtcNow,
                    Details = details,
                };
            }

            LogMetaChannelVerified(logger, channel.Id, channel.ExternalId ?? "unknown");

            return new TwilioVerificationResultDto
            {
                IsSuccessful = true,
                Status = "Verified",
                Message = "Meta channel verified successfully.",
                VerifiedAt = DateTime.UtcNow,
                Details = details,
            };
        }
        catch (Exception ex)
        {
            LogMetaVerificationError(logger, channel.Id, ex.Message);
            return new TwilioVerificationResultDto
            {
                IsSuccessful = false,
                Status = "Failed",
                Message = $"Verification failed: {ex.Message}",
                VerifiedAt = DateTime.UtcNow,
                Details = details,
            };
        }
    }

    // Logging for Meta verification
    [LoggerMessage(Level = LogLevel.Information, Message = "Meta channel {ChannelId} verified for page {PageId}")]
    private static partial void LogMetaChannelVerified(ILogger logger, Guid channelId, string pageId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Meta channel {ChannelId} verification failed: {Error}")]
    private static partial void LogMetaVerificationError(ILogger logger, Guid channelId, string error);

    private static ChannelDto MapToDto(Channel channel)
    {
        return new ChannelDto
        {
            Id = channel.Id,
            BusinessId = channel.BusinessId,
            Type = channel.Type,
            Name = channel.Name,
            IsActive = channel.IsActive,
            PhoneNumber = channel.PhoneNumber,
            WebhookUrl = channel.WebhookUrl,
            VerificationStatus = channel.VerificationStatus,
            LastVerifiedAt = channel.LastVerifiedAt,
            CreatedAt = channel.CreatedAt,
            UpdatedAt = channel.UpdatedAt,
            Configuration = channel.Configuration,
            ExternalId = channel.ExternalId,
            ExternalAccountId = channel.ExternalAccountId,
            Metadata = channel.Metadata,
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<PendingChannelDto>> GetPendingChannelsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingPendingChannels(logger, businessId);

        // Get onboarding progress to find selected channels
        var progress = await onboardingRepository.GetByBusinessIdAsync(businessId, cancellationToken);

        // Only show pending channels if onboarding was completed (or skipped)
        // Businesses that never started or are still in progress should not see this
        if (progress == null)
        {
            return [];
        }

        // Check if onboarding is complete or was skipped
        if (!progress.IsComplete && !progress.IsSkipped)
        {
            // Onboarding in progress - don't show channel setup yet
            return [];
        }

        if (string.IsNullOrWhiteSpace(progress.SelectedChannels) || progress.SelectedChannels == "[]")
        {
            return [];
        }

        // Parse selected channels from onboarding
        var selectedChannels = JsonSerializer.Deserialize<List<string>>(progress.SelectedChannels) ?? [];
        if (selectedChannels.Count == 0)
        {
            return [];
        }

        // Get existing activated channels
        var existingChannels = await channelRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        var activatedTypes = existingChannels.Select(c => c.Type).ToHashSet();

        // Get subscription for plan check
        var subscription = await subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);
        var currentPlan = NormalizePlanName(subscription?.Plan?.Name ?? subscription?.Plan?.DisplayName);

        LogCurrentPlanCheck(logger, businessId, subscription?.Plan?.Name ?? "null", currentPlan);

        var pendingChannels = new List<PendingChannelDto>();

        foreach (var rawChannelType in selectedChannels)
        {
            // Normalize channel type from onboarding format (e.g., 'phone' → 'voice', 'web_chat' → 'chat_widget')
            var channelType = NormalizeChannelType(rawChannelType);

            if (!ChannelMetadata.TryGetValue(channelType, out var metadata))
            {
                LogUnknownChannelType(logger, businessId, rawChannelType, channelType);
                continue;
            }

            // For channels with a ChannelType, check if they're in the activated list
            // For channels without a ChannelType (like email), they're considered activated
            // once any other channel is activated (meaning setup wizard was completed)
            bool isActivated;
            if (metadata.ChannelType != ChannelType.None)
            {
                isActivated = activatedTypes.Contains(metadata.ChannelType);
            }
            else
            {
                // Channels without a ChannelType (e.g., email) are considered activated
                // if any other channel has been activated (wizard was completed)
                isActivated = existingChannels.Count > 0;
            }

            var isAvailable = IsPlanSufficient(currentPlan, metadata.MinPlan);

            LogPlanSufficiencyCheck(logger, channelType, currentPlan, metadata.MinPlan, isAvailable);

            // Use enum name for consistency with active channels API (e.g., "WebForm" not "web_forms")
            var enumTypeName = metadata.ChannelType != ChannelType.None
                ? metadata.ChannelType.ToString()
                : channelType; // Fallback to key for channels without enum mapping

            pendingChannels.Add(new PendingChannelDto
            {
                ChannelType = enumTypeName,
                DisplayName = metadata.DisplayName,
                Description = metadata.Description,
                IconName = metadata.IconName,
                RequiresPhoneNumber = metadata.RequiresPhone,
                RequiresOAuthConnection = metadata.RequiresOAuth,
                MinimumPlan = metadata.MinPlan,
                IsAvailableOnCurrentPlan = isAvailable,
                IsActivated = isActivated
            });
        }

        LogPendingChannelsResult(logger, businessId, pendingChannels.Count);
        return pendingChannels;
    }

    /// <inheritdoc />
    public async Task<ActivateChannelResponse> ActivateChannelAsync(
        Guid businessId,
        ActivateChannelRequest request,
        CancellationToken cancellationToken = default)
    {
        LogActivatingChannel(logger, businessId, request.ChannelType);

        // Validate channel type
        if (!ChannelMetadata.TryGetValue(request.ChannelType, out var metadata))
        {
            return new ActivateChannelResponse
            {
                Success = false,
                ErrorMessage = $"Unknown channel type: {request.ChannelType}"
            };
        }

        // Check if channel of this type already exists for this business
        var existingChannels = await channelRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        var existingChannelOfType = existingChannels.FirstOrDefault(c => c.Type == metadata.ChannelType);
        if (existingChannelOfType != null)
        {
            // Channel already exists - return success with existing channel info
            return new ActivateChannelResponse
            {
                Success = true,
                Channel = MapToDto(existingChannelOfType),
                ProvisionedPhoneNumber = existingChannelOfType.PhoneNumber,
                NextSteps = $"{metadata.DisplayName} channel is already activated."
            };
        }

        // Check subscription allows this channel
        var subscription = await subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);
        var currentPlan = subscription?.Plan?.Name?.ToLowerInvariant().Replace(" ", string.Empty, StringComparison.Ordinal) ?? PlanConstants.FreeFlow;

        if (!IsPlanSufficient(currentPlan, metadata.MinPlan))
        {
            return new ActivateChannelResponse
            {
                Success = false,
                ErrorMessage = $"Your current plan ({currentPlan}) does not include {metadata.DisplayName}. Please upgrade to {metadata.MinPlan} or higher."
            };
        }

        // Check if OAuth connection is required - redirect to OAuth flow
        // Social channels require Meta OAuth to connect Facebook Pages and Instagram accounts
        if (metadata.RequiresOAuth)
        {
            // Generate OAuth URL for the user to connect their Meta account
            var state = Guid.NewGuid().ToString("N");
            var oauthUrl = metaOAuthService.GetAuthorizationUrl(businessId, state, "facebook");

            LogMetaOAuthRedirect(logger, businessId, metadata.DisplayName);

            return new ActivateChannelResponse
            {
                Success = true, // Not an error - just needs OAuth
                RequiresOAuth = true,
                OAuthUrl = oauthUrl,
                NextSteps = $"Connect your Meta Business account to enable {metadata.DisplayName}. " +
                           "You'll be redirected to Facebook to authorize access to your pages."
            };
        }

        // Check usage limits
        if (!await usageLimitService.CanCreateChannelAsync(businessId, request.ChannelType, cancellationToken))
        {
            return new ActivateChannelResponse
            {
                Success = false,
                ErrorMessage = "You have reached the channel limit for your current plan."
            };
        }

        string? provisionedPhone = null;
        string? twilioSubAccountSid = null;

        // Provision Twilio resources if needed
        if (metadata.RequiresPhone && metadata.ChannelType is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp)
        {
            try
            {
                // Check if we should skip provisioning in development
                var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
                var skipProvisioningInDev = configuration.GetValue<bool>("Twilio:SkipProvisioningInDevelopment");
                var developmentPhoneNumber = configuration["Twilio:DevelopmentPhoneNumber"];
                var isDevelopment = environment.Equals("Development", StringComparison.OrdinalIgnoreCase);

                if (isDevelopment && skipProvisioningInDev && !string.IsNullOrEmpty(developmentPhoneNumber))
                {
                    // DEVELOPMENT MODE: Skip actual provisioning, use shared development phone number
                    LogDevelopmentModeSkipProvisioning(logger, businessId, developmentPhoneNumber);

                    // Use a pseudo sub-account SID for development (main account SID)
                    twilioSubAccountSid = configuration["Twilio:Live:AccountSid"] ?? configuration["Twilio:AccountSid"] ?? "DEV_ACCOUNT";
                    provisionedPhone = developmentPhoneNumber;

                    // Skip webhook configuration in development - webhooks are manually configured on the dev number
                    LogDevelopmentModeWebhookSkipped(logger, developmentPhoneNumber);
                }
                else
                {
                    // PRODUCTION/STAGING MODE: Full provisioning

                    // CRITICAL: Enforce ONE sub-account per business
                    // Check if business already has a Twilio sub-account from an existing channel
                    // Reuse existingChannels from duplicate check above
                    var existingTwilioChannel = existingChannels
                        .FirstOrDefault(c => !string.IsNullOrEmpty(c.ExternalAccountId) &&
                                             c.Type is ChannelType.SMS or ChannelType.Voice or ChannelType.WhatsApp);

                    if (existingTwilioChannel != null)
                    {
                        // REUSE existing sub-account - NEVER create a duplicate
                        twilioSubAccountSid = existingTwilioChannel.ExternalAccountId;
                        LogReusingSingleSubAccount(logger, businessId, twilioSubAccountSid!);
                    }
                    else
                    {
                        // Create new Twilio sub-account (first Twilio channel for this business)
                        var friendlyName = $"QualiFlow-{businessId:N}";
                        if (friendlyName.Length > 30)
                        {
                            friendlyName = friendlyName[..30];
                        }

                        LogCreatingFirstSubAccount(logger, businessId);
                        var subAccount = await twilioService.ProvisionSubAccountAsync(businessId, friendlyName, cancellationToken);
                        twilioSubAccountSid = subAccount.AccountSid;
                    }

                    // Provision phone number only if not using an existing one
                    if (request.PhoneNumberOption == "new" || string.IsNullOrEmpty(request.ExistingPhoneNumber))
                    {
                        if (string.IsNullOrEmpty(twilioSubAccountSid))
                        {
                            return new ActivateChannelResponse
                            {
                                Success = false,
                                ErrorMessage = "Failed to provision Twilio sub-account. Cannot provision phone number."
                            };
                        }

                        var capabilities = metadata.ChannelType switch
                        {
                            ChannelType.SMS => PhoneNumberCapabilities.SMS,
                            ChannelType.Voice => PhoneNumberCapabilities.Voice | PhoneNumberCapabilities.SMS,
                            ChannelType.WhatsApp => PhoneNumberCapabilities.SMS | PhoneNumberCapabilities.MMS,
                            _ => PhoneNumberCapabilities.SMS | PhoneNumberCapabilities.Voice
                        };

                        var phoneResult = await twilioService.ProvisionPhoneNumberAsync(
                            twilioSubAccountSid,
                            areaCode: null,
                            capabilities,
                            cancellationToken);
                        provisionedPhone = phoneResult.PhoneNumber;

                        // CRITICAL: Configure webhooks on the newly provisioned phone number
                        // This ensures inbound SMS/Voice/WhatsApp are routed to QualiFlow's webhook endpoints
                        var webhookBaseUrl = GetWebhookBaseUrl();
                        var webhookUrl = metadata.ChannelType switch
                        {
                            ChannelType.SMS => $"{webhookBaseUrl}/api/v1/webhooks/twilio/sms",
                            ChannelType.Voice => $"{webhookBaseUrl}/api/v1/webhooks/twilio/voice",
                            ChannelType.WhatsApp => $"{webhookBaseUrl}/api/v1/webhooks/twilio/whatsapp",
                            _ => $"{webhookBaseUrl}/api/v1/webhooks/twilio/sms"
                        };

                        await twilioService.ConfigureWebhookAsync(
                            twilioSubAccountSid,
                            phoneResult.PhoneNumberSid,
                            webhookUrl,
                            cancellationToken);

                        LogWebhookConfigured(logger, phoneResult.PhoneNumberSid, webhookUrl);
                    }
                    else
                    {
                        // Use the existing phone number without re-provisioning
                        provisionedPhone = request.ExistingPhoneNumber;
                    }
                }
            }
            catch (Exception ex)
            {
                LogChannelActivationFailed(logger, businessId, request.ChannelType, ex);
                return new ActivateChannelResponse
                {
                    Success = false,
                    ErrorMessage = $"Failed to provision phone resources: {ex.Message}"
                };
            }
        }

        // Create the channel entity
        // Determine verification status based on channel requirements:
        // - OAuth channels (Instagram, Facebook): Always "Pending" until OAuth connection established (future feature)
        // - Twilio channels (SMS, Voice, WhatsApp): "Verified" if Twilio resources provisioned successfully
        // - Standalone channels (ChatWidget, WebForm, Email): "Verified" immediately (no external setup needed)
        var isVerified = !metadata.RequiresOAuth &&
                        (!metadata.RequiresPhone || (!string.IsNullOrEmpty(twilioSubAccountSid) && !string.IsNullOrEmpty(provisionedPhone)));
        var channelName = request.DisplayName ?? metadata.DisplayName;

        // Build webhook URL for this channel
        var channelWebhookUrl = metadata.RequiresPhone ? metadata.ChannelType switch
        {
            ChannelType.SMS => $"{GetWebhookBaseUrl()}/api/v1/webhooks/twilio/sms",
            ChannelType.Voice => $"{GetWebhookBaseUrl()}/api/v1/webhooks/twilio/voice",
            ChannelType.WhatsApp => $"{GetWebhookBaseUrl()}/api/v1/webhooks/twilio/whatsapp",
            _ => null
        } : null;

        var channel = await CreateChannelWithStatusAsync(businessId, new CreateChannelRequest
        {
            Type = metadata.ChannelType,
            Name = channelName,
            PhoneNumber = provisionedPhone,
            ExternalAccountId = twilioSubAccountSid,
            WebhookUrl = channelWebhookUrl,
            Configuration = JsonSerializer.Serialize(new { channelType = request.ChannelType, activatedAt = DateTime.UtcNow })
        }, isVerified ? "Verified" : "Pending", isVerified ? DateTime.UtcNow : null, cancellationToken);

        LogChannelActivated(logger, businessId, request.ChannelType, channel.Id);

        return new ActivateChannelResponse
        {
            Success = true,
            Channel = channel,
            ProvisionedPhoneNumber = provisionedPhone,
            NextSteps = GetNextSteps(request.ChannelType)
        };
    }

    /// <summary>
    /// Normalizes a plan name to match the hierarchy keys (freeflow, smartflow, ultraflow, enterprise).
    /// Handles various formats: "Ultra Flow", "ultraflow", "ultra-flow", "ultra_flow", etc.
    /// </summary>
    private static string NormalizePlanName(string? planName)
    {
        if (string.IsNullOrWhiteSpace(planName))
        {
            return PlanConstants.FreeFlow;
        }

        // Remove spaces, hyphens, underscores and convert to lowercase
        var normalized = planName.ToLowerInvariant()
            .Replace(" ", string.Empty, StringComparison.Ordinal)
            .Replace("-", string.Empty, StringComparison.Ordinal)
            .Replace("_", string.Empty, StringComparison.Ordinal);

        // Map common variations to canonical names
        return normalized switch
        {
            "free" or PlanConstants.FreeFlow or "freetrial" or "trial" => PlanConstants.FreeFlow,
            "smart" or PlanConstants.SmartFlow or "starter" => PlanConstants.SmartFlow,
            "ultra" or PlanConstants.UltraFlow or "professional" or "pro" => PlanConstants.UltraFlow,
            PlanConstants.Enterprise or "business" or "custom" => PlanConstants.Enterprise,
            _ => normalized // Return as-is if no match, IsPlanSufficient will handle unknown plans
        };
    }

    private static bool IsPlanSufficient(string currentPlan, string requiredPlan)
    {
        var planHierarchy = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            [PlanConstants.FreeFlow] = 0,
            [PlanConstants.SmartFlow] = 1,
            [PlanConstants.UltraFlow] = 2,
            [PlanConstants.Enterprise] = 3
        };

        var currentLevel = planHierarchy.GetValueOrDefault(currentPlan, 0);
        var requiredLevel = planHierarchy.GetValueOrDefault(requiredPlan, 0);

        return currentLevel >= requiredLevel;
    }

    private static string GetNextSteps(string channelType)
    {
        return channelType.ToLowerInvariant() switch
        {
            "sms" => "Your SMS channel is ready! Send a test message from the Conversations page.",
            "phone" => "Your AI phone line is active! Test it by calling your new number.",
            "email" => "Configure your email settings in the Email Templates section.",
            "web_chat" => "Copy the chat widget code from Settings to embed on your website.",
            "web_forms" => "Create your first form in the Forms section.",
            "social" => "Connect your Instagram and Facebook accounts in Settings > Integrations.",
            _ => "Your channel is now active!"
        };
    }

    // Logging methods

    [LoggerMessage(EventId = 9001, Level = LogLevel.Information, Message = "Getting channel {ChannelId}")]
    private static partial void LogGettingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 9010, Level = LogLevel.Information, Message = "Getting pending channels for business {BusinessId}")]
    private static partial void LogGettingPendingChannels(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 9011, Level = LogLevel.Information, Message = "Activating channel {ChannelType} for business {BusinessId}")]
    private static partial void LogActivatingChannel(ILogger logger, Guid businessId, string channelType);

    [LoggerMessage(EventId = 9012, Level = LogLevel.Information, Message = "Returning {Count} pending channels for business {BusinessId}")]
    private static partial void LogPendingChannelsResult(ILogger logger, Guid businessId, int count);

    [LoggerMessage(EventId = 9012, Level = LogLevel.Information, Message = "Channel {ChannelType} activated for business {BusinessId} with ID {ChannelId}")]
    private static partial void LogChannelActivated(ILogger logger, Guid businessId, string channelType, Guid channelId);

    [LoggerMessage(EventId = 9013, Level = LogLevel.Error, Message = "Channel activation failed for business {BusinessId}, channel type {ChannelType}")]
    private static partial void LogChannelActivationFailed(ILogger logger, Guid businessId, string channelType, Exception ex);

    [LoggerMessage(EventId = 9002, Level = LogLevel.Information, Message = "Getting all channels for business {BusinessId}")]
    private static partial void LogGettingAllChannels(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 9003, Level = LogLevel.Information, Message = "Getting channels of type {Type} for business {BusinessId}")]
    private static partial void LogGettingChannelsByType(ILogger logger, Guid businessId, ChannelType type);

    [LoggerMessage(EventId = 9004, Level = LogLevel.Information, Message = "Getting active channels for business {BusinessId}")]
    private static partial void LogGettingActiveChannels(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 9005, Level = LogLevel.Information, Message = "Creating channel of type {Type} for business {BusinessId}")]
    private static partial void LogCreatingChannel(ILogger logger, Guid businessId, ChannelType type);

    [LoggerMessage(EventId = 9006, Level = LogLevel.Information, Message = "Updating channel {ChannelId}")]
    private static partial void LogUpdatingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 9007, Level = LogLevel.Information, Message = "Deleting channel {ChannelId}")]
    private static partial void LogDeletingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 9008, Level = LogLevel.Information, Message = "Verifying channel {ChannelId}")]
    private static partial void LogVerifyingChannel(ILogger logger, Guid channelId);

    [LoggerMessage(EventId = 9009, Level = LogLevel.Information, Message = "Channel {ChannelId} verified with status: {Status}")]
    private static partial void LogChannelVerified(ILogger logger, Guid channelId, string status);

    [LoggerMessage(EventId = 9014, Level = LogLevel.Information, Message = "ENFORCING ONE SUB-ACCOUNT POLICY: Reusing existing Twilio sub-account {SubAccountSid} for business {BusinessId}")]
    private static partial void LogReusingSingleSubAccount(ILogger logger, Guid businessId, string subAccountSid);

    [LoggerMessage(EventId = 9015, Level = LogLevel.Information, Message = "Plan check for business {BusinessId}: raw plan name = '{RawPlanName}', normalized = '{NormalizedPlan}'")]
    private static partial void LogCurrentPlanCheck(ILogger logger, Guid businessId, string rawPlanName, string normalizedPlan);

    [LoggerMessage(EventId = 9017, Level = LogLevel.Information, Message = "Channel '{ChannelType}': currentPlan='{CurrentPlan}', requiredPlan='{RequiredPlan}', isAvailable={IsAvailable}")]
    private static partial void LogPlanSufficiencyCheck(ILogger logger, string channelType, string currentPlan, string requiredPlan, bool isAvailable);

    [LoggerMessage(EventId = 9015, Level = LogLevel.Information, Message = "Creating first Twilio sub-account for business {BusinessId} (none exists)")]
    private static partial void LogCreatingFirstSubAccount(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 9016, Level = LogLevel.Information, Message = "Webhook configured for phone number {PhoneNumberSid}: {WebhookUrl}")]
    private static partial void LogWebhookConfigured(ILogger logger, string phoneNumberSid, string webhookUrl);

    [LoggerMessage(EventId = 9018, Level = LogLevel.Warning, Message = "Unknown channel type for business {BusinessId}: raw='{RawChannelType}', normalized='{NormalizedChannelType}' - skipping")]
    private static partial void LogUnknownChannelType(ILogger logger, Guid businessId, string rawChannelType, string normalizedChannelType);

    [LoggerMessage(EventId = 9019, Level = LogLevel.Information, Message = "DEVELOPMENT MODE: Skipping Twilio provisioning for business {BusinessId}. Using shared development phone number: {DevelopmentPhoneNumber}")]
    private static partial void LogDevelopmentModeSkipProvisioning(ILogger logger, Guid businessId, string developmentPhoneNumber);

    [LoggerMessage(EventId = 9020, Level = LogLevel.Information, Message = "DEVELOPMENT MODE: Skipping webhook configuration for development phone number {DevelopmentPhoneNumber} (manually configured)")]
    private static partial void LogDevelopmentModeWebhookSkipped(ILogger logger, string developmentPhoneNumber);

    [LoggerMessage(EventId = 9021, Level = LogLevel.Information, Message = "Meta OAuth redirect initiated for business {BusinessId} to connect {ChannelDisplayName}")]
    private static partial void LogMetaOAuthRedirect(ILogger logger, Guid businessId, string channelDisplayName);

    // Private instance methods

    /// <summary>
    /// Gets the base URL for webhook endpoints.
    /// Priority: 1) WEBHOOK_BASE_URL environment variable, 2) Twilio:WebhookBaseUrl from appsettings.
    /// Environment-aware: Development uses localhost, Production uses api.qualiflow.ai.
    /// </summary>
    private string GetWebhookBaseUrl()
    {
        // Check for environment variable first (highest priority for manual overrides)
        var envUrl = Environment.GetEnvironmentVariable("WEBHOOK_BASE_URL");
        if (!string.IsNullOrWhiteSpace(envUrl))
        {
            return envUrl.TrimEnd('/');
        }

        // Read from configuration (environment-specific: Development, Staging, Production)
        var configUrl = configuration["Twilio:WebhookBaseUrl"];
        if (!string.IsNullOrWhiteSpace(configUrl))
        {
            return configUrl.TrimEnd('/');
        }

        // Fallback (should never happen if appsettings.json is properly configured)
        logger.LogWarning("Webhook base URL not configured! Set Twilio:WebhookBaseUrl in appsettings.json");
        return "https://api.qualiflow.ai"; // Fallback to production
    }

    /// <summary>
    /// Verifies a Twilio-based channel (SMS, Voice, WhatsApp).
    /// In test mode or development mode, returns auto-verified status.
    /// </summary>
    private async Task<TwilioVerificationResultDto> VerifyTwilioChannelAsync(
        Channel channel,
        CancellationToken cancellationToken)
    {
        // Check if we're in development mode with skip provisioning enabled
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        var isDevelopment = environment.Equals("Development", StringComparison.OrdinalIgnoreCase);
        var skipProvisioningInDev = configuration.GetValue<bool>("Twilio:SkipProvisioningInDevelopment");
        var developmentPhoneNumber = configuration["Twilio:DevelopmentPhoneNumber"];

        // DEVELOPMENT MODE or TEST MODE: Auto-verify channels without calling Twilio API
        // In development, Twilio test credentials cannot make real API calls, so we auto-verify
        var shouldAutoVerify = twilioService.IsTestModeEnabled ||
            (isDevelopment && skipProvisioningInDev && !string.IsNullOrEmpty(developmentPhoneNumber));

        if (shouldAutoVerify)
        {
            var mode = twilioService.IsTestModeEnabled ? "Test Mode" : "Development Mode";
            logger.LogInformation(
                "{Mode}: Auto-verifying channel {ChannelId} for business {BusinessId}",
                mode, channel.Id, channel.BusinessId);

            return new TwilioVerificationResultDto
            {
                IsSuccessful = true,
                Status = "Verified",
                Message = $"Channel verified ({mode} - no actual Twilio verification performed)",
                VerifiedAt = DateTime.UtcNow,
                Details = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["Mode"] = mode,
                    ["ChannelType"] = channel.Type.ToString(),
                    ["PhoneNumber"] = channel.PhoneNumber ?? "N/A"
                }
            };
        }

        if (string.IsNullOrWhiteSpace(channel.ExternalAccountId))
        {
            throw new InvalidOperationException("Twilio sub-account SID is required for verification");
        }

        return await twilioService.VerifyConnectivityAsync(
            channel.ExternalAccountId,
            channel.PhoneNumber,
            cancellationToken);
    }
}

/// <summary>
/// Metadata information for a channel type.
/// </summary>
/// <param name="DisplayName">The display name.</param>
/// <param name="Description">The description.</param>
/// <param name="IconName">The icon name.</param>
/// <param name="RequiresPhone">Whether the channel requires a phone number.</param>
/// <param name="RequiresOAuth">Whether the channel requires OAuth connection.</param>
/// <param name="MinPlan">The minimum subscription plan required.</param>
/// <param name="ChannelType">The channel type enum value.</param>
internal sealed record ChannelMetadataInfo(
    string DisplayName,
    string Description,
    string IconName,
    bool RequiresPhone,
    bool RequiresOAuth,
    string MinPlan,
    ChannelType ChannelType);
