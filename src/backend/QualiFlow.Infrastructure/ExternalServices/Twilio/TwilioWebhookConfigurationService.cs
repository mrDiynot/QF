using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QualiFlow.Application.Features.Channels.Services;

namespace QualiFlow.Infrastructure.ExternalServices.TwilioIntegration;

/// <summary>
/// Hosted service that configures Twilio webhooks on the default phone number at application startup.
/// This ensures that when deploying to any environment, the default phone number automatically
/// gets the correct environment-specific webhook URLs configured.
/// </summary>
/// <remarks>
/// <para>
/// This service runs once at application startup and is idempotent - safe to run multiple times.
/// It updates the webhook URLs on the default phone number to match the current environment's configuration.
/// </para>
/// <para>
/// The service skips configuration in test mode to avoid modifying real Twilio resources during development.
/// </para>
/// </remarks>
public sealed partial class TwilioWebhookConfigurationService : IHostedService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly TwilioOptions _options;
    private readonly ILogger<TwilioWebhookConfigurationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TwilioWebhookConfigurationService"/> class.
    /// </summary>
    /// <param name="serviceScopeFactory">The service scope factory for resolving scoped services.</param>
    /// <param name="options">The Twilio configuration options.</param>
    /// <param name="logger">The logger.</param>
    public TwilioWebhookConfigurationService(
        IServiceScopeFactory serviceScopeFactory,
        IOptions<TwilioOptions> options,
        ILogger<TwilioWebhookConfigurationService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Configures webhooks on the default phone number when the application starts.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // Skip in test mode - don't modify real Twilio resources
        if (_options.UseTestMode)
        {
            LogTestModeSkipped(_logger);
            return;
        }

        // Skip if no default phone number is configured
        var defaultPhoneNumber = _options.EffectivePhoneNumber;
        if (string.IsNullOrEmpty(defaultPhoneNumber))
        {
            LogNoDefaultPhoneNumber(_logger);
            return;
        }

        // Skip if webhook base URL is not configured
        var webhookBaseUrl = _options.WebhookBaseUrl?.ToString().TrimEnd('/');
        if (string.IsNullOrEmpty(webhookBaseUrl))
        {
            LogNoWebhookBaseUrl(_logger);
            return;
        }

        try
        {
            LogConfiguringWebhooks(_logger, defaultPhoneNumber, webhookBaseUrl);

            // Build environment-aware webhook URLs
            var smsWebhookUrl = $"{webhookBaseUrl}/api/v1/webhooks/twilio/sms";
            var voiceWebhookUrl = $"{webhookBaseUrl}/api/v1/webhooks/twilio/voice";

            // Create a scope to resolve scoped services (ITwilioService is scoped)
            await using var scope = _serviceScopeFactory.CreateAsyncScope();
            var twilioService = scope.ServiceProvider.GetRequiredService<ITwilioService>();

            // Configure webhooks on the default phone number
            var success = await twilioService.ConfigureWebhooksByPhoneNumberAsync(
                defaultPhoneNumber,
                smsWebhookUrl,
                voiceWebhookUrl,
                accountSid: null, // Use main account
                cancellationToken);

            if (success)
            {
                LogWebhooksConfigured(_logger, defaultPhoneNumber, smsWebhookUrl, voiceWebhookUrl);
            }
            else
            {
                LogWebhookConfigurationFailed(_logger, defaultPhoneNumber);
            }
        }
        catch (Exception ex)
        {
            // Log but don't throw - webhook configuration failure shouldn't prevent app startup
            LogWebhookConfigurationError(_logger, defaultPhoneNumber, ex);
        }
    }

    /// <summary>
    /// No cleanup needed on shutdown.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A completed task.</returns>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    // ============================================================================
    // LOGGER MESSAGE DELEGATES
    // ============================================================================

    [LoggerMessage(
        EventId = 12001,
        Level = LogLevel.Debug,
        Message = "Skipping webhook configuration - test mode enabled")]
    private static partial void LogTestModeSkipped(ILogger logger);

    [LoggerMessage(
        EventId = 12002,
        Level = LogLevel.Warning,
        Message = "No default phone number configured - skipping webhook configuration")]
    private static partial void LogNoDefaultPhoneNumber(ILogger logger);

    [LoggerMessage(
        EventId = 12003,
        Level = LogLevel.Warning,
        Message = "No webhook base URL configured - skipping webhook configuration")]
    private static partial void LogNoWebhookBaseUrl(ILogger logger);

    [LoggerMessage(
        EventId = 12004,
        Level = LogLevel.Information,
        Message = "Configuring webhooks for default phone number {PhoneNumber} with base URL {WebhookBaseUrl}")]
    private static partial void LogConfiguringWebhooks(ILogger logger, string phoneNumber, string webhookBaseUrl);

    [LoggerMessage(
        EventId = 12005,
        Level = LogLevel.Information,
        Message = "Webhooks configured for {PhoneNumber}: SMS={SmsUrl}, Voice={VoiceUrl}")]
    private static partial void LogWebhooksConfigured(ILogger logger, string phoneNumber, string smsUrl, string voiceUrl);

    [LoggerMessage(
        EventId = 12006,
        Level = LogLevel.Warning,
        Message = "Failed to configure webhooks for {PhoneNumber} - phone number not found in Twilio account")]
    private static partial void LogWebhookConfigurationFailed(ILogger logger, string phoneNumber);

    [LoggerMessage(
        EventId = 12007,
        Level = LogLevel.Error,
        Message = "Error configuring webhooks for {PhoneNumber}")]
    private static partial void LogWebhookConfigurationError(ILogger logger, string phoneNumber, Exception ex);
}

