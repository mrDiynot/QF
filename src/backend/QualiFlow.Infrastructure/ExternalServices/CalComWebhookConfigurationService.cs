using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.ExternalServices;

/// <summary>
/// Hosted service that logs the Cal.com webhook configuration on application startup.
/// Unlike Twilio, Cal.com webhooks must be configured manually in the Cal.com dashboard.
/// This service logs the expected webhook URL for the current environment.
/// </summary>
public partial class CalComWebhookConfigurationService : IHostedService
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<CalComWebhookConfigurationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CalComWebhookConfigurationService"/> class.
    /// </summary>
    public CalComWebhookConfigurationService(
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<CalComWebhookConfigurationService> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task StartAsync(CancellationToken cancellationToken)
    {
        var platformApiKey = _configuration["CalCom:PlatformApiKey"];
        var eventTypeId = _configuration["CalCom:OnboardingEventTypeId"];
        var webhookSecret = _configuration["CalCom:WebhookSecret"];

        // Check if Cal.com is configured
        if (string.IsNullOrEmpty(platformApiKey) || platformApiKey.StartsWith("PLACEHOLDER"))
        {
            LogCalComNotConfigured();
            return Task.CompletedTask;
        }

        // Determine the webhook URL based on environment
        var webhookBaseUrl = GetWebhookBaseUrl();
        var webhookUrl = $"{webhookBaseUrl}/api/v1/webhooks/calcom";

        LogCalComConfiguration(
            _environment.EnvironmentName,
            eventTypeId ?? "NOT SET",
            webhookUrl,
            !string.IsNullOrEmpty(webhookSecret) && !webhookSecret.StartsWith("PLACEHOLDER"));

        // Log reminder about manual configuration
        LogWebhookConfigurationReminder(webhookUrl);

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    /// <summary>
    /// Gets the webhook base URL based on environment configuration.
    /// </summary>
    private string GetWebhookBaseUrl()
    {
        // Check for explicit Cal.com webhook URL first
        var calComWebhookUrl = _configuration["CalCom:WebhookBaseUrl"];
        if (!string.IsNullOrWhiteSpace(calComWebhookUrl))
        {
            return calComWebhookUrl.TrimEnd('/');
        }

        // Fall back to App:ApiUrl or environment-specific defaults
        var apiUrl = _configuration["App:ApiUrl"];
        if (!string.IsNullOrWhiteSpace(apiUrl))
        {
            return apiUrl.TrimEnd('/');
        }

        // Use Twilio webhook base URL as fallback (same base URL pattern)
        var twilioWebhookUrl = _configuration["Twilio:WebhookBaseUrl"];
        if (!string.IsNullOrWhiteSpace(twilioWebhookUrl))
        {
            // Extract base URL (remove /api/v1/webhooks/twilio if present)
            var baseUrl = twilioWebhookUrl.Replace("/api/v1/webhooks/twilio", string.Empty, StringComparison.OrdinalIgnoreCase).TrimEnd('/');
            return baseUrl;
        }

        // Environment-specific defaults
        return _environment.EnvironmentName switch
        {
            "Development" => "https://localhost:5000",
            "Staging" => "https://api-staging.qualiflow.ai",
            "Production" => "https://api.qualiflow.ai",
            _ => "https://api-dev.qualiflow.ai"
        };
    }

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Cal.com platform integration is not configured. Set CalCom:PlatformApiKey in configuration to enable onboarding call scheduling.")]
    private partial void LogCalComNotConfigured();

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Cal.com Configuration: Environment={Environment}, EventTypeId={EventTypeId}, WebhookUrl={WebhookUrl}, WebhookSecretConfigured={WebhookSecretConfigured}")]
    private partial void LogCalComConfiguration(string environment, string eventTypeId, string webhookUrl, bool webhookSecretConfigured);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Cal.com Webhook URL for this environment: {WebhookUrl} - Configure this URL in Cal.com dashboard under Event Type > Webhooks")]
    private partial void LogWebhookConfigurationReminder(string webhookUrl);
}

