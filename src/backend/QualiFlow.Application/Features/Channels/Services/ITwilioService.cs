using QualiFlow.Application.Features.Channels.DTOs;

namespace QualiFlow.Application.Features.Channels.Services;

/// <summary>
/// Service for Twilio sub-account provisioning and phone number management.
/// </summary>
public interface ITwilioService
{
    // ============================================================================
    // TEST MODE PROPERTIES (must be declared before methods per SA1201)
    // ============================================================================

    /// <summary>
    /// Gets a value indicating whether test mode is enabled.
    /// When true, uses magic phone numbers and skips real provisioning.
    /// </summary>
    bool IsTestModeEnabled { get; }

    /// <summary>
    /// Gets the test mode magic phone number for successful operations.
    /// </summary>
    string TestModePhoneNumber { get; }

    // ============================================================================
    // SUB-ACCOUNT PROVISIONING METHODS
    // ============================================================================

    /// <summary>
    /// Provisions a new Twilio sub-account for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="businessName">The business name for the sub-account friendly name.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The sub-account details.</returns>
    Task<TwilioSubAccountDto> ProvisionSubAccountAsync(
        Guid businessId,
        string businessName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Provisions a phone number for SMS/Voice/WhatsApp channel.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="areaCode">The preferred area code (e.g., "415" for San Francisco).</param>
    /// <param name="capabilities">The phone number capabilities (SMS, Voice, MMS).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The provisioned phone number details.</returns>
    Task<TwilioPhoneNumberDto> ProvisionPhoneNumberAsync(
        string subAccountSid,
        string? areaCode,
        PhoneNumberCapabilities capabilities,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configures a webhook URL for a phone number.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="phoneNumberSid">The phone number SID.</param>
    /// <param name="webhookUrl">The webhook URL for incoming messages/calls.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if successful.</returns>
#pragma warning disable CA1054 // URI-like parameters should not be strings
    Task<bool> ConfigureWebhookAsync(
        string subAccountSid,
        string phoneNumberSid,
        string webhookUrl,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054

    /// <summary>
    /// Verifies a Twilio sub-account and phone number connectivity.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="phoneNumberSid">The phone number SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Verification result with status and details.</returns>
    Task<TwilioVerificationResultDto> VerifyConnectivityAsync(
        string subAccountSid,
        string? phoneNumberSid = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Releases a phone number (makes it available for purchase by others).
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="phoneNumberSid">The phone number SID to release.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> ReleasePhoneNumberAsync(
        string subAccountSid,
        string phoneNumberSid,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available phone numbers matching the criteria.
    /// </summary>
    /// <param name="countryCode">The country code (e.g., "US", "CA").</param>
    /// <param name="areaCode">The preferred area code.</param>
    /// <param name="capabilities">Required capabilities.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of available phone numbers.</returns>
    Task<IReadOnlyList<TwilioAvailableNumberDto>> SearchAvailableNumbersAsync(
        string countryCode,
        string? areaCode,
        PhoneNumberCapabilities capabilities,
        int limit = 10,
        CancellationToken cancellationToken = default);

    // ============================================================================
    // OUTBOUND CALLING METHODS (Sprint 22)
    // ============================================================================

    /// <summary>
    /// Initiates an outbound call.
    /// </summary>
    /// <param name="request">The outbound call request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The call result with Twilio Call SID.</returns>
    Task<TwilioOutboundCallResultDto> InitiateOutboundCallAsync(
        TwilioOutboundCallRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the status of an outbound call.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="subAccountSid">The Twilio sub-account SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The call status details.</returns>
    Task<TwilioCallStatusDto> GetCallStatusAsync(
        string callSid,
        string? subAccountSid = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Hangs up an active call.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="subAccountSid">The Twilio sub-account SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the call was successfully hung up.</returns>
    Task<bool> HangupCallAsync(
        string callSid,
        string? subAccountSid = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the recording for a call.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="subAccountSid">The Twilio sub-account SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The recording details or null if no recording exists.</returns>
    Task<TwilioRecordingDto?> GetCallRecordingAsync(
        string callSid,
        string? subAccountSid = null,
        CancellationToken cancellationToken = default);

    // ============================================================================
    // SUB-ACCOUNT MANAGEMENT METHODS (Development/Testing)
    // ============================================================================

    /// <summary>
    /// Lists all sub-accounts under the main account.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of all sub-accounts.</returns>
    Task<IReadOnlyList<TwilioSubAccountDto>> ListSubAccountsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Closes a sub-account. Closed accounts are automatically deleted after 30 days.
    /// </summary>
    /// <param name="subAccountSid">The sub-account SID to close.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the sub-account was successfully closed.</returns>
    Task<bool> CloseSubAccountAsync(
        string subAccountSid,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Closes all sub-accounts. Use with caution - for development/testing cleanup only.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The number of sub-accounts closed.</returns>
    Task<int> CloseAllSubAccountsAsync(
        CancellationToken cancellationToken = default);

    // ============================================================================
    // MESSAGING METHODS (Sprint 35 - AI Auto-Response)
    // ============================================================================

    /// <summary>
    /// Sends an SMS message via Twilio.
    /// </summary>
    /// <param name="request">The SMS send request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of the SMS send operation.</returns>
    Task<TwilioSmsResultDto> SendSmsAsync(
        TwilioSendSmsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a WhatsApp message via Twilio.
    /// </summary>
    /// <param name="request">The WhatsApp send request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of the WhatsApp send operation.</returns>
    Task<TwilioSmsResultDto> SendWhatsAppAsync(
        TwilioSendSmsRequest request,
        CancellationToken cancellationToken = default);

    // ============================================================================
    // USAGE TRACKING METHODS (For Billing & Business Settings)
    // ============================================================================

    /// <summary>
    /// Gets usage records for a sub-account (SMS, Voice, WhatsApp).
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="startDate">The start date for usage records.</param>
    /// <param name="endDate">The end date for usage records.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Usage records for the sub-account.</returns>
    Task<TwilioUsageSummaryDto> GetUsageAsync(
        string subAccountSid,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the sub-account details by SID.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The sub-account details or null if not found.</returns>
    Task<TwilioSubAccountDto?> GetSubAccountAsync(
        string subAccountSid,
        CancellationToken cancellationToken = default);

    // ============================================================================
    // PHONE NUMBER LOOKUP METHODS
    // ============================================================================

    /// <summary>
    /// Gets a phone number's details by its E.164 format number.
    /// </summary>
    /// <param name="phoneNumber">The phone number in E.164 format (e.g., +14155551234).</param>
    /// <param name="accountSid">The account SID (main or sub-account). If null, uses main account.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The phone number details or null if not found.</returns>
    Task<TwilioPhoneNumberDto?> GetPhoneNumberByNumberAsync(
        string phoneNumber,
        string? accountSid = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Configures webhook URLs for a phone number using the phone number string (E.164 format).
    /// Looks up the phone number SID and configures webhooks.
    /// </summary>
    /// <param name="phoneNumber">The phone number in E.164 format.</param>
    /// <param name="smsWebhookUrl">The webhook URL for SMS (can be same as voice).</param>
    /// <param name="voiceWebhookUrl">The webhook URL for Voice (can be same as SMS).</param>
    /// <param name="accountSid">The account SID. If null, uses main account.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if successful, false if phone number not found.</returns>
#pragma warning disable CA1054 // URI-like parameters should not be strings
    Task<bool> ConfigureWebhooksByPhoneNumberAsync(
        string phoneNumber,
        string smsWebhookUrl,
        string voiceWebhookUrl,
        string? accountSid = null,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054
}
