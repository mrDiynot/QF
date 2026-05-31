using FluentValidation;

namespace QualiFlow.API.Extensions;

/// <summary>
/// Extension methods for registering all application repositories and services.
/// </summary>
public static class DependencyInjectionExtensions
{
    /// <summary>
    /// Registers all application-layer repositories, services, and external integrations.
    /// </summary>
    /// <returns>The <see cref="IServiceCollection"/> for chaining.</returns>
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        AddAutoMapperAndValidation(services);
        AddRepositories(services);
        AddCoreServices(services);
        AddCrmServices(services);
        AddAnalyticsAndSearchServices(services);
        AddTwilioAndMetaServices(services, configuration);
        AddVoiceAndResilienceServices(services);
        AddAuthServices(services);
        AddEmailServices(services, configuration, environment);
        AddCommunicationAndApiKeyServices(services);
        AddSubscriptionAndBillingServices(services);
        AddAdminServices(services);
        AddCrmOAuthServices(services);
        AddCurrentUserAndAIServices(services, configuration);
        AddRealTimeBroadcastServices(services);
        AddSprint4Services(services, configuration, environment);
        AddInboundAndOutboundServices(services, configuration);
        AddChatWidgetServices(services);
        AddTeamAndAuditServices(services);
        AddCmsServices(services);

        return services;
    }

    private static void AddAutoMapperAndValidation(IServiceCollection services)
    {
        services.AddAutoMapper(cfg =>
        {
            cfg.AddMaps(typeof(QualiFlow.Application.Features.Leads.Mappings.LeadMappingProfile).Assembly);
        });
        services.AddValidatorsFromAssemblyContaining<QualiFlow.Application.Features.Leads.Validators.CreateLeadRequestValidator>();
    }

    private static void AddRepositories(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ILeadRepository,
            QualiFlow.Infrastructure.Repositories.LeadRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IConversationRepository,
            QualiFlow.Infrastructure.Repositories.ConversationRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IMessageRepository,
            QualiFlow.Infrastructure.Repositories.MessageRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IScoringCriteriaRepository,
            QualiFlow.Infrastructure.Repositories.ScoringCriteriaRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IFormRepository,
            QualiFlow.Infrastructure.Repositories.FormRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IFormSubmissionRepository,
            QualiFlow.Infrastructure.Repositories.FormSubmissionRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IOnboardingRepository,
            QualiFlow.Infrastructure.Repositories.OnboardingRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IAIConfigurationRepository,
            QualiFlow.Infrastructure.Repositories.AIConfigurationRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IBusinessRepository,
            QualiFlow.Infrastructure.Repositories.BusinessRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IChannelRepository,
            QualiFlow.Infrastructure.Repositories.ChannelRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IContactRepository,
            QualiFlow.Infrastructure.Repositories.ContactRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IDealRepository,
            QualiFlow.Infrastructure.Repositories.DealRepository>();
        services.AddScoped<QualiFlow.Application.Features.Search.Repositories.ISavedSearchRepository,
            QualiFlow.Infrastructure.Repositories.SavedSearchRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IAuditLogRepository,
            QualiFlow.Infrastructure.Repositories.AuditLogRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IBusinessScoringConfigurationRepository,
            QualiFlow.Infrastructure.Repositories.BusinessScoringConfigurationRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IScoreHistoryRepository,
            QualiFlow.Infrastructure.Repositories.ScoreHistoryRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IBusinessKnowledgeBaseRepository,
            QualiFlow.Infrastructure.Repositories.BusinessKnowledgeBaseRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ILeadEnrichmentRepository,
            QualiFlow.Infrastructure.Repositories.LeadEnrichmentRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IAIGenerationAuditRepository,
            QualiFlow.Infrastructure.Repositories.AIGenerationAuditRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IFaqEmbeddingRepository,
            QualiFlow.Infrastructure.Repositories.FaqEmbeddingRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IConversationMemoryRepository,
            QualiFlow.Infrastructure.Repositories.ConversationMemoryRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IKnowledgeBaseRepository,
            QualiFlow.Infrastructure.Repositories.KnowledgeBaseRepository>();
    }

    private static void AddCoreServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.Leads.Services.ILeadService,
            QualiFlow.Application.Features.Leads.Services.LeadService>();
        services.AddScoped<QualiFlow.Application.Features.Conversations.Services.IConversationService,
            QualiFlow.Application.Features.Conversations.Services.ConversationService>();
        services.AddScoped<QualiFlow.Application.Features.Messages.Services.IMessageService,
            QualiFlow.Application.Features.Messages.Services.MessageService>();
        services.AddScoped<QualiFlow.Application.Features.ScoringCriteria.Services.IScoringCriteriaService,
            QualiFlow.Infrastructure.Services.ScoringCriteriaService>();
        services.AddScoped<QualiFlow.Application.Features.Forms.Services.IFormService,
            QualiFlow.Application.Features.Forms.Services.FormService>();
        services.AddScoped<QualiFlow.Application.Features.Forms.Services.IFormFieldValidator,
            QualiFlow.Application.Features.Forms.Services.FormFieldValidator>();
        services.AddScoped<QualiFlow.Application.Features.Onboarding.Services.IOnboardingService,
            QualiFlow.Application.Features.Onboarding.Services.OnboardingService>();
        services.AddScoped<QualiFlow.Application.Features.Onboarding.Services.IIndustryDefaultsService,
            QualiFlow.Application.Features.Onboarding.Services.IndustryDefaultsService>();
        services.AddScoped<QualiFlow.Application.Features.Onboarding.Services.IWelcomeEmailService,
            QualiFlow.Infrastructure.Services.WelcomeEmailService>();
        services.AddScoped<QualiFlow.Application.Features.Channels.Services.IChannelService,
            QualiFlow.Application.Features.Channels.Services.ChannelService>();
        services.AddScoped<QualiFlow.Application.Features.CRM.Services.IContactService,
            QualiFlow.Application.Features.CRM.Services.ContactService>();
        services.AddScoped<QualiFlow.Application.Features.CRM.Services.IDealService,
            QualiFlow.Application.Features.CRM.Services.DealService>();
    }

    private static void AddCrmServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Infrastructure.CRM.Adapters.QualiFlowCRMAdapter>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ICRMAdapterFactory,
            QualiFlow.Infrastructure.CRM.Factories.CRMAdapterFactory>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ICRMSyncService,
            QualiFlow.Infrastructure.Services.CRMSyncService>();
    }

    private static void AddAnalyticsAndSearchServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.Analytics.Services.IAnalyticsService,
            QualiFlow.Infrastructure.Services.AnalyticsService>();
        services.AddScoped<QualiFlow.Application.Features.Analytics.Services.IQrCodeAnalyticsService,
            QualiFlow.Infrastructure.Services.QrCodeAnalyticsService>();
        services.AddScoped<QualiFlow.Application.Features.Analytics.Services.IFormAnalyticsService,
            QualiFlow.Infrastructure.Services.FormAnalyticsService>();
        services.AddScoped<QualiFlow.Application.Features.Analytics.Services.ISocialChannelAnalyticsService,
            QualiFlow.Infrastructure.Services.SocialChannelAnalyticsService>();
        services.AddScoped<QualiFlow.Application.Features.Search.Services.IGlobalSearchService,
            QualiFlow.Infrastructure.Services.GlobalSearchService>();
        services.AddScoped<QualiFlow.Application.Features.BulkOperations.Services.IBulkOperationsService,
            QualiFlow.Infrastructure.Services.BulkOperationsService>();
        services.AddScoped<QualiFlow.Application.Features.DataExport.Services.IDataExportService,
            QualiFlow.Infrastructure.Services.DataExportService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Services.IAiResponseTemplateService,
            QualiFlow.Infrastructure.Services.AiResponseTemplateService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IConversationMemoryService,
            QualiFlow.Infrastructure.Services.ConversationMemoryService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IKnowledgeBaseService,
            QualiFlow.Infrastructure.Services.KnowledgeBaseService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IFaqSearchService,
            QualiFlow.Infrastructure.Services.FaqSearchService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IContentModerationService,
            QualiFlow.Infrastructure.Services.ContentModerationService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IPiiProtectionService,
            QualiFlow.Infrastructure.Services.PiiProtectionService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IComingSoonAnalyticsService,
            QualiFlow.Infrastructure.Services.ComingSoonAnalyticsService>();
        services.AddScoped<QualiFlow.Application.Features.Subscriptions.Services.IOverageAlertService,
            QualiFlow.Infrastructure.Services.OverageAlertService>();
        services.AddScoped<QualiFlow.Application.Features.Integrations.Services.IGoogleCalendarService,
            QualiFlow.Infrastructure.Services.GoogleCalendarService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IWorkflowTemplateService,
            QualiFlow.Infrastructure.Services.Workflows.WorkflowTemplateService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IBusinessWorkflowService,
            QualiFlow.Infrastructure.Services.Workflows.BusinessWorkflowService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IWorkflowApprovalService,
            QualiFlow.Infrastructure.Services.Workflows.WorkflowApprovalService>();
    }

    private static void AddTwilioAndMetaServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<QualiFlow.Infrastructure.ExternalServices.TwilioIntegration.TwilioOptions>(
            configuration.GetSection(QualiFlow.Infrastructure.ExternalServices.TwilioIntegration.TwilioOptions.SectionName));
        services.AddScoped<QualiFlow.Application.Features.Channels.Services.ITwilioService,
            QualiFlow.Infrastructure.ExternalServices.TwilioIntegration.TwilioService>();
        services.AddHostedService<QualiFlow.Infrastructure.ExternalServices.TwilioIntegration.TwilioWebhookConfigurationService>();
        services.AddHostedService<QualiFlow.Infrastructure.ExternalServices.CalComWebhookConfigurationService>();

        services.Configure<QualiFlow.Infrastructure.ExternalServices.Meta.MetaOptions>(
            configuration.GetSection(QualiFlow.Infrastructure.ExternalServices.Meta.MetaOptions.SectionName));
        services.AddHttpClient<QualiFlow.Application.Features.Meta.Interfaces.IMetaApiClient,
            QualiFlow.Infrastructure.ExternalServices.Meta.MetaApiClient>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("User-Agent", "QualiFlow/1.0");
        });
        services.AddScoped<QualiFlow.Application.Features.Meta.Interfaces.IMetaTokenManager,
            QualiFlow.Infrastructure.ExternalServices.Meta.MetaTokenManager>();
        services.AddScoped<QualiFlow.Application.Features.Meta.Interfaces.IMetaMessagingService,
            QualiFlow.Infrastructure.ExternalServices.Meta.MetaMessagingService>();
        services.AddScoped<QualiFlow.Application.Features.Meta.Interfaces.IMetaOAuthService,
            QualiFlow.Infrastructure.ExternalServices.Meta.MetaOAuthService>();
    }

    private static void AddVoiceAndResilienceServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.VoiceAgents.Services.IRealtimeVoiceService,
            QualiFlow.Infrastructure.Services.RealtimeVoiceService>();
        services.AddScoped<QualiFlow.Application.Features.VoiceAgents.Services.ITwilioVoiceService,
            QualiFlow.Infrastructure.Services.TwilioVoiceService>();
        services.AddSingleton<QualiFlow.API.Hubs.MediaStreamHandler>();
        services.AddSingleton<QualiFlow.Infrastructure.Services.IResilienceService,
            QualiFlow.Infrastructure.Services.ResilienceService>();
    }

    private static void AddAuthServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IJwtTokenService,
            QualiFlow.Infrastructure.Services.JwtTokenService>();
        services.AddScoped<QualiFlow.Application.Features.Auth.Services.IEmailOtpService,
            QualiFlow.Infrastructure.Services.EmailOtpService>();
        services.AddScoped<QualiFlow.Application.Features.Auth.Services.IGoogleOAuthService,
            QualiFlow.Infrastructure.Services.GoogleOAuthService>();
        services.AddScoped<QualiFlow.Application.Features.Auth.Services.IMicrosoftOAuthService,
            QualiFlow.Infrastructure.Services.MicrosoftOAuthService>();
    }

    private static void AddEmailServices(
        IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.Configure<QualiFlow.Application.Common.Options.ContactFormOptions>(
            configuration.GetSection(QualiFlow.Application.Common.Options.ContactFormOptions.SectionName));

        var resendApiKey = configuration["Resend:ApiKey"];
        if (string.IsNullOrEmpty(resendApiKey) && environment.EnvironmentName != "Testing")
        {
            throw new InvalidOperationException("Resend API key not configured");
        }

        services.Configure<Resend.ResendClientOptions>(options =>
        {
            options.ApiToken = resendApiKey ?? "test-api-key";
        });

        services.AddHttpClient<Resend.IResend, Resend.ResendClient>();
        services.AddScoped<QualiFlow.Application.Features.Email.Services.IEmailService,
            QualiFlow.Infrastructure.Services.EmailService>();
        services.AddScoped<QualiFlow.Infrastructure.Services.EmailTrackingService>();
        services.AddScoped<QualiFlow.Infrastructure.Data.Repositories.IEmailTemplateRepository,
            QualiFlow.Infrastructure.Repositories.EmailTemplateRepository>();
        services.AddScoped<QualiFlow.Infrastructure.Data.Repositories.IEmailLogRepository,
            QualiFlow.Infrastructure.Repositories.EmailLogRepository>();
        services.AddScoped<QualiFlow.Application.Features.Auth.Services.IEmailVerificationService,
            QualiFlow.Infrastructure.Services.EmailVerificationService>();
    }

    private static void AddCommunicationAndApiKeyServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ICommunicationSettingsRepository,
            QualiFlow.Infrastructure.Repositories.CommunicationSettingsRepository>();
        services.AddScoped<QualiFlow.Application.Features.CommunicationSettings.Services.ICommunicationSettingsService,
            QualiFlow.Application.Features.CommunicationSettings.Services.CommunicationSettingsService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IApiKeyRepository,
            QualiFlow.Infrastructure.Repositories.ApiKeyRepository>();
        services.AddScoped<QualiFlow.Application.Features.ApiKeys.Services.IApiKeyService,
            QualiFlow.Application.Features.ApiKeys.Services.ApiKeyService>();
    }

    private static void AddSubscriptionAndBillingServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ISubscriptionService,
            QualiFlow.Infrastructure.Services.SubscriptionService>();
        services.AddScoped<QualiFlow.Application.Features.Subscriptions.Services.ISubscriptionNotificationService,
            QualiFlow.Infrastructure.Services.SubscriptionNotificationService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IUsageLimitService,
            QualiFlow.Infrastructure.Services.UsageLimitService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IStripeService,
            QualiFlow.Infrastructure.Services.StripeService>();
    }

    private static void AddAdminServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.Admin.Auth.IAdminAuthService,
            QualiFlow.Infrastructure.Services.AdminAuthService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.Users.IAdminUserService,
            QualiFlow.Infrastructure.Services.AdminUserService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.Auth.ITwoFactorAuthService,
            QualiFlow.Infrastructure.Services.TwoFactorAuthService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.AuditLogs.IAdminAuditLogService,
            QualiFlow.Infrastructure.Services.AdminAuditLogService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.UserManagement.IAdminUserManagementService,
            QualiFlow.Infrastructure.Services.AdminUserManagementService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.BusinessManagement.IAdminBusinessManagementService,
            QualiFlow.Infrastructure.Services.AdminBusinessManagementService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.UserManagement.IUserImpersonationService,
            QualiFlow.Infrastructure.Services.UserImpersonationService>();
        services.AddScoped<QualiFlow.Application.Features.Support.ISupportTicketService,
            QualiFlow.Infrastructure.Services.SupportTicketService>();
        services.AddScoped<QualiFlow.Application.Features.Support.ISupportTicketNotificationService,
            QualiFlow.Infrastructure.Services.SupportTicketNotificationService>();
        services.AddScoped<QualiFlow.Application.Interfaces.Admin.IAdminDashboardService,
            QualiFlow.Infrastructure.Services.AdminDashboardService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.Billing.IAdminBillingService,
            QualiFlow.Infrastructure.Services.AdminBillingService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.Billing.IAdminPlanManagementService,
            QualiFlow.Infrastructure.Services.AdminPlanManagementService>();
        services.AddScoped<QualiFlow.Application.Features.Admin.SystemHealth.ISystemHealthService,
            QualiFlow.Infrastructure.Services.SystemHealthService>();
    }

    private static void AddCrmOAuthServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IHubSpotOAuthService,
            QualiFlow.Infrastructure.Services.HubSpotOAuthService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ISalesforceOAuthService,
            QualiFlow.Infrastructure.Services.SalesforceOAuthService>();
        services.AddHttpClient();
        services.AddHttpClient("WebhookClient", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("User-Agent", "QualiFlow-Webhooks/1.0");
        });
    }

    private static void AddCurrentUserAndAIServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ICurrentUserService,
            QualiFlow.Infrastructure.Services.CurrentUserService>();

        // OpenAI configuration
        services.Configure<QualiFlow.Application.Common.Options.OpenAIOptions>(
            configuration.GetSection(QualiFlow.Application.Common.Options.OpenAIOptions.SectionName));
        services.AddSingleton<QualiFlow.Application.Common.Interfaces.IOpenAIService,
            QualiFlow.Infrastructure.Services.OpenAIService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIConversationService,
            QualiFlow.Infrastructure.Services.AIConversationService>();
        services.AddScoped<QualiFlow.Application.Features.Scoring.Interfaces.ILeadScoringService,
            QualiFlow.Infrastructure.Services.LeadScoringService>();
        services.AddScoped<QualiFlow.Application.Features.Scoring.Interfaces.IBantExtractionService,
            QualiFlow.Infrastructure.Services.BantExtractionService>();
        services.AddSingleton<QualiFlow.Application.Features.AI.Interfaces.IAIModelSelector,
            QualiFlow.Infrastructure.Services.AIModelSelector>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IIntentDetectionService,
            QualiFlow.Infrastructure.Services.IntentDetectionService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.ISentimentAnalysisService,
            QualiFlow.Infrastructure.Services.SentimentAnalysisService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IInformationExtractionService,
            QualiFlow.Infrastructure.Services.InformationExtractionService>();

        // AI Orchestration
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIPersonaService,
            QualiFlow.Infrastructure.Services.AIPersonaService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIAutoResponseService,
            QualiFlow.Infrastructure.Services.AIAutoResponseService>();
        services.AddScoped<QualiFlow.Application.Features.ChatWidgets.Interfaces.IChatHubNotifier,
            QualiFlow.API.Services.ChatHubNotifier>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IExternalUsageTrackingService,
            QualiFlow.Infrastructure.Services.ExternalUsageTrackingService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIAutoResponseJobService,
            QualiFlow.Infrastructure.Jobs.AIAutoResponseJob>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIGenerationAuditService,
            QualiFlow.Application.Features.AI.Services.AIGenerationAuditService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIFeedbackService,
            QualiFlow.Application.Features.AI.Services.AIFeedbackService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIFormGenerationService,
            QualiFlow.Application.Features.AI.Services.AIFormGenerationService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAISmsTemplateGenerationService,
            QualiFlow.Application.Features.AI.Services.AISmsTemplateGenerationService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIInsightsService,
            QualiFlow.Application.Features.AI.Services.AIInsightsService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIReportGenerationService,
            QualiFlow.Application.Features.AI.Services.AIReportGenerationService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAICrmEnrichmentService,
            QualiFlow.Application.Features.AI.Services.AICrmEnrichmentService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIQuickReplySuggestionService,
            QualiFlow.Application.Features.AI.Services.AIQuickReplySuggestionService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIOnboardingRecommendationService,
            QualiFlow.Application.Features.AI.Services.AIOnboardingRecommendationService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIKnowledgeGenerationService,
            QualiFlow.Application.Features.AI.Services.AIKnowledgeGenerationService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IAIWorkflowGenerationService,
            QualiFlow.Application.Features.AI.Services.AIWorkflowGenerationService>();
        services.AddScoped<QualiFlow.Application.Features.AI.Interfaces.IFormQualificationService,
            QualiFlow.Infrastructure.Services.FormQualificationService>();
    }

    private static void AddRealTimeBroadcastServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.RealTime.Services.IRealTimeBroadcastService>(sp =>
        {
            var hubContext = sp.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<
                QualiFlow.API.Hubs.ConversationHub,
                QualiFlow.Application.Common.Interfaces.IConversationHubClient>>();
            var logger = sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<
                QualiFlow.Infrastructure.Services.RealTimeBroadcastService>>();
            return new QualiFlow.Infrastructure.Services.RealTimeBroadcastService(hubContext.Clients, logger);
        });

        services.AddScoped<QualiFlow.Application.Common.Interfaces.INotificationService>(sp =>
        {
            var hubContext = sp.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<
                QualiFlow.API.Hubs.NotificationHub,
                QualiFlow.Application.Common.Interfaces.INotificationHubClient>>();
            var context = sp.GetRequiredService<QualiFlow.Infrastructure.Data.QualiFlowDbContext>();
            var logger = sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<
                QualiFlow.Infrastructure.Services.NotificationService>>();
            return new QualiFlow.Infrastructure.Services.NotificationService(context, hubContext.Clients, logger);
        });

        services.AddScoped<QualiFlow.Application.Features.Notifications.Services.INotificationPreferenceService,
            QualiFlow.Infrastructure.Services.NotificationPreferenceService>();
    }

    private static void AddSprint4Services(
        IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // Conversation Notes
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IConversationNoteRepository,
            QualiFlow.Infrastructure.Repositories.ConversationNoteRepository>();
        services.AddScoped<QualiFlow.Application.Features.ConversationNotes.Services.IConversationNoteService,
            QualiFlow.Application.Features.ConversationNotes.Services.ConversationNoteService>();

        // Quick Replies
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IQuickReplyRepository,
            QualiFlow.Infrastructure.Repositories.QuickReplyRepository>();
        services.AddScoped<QualiFlow.Application.Features.QuickReplies.Services.IQuickReplyService,
            QualiFlow.Application.Features.QuickReplies.Services.QuickReplyService>();

        // SMS Templates
        services.AddScoped<QualiFlow.Application.Features.SmsTemplates.Services.ISmsTemplateService,
            QualiFlow.Infrastructure.Services.SmsTemplateService>();

        // Bookings
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IBookingRepository,
            QualiFlow.Infrastructure.Repositories.BookingRepository>();
        services.AddScoped<QualiFlow.Application.Features.Bookings.Services.IBookingService,
            QualiFlow.Application.Features.Bookings.Services.BookingService>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ICalComService,
            QualiFlow.Infrastructure.ExternalServices.CalComService>();

        // File Upload
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IMessageAttachmentRepository,
            QualiFlow.Infrastructure.Repositories.MessageAttachmentRepository>();
        services.AddScoped<QualiFlow.Application.Features.Files.Services.IFileService,
            QualiFlow.Application.Features.Files.Services.FileService>();

        // Blob Storage (Azure in production, local in development)
        var azureBlobConnectionString = configuration.GetConnectionString("AzureBlobStorage")
            ?? configuration["AzureBlobStorage:ConnectionString"];
        if (!environment.IsDevelopment() && !string.IsNullOrEmpty(azureBlobConnectionString))
        {
            services.AddScoped<QualiFlow.Application.Common.Interfaces.IBlobStorageService,
                QualiFlow.Infrastructure.ExternalServices.AzureBlobStorageService>();
        }
        else
        {
            services.AddScoped<QualiFlow.Application.Common.Interfaces.IBlobStorageService,
                QualiFlow.Infrastructure.Services.LocalBlobStorageService>();
        }

        // Webhooks
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IWebhookRepository,
            QualiFlow.Infrastructure.Repositories.WebhookRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IWebhookDeliveryRepository,
            QualiFlow.Infrastructure.Repositories.WebhookDeliveryRepository>();
        services.AddScoped<QualiFlow.Application.Features.Webhooks.Services.IWebhookService,
            QualiFlow.Application.Features.Webhooks.Services.WebhookService>();

        // Workflows
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IQualiFlowWorkflowRepository,
            QualiFlow.Infrastructure.Repositories.WorkflowRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IWorkflowService,
            QualiFlow.Infrastructure.Services.WorkflowService>();
    }

    private static void AddInboundAndOutboundServices(IServiceCollection services, IConfiguration configuration)
    {
        // Inbound Message Processing
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IBackgroundJobService,
            QualiFlow.Infrastructure.Services.BackgroundJobService>();
        services.AddScoped<QualiFlow.Application.Features.InboundMessages.Services.IInboundMessageService,
            QualiFlow.Application.Features.InboundMessages.Services.InboundMessageService>();
        services.AddScoped<QualiFlow.Application.Features.InboundMessages.Services.IAiQualificationJobService,
            QualiFlow.Infrastructure.Services.AiQualificationJobService>();
        services.AddScoped<QualiFlow.Application.Features.InboundMessages.Services.IVoiceTranscriptionJobService,
            QualiFlow.Infrastructure.Services.VoiceTranscriptionJobService>();

        // Outbound AI Calling
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IOutboundCallRepository,
            QualiFlow.Infrastructure.Repositories.OutboundCallRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.ICallScriptRepository,
            QualiFlow.Infrastructure.Repositories.CallScriptRepository>();
        services.AddScoped<QualiFlow.Application.Features.OutboundCalls.Services.IOutboundCallService,
            QualiFlow.Application.Features.OutboundCalls.Services.OutboundCallService>();
        services.AddScoped<QualiFlow.Application.Features.CallScripts.Services.ICallScriptService,
            QualiFlow.Application.Features.CallScripts.Services.CallScriptService>();
        services.Configure<QualiFlow.Application.Features.OutboundCalls.Services.OutboundCallOptions>(
            configuration.GetSection("OutboundCalling"));
        services.AddScoped<QualiFlow.Application.Features.OutboundCalls.Jobs.ScheduledCallProcessorJob>();
        services.AddScoped<QualiFlow.Application.Features.OutboundCalls.Jobs.CallRetryJob>();
    }

    private static void AddChatWidgetServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IChatWidgetRepository,
            QualiFlow.Infrastructure.Repositories.ChatWidgetRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IChatSessionRepository,
            QualiFlow.Infrastructure.Repositories.ChatSessionRepository>();
        services.AddScoped<QualiFlow.Application.Common.Interfaces.IChatMessageRepository,
            QualiFlow.Infrastructure.Repositories.ChatMessageRepository>();
        services.AddScoped<QualiFlow.Application.Features.ChatWidgets.Services.IChatWidgetService,
            QualiFlow.Application.Features.ChatWidgets.Services.ChatWidgetService>();
        services.AddScoped<QualiFlow.Application.Features.ChatWidgets.Services.IChatSessionService,
            QualiFlow.Application.Features.ChatWidgets.Services.ChatSessionService>();
        services.AddScoped<QualiFlow.Application.Features.QRCode.Services.IQRCodeService,
            QualiFlow.Infrastructure.Services.QRCodeService>();
        services.AddScoped<QualiFlow.Application.Features.AutoAssignment.Interfaces.IAutoAssignmentService,
            QualiFlow.Infrastructure.Services.AutoAssignmentService>();
    }

    private static void AddTeamAndAuditServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.TeamMembers.Services.ITeamMemberService,
            QualiFlow.Infrastructure.Services.TeamMemberService>();
        services.AddScoped<QualiFlow.Application.Features.TeamMembers.Services.IInvitationService,
            QualiFlow.Infrastructure.Services.InvitationService>();
        services.AddScoped<QualiFlow.Application.Features.AuditLogs.Services.IAuthenticationAuditService,
            QualiFlow.Infrastructure.Services.AuthenticationAuditService>();
        services.AddScoped<QualiFlow.Infrastructure.Data.Interceptors.AuditingInterceptor>();
    }

    private static void AddCmsServices(IServiceCollection services)
    {
        services.AddScoped<QualiFlow.Application.Features.Admin.CMS.Services.ICmsService,
            QualiFlow.Infrastructure.Services.CMS.CmsService>();
    }
}

