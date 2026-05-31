using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Common;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Entities.CMS;
using QualiFlow.Domain.Entities.Support;

namespace QualiFlow.Infrastructure.Data;

/// <summary>
/// Entity Framework Core database context for QualiFlow.
/// Manages database connections, entity configurations, and change tracking.
/// Inherits from IdentityDbContext to support ASP.NET Core Identity.
/// Implements multi-tenancy through global query filters and automatic BusinessId assignment.
/// </summary>
public class QualiFlowDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    private readonly ICurrentUserService? _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="QualiFlowDbContext"/> class.
    /// </summary>
    /// <param name="options">The options to be used by the DbContext.</param>
    /// <param name="currentUserService">Service for accessing current user context (optional for migrations).</param>
    public QualiFlowDbContext(
        DbContextOptions<QualiFlowDbContext> options,
        ICurrentUserService? currentUserService = null)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    // ============================================================================
    // DbSet Properties
    // ============================================================================

    /// <summary>
    /// Gets the Leads DbSet.
    /// </summary>
    public DbSet<Lead> Leads => Set<Lead>();

    /// <summary>
    /// Gets the Conversations DbSet.
    /// </summary>
    public DbSet<Conversation> Conversations => Set<Conversation>();

    /// <summary>
    /// Gets the Messages DbSet.
    /// </summary>
    public DbSet<Message> Messages => Set<Message>();

    /// <summary>
    /// Gets the MessageReadStatuses DbSet.
    /// </summary>
    public DbSet<MessageReadStatus> MessageReadStatuses => Set<MessageReadStatus>();

    /// <summary>
    /// Gets the Channels DbSet.
    /// </summary>
    public DbSet<Channel> Channels => Set<Channel>();

    /// <summary>
    /// Gets the Bookings DbSet.
    /// </summary>
    public DbSet<Booking> Bookings => Set<Booking>();

    /// <summary>
    /// Gets the Qualifications DbSet.
    /// </summary>
    public DbSet<Qualification> Qualifications => Set<Qualification>();

    /// <summary>
    /// Gets the Businesses DbSet.
    /// </summary>
    public DbSet<Business> Businesses => Set<Business>();

    /// <summary>
    /// Gets the RefreshTokens DbSet.
    /// </summary>
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    /// <summary>
    /// Gets the EmailOtps DbSet.
    /// </summary>
    public DbSet<EmailOtp> EmailOtps => Set<EmailOtp>();

    /// <summary>
    /// Gets the ScoringCriteria DbSet.
    /// </summary>
    public DbSet<ScoringCriteria> ScoringCriteria => Set<ScoringCriteria>();

    /// <summary>
    /// Gets the ScoreHistories DbSet for tracking lead score changes.
    /// </summary>
    public DbSet<ScoreHistory> ScoreHistories => Set<ScoreHistory>();

    /// <summary>
    /// Gets the BusinessScoringConfigurations DbSet for per-business scoring settings.
    /// </summary>
    public DbSet<BusinessScoringConfiguration> BusinessScoringConfigurations => Set<BusinessScoringConfiguration>();

    /// <summary>
    /// Gets the BusinessKnowledgeBases DbSet for AI context knowledge entries.
    /// </summary>
    public DbSet<BusinessKnowledgeBase> BusinessKnowledgeBases => Set<BusinessKnowledgeBase>();

    /// <summary>
    /// Gets the LeadEnrichments DbSet for enriched lead data from external sources.
    /// </summary>
    public DbSet<LeadEnrichment> LeadEnrichments => Set<LeadEnrichment>();

    /// <summary>
    /// Gets the IndustryScoringTemplates DbSet for industry-specific scoring presets.
    /// </summary>
    public DbSet<IndustryScoringTemplate> IndustryScoringTemplates => Set<IndustryScoringTemplate>();

    /// <summary>
    /// Gets the ScoringABTests DbSet for A/B testing scoring models.
    /// </summary>
    public DbSet<ScoringABTest> ScoringABTests => Set<ScoringABTest>();

    /// <summary>
    /// Gets the MLScorePredictions DbSet for ML-based score predictions.
    /// </summary>
    public DbSet<MLScorePrediction> MLScorePredictions => Set<MLScorePrediction>();

    /// <summary>
    /// Gets the Forms DbSet.
    /// </summary>
    public DbSet<Form> Forms => Set<Form>();

    /// <summary>
    /// Gets the FormSubmissions DbSet.
    /// </summary>
    public DbSet<FormSubmission> FormSubmissions => Set<FormSubmission>();

    /// <summary>
    /// Gets the ConversationNotes DbSet.
    /// </summary>
    public DbSet<ConversationNote> ConversationNotes => Set<ConversationNote>();

    /// <summary>
    /// Gets the QuickReplies DbSet.
    /// </summary>
    public DbSet<QuickReply> QuickReplies => Set<QuickReply>();

    /// <summary>
    /// Gets the AutoAssignmentRules DbSet.
    /// </summary>
    public DbSet<AutoAssignmentRule> AutoAssignmentRules => Set<AutoAssignmentRule>();

    /// <summary>
    /// Gets the MessageAttachments DbSet.
    /// </summary>
    public DbSet<MessageAttachment> MessageAttachments => Set<MessageAttachment>();

    /// <summary>
    /// Gets the OnboardingProgress DbSet.
    /// </summary>
    public DbSet<OnboardingProgress> OnboardingProgress => Set<OnboardingProgress>();

    /// <summary>
    /// Gets the AIConfigurations DbSet.
    /// </summary>
    public DbSet<AIConfiguration> AIConfigurations => Set<AIConfiguration>();

    /// <summary>
    /// Gets the KnowledgeBaseArticles DbSet.
    /// </summary>
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();

    /// <summary>
    /// Gets the Contacts DbSet.
    /// </summary>
    public DbSet<Contact> Contacts => Set<Contact>();

    /// <summary>
    /// Gets the Deals DbSet.
    /// </summary>
    public DbSet<Deal> Deals => Set<Deal>();

    /// <summary>
    /// Gets the CRMProviders DbSet.
    /// </summary>
    public DbSet<CRMProvider> CRMProviders => Set<CRMProvider>();

    /// <summary>
    /// Gets the Webhooks DbSet (Sprint 8).
    /// </summary>
    public DbSet<Webhook> Webhooks => Set<Webhook>();

    /// <summary>
    /// Gets the WebhookDeliveries DbSet (Sprint 8).
    /// </summary>
    public DbSet<WebhookDelivery> WebhookDeliveries => Set<WebhookDelivery>();

    /// <summary>
    /// Gets the EmailTemplates DbSet (Sprint 8).
    /// </summary>
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();

    /// <summary>
    /// Gets the EmailLogs DbSet (Sprint 8).
    /// </summary>
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();

    /// <summary>
    /// Gets the CommunicationSettings DbSet.
    /// </summary>
    public DbSet<CommunicationSettings> CommunicationSettings => Set<CommunicationSettings>();

    /// <summary>
    /// Gets the ApiKeys DbSet.
    /// </summary>
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();

    /// <summary>
    /// Gets the SavedSearches DbSet (Sprint 15).
    /// </summary>
    public DbSet<SavedSearch> SavedSearches => Set<SavedSearch>();

    /// <summary>
    /// Gets the SearchAnalytics DbSet (Sprint 15).
    /// </summary>
    public DbSet<SearchAnalytics> SearchAnalytics => Set<SearchAnalytics>();

    /// <summary>
    /// Gets the WorkflowDefinitions DbSet (Sprint 9).
    /// </summary>
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();

    /// <summary>
    /// Gets or sets the WorkflowInstances DbSet.
    /// </summary>
    public DbSet<WorkflowInstance> WorkflowInstances { get; set; } = null!;

    /// <summary>
    /// Gets or sets the WorkflowTemplates DbSet.
    /// </summary>
    public DbSet<WorkflowTemplate> WorkflowTemplates { get; set; } = null!;

    /// <summary>
    /// Gets or sets the BusinessWorkflows DbSet.
    /// </summary>
    public DbSet<BusinessWorkflow> BusinessWorkflows { get; set; } = null!;

    /// <summary>
    /// Gets or sets the WorkflowPlanAssignments DbSet.
    /// </summary>
    public DbSet<WorkflowPlanAssignment> WorkflowPlanAssignments { get; set; } = null!;

    /// <summary>
    /// Gets or sets the WorkflowApprovalRequests DbSet.
    /// </summary>
    public DbSet<WorkflowApprovalRequest> WorkflowApprovalRequests { get; set; } = null!;

    /// <summary>
    /// Gets or sets the WorkflowExecutions DbSet.
    /// </summary>
    public DbSet<WorkflowExecution> WorkflowExecutions { get; set; } = null!;

    /// <summary>
    /// Gets the AuditLogs DbSet (Sprint 13).
    /// </summary>
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    /// <summary>
    /// Gets the SubscriptionPlans DbSet (Sprint 16).
    /// </summary>
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();

    /// <summary>
    /// Gets the Subscriptions DbSet (Sprint 16).
    /// Platform-level entity tracking business billing relationships.
    /// </summary>
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    /// <summary>
    /// Gets the SubscriptionIntents DbSet (Sprint 20).
    /// Tracks user's subscription intent before Stripe payment for reconciliation.
    /// </summary>
    public DbSet<SubscriptionIntent> SubscriptionIntents => Set<SubscriptionIntent>();

    /// <summary>
    /// Gets the PlanLimits DbSet (Sprint 16).
    /// </summary>
    public DbSet<PlanLimit> PlanLimits => Set<PlanLimit>();

    /// <summary>
    /// Gets the Features DbSet (Sprint 16).
    /// </summary>
    public DbSet<Feature> Features => Set<Feature>();

    /// <summary>
    /// Gets the PlanFeatures DbSet (Sprint 16).
    /// </summary>
    public DbSet<PlanFeature> PlanFeatures => Set<PlanFeature>();

    /// <summary>
    /// Gets the BusinessOverrides DbSet (Sprint 16).
    /// </summary>
    public DbSet<BusinessOverride> BusinessOverrides => Set<BusinessOverride>();

    /// <summary>
    /// Gets the AdminUsers DbSet (Sprint 17).
    /// </summary>
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    /// <summary>
    /// Gets the AdminAuditLogs DbSet (Sprint 17).
    /// </summary>
    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();

    /// <summary>
    /// Gets the OutboundCalls DbSet (Sprint 22).
    /// </summary>
    public DbSet<OutboundCall> OutboundCalls => Set<OutboundCall>();

    /// <summary>
    /// Gets the CallScripts DbSet (Sprint 22).
    /// </summary>
    public DbSet<CallScript> CallScripts => Set<CallScript>();

    /// <summary>
    /// Gets the ChatWidgets DbSet (Sprint 23).
    /// </summary>
    public DbSet<ChatWidget> ChatWidgets => Set<ChatWidget>();

    /// <summary>
    /// Gets the ChatSessions DbSet (Sprint 23).
    /// </summary>
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();

    /// <summary>
    /// Gets the ChatMessages DbSet (Sprint 23).
    /// </summary>
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    /// <summary>
    /// Gets the FaqEmbeddings DbSet for semantic FAQ search.
    /// </summary>
    public DbSet<FaqEmbedding> FaqEmbeddings => Set<FaqEmbedding>();

    /// <summary>
    /// Gets the ConversationMemories DbSet for long-term conversation context.
    /// </summary>
    public DbSet<ConversationMemory> ConversationMemories => Set<ConversationMemory>();

    /// <summary>
    /// Gets the KnowledgeBaseDocuments DbSet for RAG.
    /// </summary>
    public DbSet<KnowledgeBaseDocument> KnowledgeBaseDocuments => Set<KnowledgeBaseDocument>();

    /// <summary>
    /// Gets the KnowledgeBaseChunks DbSet for RAG.
    /// </summary>
    public DbSet<KnowledgeBaseChunk> KnowledgeBaseChunks => Set<KnowledgeBaseChunk>();

    /// <summary>
    /// Gets the Invitations DbSet (Sprint 31).
    /// </summary>
    public DbSet<Invitation> Invitations => Set<Invitation>();

    /// <summary>
    /// Gets the SupportTickets DbSet (Sprint 24).
    /// </summary>
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();

    /// <summary>
    /// Gets the TicketMessages DbSet (Sprint 24).
    /// </summary>
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();

    /// <summary>
    /// Gets the TicketAttachments DbSet (Sprint 24).
    /// </summary>
    public DbSet<TicketAttachment> TicketAttachments => Set<TicketAttachment>();

    /// <summary>
    /// Gets the SlaPolicies DbSet (Sprint 24).
    /// </summary>
    public DbSet<SlaPolicy> SlaPolicies => Set<SlaPolicy>();

    /// <summary>
    /// Gets the Proposals DbSet.
    /// </summary>
    public DbSet<Proposal> Proposals => Set<Proposal>();

    /// <summary>
    /// Gets the ExternalUsageLogs DbSet (Sprint 35 - AI Orchestration).
    /// </summary>
    public DbSet<ExternalUsageLog> ExternalUsageLogs => Set<ExternalUsageLog>();

    // ============================================================================
    // Analytics DbSets (Advanced Analytics)
    // ============================================================================

    /// <summary>
    /// Gets the QR Campaigns DbSet (QRCode Analytics).
    /// </summary>
    public DbSet<QrCampaign> QrCampaigns => Set<QrCampaign>();

    /// <summary>
    /// Gets the QR Scans DbSet (QRCode Analytics).
    /// </summary>
    public DbSet<QrScan> QrScans => Set<QrScan>();

    /// <summary>
    /// Gets the Form Views DbSet (Form Analytics).
    /// </summary>
    public DbSet<FormView> FormViews => Set<FormView>();

    /// <summary>
    /// Gets the Field Interactions DbSet (Form Analytics).
    /// </summary>
    public DbSet<FieldInteraction> FieldInteractions => Set<FieldInteraction>();

    /// <summary>
    /// Gets the A/B Tests DbSet (A/B Testing).
    /// </summary>
    public DbSet<AbTest> AbTests => Set<AbTest>();

    /// <summary>
    /// Gets the A/B Test Variants DbSet (A/B Testing).
    /// </summary>
    public DbSet<AbTestVariant> AbTestVariants => Set<AbTestVariant>();

    /// <summary>
    /// Gets the CalComIntegrations DbSet.
    /// Per-business Cal.com API key storage for booking integration.
    /// </summary>
    public DbSet<CalComIntegration> CalComIntegrations => Set<CalComIntegration>();

    // ============================================================================
    // CMS DbSets
    // ============================================================================

    /// <summary>
    /// Gets the CMS Pages DbSet.
    /// </summary>
    public DbSet<CmsPage> CmsPages => Set<CmsPage>();

    /// <summary>
    /// Gets the Blog Posts DbSet.
    /// </summary>
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();

    /// <summary>
    /// Gets the FAQs DbSet.
    /// </summary>
    public DbSet<FrequentlyAskedQuestion> FrequentlyAskedQuestions => Set<FrequentlyAskedQuestion>();

    /// <summary>
    /// Gets the Testimonials DbSet.
    /// </summary>
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();

    /// <summary>
    /// Gets the Trusted Companies DbSet.
    /// </summary>
    public DbSet<TrustedCompany> TrustedCompanies => Set<TrustedCompany>();

    /// <summary>
    /// Gets the Landing Page Content DbSet.
    /// </summary>
    public DbSet<LandingPageContent> LandingPageContents => Set<LandingPageContent>();

    /// <summary>
    /// Gets the Landing Page Statistics DbSet.
    /// </summary>
    public DbSet<LandingPageStatistic> LandingPageStatistics => Set<LandingPageStatistic>();

    /// <summary>
    /// Gets the CMS Pricing Plans DbSet.
    /// </summary>
    public DbSet<CmsPricingPlan> CmsPricingPlans => Set<CmsPricingPlan>();

    /// <summary>
    /// Gets the CMS Pricing Add-Ons DbSet.
    /// </summary>
    public DbSet<CmsPricingAddOn> CmsPricingAddOns => Set<CmsPricingAddOn>();

    /// <summary>
    /// Gets the Help Articles DbSet.
    /// </summary>
    public DbSet<HelpArticle> HelpArticles => Set<HelpArticle>();

    /// <summary>
    /// Gets the Feature Modules DbSet.
    /// </summary>
    public DbSet<FeatureModule> FeatureModules => Set<FeatureModule>();

    /// <summary>
    /// Gets the Prebuilt Journeys DbSet.
    /// </summary>
    public DbSet<PrebuiltJourney> PrebuiltJourneys => Set<PrebuiltJourney>();

    /// <summary>
    /// Gets the Pricing Feature Comparisons DbSet.
    /// </summary>
    public DbSet<PricingFeatureComparison> PricingFeatureComparisons => Set<PricingFeatureComparison>();

    // ============================================================================
    // Links, Surveys, and AI Voice DbSets
    // ============================================================================

    /// <summary>
    /// Gets the TrackedLinks DbSet.
    /// </summary>
    public DbSet<TrackedLink> TrackedLinks => Set<TrackedLink>();

    /// <summary>
    /// Gets the Surveys DbSet.
    /// </summary>
    public DbSet<Survey> Surveys => Set<Survey>();

    /// <summary>
    /// Gets the SurveyResponses DbSet.
    /// </summary>
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();

    /// <summary>
    /// Gets the VoiceAgents DbSet.
    /// </summary>
    public DbSet<VoiceAgent> VoiceAgents => Set<VoiceAgent>();

    /// <summary>
    /// Gets the VoiceCalls DbSet.
    /// </summary>
    public DbSet<VoiceCall> VoiceCalls => Set<VoiceCall>();

    // ============================================================================
    // Notification and Usage Tracking DbSets
    // ============================================================================

    /// <summary>
    /// Gets the Notifications DbSet.
    /// In-app notifications for users.
    /// </summary>
    public DbSet<Notification> Notifications => Set<Notification>();

    /// <summary>
    /// Gets the NotificationPreferences DbSet.
    /// User notification preferences for channels and categories.
    /// </summary>
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();

    /// <summary>
    /// Gets the UsageSnapshots DbSet.
    /// Daily snapshots of usage data for analytics.
    /// </summary>
    public DbSet<UsageSnapshot> UsageSnapshots => Set<UsageSnapshot>();

    /// <summary>
    /// Gets the AnalyticsSnapshots DbSet.
    /// Pre-computed analytics metrics for dashboard display.
    /// </summary>
    public DbSet<AnalyticsSnapshot> AnalyticsSnapshots => Set<AnalyticsSnapshot>();

    // ============================================================================
    // AI Enhancement DbSets (Sprint 38+)
    // ============================================================================

    /// <summary>
    /// Gets the AIGenerationAudits DbSet.
    /// Tracks all AI generation requests, outputs, token usage, and user feedback.
    /// </summary>
    public DbSet<AIGenerationAudit> AIGenerationAudits => Set<AIGenerationAudit>();

    // ============================================================================
    // Coming Soon Analytics DbSets
    // ============================================================================

    /// <summary>
    /// Gets the WaitlistEntries DbSet.
    /// Tracks waitlist signups from the Coming Soon landing page.
    /// </summary>
    public DbSet<WaitlistEntry> WaitlistEntries => Set<WaitlistEntry>();

    /// <summary>
    /// Gets the ChatWidgetEvents DbSet.
    /// Tracks analytics events from the chat widget for funnel analysis.
    /// </summary>
    public DbSet<ChatWidgetEvent> ChatWidgetEvents => Set<ChatWidgetEvent>();

    // ============================================================================
    // Audit Fields Auto-Population & Multi-Tenancy
    // ============================================================================

    /// <summary>
    /// Saves all changes made in this context to the database.
    /// Automatically sets CreatedAt, UpdatedAt audit fields and BusinessId for multi-tenancy.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
    /// <returns>A task that represents the asynchronous save operation. The task result contains the number of state entries written to the database.</returns>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Get all entities that inherit from BaseEntity and are being added or modified
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity &&
                       (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                // Set CreatedAt for new entities
                entity.CreatedAt = DateTime.UtcNow;

                // Auto-set BusinessId for tenant-scoped entities
                SetBusinessIdIfApplicable(entry);
            }

            if (entry.State == EntityState.Modified)
            {
                // Set UpdatedAt for modified entities
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    // ============================================================================
    // Model Configuration
    // ============================================================================

    /// <summary>
    /// Configures the model that was discovered by convention from the entity types
    /// exposed in DbSet properties on the derived context.
    /// </summary>
    /// <param name="builder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure pgvector only for PostgreSQL provider (not InMemoryDatabase for unit tests)
        if (Database.IsNpgsql())
        {
            // Enable pgvector extension for vector similarity search
            builder.HasPostgresExtension("vector");

            // Configure Vector properties to avoid EF Core materialization issues
            // Vector type has no parameterless constructor, so we configure it to use a factory
            builder.Entity<FaqEmbedding>()
                .Property(e => e.Embedding)
                .HasColumnType("vector(1536)");

            builder.Entity<KnowledgeBaseChunk>()
                .Property(e => e.Embedding)
                .HasColumnType("vector(1536)");

            builder.Entity<ConversationMemory>()
                .Property(e => e.Embedding)
                .HasColumnType("vector(1536)");
        }
        else
        {
            // For InMemoryDatabase (unit tests), ignore Vector properties
            builder.Entity<FaqEmbedding>().Ignore(e => e.Embedding);
            builder.Entity<KnowledgeBaseChunk>().Ignore(e => e.Embedding);
            builder.Entity<ConversationMemory>().Ignore(e => e.Embedding);
        }

        // Configure Identity table names to use snake_case
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("users");
        });

        builder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("roles");
        });

        builder.Entity<IdentityUserRole<Guid>>(entity =>
        {
            entity.ToTable("user_roles");
        });

        builder.Entity<IdentityUserClaim<Guid>>(entity =>
        {
            entity.ToTable("user_claims");
        });

        builder.Entity<IdentityUserLogin<Guid>>(entity =>
        {
            entity.ToTable("user_logins");
        });

        builder.Entity<IdentityUserToken<Guid>>(entity =>
        {
            entity.ToTable("user_tokens");
        });

        builder.Entity<IdentityRoleClaim<Guid>>(entity =>
        {
            entity.ToTable("role_claims");
        });

        // Apply all entity configurations from the current assembly
        // This will automatically discover and apply all IEntityTypeConfiguration<T> implementations
        // Including the new workflow template system configurations
        builder.ApplyConfigurationsFromAssembly(typeof(QualiFlowDbContext).Assembly);

        // ============================================================================
        // Global Query Filters for Multi-Tenancy (S2-BE-005)
        // ============================================================================

        // Apply multi-tenancy query filters to all entities with BusinessId property
        // This ensures all queries are automatically filtered by the current user's business
        ApplyMultiTenancyQueryFilters(builder);
    }

    /// <summary>
    /// Applies global query filters for multi-tenancy to all entities with BusinessId property.
    /// Ensures all queries are automatically filtered by the current user's business context.
    /// Uses TryGetBusinessId() to safely handle unauthenticated contexts (e.g., registration).
    /// </summary>
    /// <param name="builder">The model builder.</param>
    private void ApplyMultiTenancyQueryFilters(ModelBuilder builder)
    {
        // Skip if no current user service (e.g., during migrations)
        if (_currentUserService == null)
        {
            return;
        }

        // Apply filters to all tenant-scoped entities
        ApplyBusinessIdFilter<Lead>(builder);
        ApplyBusinessIdFilter<Conversation>(builder);
        ApplyBusinessIdFilter<Channel>(builder);
        ApplyBusinessIdFilter<Booking>(builder);
        ApplyBusinessIdFilter<ApplicationUser>(builder);
        ApplyBusinessIdFilter<ScoringCriteria>(builder);
        ApplyBusinessIdFilter<Form>(builder);
        ApplyBusinessIdFilter<FormSubmission>(builder);
        ApplyBusinessIdFilter<ConversationNote>(builder);
        ApplyBusinessIdFilter<QuickReply>(builder);
        ApplyBusinessIdFilter<AutoAssignmentRule>(builder);
        ApplyBusinessIdFilter<OnboardingProgress>(builder);
        ApplyBusinessIdFilter<AIConfiguration>(builder);
        ApplyBusinessIdFilter<Contact>(builder);
        ApplyBusinessIdFilter<Deal>(builder);
        ApplyBusinessIdFilter<Webhook>(builder);
        ApplyBusinessIdFilter<ChatWidget>(builder);
        ApplyBusinessIdFilter<ChatSession>(builder);
        ApplyBusinessIdFilter<ChatMessage>(builder);
        ApplyBusinessIdFilter<Subscription>(builder);

        // Workflow template system entities
        ApplyBusinessIdFilter<BusinessWorkflow>(builder);
        ApplyBusinessIdFilter<WorkflowExecution>(builder);
        ApplyBusinessIdFilter<WorkflowApprovalRequest>(builder);

        // AI Enhancement entities (Sprint 38+)
        ApplyBusinessIdFilter<AIGenerationAudit>(builder);

        // Dependent entities without BusinessId must align with principals filtered above
        // Message -> Conversation.BusinessId
        builder.Entity<Message>().HasQueryFilter(m =>
            _currentUserService!.TryGetBusinessId() == null ||
            m.Conversation.BusinessId == _currentUserService.TryGetBusinessId());

        // WebhookDelivery -> Webhook.BusinessId
        builder.Entity<WebhookDelivery>().HasQueryFilter(wd =>
            _currentUserService!.TryGetBusinessId() == null ||
            wd.Webhook.BusinessId == _currentUserService.TryGetBusinessId());

        // MessageReadStatus -> User.BusinessId AND Message.Conversation.BusinessId
        builder.Entity<MessageReadStatus>().HasQueryFilter(mrs =>
            _currentUserService!.TryGetBusinessId() == null ||
            (mrs.User.BusinessId == _currentUserService.TryGetBusinessId() &&
             mrs.Message.Conversation.BusinessId == _currentUserService.TryGetBusinessId()));

        // RefreshToken -> User.BusinessId
        builder.Entity<RefreshToken>().HasQueryFilter(rt =>
            _currentUserService!.TryGetBusinessId() == null ||
            rt.User.BusinessId == _currentUserService.TryGetBusinessId());

        // Qualification -> Lead.BusinessId
        builder.Entity<Qualification>().HasQueryFilter(q =>
            _currentUserService!.TryGetBusinessId() == null ||
            q.Lead.BusinessId == _currentUserService.TryGetBusinessId());

        // ScoreHistory -> Lead.BusinessId
        builder.Entity<ScoreHistory>().HasQueryFilter(sh =>
            _currentUserService!.TryGetBusinessId() == null ||
            sh.Lead.BusinessId == _currentUserService.TryGetBusinessId());

        // MessageAttachment -> Message.Conversation.BusinessId
        builder.Entity<MessageAttachment>().HasQueryFilter(att =>
            _currentUserService!.TryGetBusinessId() == null ||
            att.Message.Conversation.BusinessId == _currentUserService.TryGetBusinessId());
    }

    /// <summary>
    /// Applies a multi-tenancy query filter to a specific entity type with BusinessId property.
    /// </summary>
    /// <typeparam name="TEntity">The entity type with BusinessId property.</typeparam>
    /// <param name="builder">The model builder.</param>
    private void ApplyBusinessIdFilter<TEntity>(ModelBuilder builder)
        where TEntity : class
    {
        builder.Entity<TEntity>().HasQueryFilter(e =>
            _currentUserService!.TryGetBusinessId() == null ||
            EF.Property<Guid>(e, "BusinessId") == _currentUserService.TryGetBusinessId());
    }

    /// <summary>
    /// Automatically sets BusinessId on entities that have this property.
    /// Only sets if BusinessId is empty (Guid.Empty) and current user is authenticated.
    /// </summary>
    /// <param name="entry">The entity entry being tracked.</param>
    private void SetBusinessIdIfApplicable(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        // Skip if no current user service (e.g., during migrations)
        if (_currentUserService == null || !_currentUserService.IsAuthenticated())
        {
            return;
        }

        // Check if entity type has BusinessId property before trying to access it
        var entityType = entry.Metadata;
        var businessIdProperty = entityType.FindProperty("BusinessId");

        if (businessIdProperty == null)
        {
            // Entity doesn't have BusinessId property (e.g., Business entity itself)
            return;
        }

        // Get the property value
        var propertyEntry = entry.Property("BusinessId");
        var currentBusinessId = (Guid?)propertyEntry.CurrentValue;

        // Only set if BusinessId is empty
        if (currentBusinessId == null || currentBusinessId == Guid.Empty)
        {
            propertyEntry.CurrentValue = _currentUserService.GetBusinessId();
        }
    }
}

