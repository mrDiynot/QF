using Azure.Identity;
using Serilog;
using Serilog.Events;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring logging, Sentry, and Azure Key Vault.
/// </summary>
public static class LoggingExtensions
{
    /// <summary>
    /// Configures Serilog structured logging with console, file, and optional Sentry sinks.
    /// </summary>
    /// <returns>The <see cref="WebApplicationBuilder"/> for chaining.</returns>
    public static WebApplicationBuilder AddSerilogLogging(this WebApplicationBuilder builder)
    {
        var sentryDsn = builder.Configuration["Sentry:Dsn"];
        var isSentryConfigured = !string.IsNullOrEmpty(sentryDsn) &&
            sentryDsn.StartsWith("https://", StringComparison.OrdinalIgnoreCase);

        var loggerConfig = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
            .Enrich.WithProperty("Application", "QualiFlow.API")
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
            .WriteTo.File("logs/qualiflow-.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7);

        if (isSentryConfigured)
        {
            loggerConfig.WriteTo.Sentry(o =>
            {
                o.Dsn = sentryDsn;
                o.MinimumBreadcrumbLevel = LogEventLevel.Debug;
                o.MinimumEventLevel = LogEventLevel.Warning;
            });
        }

        Log.Logger = loggerConfig.CreateLogger();
        builder.Host.UseSerilog();

        return builder;
    }

    /// <summary>
    /// Configures Sentry for error tracking and performance monitoring.
    /// </summary>
    /// <returns>The <see cref="WebApplicationBuilder"/> for chaining.</returns>
    public static WebApplicationBuilder AddSentryMonitoring(this WebApplicationBuilder builder)
    {
        var sentryDsn = builder.Configuration["Sentry:Dsn"];
        var isSentryConfigured = !string.IsNullOrEmpty(sentryDsn) &&
            sentryDsn.StartsWith("https://", StringComparison.OrdinalIgnoreCase);

        if (!isSentryConfigured)
        {
            return builder;
        }

        builder.WebHost.UseSentry(options =>
        {
            options.Dsn = sentryDsn;
            options.Environment = builder.Environment.EnvironmentName;
            options.TracesSampleRate = builder.Environment.IsDevelopment() ? 1.0 : 0.1;
            options.ProfilesSampleRate = builder.Environment.IsDevelopment() ? 1.0 : 0.1;
            options.Debug = builder.Environment.IsDevelopment();
            options.SendDefaultPii = false;
            options.AttachStacktrace = true;
            options.MaxBreadcrumbs = 100;
            options.Release = builder.Configuration["Sentry:Release"] ?? "development";

            options.SetBeforeSend((sentryEvent, hint) =>
            {
                sentryEvent.SetTag("application", "QualiFlow.API");
                sentryEvent.SetTag("platform", "backend");
                if (sentryEvent.Request?.Url?.Contains("/health", StringComparison.OrdinalIgnoreCase) == true)
                {
                    return null;
                }

                return sentryEvent;
            });

            options.SetBeforeSendTransaction((transaction, hint) =>
            {
                transaction.SetTag("application", "QualiFlow.API");
                transaction.SetTag("platform", "backend");
                return transaction;
            });
        });

        return builder;
    }

    /// <summary>
    /// Configures Azure Key Vault for production secrets management.
    /// </summary>
    /// <returns>The <see cref="WebApplicationBuilder"/> for chaining.</returns>
    public static WebApplicationBuilder AddAzureKeyVault(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsProduction())
        {
            return builder;
        }

        var keyVaultName = builder.Configuration["KeyVault:Name"];
        if (!string.IsNullOrEmpty(keyVaultName))
        {
            var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
            builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
        }

        return builder;
    }
}

