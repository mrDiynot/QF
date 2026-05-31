namespace QualiFlow.Infrastructure.ExternalServices.TwilioIntegration;

/// <summary>
/// Configuration options for Twilio integration.
/// Supports both direct credentials (AccountSid/AuthToken) and environment-based credentials (Test/Live).
/// </summary>
public class TwilioOptions
{
    /// <summary>
    /// Gets or sets the configuration section name.
    /// </summary>
    public const string SectionName = "Twilio";

    /// <summary>
    /// Gets or sets the Twilio Account SID (direct configuration).
    /// If empty, will use Test or Live credentials based on UseTestMode.
    /// </summary>
    public string AccountSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Twilio Auth Token (direct configuration).
    /// If empty, will use Test or Live credentials based on UseTestMode.
    /// </summary>
    public string AuthToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the default phone number for outbound SMS/calls.
    /// </summary>
    public string? DefaultPhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to enable sub-account provisioning.
    /// When true, creates separate Twilio sub-accounts for each business.
    /// </summary>
    public bool EnableSubAccounts { get; set; } = true;

    /// <summary>
    /// Gets or sets the webhook base URL for Twilio callbacks.
    /// Example: https://api.qualiflow.com/webhooks/twilio.
    /// </summary>
    public Uri? WebhookBaseUrl { get; set; }

    /// <summary>
    /// Gets or sets the Twilio API base URL.
    /// Default: https://api.twilio.com/2010-04-01.
    /// </summary>
    public Uri ApiBaseUrl { get; set; } = new("https://api.twilio.com/2010-04-01");

    /// <summary>
    /// Gets or sets the retry policy configuration.
    /// </summary>
    public RetryPolicyOptions RetryPolicy { get; set; } = new();

    /// <summary>
    /// Gets or sets a value indicating whether to use test mode with magic numbers.
    /// When true, uses Twilio test credentials and magic phone numbers.
    /// No actual SMS/calls are made and no charges are incurred.
    /// </summary>
    public bool UseTestMode { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to skip actual provisioning in development.
    /// When true, skips sub-account creation and phone number provisioning.
    /// Uses DevelopmentPhoneNumber for all businesses instead.
    /// This allows local development testing with a single toll-free number.
    /// </summary>
    public bool SkipProvisioningInDevelopment { get; set; } = true;

    /// <summary>
    /// Gets or sets the default phone number to use in development mode.
    /// When SkipProvisioningInDevelopment is true, this number is used for all channels.
    /// Should be a toll-free number that is already provisioned in your Twilio account.
    /// </summary>
    public string? DevelopmentPhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the test credentials configuration.
    /// Used when UseTestMode is true and AccountSid/AuthToken are not directly set.
    /// </summary>
    public TwilioCredentials Test { get; set; } = new();

    /// <summary>
    /// Gets or sets the live/production credentials configuration.
    /// Used when UseTestMode is false and AccountSid/AuthToken are not directly set.
    /// </summary>
    public TwilioCredentials Live { get; set; } = new();

    /// <summary>
    /// Gets or sets the test mode configuration for magic phone numbers.
    /// Only used when UseTestMode is true.
    /// </summary>
    public TestModeOptions TestMode { get; set; } = new();

    /// <summary>
    /// Gets the effective Account SID based on configuration.
    /// Priority: Direct AccountSid > Test/Live based on UseTestMode.
    /// </summary>
    public string EffectiveAccountSid
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(AccountSid))
            {
                return AccountSid;
            }

            return UseTestMode ? Test.AccountSid : Live.AccountSid;
        }
    }

    /// <summary>
    /// Gets the effective Auth Token based on configuration.
    /// Priority: Direct AuthToken > Test/Live based on UseTestMode.
    /// </summary>
    public string EffectiveAuthToken
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(AuthToken))
            {
                return AuthToken;
            }

            return UseTestMode ? Test.AuthToken : Live.AuthToken;
        }
    }

    /// <summary>
    /// Gets the effective phone number based on configuration.
    /// Priority: Direct DefaultPhoneNumber > Test/Live based on UseTestMode.
    /// </summary>
    public string? EffectivePhoneNumber
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(DefaultPhoneNumber))
            {
                return DefaultPhoneNumber;
            }

            return UseTestMode ? Test.PhoneNumber : Live.PhoneNumber;
        }
    }

    /// <summary>
    /// Validates the configuration options.
    /// </summary>
    /// <returns>True if valid, false otherwise.</returns>
    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(EffectiveAccountSid) &&
               !string.IsNullOrWhiteSpace(EffectiveAuthToken);
    }
}

/// <summary>
/// Twilio credentials for a specific environment (Test or Live).
/// </summary>
public class TwilioCredentials
{
    /// <summary>
    /// Gets or sets the Twilio Account SID for this environment.
    /// </summary>
    public string AccountSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Twilio Auth Token for this environment.
    /// </summary>
    public string AuthToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the default phone number for this environment.
    /// </summary>
    public string? PhoneNumber { get; set; }
}

/// <summary>
/// Test mode configuration with magic phone numbers.
/// </summary>
public class TestModeOptions
{
    /// <summary>
    /// Gets or sets the valid sender phone number for SMS/Voice tests.
    /// Default: +15005550006 (Twilio magic number for valid sender).
    /// </summary>
    public string ValidFromNumber { get; set; } = "+15005550006";

    /// <summary>
    /// Gets or sets the invalid sender phone number for testing error scenarios.
    /// Default: +15005550001 (Twilio magic number for invalid number).
    /// </summary>
    public string InvalidFromNumber { get; set; } = "+15005550001";

    /// <summary>
    /// Gets or sets the valid recipient phone number for successful SMS/Voice delivery.
    /// For SMS, any valid format works. For Voice, use +15005550003.
    /// </summary>
    public string ValidToNumber { get; set; } = "+15005550003";

    /// <summary>
    /// Gets or sets the recipient phone number that will fail (cannot route).
    /// Default: +15005550002 (Twilio magic number for cannot route).
    /// </summary>
    public string CannotRouteNumber { get; set; } = "+15005550002";

    /// <summary>
    /// Gets or sets the recipient phone number for international permissions error.
    /// Default: +15005550003 (Twilio magic number).
    /// </summary>
    public string NoInternationalPermissions { get; set; } = "+15005550003";

    /// <summary>
    /// Gets or sets the recipient phone number in blocked list.
    /// Default: +15005550004 (Twilio magic number).
    /// </summary>
    public string BlockedNumber { get; set; } = "+15005550004";

    /// <summary>
    /// Gets or sets the phone number available for purchase in test mode.
    /// Default: +15005550006 (Twilio magic number for valid available number).
    /// </summary>
    public string AvailableForPurchase { get; set; } = "+15005550006";
}
