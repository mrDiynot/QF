// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Seeds;

/// <summary>
/// Seeds the chat widget for the Coming Soon landing page.
/// </summary>
public static class ComingSoonChatWidgetSeeder
{
    private static readonly Guid SystemBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");
    private static readonly Guid ComingSoonWidgetId = Guid.Parse("00000000-0000-0000-0000-000000000101");

    /// <summary>
    /// Seeds the coming soon chat widget.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public static async Task SeedAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Seeding Coming Soon chat widget...");

        await EnsureSystemBusinessAsync(context, logger, cancellationToken);
        await EnsureComingSoonWidgetAsync(context, logger, cancellationToken);
        await EnsureKnowledgeBaseAsync(context, logger, cancellationToken);
        await EnsureAIConfigurationAsync(context, logger, cancellationToken);

        logger.LogInformation("Coming Soon chat widget seeding completed.");
    }

    private static async Task EnsureSystemBusinessAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var exists = await context.Businesses
            .AnyAsync(b => b.Id == SystemBusinessId, cancellationToken);

        if (exists)
        {
            logger.LogInformation("System business already exists.");
            return;
        }

        var systemBusiness = new Business
        {
            Id = SystemBusinessId,
            Name = "QualiFlowAI Platform",
            Industry = "Technology",
            Description = "System business for platform-wide features",
            Email = "platform@qualiflowai.com",
            Website = "https://qualiflowai.com",
            Timezone = "America/New_York",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        context.Businesses.Add(systemBusiness);
        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Created system business: {BusinessId}", SystemBusinessId);
    }

    private static async Task EnsureComingSoonWidgetAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var exists = await context.ChatWidgets
            .AnyAsync(w => w.Id == ComingSoonWidgetId, cancellationToken);

        if (exists)
        {
            logger.LogInformation("Coming Soon chat widget already exists.");
            return;
        }

        var widget = new ChatWidget
        {
            Id = ComingSoonWidgetId,
            BusinessId = SystemBusinessId,
            Name = "Coming Soon Landing Page Chat",
            WidgetKey = "coming-soon-widget",
            IsActive = true,
            AllowedDomains = string.Empty,
            PrimaryColor = "#6B2D9E",
            Position = "bottom-right",
            GreetingMessage = "Hi! 👋 I'm the QualiflowAI assistant. I can answer questions about our AI-powered customer journey platform. What would you like to know?",
            OfflineMessage = "Thanks for your interest! We're currently finalizing QualiflowAI. Join our waitlist to be notified when we launch!",
            ShowPreChatForm = false,
            PreChatFormFieldsJson = "[]",
            EnableAIResponse = true,
            AIResponseDelayMs = 1000,
            SessionTimeoutMinutes = 60,
            AutoCreateLead = true,
            BusinessHoursJson = "{}",
            CustomCss = string.Empty,
            CreatedAt = DateTime.UtcNow,
        };

        context.ChatWidgets.Add(widget);
        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Created Coming Soon chat widget: {WidgetId}", ComingSoonWidgetId);
    }

    private static async Task EnsureKnowledgeBaseAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var existingCount = await context.Set<BusinessKnowledgeBase>()
            .CountAsync(k => k.BusinessId == SystemBusinessId, cancellationToken);

        if (existingCount > 0)
        {
            logger.LogInformation("Knowledge base entries already exist ({Count} entries).", existingCount);
            return;
        }

        var entries = GetQualiflowFaqEntries();
        context.Set<BusinessKnowledgeBase>().AddRange(entries);
        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Created {Count} knowledge base entries for QualiflowAI.", entries.Count);
    }

    private static async Task EnsureAIConfigurationAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<AIConfiguration>()
            .AnyAsync(c => c.BusinessId == SystemBusinessId, cancellationToken);

        if (exists)
        {
            logger.LogInformation("AI configuration already exists for system business.");
            return;
        }

        var config = new AIConfiguration
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            Persona = "friendly",
            GreetingMessage = "Hi! 👋 I'm the QualiflowAI assistant. I can answer questions about our AI-powered customer journey platform. What would you like to know?",
            BusinessHours = "24-7",
            FollowUpPreference = "email-first",
            QualificationThreshold = 70,
            ScoringWeights = "{}",
            UseIndustryQuestions = false,
            CreatedAt = DateTime.UtcNow,
        };

        context.Set<AIConfiguration>().Add(config);
        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Created AI configuration for system business.");
    }

    private static List<BusinessKnowledgeBase> GetQualiflowFaqEntries()
    {
        var entries = new List<BusinessKnowledgeBase>();
        var now = DateTime.UtcNow;

        // About QualiFlowAI
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.FAQ,
            Title = "What is QualiFlowAI?",
            Content = "QualiFlowAI is an AI-powered customer-journey platform designed to turn leads into revenue. It will capture leads from multiple channels, engage them with conversational AI, qualify and score intent, book appointments, follow up automatically, collect reviews, and re-engage inactive customers — all without manual effort.",
            Category = "About",
            Priority = 100,
            Keywords = "qualiflow,what is,about,platform,product",
            IsActive = true,
            CreatedAt = now,
        });

        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.FAQ,
            Title = "How does QualiFlowAI work?",
            Content = "QualiFlowAI is designed to run the full customer lifecycle from first contact through post-purchase. It will automatically capture leads, respond instantly with AI, ask qualification questions and assign lead scores, book appointments, create and send proposals, track proposal acceptance, follow up automatically, collect reviews, and update your CRM. All powered by our Journey Automation Engine™.",
            Category = "About",
            Priority = 95,
            Keywords = "how,work,automation,journey,engine",
            IsActive = true,
            CreatedAt = now,
        });

        // Features
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.Product,
            Title = "What features does QualiFlowAI include?",
            Content = "QualiFlowAI will include: Journey Automation Engine™ (core orchestration), AI Voice (inbound & outbound calls), Omnichannel Lead Capture (web chat, SMS, phone, Instagram, Facebook, email, QR codes), Built-In CRM with AI Segmentation, Forms & Surveys, Proposals, and Analytics & Reporting dashboards.",
            Category = "Features",
            Priority = 90,
            Keywords = "features,modules,capabilities,what can",
            IsActive = true,
            CreatedAt = now,
        });

        // Pre-built Journeys
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.Product,
            Title = "What pre-built customer journeys are available?",
            Content = "QualiFlowAI will include 10 pre-built AI journeys: 1) New Lead → Qualification → Booking, 2) Missed Call Recovery, 3) No-Show Recovery, 4) Review & Survey Follow-Up, 5) Cold Lead Revival, 6) Retention & Re-Engagement, 7) Proposal Creation & Assignment, 8) Proposal Sending & Acceptance, 9) Abandoned Form Recovery, and 10) Post-Purchase Follow-Up. These will work out of the box and adapt automatically based on lead behavior.",
            Category = "Features",
            Priority = 85,
            Keywords = "journey,workflow,automation,pre-built,templates",
            IsActive = true,
            CreatedAt = now,
        });

        // CRM & Integrations
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.FAQ,
            Title = "Does QualiFlowAI integrate with my CRM?",
            Content = "Yes! QualiFlowAI will include a built-in CRM so you can start immediately without setup. If you already use a CRM, QualiFlowAI is designed to sync in real time with external systems like Salesforce, HubSpot, Zoho, Monday, and Pipedrive. Contact data, conversation history, appointments, and lead status will stay aligned across platforms.",
            Category = "Integrations",
            Priority = 80,
            Keywords = "crm,integrate,salesforce,hubspot,zoho,monday,pipedrive",
            IsActive = true,
            CreatedAt = now,
        });

        // Channels
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.Product,
            Title = "What communication channels does QualiFlowAI support?",
            Content = "QualiFlowAI is designed to capture and engage leads across: Web chat, SMS/Text, Phone/Voice, WhatsApp, Instagram, Facebook, QR codes, and Web forms. All conversations will be unified into a single inbox where teams can monitor or step in when needed.",
            Category = "Features",
            Priority = 80,
            Keywords = "channel,sms,whatsapp,instagram,facebook,voice,chat,omnichannel",
            IsActive = true,
            CreatedAt = now,
        });

        // Early Access
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.FAQ,
            Title = "How do I get early access?",
            Content = "Join our waitlist by entering your email on the website! Early-access members receive priority product access, exclusive webinars and education, early feature previews, and potential founding-member pricing benefits. We're launching soon!",
            Category = "Launch",
            Priority = 90,
            Keywords = "early access,waitlist,launch,when,beta,signup",
            IsActive = true,
            CreatedAt = now,
        });

        // AI Capabilities
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.Product,
            Title = "How does the AI work?",
            Content = "QualiFlowAI's AI is designed to feel natural, conversational, and human. It will respond instantly 24/7, ask smart qualification questions, book appointments, follow up automatically, re-engage cold leads, and adapt based on conversation history and outcomes. You'll be able to customize greeting scripts, qualification questions, call-transfer rules, and knowledge-base content.",
            Category = "AI",
            Priority = 85,
            Keywords = "ai,artificial intelligence,bot,automated,smart,learn",
            IsActive = true,
            CreatedAt = now,
        });

        // Security
        entries.Add(new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = SystemBusinessId,
            EntryType = KnowledgeEntryType.FAQ,
            Title = "Is QualiFlowAI secure?",
            Content = "Absolutely! Security is a top priority for QualiFlowAI. The platform will feature industry-standard encryption, secure data handling, safe CRM synchronization, and privacy best practices. Enterprise plans will include additional security and compliance options.",
            Category = "Security",
            Priority = 70,
            Keywords = "security,secure,safe,privacy,data,protection,compliance",
            IsActive = true,
            CreatedAt = now,
        });

        return entries;
    }
}
