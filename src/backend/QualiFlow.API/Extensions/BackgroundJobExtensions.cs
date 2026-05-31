using Hangfire;
using Hangfire.PostgreSql;
using WorkflowCore.Interface;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for configuring Hangfire background jobs and Workflow Core.
/// </summary>
public static class BackgroundJobExtensions
{
    /// <summary>
    /// Adds Hangfire and Workflow Core configuration.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddBackgroundJobs(
        this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        AddHangfireServices(services, configuration, environment);
        AddWorkflowCore(services, configuration);
        AddStartupValidation(services);

        return services;
    }

    private static void AddHangfireServices(
        IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        if (environment.IsEnvironment("Testing"))
        {
            return;
        }

        services.AddHangfire(config =>
        {
            config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options =>
                {
                    options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection"));
                });

            GlobalJobFilters.Filters.Add(new QualiFlow.Infrastructure.Jobs.AutomaticRetryAttribute());
            GlobalJobFilters.Filters.Add(new QualiFlow.Infrastructure.Jobs.JobPerformanceLoggerAttribute());
        });

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = 10;
            options.Queues = new[] { "default", "critical", "low" };
            options.SchedulePollingInterval = TimeSpan.FromSeconds(1);
            options.ServerName = $"{Environment.MachineName}:QualiFlow";
        });

        // Register Hangfire job services
        services.AddScoped<QualiFlow.Infrastructure.Jobs.BookingReminderJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.MonthlyUsageResetJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.TrialExpirationCheckJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.PaymentRetryJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.UsageSnapshotJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.WebhookRetryJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.SubscriptionIntentReconciliationJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.ChatSessionTimeoutJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.MetaTokenRefreshJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.DailyLeadQualificationJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.WeeklyNurtureCampaignJob>();
        services.AddScoped<QualiFlow.Infrastructure.Jobs.DailyFollowUpSequenceJob>();
    }

    private static void AddWorkflowCore(IServiceCollection services, IConfiguration configuration)
    {
        services.AddWorkflow(config =>
        {
            config.UsePostgreSQL(configuration.GetConnectionString("DefaultConnection")!, false, false);
            config.UsePollInterval(TimeSpan.FromSeconds(10));
        });

        // Register custom workflow activities
        services.AddTransient<QualiFlow.Infrastructure.Workflows.Activities.ScoreLeadActivity>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.Activities.SendEmailActivity>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.Activities.AssignLeadActivity>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.Activities.SendSmsActivity>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.Activities.UpdateLeadActivity>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.Activities.DelayActivity>();

        // Register Journey Trigger Service
        services.AddScoped<QualiFlow.Application.Features.Journeys.Services.IJourneyTriggerService,
            QualiFlow.Infrastructure.Services.JourneyTriggerService>();

        // Register Workflow Subscription Service
        services.AddScoped<QualiFlow.Application.Features.Workflows.Services.IWorkflowSubscriptionService,
            QualiFlow.Infrastructure.Services.WorkflowSubscriptionService>();

        // Register workflow definitions (10 prebuilt journeys)
        // FreeFlow tier
        services.AddTransient<QualiFlow.Infrastructure.Workflows.LeadQualificationWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.ReviewSurveyWorkflow>();

        // SmartFlow tier
        services.AddTransient<QualiFlow.Infrastructure.Workflows.EmailNurtureCampaignWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.FollowUpSequenceWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.MissedCallRecoveryWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.NoShowRecoveryWorkflow>();

        // UltraFlow tier
        services.AddTransient<QualiFlow.Infrastructure.Workflows.ColdLeadRevivalWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.RetentionReengagementWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.ProposalWorkflow>();
        services.AddTransient<QualiFlow.Infrastructure.Workflows.AbandonedFormRecoveryWorkflow>();
    }

    private static void AddStartupValidation(IServiceCollection services)
    {
        services.AddHostedService<QualiFlow.Infrastructure.Services.ConstantsValidationService>();
    }

    /// <summary>
    /// Configures Hangfire dashboard and recurring jobs on the application pipeline.
    /// </summary>
    /// <returns>The <see cref="WebApplication"/> for chaining.</returns>
    public static WebApplication UseHangfireRecurringJobs(this WebApplication app)
    {
        if (app.Environment.IsEnvironment("Testing"))
        {
            return app;
        }

        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            Authorization = app.Environment.IsDevelopment()
                ? []
                : [new QualiFlow.API.Filters.HangfireAdminAuthorizationFilter(app.Configuration)],
        });

        ConfigureRecurringJobs();

        return app;
    }

    private static void ConfigureRecurringJobs()
    {
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.BookingReminderJob>(
            "booking-reminder", job => job.ExecuteAsync(), Cron.Minutely);
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.MonthlyUsageResetJob>(
            "monthly-usage-reset", job => job.ExecuteAsync(), Cron.Daily(0));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.TrialExpirationCheckJob>(
            "trial-expiration-check", job => job.ExecuteAsync(), Cron.Daily(9));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.PaymentRetryJob>(
            "payment-retry", job => job.ExecuteAsync(), Cron.Daily(10));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.UsageSnapshotJob>(
            "usage-snapshot", job => job.ExecuteAsync(), Cron.Daily(23));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.AnalyticsSnapshotJob>(
            "analytics-snapshot", job => job.ExecuteAsync(), Cron.Hourly());
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.WebhookRetryJob>(
            "webhook-retry", job => job.ExecuteAsync(), "*/1 * * * *");
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.SubscriptionIntentReconciliationJob>(
            "subscription-intent-reconciliation", job => job.ExecuteAsync(), "*/5 * * * *");
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.MetaTokenRefreshJob>(
            "meta-token-refresh", job => job.ExecuteAsync(), Cron.Daily(3));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.DailyLeadQualificationJob>(
            "daily-lead-qualification", job => job.ExecuteAsync(), Cron.Daily(8));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.WeeklyNurtureCampaignJob>(
            "weekly-nurture-campaign", job => job.ExecuteAsync(), Cron.Weekly(DayOfWeek.Monday, 9));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.DailyFollowUpSequenceJob>(
            "daily-follow-up-sequence", job => job.ExecuteAsync(), Cron.Daily(10));
        RecurringJob.AddOrUpdate<QualiFlow.Infrastructure.Jobs.ChatSessionTimeoutJob>(
            "chat-session-timeout", job => job.ExecuteAsync(), "*/5 * * * *");
        RecurringJob.AddOrUpdate<QualiFlow.Application.Features.OutboundCalls.Jobs.ScheduledCallProcessorJob>(
            "scheduled-call-processor", job => job.ProcessScheduledCallsAsync(), "*/1 * * * *");
        RecurringJob.AddOrUpdate<QualiFlow.Application.Features.OutboundCalls.Jobs.CallRetryJob>(
            "call-retry", job => job.RetryFailedCallsAsync(), "*/5 * * * *");
    }
}

