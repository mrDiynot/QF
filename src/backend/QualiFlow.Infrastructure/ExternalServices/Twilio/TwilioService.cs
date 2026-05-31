using System.Globalization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Channels.Services;
using Twilio;
using Twilio.Rest.Api.V2010;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Rest.Api.V2010.Account.AvailablePhoneNumberCountry;
using Twilio.Rest.Api.V2010.Account.Message;
using Twilio.Rest.Api.V2010.Account.Usage.Record;
using Twilio.Types;
using AppPhoneNumberCapabilities = QualiFlow.Application.Features.Channels.Services.PhoneNumberCapabilities;
using TollFreeResource = Twilio.Rest.Api.V2010.Account.AvailablePhoneNumberCountry.TollFreeResource;
using TwilioPhoneNumber = Twilio.Types.PhoneNumber;
using UsageResource = Twilio.Rest.Api.V2010.Account.Usage.RecordResource;

namespace QualiFlow.Infrastructure.ExternalServices.TwilioIntegration;

/// <summary>
/// Service for Twilio sub-account provisioning and phone number management.
/// Implements real Twilio SDK integration (Sprint 23).
/// Supports test mode for development without real provisioning.
/// </summary>
public partial class TwilioService : ITwilioService
{
    private readonly TwilioOptions _options;
    private readonly ILogger<TwilioService> _logger;
    private readonly bool _isInitialized;

    /// <summary>
    /// Initializes a new instance of the <see cref="TwilioService"/> class.
    /// </summary>
    /// <param name="options">Twilio configuration options.</param>
    /// <param name="logger">Logger instance.</param>
    public TwilioService(
        IOptions<TwilioOptions> options,
        ILogger<TwilioService> logger)
    {
        _options = options.Value;
        _logger = logger;

        // Initialize Twilio client if credentials are valid
        // Uses EffectiveAccountSid/EffectiveAuthToken which support Test/Live credential switching
        if (_options.IsValid())
        {
            TwilioClient.Init(_options.EffectiveAccountSid, _options.EffectiveAuthToken);
            _isInitialized = true;
            LogTwilioInitialized(_logger, _options.EffectiveAccountSid);

            if (_options.UseTestMode)
            {
                LogTestModeEnabled(_logger, _options.Test.PhoneNumber ?? _options.EffectivePhoneNumber ?? "N/A");
            }
        }
        else
        {
            _isInitialized = false;
            LogTwilioNotInitialized(_logger);
        }
    }

    /// <inheritdoc />
    public bool IsTestModeEnabled => _options.UseTestMode;

    /// <inheritdoc />
    public string TestModePhoneNumber => _options.TestMode.ValidFromNumber;

    /// <summary>
    /// Provisions a new Twilio sub-account for a business.
    /// In test mode, returns a mock sub-account without real provisioning.
    /// </summary>
    /// <param name="businessId">The business identifier.</param>
    /// <param name="businessName">The business name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The provisioned sub-account information.</returns>
    public async Task<TwilioSubAccountDto> ProvisionSubAccountAsync(
        Guid businessId,
        string businessName,
        CancellationToken cancellationToken = default)
    {
        LogProvisioningSubAccount(_logger, businessId, businessName);
        EnsureInitialized();

        // TEST MODE: Return mock sub-account without real provisioning
        if (_options.UseTestMode)
        {
            LogTestModeSubAccountProvisioned(_logger, businessId);
            return new TwilioSubAccountDto
            {
                AccountSid = $"AC_TEST_{businessId:N}",
                FriendlyName = $"{businessName} (Test Mode)",
                AuthToken = "TEST_AUTH_TOKEN",
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
            };
        }

        if (!_options.EnableSubAccounts)
        {
            LogSubAccountsDisabled(_logger);
            throw new InvalidOperationException(
                "Twilio sub-account provisioning is disabled. Set Twilio:EnableSubAccounts to true.");
        }

        try
        {
            var friendlyName = $"{businessName} (Business ID: {businessId})";
            var account = await AccountResource.CreateAsync(friendlyName: friendlyName);

            var result = new TwilioSubAccountDto
            {
                AccountSid = account.Sid,
                FriendlyName = account.FriendlyName,
                AuthToken = account.AuthToken,
                Status = account.Status?.ToString() ?? "Active",
                CreatedAt = account.DateCreated ?? DateTime.UtcNow,
            };

            LogSubAccountProvisioned(_logger, businessId, result.AccountSid);
            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "ProvisionSubAccount", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Provisions a phone number for SMS/Voice/WhatsApp channel.
    /// In test mode, returns the magic phone number without real provisioning.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="areaCode">Optional area code for phone number.</param>
    /// <param name="capabilities">Required phone number capabilities.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The provisioned phone number information.</returns>
    public async Task<TwilioPhoneNumberDto> ProvisionPhoneNumberAsync(
        string subAccountSid,
        string? areaCode,
        QualiFlow.Application.Features.Channels.Services.PhoneNumberCapabilities capabilities,
        CancellationToken cancellationToken = default)
    {
        LogProvisioningPhoneNumber(_logger, subAccountSid, areaCode ?? "any");
        EnsureInitialized();

        // TEST MODE: Return magic phone number without real provisioning
        if (_options.UseTestMode)
        {
            var testNumber = _options.TestMode.ValidFromNumber;
            LogTestModePhoneNumberProvisioned(_logger, testNumber);
            return new TwilioPhoneNumberDto
            {
                PhoneNumberSid = $"PN_TEST_{Guid.NewGuid():N}",
                PhoneNumber = testNumber,
                FriendlyName = "QualiFlow Test Number",
                VoiceEnabled = capabilities.HasFlag(AppPhoneNumberCapabilities.Voice),
                SmsEnabled = capabilities.HasFlag(AppPhoneNumberCapabilities.SMS),
                MmsEnabled = capabilities.HasFlag(AppPhoneNumberCapabilities.MMS),
                MonthlyCost = 0m, // No cost in test mode
            };
        }

        try
        {
            // CRITICAL FIX: Search for available numbers in the MAIN account (not sub-account)
            // Sub-accounts cannot search for available numbers - only the main account can
            // NOTE: pathAccountSid is intentionally NOT passed here - we search in main account
            var availableNumbers = await LocalResource.ReadAsync(
                pathCountryCode: "US",
                areaCode: string.IsNullOrEmpty(areaCode) ? null : int.Parse(areaCode, CultureInfo.InvariantCulture),
                smsEnabled: capabilities.HasFlag(AppPhoneNumberCapabilities.SMS),
                voiceEnabled: capabilities.HasFlag(AppPhoneNumberCapabilities.Voice),
                mmsEnabled: capabilities.HasFlag(AppPhoneNumberCapabilities.MMS),
                limit: 1);

            var availableNumber = availableNumbers.FirstOrDefault()
                ?? throw new InvalidOperationException($"No available phone numbers found for area code {areaCode ?? "any"}");

            // Purchase the phone number and assign it to the sub-account
            var incomingNumber = await IncomingPhoneNumberResource.CreateAsync(
                phoneNumber: new TwilioPhoneNumber(availableNumber.PhoneNumber.ToString()),
                friendlyName: "QualiFlow Channel Number",
                pathAccountSid: subAccountSid);

            var result = new TwilioPhoneNumberDto
            {
                PhoneNumberSid = incomingNumber.Sid,
                PhoneNumber = incomingNumber.PhoneNumber.ToString(),
                FriendlyName = incomingNumber.FriendlyName,
                VoiceEnabled = incomingNumber.Capabilities?.Voice ?? false,
                SmsEnabled = incomingNumber.Capabilities?.Sms ?? false,
                MmsEnabled = incomingNumber.Capabilities?.Mms ?? false,
                MonthlyCost = 1.00m, // Twilio doesn't return cost in API, use default
            };

            LogPhoneNumberProvisioned(_logger, result.PhoneNumber, result.PhoneNumberSid);
            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "ProvisionPhoneNumber", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Configures a webhook URL for a phone number.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="phoneNumberSid">The phone number SID.</param>
    /// <param name="webhookUrl">The webhook URL to configure.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if configuration succeeded.</returns>
    public async Task<bool> ConfigureWebhookAsync(
        string subAccountSid,
        string phoneNumberSid,
        string webhookUrl,
        CancellationToken cancellationToken = default)
    {
        LogConfiguringWebhook(_logger, phoneNumberSid, webhookUrl);
        EnsureInitialized();

        // TEST MODE: Skip actual webhook configuration for mock phone numbers
        if (_options.UseTestMode)
        {
            LogTestModeWebhookConfigured(_logger, phoneNumberSid, webhookUrl);
            return true;
        }

        try
        {
            var webhookUri = new Uri(webhookUrl);
            await IncomingPhoneNumberResource.UpdateAsync(
                pathSid: phoneNumberSid,
                smsUrl: webhookUri,
                voiceUrl: webhookUri,
                smsMethod: Twilio.Http.HttpMethod.Post,
                voiceMethod: Twilio.Http.HttpMethod.Post,
                pathAccountSid: subAccountSid);

            LogWebhookConfigured(_logger, phoneNumberSid);
            return true;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "ConfigureWebhook", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Verifies a Twilio sub-account and phone number connectivity.
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="phoneNumberSid">Optional phone number SID to verify.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The verification result.</returns>
    public async Task<TwilioVerificationResultDto> VerifyConnectivityAsync(
        string subAccountSid,
        string? phoneNumberSid = null,
        CancellationToken cancellationToken = default)
    {
        LogVerifyingConnectivity(_logger, subAccountSid);
        EnsureInitialized();

        try
        {
            // Fetch the account to verify connectivity
            var account = await AccountResource.FetchAsync(pathSid: subAccountSid);

            var details = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["AccountStatus"] = account.Status?.ToString() ?? "Unknown",
                ["AccountSid"] = account.Sid,
                ["FriendlyName"] = account.FriendlyName,
            };

            // If phone number SID provided, verify it too
            if (!string.IsNullOrEmpty(phoneNumberSid))
            {
                var phoneNumber = await IncomingPhoneNumberResource.FetchAsync(
                    pathSid: phoneNumberSid,
                    pathAccountSid: subAccountSid);
                details["PhoneNumber"] = phoneNumber.PhoneNumber.ToString();
                details["PhoneNumberSid"] = phoneNumber.Sid;
            }

            var result = new TwilioVerificationResultDto
            {
                IsSuccessful = true,
                Status = "Verified",
                Message = "Twilio connectivity verified successfully.",
                VerifiedAt = DateTime.UtcNow,
                Details = details,
            };

            LogConnectivityVerified(_logger, subAccountSid);
            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "VerifyConnectivity", ex.Message, ex);
            return new TwilioVerificationResultDto
            {
                IsSuccessful = false,
                Status = "Failed",
                Message = $"Twilio connectivity verification failed: {ex.Message}",
                VerifiedAt = DateTime.UtcNow,
                Details = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["Error"] = ex.Message,
                },
            };
        }
    }

    /// <summary>
    /// Releases a phone number (makes it available for purchase by others).
    /// </summary>
    /// <param name="subAccountSid">The Twilio sub-account SID.</param>
    /// <param name="phoneNumberSid">The phone number SID to release.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if release succeeded.</returns>
    public async Task<bool> ReleasePhoneNumberAsync(
        string subAccountSid,
        string phoneNumberSid,
        CancellationToken cancellationToken = default)
    {
        LogReleasingPhoneNumber(_logger, phoneNumberSid);
        EnsureInitialized();

        try
        {
            await IncomingPhoneNumberResource.DeleteAsync(
                pathSid: phoneNumberSid,
                pathAccountSid: subAccountSid);

            LogPhoneNumberReleased(_logger, phoneNumberSid);
            return true;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "ReleasePhoneNumber", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Gets available phone numbers matching the criteria.
    /// In test mode, returns mock phone numbers from configuration.
    /// </summary>
    /// <param name="countryCode">The country code to search in.</param>
    /// <param name="areaCode">Optional area code filter.</param>
    /// <param name="capabilities">Required phone number capabilities.</param>
    /// <param name="limit">Maximum number of results to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available phone numbers.</returns>
    public async Task<IReadOnlyList<TwilioAvailableNumberDto>> SearchAvailableNumbersAsync(
        string countryCode,
        string? areaCode,
        QualiFlow.Application.Features.Channels.Services.PhoneNumberCapabilities capabilities,
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        LogSearchingPhoneNumbers(_logger, countryCode, areaCode ?? "any", limit);

        // In test mode, return mock phone numbers without calling Twilio API
        if (_options.UseTestMode)
        {
            _logger.LogInformation("Test mode enabled - returning mock phone numbers");
            var testNumber = _options.Test.PhoneNumber ?? _options.TestMode.AvailableForPurchase;

            return
            [
                new TwilioAvailableNumberDto
                {
                    PhoneNumber = testNumber,
                    FriendlyName = $"Test Number ({testNumber})",
                    Locality = "Test City",
                    Region = "Test Region",
                    VoiceEnabled = true,
                    SmsEnabled = true,
                    MmsEnabled = true,
                },
            ];
        }

        EnsureInitialized();

        try
        {
            var smsEnabled = capabilities.HasFlag(QualiFlow.Application.Features.Channels.Services.PhoneNumberCapabilities.SMS);
            var voiceEnabled = capabilities.HasFlag(QualiFlow.Application.Features.Channels.Services.PhoneNumberCapabilities.Voice);
            var mmsEnabled = capabilities.HasFlag(QualiFlow.Application.Features.Channels.Services.PhoneNumberCapabilities.MMS);

            _logger.LogInformation(
                "Twilio search parameters: SMS={SmsEnabled}, Voice={VoiceEnabled}, MMS={MmsEnabled}, Capabilities={Capabilities}",
                smsEnabled,
                voiceEnabled,
                mmsEnabled,
                (int)capabilities);

            // Search for toll-free numbers (800, 888, 877, 866, 855, 844, 833)
            // API: https://api.twilio.com/2010-04-01/Accounts/:AccountSid/AvailablePhoneNumbers/:CountryCode/TollFree.json
            _logger.LogInformation(
                "Searching for toll-free numbers in {CountryCode} using account {AccountSid}",
                countryCode,
                _options.EffectiveAccountSid);

            // Use HttpClient directly since SDK has issues - curl works but SDK doesn't
            using var httpClient = new HttpClient();
            var authBytes = System.Text.Encoding.ASCII.GetBytes($"{_options.EffectiveAccountSid}:{_options.EffectiveAuthToken}");
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));

            var apiUrl = new Uri($"{_options.ApiBaseUrl}/Accounts/{_options.EffectiveAccountSid}/AvailablePhoneNumbers/{countryCode}/TollFree.json?PageSize={limit}");
            _logger.LogInformation("Calling Twilio API directly: {ApiUrl}", apiUrl);

            var response = await httpClient.GetAsync(apiUrl, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            _logger.LogInformation(
                "Twilio API response status: {StatusCode}, Content length: {Length}",
                response.StatusCode,
                responseContent.Length);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Twilio API error: {StatusCode} - {Content}", response.StatusCode, responseContent);
                return [];
            }

            // Parse JSON response
            var jsonDoc = System.Text.Json.JsonDocument.Parse(responseContent);
            var availableNumbersJson = jsonDoc.RootElement.GetProperty("available_phone_numbers");

            var results = new List<TwilioAvailableNumberDto>();
            foreach (var number in availableNumbersJson.EnumerateArray())
            {
                var caps = number.GetProperty("capabilities");
                results.Add(new TwilioAvailableNumberDto
                {
                    PhoneNumber = number.GetProperty("phone_number").GetString() ?? string.Empty,
                    FriendlyName = number.GetProperty("friendly_name").GetString() ?? string.Empty,
                    Locality = number.TryGetProperty("locality", out var loc) ? loc.GetString() : null,
                    Region = number.TryGetProperty("region", out var reg) ? reg.GetString() : null,
                    VoiceEnabled = caps.TryGetProperty("voice", out var voice) && voice.GetBoolean(),
                    SmsEnabled = caps.TryGetProperty("SMS", out var smsVal) && smsVal.GetBoolean(),
                    MmsEnabled = caps.TryGetProperty("MMS", out var mmsVal) && mmsVal.GetBoolean(),
                });
            }

            _logger.LogInformation("Twilio TollFree API returned {Count} numbers", results.Count);

            LogPhoneNumbersFound(_logger, results.Count, countryCode);
            return results;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "SearchAvailableNumbers", ex.Message, ex);
            throw;
        }
    }

    // LoggerMessage delegates for high-performance structured logging

    [LoggerMessage(EventId = 11002, Level = LogLevel.Information, Message = "Provisioning Twilio sub-account for business {BusinessId} ({BusinessName})")]
    private static partial void LogProvisioningSubAccount(ILogger logger, Guid businessId, string businessName);

    [LoggerMessage(EventId = 11003, Level = LogLevel.Warning, Message = "Twilio sub-account provisioning is disabled in configuration")]
    private static partial void LogSubAccountsDisabled(ILogger logger);

    [LoggerMessage(EventId = 11004, Level = LogLevel.Information, Message = "Twilio sub-account provisioned for business {BusinessId}: {SubAccountSid}")]
    private static partial void LogSubAccountProvisioned(ILogger logger, Guid businessId, string subAccountSid);

    [LoggerMessage(EventId = 11005, Level = LogLevel.Information, Message = "Provisioning phone number for sub-account {SubAccountSid} with area code {AreaCode}")]
    private static partial void LogProvisioningPhoneNumber(ILogger logger, string subAccountSid, string areaCode);

    [LoggerMessage(EventId = 11007, Level = LogLevel.Information, Message = "Phone number provisioned: {PhoneNumber} ({PhoneNumberSid})")]
    private static partial void LogPhoneNumberProvisioned(ILogger logger, string phoneNumber, string phoneNumberSid);

    [LoggerMessage(EventId = 11008, Level = LogLevel.Information, Message = "Configuring webhook for phone number {PhoneNumberSid}: {WebhookUrl}")]
    private static partial void LogConfiguringWebhook(ILogger logger, string phoneNumberSid, string webhookUrl);

    [LoggerMessage(EventId = 11009, Level = LogLevel.Information, Message = "Webhook configured for phone number {PhoneNumberSid}")]
    private static partial void LogWebhookConfigured(ILogger logger, string phoneNumberSid);

    [LoggerMessage(EventId = 11099, Level = LogLevel.Information, Message = "TEST MODE: Webhook configuration skipped for phone number {PhoneNumberSid}, URL: {WebhookUrl}")]
    private static partial void LogTestModeWebhookConfigured(ILogger logger, string phoneNumberSid, string webhookUrl);

    [LoggerMessage(EventId = 11010, Level = LogLevel.Information, Message = "Verifying connectivity for sub-account {SubAccountSid}")]
    private static partial void LogVerifyingConnectivity(ILogger logger, string subAccountSid);

    [LoggerMessage(EventId = 11011, Level = LogLevel.Information, Message = "Connectivity verified for sub-account {SubAccountSid}")]
    private static partial void LogConnectivityVerified(ILogger logger, string subAccountSid);

    [LoggerMessage(EventId = 11012, Level = LogLevel.Information, Message = "Releasing phone number {PhoneNumberSid}")]
    private static partial void LogReleasingPhoneNumber(ILogger logger, string phoneNumberSid);

    [LoggerMessage(EventId = 11013, Level = LogLevel.Information, Message = "Phone number released: {PhoneNumberSid}")]
    private static partial void LogPhoneNumberReleased(ILogger logger, string phoneNumberSid);

    [LoggerMessage(EventId = 11014, Level = LogLevel.Information, Message = "Searching for available phone numbers in {CountryCode} with area code {AreaCode} (limit: {Limit})")]
    private static partial void LogSearchingPhoneNumbers(ILogger logger, string countryCode, string areaCode, int limit);

    [LoggerMessage(EventId = 11015, Level = LogLevel.Information, Message = "Found {Count} available phone numbers in {CountryCode}")]
    private static partial void LogPhoneNumbersFound(ILogger logger, int count, string countryCode);

    // ============================================================================
    // OUTBOUND CALLING METHODS (Sprint 22)
    // ============================================================================

    /// <summary>
    /// Initiates an outbound call.
    /// </summary>
    /// <param name="request">The outbound call request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The call result with Twilio Call SID.</returns>
    public async Task<TwilioOutboundCallResultDto> InitiateOutboundCallAsync(
        TwilioOutboundCallRequest request,
        CancellationToken cancellationToken = default)
    {
        LogInitiatingOutboundCall(_logger, request.ToPhoneNumber, request.FromPhoneNumber);
        EnsureInitialized();

        try
        {
            var call = await CallResource.CreateAsync(
                to: new TwilioPhoneNumber(request.ToPhoneNumber),
                from: new TwilioPhoneNumber(request.FromPhoneNumber),
                url: new Uri(request.TwimlUrl),
                record: request.Record,
                machineDetection: string.IsNullOrEmpty(request.MachineDetection) ? null : request.MachineDetection,
                statusCallback: string.IsNullOrEmpty(request.StatusCallbackUrl) ? null : new Uri(request.StatusCallbackUrl),
                statusCallbackMethod: Twilio.Http.HttpMethod.Post,
                timeout: request.TimeoutSeconds,
                pathAccountSid: request.SubAccountSid);

            var result = new TwilioOutboundCallResultDto
            {
                CallSid = call.Sid,
                Status = call.Status?.ToString() ?? "queued",
                ToPhoneNumber = call.To,
                FromPhoneNumber = call.From,
                Direction = call.Direction?.ToString() ?? "outbound-api",
                InitiatedAt = call.DateCreated ?? DateTime.UtcNow,
            };

            LogOutboundCallInitiated(_logger, result.CallSid, request.ToPhoneNumber);
            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "InitiateOutboundCall", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Gets the status of an outbound call.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="subAccountSid">The Twilio sub-account SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The call status details.</returns>
    public async Task<TwilioCallStatusDto> GetCallStatusAsync(
        string callSid,
        string? subAccountSid = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingCallStatus(_logger, callSid);
        EnsureInitialized();

        try
        {
            var call = await CallResource.FetchAsync(
                pathSid: callSid,
                pathAccountSid: subAccountSid);

            var result = new TwilioCallStatusDto
            {
                CallSid = call.Sid,
                Status = call.Status?.ToString() ?? "unknown",
                DurationSeconds = int.TryParse(call.Duration, CultureInfo.InvariantCulture, out var duration) ? duration : 0,
                AnsweredBy = call.AnsweredBy,
                StartTime = call.StartTime,
                EndTime = call.EndTime,
            };

            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "GetCallStatus", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Hangs up an active call.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="subAccountSid">The Twilio sub-account SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the call was successfully hung up.</returns>
    public async Task<bool> HangupCallAsync(
        string callSid,
        string? subAccountSid = null,
        CancellationToken cancellationToken = default)
    {
        LogHangingUpCall(_logger, callSid);
        EnsureInitialized();

        try
        {
            await CallResource.UpdateAsync(
                pathSid: callSid,
                status: CallResource.UpdateStatusEnum.Completed,
                pathAccountSid: subAccountSid);

            LogCallHungUp(_logger, callSid);
            return true;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "HangupCall", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Gets the recording for a call.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="subAccountSid">The Twilio sub-account SID (optional).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The recording details or null if no recording exists.</returns>
    public async Task<TwilioRecordingDto?> GetCallRecordingAsync(
        string callSid,
        string? subAccountSid = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingCallRecording(_logger, callSid);
        EnsureInitialized();

        try
        {
            var recordings = await RecordingResource.ReadAsync(
                callSid: callSid,
                limit: 1,
                pathAccountSid: subAccountSid);

            var recording = recordings.FirstOrDefault();
            if (recording == null)
            {
                return null;
            }

            var result = new TwilioRecordingDto
            {
                RecordingSid = recording.Sid,
                RecordingUrl = $"{_options.ApiBaseUrl}/Accounts/{recording.AccountSid}/Recordings/{recording.Sid}.mp3",
                DurationSeconds = int.TryParse(recording.Duration, CultureInfo.InvariantCulture, out var dur) ? dur : 0,
                Status = recording.Status?.ToString() ?? "unknown",
            };

            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "GetCallRecording", ex.Message, ex);
            throw;
        }
    }

    // ============================================================================
    // SUB-ACCOUNT MANAGEMENT METHODS (Development/Testing)
    // ============================================================================

    /// <summary>
    /// Lists all sub-accounts under the main account.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of all sub-accounts.</returns>
    public async Task<IReadOnlyList<TwilioSubAccountDto>> ListSubAccountsAsync(
        CancellationToken cancellationToken = default)
    {
        LogListingSubAccounts(_logger);
        EnsureInitialized();

        try
        {
            var accounts = await AccountResource.ReadAsync(limit: 100);

            // Filter to only include sub-accounts (exclude the main account)
            var subAccounts = accounts
                .Where(a => a.Sid != _options.AccountSid)
                .Select(a => new TwilioSubAccountDto
                {
                    AccountSid = a.Sid,
                    FriendlyName = a.FriendlyName,
                    AuthToken = a.AuthToken ?? string.Empty,
                    Status = a.Status?.ToString() ?? "Unknown",
                    CreatedAt = a.DateCreated ?? DateTime.UtcNow,
                })
                .ToList();

            LogSubAccountsListed(_logger, subAccounts.Count);
            return subAccounts;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "ListSubAccounts", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Closes a sub-account. Closed accounts are automatically deleted after 30 days.
    /// </summary>
    /// <param name="subAccountSid">The sub-account SID to close.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the sub-account was successfully closed.</returns>
    public async Task<bool> CloseSubAccountAsync(
        string subAccountSid,
        CancellationToken cancellationToken = default)
    {
        LogClosingSubAccount(_logger, subAccountSid);
        EnsureInitialized();

        // Prevent closing the main account
        if (subAccountSid == _options.AccountSid)
        {
            throw new InvalidOperationException("Cannot close the main Twilio account.");
        }

        try
        {
            await AccountResource.UpdateAsync(
                pathSid: subAccountSid,
                status: AccountResource.StatusEnum.Closed);

            LogSubAccountClosed(_logger, subAccountSid);
            return true;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "CloseSubAccount", ex.Message, ex);
            throw;
        }
    }

    /// <summary>
    /// Closes all sub-accounts. Use with caution - for development/testing cleanup only.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of sub-accounts closed.</returns>
    public async Task<int> CloseAllSubAccountsAsync(
        CancellationToken cancellationToken = default)
    {
        LogClosingAllSubAccounts(_logger);
        EnsureInitialized();

        try
        {
            var subAccounts = await ListSubAccountsAsync(cancellationToken);
            var closedCount = 0;

            foreach (var subAccount in subAccounts)
            {
                // Only close active accounts (skip already closed ones)
                if (!string.Equals(subAccount.Status, "closed", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        await CloseSubAccountAsync(subAccount.AccountSid, cancellationToken);
                        closedCount++;
                    }
                    catch (Exception ex)
                    {
                        // Log but continue with other accounts
                        _logger.LogWarning(
                            ex,
                            "Failed to close sub-account {SubAccountSid}: {Message}",
                            subAccount.AccountSid,
                            ex.Message);
                    }
                }
            }

            LogAllSubAccountsClosed(_logger, closedCount);
            return closedCount;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "CloseAllSubAccounts", ex.Message, ex);
            throw;
        }
    }

    // ============================================================================
    // USAGE TRACKING METHODS
    // ============================================================================

    /// <inheritdoc />
    public async Task<TwilioUsageSummaryDto> GetUsageAsync(
        string subAccountSid,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        LogGettingUsage(_logger, subAccountSid, startDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
        EnsureInitialized();

        var summary = new TwilioUsageSummaryDto
        {
            SubAccountSid = subAccountSid,
            StartDate = startDate,
            EndDate = endDate,
        };

        // TEST MODE: Return mock usage data
        if (_options.UseTestMode)
        {
            LogTestModeUsageReturned(_logger, subAccountSid);
            summary.Sms = new TwilioUsageCategoryDto { InboundCount = 10, OutboundCount = 25, Cost = 0.75m };
            summary.Voice = new TwilioUsageCategoryDto { InboundCount = 5, OutboundCount = 8, TotalMinutes = 45.5m, Cost = 1.20m };
            summary.WhatsApp = new TwilioUsageCategoryDto { InboundCount = 3, OutboundCount = 12, Cost = 0.45m };
            summary.TotalCost = 2.40m;
            return summary;
        }

        try
        {
            var usageRecords = await UsageResource.ReadAsync(
                pathAccountSid: subAccountSid,
                startDate: startDate.ToDateTime(TimeOnly.MinValue),
                endDate: endDate.ToDateTime(TimeOnly.MaxValue));

            foreach (var record in usageRecords)
            {
                var category = record.Category?.ToString() ?? string.Empty;
                var count = int.Parse(record.Count ?? "0", CultureInfo.InvariantCulture);
                var cost = record.Price ?? 0m;

                if (category.Contains("sms", StringComparison.OrdinalIgnoreCase))
                {
                    if (category.Contains("inbound", StringComparison.OrdinalIgnoreCase))
                    {
                        summary.Sms.InboundCount += count;
                    }
                    else
                    {
                        summary.Sms.OutboundCount += count;
                    }

                    summary.Sms.Cost += cost;
                }
                else if (category.Contains("call", StringComparison.OrdinalIgnoreCase) ||
                         category.Contains("voice", StringComparison.OrdinalIgnoreCase))
                {
                    if (category.Contains("inbound", StringComparison.OrdinalIgnoreCase))
                    {
                        summary.Voice.InboundCount += count;
                    }
                    else
                    {
                        summary.Voice.OutboundCount += count;
                    }

                    // Parse usage value for minutes
                    if (decimal.TryParse(record.Usage, CultureInfo.InvariantCulture, out var minutes))
                    {
                        summary.Voice.TotalMinutes += minutes;
                    }

                    summary.Voice.Cost += cost;
                }
                else if (category.Contains("whatsapp", StringComparison.OrdinalIgnoreCase))
                {
                    if (category.Contains("inbound", StringComparison.OrdinalIgnoreCase))
                    {
                        summary.WhatsApp.InboundCount += count;
                    }
                    else
                    {
                        summary.WhatsApp.OutboundCount += count;
                    }

                    summary.WhatsApp.Cost += cost;
                }
            }

            summary.TotalCost = summary.Sms.Cost + summary.Voice.Cost + summary.WhatsApp.Cost;

            LogUsageRetrieved(_logger, subAccountSid, summary.TotalCost);
            return summary;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "GetUsage", ex.Message, ex);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<TwilioSubAccountDto?> GetSubAccountAsync(
        string subAccountSid,
        CancellationToken cancellationToken = default)
    {
        LogGettingSubAccount(_logger, subAccountSid);
        EnsureInitialized();

        // TEST MODE: Return mock sub-account for test SIDs
        if (_options.UseTestMode && subAccountSid.StartsWith("AC_TEST_", StringComparison.OrdinalIgnoreCase))
        {
            return new TwilioSubAccountDto
            {
                AccountSid = subAccountSid,
                FriendlyName = "Test Sub-Account",
                AuthToken = "TEST_AUTH_TOKEN",
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
            };
        }

        try
        {
            var account = await AccountResource.FetchAsync(pathSid: subAccountSid);

            return new TwilioSubAccountDto
            {
                AccountSid = account.Sid,
                FriendlyName = account.FriendlyName,
                AuthToken = account.AuthToken,
                Status = account.Status?.ToString() ?? "Unknown",
                CreatedAt = account.DateCreated ?? DateTime.UtcNow,
            };
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "GetSubAccount", ex.Message, ex);
            return null;
        }
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private void EnsureInitialized()
    {
        if (!_isInitialized)
        {
            throw new InvalidOperationException(
                "Twilio client is not initialized. Please check AccountSid and AuthToken configuration.");
        }
    }

    // ============================================================================
    // LOGGERMESSAGE DELEGATES
    // ============================================================================

    [LoggerMessage(EventId = 11000, Level = LogLevel.Information, Message = "Twilio client initialized with account {AccountSid}")]
    private static partial void LogTwilioInitialized(ILogger logger, string accountSid);

    [LoggerMessage(EventId = 11001, Level = LogLevel.Warning, Message = "Twilio client not initialized - credentials not configured")]
    private static partial void LogTwilioNotInitialized(ILogger logger);

    [LoggerMessage(EventId = 11099, Level = LogLevel.Error, Message = "Twilio API error in {Operation}: {ErrorMessage}")]
    private static partial void LogTwilioError(ILogger logger, string operation, string errorMessage, Exception exception);

    // Outbound calling LoggerMessage delegates

    [LoggerMessage(EventId = 11020, Level = LogLevel.Information, Message = "Initiating outbound call to {ToPhoneNumber} from {FromPhoneNumber}")]
    private static partial void LogInitiatingOutboundCall(ILogger logger, string toPhoneNumber, string fromPhoneNumber);

    [LoggerMessage(EventId = 11021, Level = LogLevel.Information, Message = "Outbound call initiated: {CallSid} to {ToPhoneNumber}")]
    private static partial void LogOutboundCallInitiated(ILogger logger, string callSid, string toPhoneNumber);

    [LoggerMessage(EventId = 11022, Level = LogLevel.Information, Message = "Getting call status for {CallSid}")]
    private static partial void LogGettingCallStatus(ILogger logger, string callSid);

    [LoggerMessage(EventId = 11023, Level = LogLevel.Information, Message = "Hanging up call {CallSid}")]
    private static partial void LogHangingUpCall(ILogger logger, string callSid);

    [LoggerMessage(EventId = 11024, Level = LogLevel.Information, Message = "Call hung up: {CallSid}")]
    private static partial void LogCallHungUp(ILogger logger, string callSid);

    [LoggerMessage(EventId = 11025, Level = LogLevel.Information, Message = "Getting recording for call {CallSid}")]
    private static partial void LogGettingCallRecording(ILogger logger, string callSid);

    // Sub-account management LoggerMessage delegates

    [LoggerMessage(EventId = 11030, Level = LogLevel.Information, Message = "Listing all Twilio sub-accounts")]
    private static partial void LogListingSubAccounts(ILogger logger);

    [LoggerMessage(EventId = 11031, Level = LogLevel.Information, Message = "Found {Count} Twilio sub-accounts")]
    private static partial void LogSubAccountsListed(ILogger logger, int count);

    [LoggerMessage(EventId = 11032, Level = LogLevel.Information, Message = "Closing Twilio sub-account {SubAccountSid}")]
    private static partial void LogClosingSubAccount(ILogger logger, string subAccountSid);

    [LoggerMessage(EventId = 11033, Level = LogLevel.Information, Message = "Twilio sub-account closed: {SubAccountSid}")]
    private static partial void LogSubAccountClosed(ILogger logger, string subAccountSid);

    [LoggerMessage(EventId = 11034, Level = LogLevel.Warning, Message = "Closing ALL Twilio sub-accounts - use with caution")]
    private static partial void LogClosingAllSubAccounts(ILogger logger);

    [LoggerMessage(EventId = 11035, Level = LogLevel.Information, Message = "Closed {Count} Twilio sub-accounts")]
    private static partial void LogAllSubAccountsClosed(ILogger logger, int count);

    // Test mode LoggerMessage delegates

    [LoggerMessage(EventId = 11040, Level = LogLevel.Information, Message = "Twilio test mode enabled - using magic number {MagicNumber}")]
    private static partial void LogTestModeEnabled(ILogger logger, string magicNumber);

    [LoggerMessage(EventId = 11041, Level = LogLevel.Information, Message = "TEST MODE: Mock sub-account provisioned for business {BusinessId}")]
    private static partial void LogTestModeSubAccountProvisioned(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 11042, Level = LogLevel.Information, Message = "TEST MODE: Mock phone number provisioned: {PhoneNumber}")]
    private static partial void LogTestModePhoneNumberProvisioned(ILogger logger, string phoneNumber);

    [LoggerMessage(EventId = 11043, Level = LogLevel.Information, Message = "TEST MODE: Mock usage data returned for sub-account {SubAccountSid}")]
    private static partial void LogTestModeUsageReturned(ILogger logger, string subAccountSid);

    // ============================================================================
    // MESSAGING METHODS (Sprint 35 - AI Auto-Response)
    // ============================================================================

    /// <summary>
    /// Sends an SMS message via Twilio.
    /// </summary>
    /// <param name="request">The SMS send request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of the SMS send operation.</returns>
    public async Task<TwilioSmsResultDto> SendSmsAsync(
        TwilioSendSmsRequest request,
        CancellationToken cancellationToken = default)
    {
        LogSendingSms(_logger, request.ToPhoneNumber, request.FromPhoneNumber);
        EnsureInitialized();

        try
        {
            // TEST MODE: Return mock result without actually sending
            if (_options.UseTestMode)
            {
                LogTestModeSmsSkipped(_logger, request.ToPhoneNumber);
                return new TwilioSmsResultDto
                {
                    MessageSid = $"SM_TEST_{Guid.NewGuid():N}",
                    Status = "sent",
                    ToPhoneNumber = request.ToPhoneNumber,
                    FromPhoneNumber = request.FromPhoneNumber,
                    Body = request.Body,
                    NumSegments = (int)Math.Ceiling(request.Body.Length / 160.0),
                    Price = 0.0079m,
                    PriceUnit = "USD",
                    SentAt = DateTime.UtcNow,
                    Success = true,
                };
            }

            var messageOptions = new CreateMessageOptions(new TwilioPhoneNumber(request.ToPhoneNumber))
            {
                From = new TwilioPhoneNumber(request.FromPhoneNumber),
                Body = request.Body,
            };

            if (!string.IsNullOrEmpty(request.StatusCallbackUrl))
            {
                messageOptions.StatusCallback = new Uri(request.StatusCallbackUrl);
            }

            if (request.MediaUrls?.Count > 0)
            {
                messageOptions.MediaUrl = request.MediaUrls.Select(u => new Uri(u)).ToList();
            }

            var message = await MessageResource.CreateAsync(
                options: messageOptions,
                client: null);

            var result = new TwilioSmsResultDto
            {
                MessageSid = message.Sid,
                Status = message.Status?.ToString() ?? "queued",
                ToPhoneNumber = message.To,
                FromPhoneNumber = message.From?.ToString() ?? request.FromPhoneNumber,
                Body = message.Body,
                NumSegments = int.TryParse(message.NumSegments, CultureInfo.InvariantCulture, out var segments) ? segments : 1,
                Price = decimal.TryParse(message.Price, CultureInfo.InvariantCulture, out var price) ? price : null,
                PriceUnit = message.PriceUnit,
                SentAt = message.DateSent ?? DateTime.UtcNow,
                Success = true,
            };

            LogSmsSent(_logger, result.MessageSid, request.ToPhoneNumber);
            return result;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "SendSms", ex.Message, ex);
            return new TwilioSmsResultDto
            {
                MessageSid = string.Empty,
                Status = "failed",
                ToPhoneNumber = request.ToPhoneNumber,
                FromPhoneNumber = request.FromPhoneNumber,
                Body = request.Body,
                Success = false,
                ErrorMessage = ex.Message,
            };
        }
    }

    /// <summary>
    /// Sends a WhatsApp message via Twilio.
    /// </summary>
    /// <param name="request">The WhatsApp send request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The result of the WhatsApp send operation.</returns>
    public async Task<TwilioSmsResultDto> SendWhatsAppAsync(
        TwilioSendSmsRequest request,
        CancellationToken cancellationToken = default)
    {
        // WhatsApp numbers need whatsapp: prefix
        var toNumber = request.ToPhoneNumber.StartsWith("whatsapp:", StringComparison.OrdinalIgnoreCase)
            ? request.ToPhoneNumber
            : $"whatsapp:{request.ToPhoneNumber}";

        var fromNumber = request.FromPhoneNumber.StartsWith("whatsapp:", StringComparison.OrdinalIgnoreCase)
            ? request.FromPhoneNumber
            : $"whatsapp:{request.FromPhoneNumber}";

        var whatsAppRequest = request with
        {
            ToPhoneNumber = toNumber,
            FromPhoneNumber = fromNumber,
        };

        LogSendingWhatsApp(_logger, toNumber, fromNumber);
        return await SendSmsAsync(whatsAppRequest, cancellationToken);
    }

    // SMS LoggerMessage delegates

    [LoggerMessage(EventId = 11060, Level = LogLevel.Information, Message = "Sending SMS to {ToPhoneNumber} from {FromPhoneNumber}")]
    private static partial void LogSendingSms(ILogger logger, string toPhoneNumber, string fromPhoneNumber);

    [LoggerMessage(EventId = 11061, Level = LogLevel.Information, Message = "SMS sent: {MessageSid} to {ToPhoneNumber}")]
    private static partial void LogSmsSent(ILogger logger, string messageSid, string toPhoneNumber);

    [LoggerMessage(EventId = 11062, Level = LogLevel.Information, Message = "TEST MODE: SMS send skipped for {ToPhoneNumber}")]
    private static partial void LogTestModeSmsSkipped(ILogger logger, string toPhoneNumber);

    [LoggerMessage(EventId = 11063, Level = LogLevel.Information, Message = "Sending WhatsApp to {ToPhoneNumber} from {FromPhoneNumber}")]
    private static partial void LogSendingWhatsApp(ILogger logger, string toPhoneNumber, string fromPhoneNumber);

    // Usage tracking LoggerMessage delegates

    [LoggerMessage(EventId = 11050, Level = LogLevel.Information, Message = "Getting usage for sub-account {SubAccountSid} from {StartDate}")]
    private static partial void LogGettingUsage(ILogger logger, string subAccountSid, string startDate);

    [LoggerMessage(EventId = 11051, Level = LogLevel.Information, Message = "Usage retrieved for sub-account {SubAccountSid}: Total cost ${TotalCost}")]
    private static partial void LogUsageRetrieved(ILogger logger, string subAccountSid, decimal totalCost);

    [LoggerMessage(EventId = 11052, Level = LogLevel.Information, Message = "Getting sub-account details for {SubAccountSid}")]
    private static partial void LogGettingSubAccount(ILogger logger, string subAccountSid);

    [LoggerMessage(EventId = 11070, Level = LogLevel.Information, Message = "Looking up phone number {PhoneNumber}")]
    private static partial void LogLookingUpPhoneNumber(ILogger logger, string phoneNumber);

    [LoggerMessage(EventId = 11071, Level = LogLevel.Information, Message = "Phone number {PhoneNumber} found with SID {PhoneNumberSid}")]
    private static partial void LogPhoneNumberFound(ILogger logger, string phoneNumber, string phoneNumberSid);

    [LoggerMessage(EventId = 11072, Level = LogLevel.Warning, Message = "Phone number {PhoneNumber} not found in account")]
    private static partial void LogPhoneNumberNotFound(ILogger logger, string phoneNumber);

    [LoggerMessage(EventId = 11073, Level = LogLevel.Information, Message = "Configuring webhooks for phone number {PhoneNumber}")]
    private static partial void LogConfiguringWebhooksByNumber(ILogger logger, string phoneNumber);

    // ============================================================================
    // PHONE NUMBER LOOKUP METHODS
    // ============================================================================

    /// <inheritdoc />
    public async Task<TwilioPhoneNumberDto?> GetPhoneNumberByNumberAsync(
        string phoneNumber,
        string? accountSid = null,
        CancellationToken cancellationToken = default)
    {
        LogLookingUpPhoneNumber(_logger, phoneNumber);
        EnsureInitialized();

        // TEST MODE: Return mock phone number
        if (_options.UseTestMode)
        {
            LogPhoneNumberFound(_logger, phoneNumber, $"PN_TEST_{Guid.NewGuid():N}");
            return new TwilioPhoneNumberDto
            {
                PhoneNumberSid = $"PN_TEST_{Guid.NewGuid():N}",
                PhoneNumber = phoneNumber,
                FriendlyName = "Test Phone Number",
                VoiceEnabled = true,
                SmsEnabled = true,
                MmsEnabled = true,
                MonthlyCost = 0m,
            };
        }

        try
        {
            var effectiveAccountSid = accountSid ?? _options.EffectiveAccountSid;

            // List all incoming phone numbers and find the matching one
            var numbers = await IncomingPhoneNumberResource.ReadAsync(
                phoneNumber: new TwilioPhoneNumber(phoneNumber),
                pathAccountSid: effectiveAccountSid,
                limit: 1);

            var number = numbers.FirstOrDefault();
            if (number == null)
            {
                LogPhoneNumberNotFound(_logger, phoneNumber);
                return null;
            }

            LogPhoneNumberFound(_logger, phoneNumber, number.Sid);
            return new TwilioPhoneNumberDto
            {
                PhoneNumberSid = number.Sid,
                PhoneNumber = number.PhoneNumber.ToString(),
                FriendlyName = number.FriendlyName,
                VoiceEnabled = number.Capabilities?.Voice ?? false,
                SmsEnabled = number.Capabilities?.Sms ?? false,
                MmsEnabled = number.Capabilities?.Mms ?? false,
                MonthlyCost = 1.00m, // Twilio doesn't return cost in API
            };
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "GetPhoneNumberByNumber", ex.Message, ex);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ConfigureWebhooksByPhoneNumberAsync(
        string phoneNumber,
        string smsWebhookUrl,
        string voiceWebhookUrl,
        string? accountSid = null,
        CancellationToken cancellationToken = default)
    {
        LogConfiguringWebhooksByNumber(_logger, phoneNumber);
        EnsureInitialized();

        // TEST MODE: Skip actual configuration
        if (_options.UseTestMode)
        {
            LogTestModeWebhookConfigured(_logger, phoneNumber, smsWebhookUrl);
            return true;
        }

        try
        {
            var effectiveAccountSid = accountSid ?? _options.EffectiveAccountSid;

            // First, look up the phone number to get its SID
            var phoneNumberDto = await GetPhoneNumberByNumberAsync(
                phoneNumber,
                effectiveAccountSid,
                cancellationToken);

            if (phoneNumberDto == null)
            {
                _logger.LogWarning(
                    "Cannot configure webhooks: phone number {PhoneNumber} not found",
                    phoneNumber);
                return false;
            }

            // Configure webhooks using the SID
            await IncomingPhoneNumberResource.UpdateAsync(
                pathSid: phoneNumberDto.PhoneNumberSid,
                smsUrl: new Uri(smsWebhookUrl),
                voiceUrl: new Uri(voiceWebhookUrl),
                smsMethod: Twilio.Http.HttpMethod.Post,
                voiceMethod: Twilio.Http.HttpMethod.Post,
                pathAccountSid: effectiveAccountSid);

            LogWebhookConfigured(_logger, phoneNumberDto.PhoneNumberSid);
            return true;
        }
        catch (Exception ex)
        {
            LogTwilioError(_logger, "ConfigureWebhooksByPhoneNumber", ex.Message, ex);
            throw;
        }
    }
}
