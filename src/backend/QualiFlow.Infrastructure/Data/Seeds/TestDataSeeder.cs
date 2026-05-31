// -----------------------------------------------------------------------
// <copyright file="TestDataSeeder.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

// Suppress weak random generator warnings - acceptable for test data seeding
#pragma warning disable SCS0005, CA5394

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Entities.CMS;
using QualiFlow.Domain.Entities.Support;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Seeds;

/// <summary>
/// Seeds comprehensive test data for development and testing.
/// Creates businesses, users, subscriptions, support tickets, and CMS content.
/// </summary>
public static class TestDataSeeder
{
    /// <summary>
    /// Seeds all test data for the admin portal.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public static async Task SeedTestDataAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Starting test data seeding...");

        // Seed subscription plans first (required for subscriptions)
        await SeedSubscriptionPlansAsync(context, logger, cancellationToken);

        // Seed businesses with users and subscriptions
        await SeedBusinessesAsync(context, logger, cancellationToken);

        // Seed support tickets
        await SeedSupportTicketsAsync(context, logger, cancellationToken);

        // Seed CMS content
        await SeedCmsContentAsync(context, logger, cancellationToken);

        // Seed audit logs
        await SeedAuditLogsAsync(context, logger, cancellationToken);

        logger.LogInformation("Test data seeding completed successfully.");
    }

    private static async Task SeedSubscriptionPlansAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.SubscriptionPlans.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Subscription plans already exist. Skipping.");
            return;
        }

        var plans = new List<SubscriptionPlan>
        {
            new()
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = "freeflow",
                DisplayName = "FreeFlow",
                Description = "Perfect for trying out QualiFlow",
                PriceMonthly = 0,
                AllowsTrial = true,
                TrialDays = 7,
                IsActive = true,
                IsPublic = true,
                Version = 1,
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Name = "smartflow",
                DisplayName = "SmartFlow",
                Description = "For growing businesses ready to automate",
                PriceMonthly = 199,
                PriceQuarterly = 175,
                PriceYearly = 1908,
                DiscountQuarterly = 12,
                DiscountAnnual = 20,
                OnboardingPrice = 700,
                OnboardingRequired = false,
                AllowsTrial = false,
                TrialDays = 0,
                IsActive = true,
                IsPublic = true,
                Version = 1,
                SortOrder = 2,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Name = "ultraflow",
                DisplayName = "UltraFlow",
                Description = "Most popular for scaling teams",
                PriceMonthly = 699,
                PriceQuarterly = 629,
                PriceYearly = 6708,
                DiscountQuarterly = 10,
                DiscountAnnual = 20,
                OnboardingPrice = 1500,
                OnboardingRequired = true,
                AllowsTrial = false,
                TrialDays = 0,
                IsActive = true,
                IsPublic = true,
                Version = 1,
                SortOrder = 3,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                Name = "enterprise",
                DisplayName = "Enterprise",
                Description = "Custom solutions for large organizations",
                PriceMonthly = 499,
                PriceYearly = 399,
                DiscountAnnual = 20,
                OnboardingPrice = 2500,
                OnboardingRequired = true,
                AllowsTrial = false,
                TrialDays = 0,
                IsActive = true,
                IsPublic = true,
                Version = 1,
                SortOrder = 4,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.SubscriptionPlans.AddRangeAsync(plans, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} subscription plans.", plans.Count);
    }

    private static async Task SeedBusinessesAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.Businesses.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Businesses already exist. Skipping.");
            return;
        }

        var random = new Random(42); // Fixed seed for reproducibility
        var industries = new[] { "Technology", "Healthcare", "Finance", "Retail", "Real Estate", "Consulting", "Education", "Manufacturing" };
        var companySizes = new[] { "1-10", "11-50", "51-200", "201-500" };
        var plans = await context.SubscriptionPlans.ToListAsync(cancellationToken);

        var businesses = new List<Business>();
        var subscriptions = new List<Subscription>();
        var users = new List<ApplicationUser>();

        // Create 50 test businesses
        for (int i = 1; i <= 50; i++)
        {
            var businessId = Guid.NewGuid();
            var plan = plans[random.Next(plans.Count)];
            var status = GetRandomStatus(random, plan.Name);
            var createdAt = DateTime.UtcNow.AddDays(-random.Next(1, 365));

            var business = new Business
            {
                Id = businessId,
                Name = GetBusinessName(i),
                Email = $"contact@business{i}.com",
                Phone = $"+1555{random.Next(1000000, 9999999)}",
                Industry = industries[random.Next(industries.Length)],
                CompanySize = companySizes[random.Next(companySizes.Length)],
                Timezone = "America/New_York",
                Website = $"https://www.business{i}.com",
                IsActive = status != SubscriptionStatus.Suspended,
                CreatedAt = createdAt
            };
            businesses.Add(business);

            // Create subscription for business
            var subscription = new Subscription
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                PlanId = plan.Id,
                PlanVersion = plan.Version,
                Status = status,
                BillingCycle = random.Next(2) == 0 ? "monthly" : "yearly",
                MonthlyAmount = plan.PriceMonthly,
                AnnualAmount = plan.PriceYearly,
                Currency = "USD",
                CurrentPeriodStart = DateTime.UtcNow.AddDays(-random.Next(1, 30)),
                CurrentPeriodEnd = DateTime.UtcNow.AddDays(random.Next(1, 30)),
                TrialStart = status == SubscriptionStatus.Trial ? DateTime.UtcNow.AddDays(-random.Next(1, 7)) : null,
                TrialEnd = status == SubscriptionStatus.Trial ? DateTime.UtcNow.AddDays(random.Next(1, 7)) : null,
                CreatedAt = createdAt
            };
            subscriptions.Add(subscription);

            // Create 1-5 users per business
            var userCount = random.Next(1, 6);
            for (int j = 1; j <= userCount; j++)
            {
                var user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    BusinessId = businessId,
                    Email = $"user{j}@business{i}.com",
                    NormalizedEmail = $"USER{j}@BUSINESS{i}.COM",
                    UserName = $"user{j}@business{i}.com",
                    NormalizedUserName = $"USER{j}@BUSINESS{i}.COM",
                    FirstName = GetFirstName(random),
                    LastName = GetLastName(random),
                    EmailConfirmed = true,
                    IsActive = true,
                    PhoneNumber = $"+1555{random.Next(1000000, 9999999)}",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestUser123!"),
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    CreatedAt = createdAt.AddDays(random.Next(0, 30))
                };
                users.Add(user);
            }
        }

        await context.Businesses.AddRangeAsync(businesses, cancellationToken);
        await context.Subscriptions.AddRangeAsync(subscriptions, cancellationToken);
        await context.Users.AddRangeAsync(users, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded {BusinessCount} businesses with {UserCount} users.", businesses.Count, users.Count);

        // Seed Voice channel for inbound call testing
        await SeedVoiceChannelAsync(context, logger, businesses[0].Id, cancellationToken);
    }

    private static async Task SeedVoiceChannelAsync(
        QualiFlowDbContext context,
        ILogger logger,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        // Check if Voice channel with toll-free number already exists
        var tollFreeNumber = "+18776765329";
        var existingChannel = await context.Channels
            .FirstOrDefaultAsync(c => c.PhoneNumber == tollFreeNumber, cancellationToken);

        if (existingChannel != null)
        {
            logger.LogInformation("Voice channel with toll-free number already exists. Skipping.");
            return;
        }

        var voiceChannel = new Channel
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Type = ChannelType.Voice,
            Name = "AI Voice - Toll Free",
            PhoneNumber = tollFreeNumber,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await context.Channels.AddAsync(voiceChannel, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded Voice channel with toll-free number {PhoneNumber} for business {BusinessId}", tollFreeNumber, businessId);
    }

    private static async Task SeedSupportTicketsAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.SupportTickets.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Support tickets already exist. Skipping.");
            return;
        }

        var businesses = await context.Businesses.Take(20).ToListAsync(cancellationToken);
        var adminUsers = await context.AdminUsers.ToListAsync(cancellationToken);
        var random = new Random(42);

        var categories = Enum.GetValues<TicketCategory>();
        var priorities = Enum.GetValues<TicketPriority>();
        var statuses = new[] { TicketStatus.Open, TicketStatus.InProgress, TicketStatus.Resolved, TicketStatus.Closed };
        var ticketCounter = 1;

        var tickets = new List<SupportTicket>();
        var messages = new List<TicketMessage>();

        foreach (var business in businesses)
        {
            // Create 1-3 tickets per business
            var ticketCount = random.Next(1, 4);
            for (int i = 0; i < ticketCount; i++)
            {
                var ticketId = Guid.NewGuid();
                var status = statuses[random.Next(statuses.Length)];
                var createdAt = DateTime.UtcNow.AddDays(-random.Next(1, 60));

                var ticket = new SupportTicket
                {
                    Id = ticketId,
                    TicketNumber = $"TKT-2024-{ticketCounter++:D5}",
                    BusinessId = business.Id,
                    ReporterEmail = business.Email,
                    ReporterName = $"User at {business.Name}",
                    Subject = GetTicketSubject(random),
                    Description = "This is a test support ticket for development purposes.",
                    Category = categories[random.Next(categories.Length)],
                    Priority = priorities[random.Next(priorities.Length)],
                    Status = status,
                    AssignedToAdminId = adminUsers.Count > 0 ? adminUsers[random.Next(adminUsers.Count)].Id : null,
                    CreatedAt = createdAt,
                    ResolvedAt = status == TicketStatus.Resolved || status == TicketStatus.Closed
                        ? createdAt.AddDays(random.Next(1, 5))
                        : null
                };
                tickets.Add(ticket);

                // Add 1-5 messages per ticket
                var messageCount = random.Next(1, 6);
                for (int j = 0; j < messageCount; j++)
                {
                    var isCustomer = j % 2 == 0;
                    var message = new TicketMessage
                    {
                        Id = Guid.NewGuid(),
                        TicketId = ticketId,
                        Content = $"This is message {j + 1} for the ticket. Lorem ipsum dolor sit amet.",
                        IsInternal = false,
                        SenderName = isCustomer ? "Customer User" : "Support Agent",
                        SenderEmail = isCustomer ? $"user@business{i}.com" : "support@qualiflow.ai",
                        Type = TicketMessageType.Reply,
                        CreatedAt = createdAt.AddHours(j * 2)
                    };
                    messages.Add(message);
                }
            }
        }

        await context.SupportTickets.AddRangeAsync(tickets, cancellationToken);
        await context.TicketMessages.AddRangeAsync(messages, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded {TicketCount} support tickets with {MessageCount} messages.", tickets.Count, messages.Count);
    }

    private static async Task SeedCmsContentAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        // Seed FAQs
        if (!await context.FrequentlyAskedQuestions.AnyAsync(cancellationToken))
        {
            var faqs = new List<FrequentlyAskedQuestion>
            {
                new() { Id = Guid.NewGuid(), Question = "What is QualiFlow?", Answer = "QualiFlow is an AI-powered omnichannel lead qualification and conversation management platform.", Category = "General", IsActive = true, DisplayOrder = 1, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Question = "How does the AI agent work?", Answer = "Our AI agents use advanced GPT-4 technology to understand and respond to customer inquiries naturally.", Category = "Features", IsActive = true, DisplayOrder = 2, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Question = "What communication channels are supported?", Answer = "QualiFlow supports SMS, Email, Phone (AI Voice), Web Chat, WhatsApp, Facebook Messenger, and Instagram DMs.", Category = "Features", IsActive = true, DisplayOrder = 3, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Question = "Can I try QualiFlow for free?", Answer = "Yes! We offer a 7-day free trial with our FreeFlow plan. No credit card required.", Category = "Pricing", IsActive = true, DisplayOrder = 4, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Question = "How do I upgrade my plan?", Answer = "You can upgrade your plan anytime from the Settings page. Changes take effect immediately.", Category = "Pricing", IsActive = true, DisplayOrder = 5, CreatedAt = DateTime.UtcNow },
            };

            await context.FrequentlyAskedQuestions.AddRangeAsync(faqs, cancellationToken);
            logger.LogInformation("Seeded {Count} FAQs.", faqs.Count);
        }

        // Seed Testimonials
        if (!await context.Testimonials.AnyAsync(cancellationToken))
        {
            var testimonials = new List<Testimonial>
            {
                new() { Id = Guid.NewGuid(), AuthorName = "Sarah Johnson", CompanyName = "TechStart Inc", AuthorRole = "CEO", Quote = "QualiFlow transformed our lead management. We've increased conversions by 40%!", Rating = 5, IsActive = true, DisplayOrder = 1, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), AuthorName = "Michael Chen", CompanyName = "GrowthHub", AuthorRole = "Sales Director", Quote = "The AI agents handle inquiries 24/7. Our response time dropped from hours to seconds.", Rating = 5, IsActive = true, DisplayOrder = 2, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), AuthorName = "Emily Rodriguez", CompanyName = "Acme Realty", AuthorRole = "Broker", Quote = "As a real estate broker, QualiFlow helps me qualify leads while I'm showing properties.", Rating = 5, IsActive = true, DisplayOrder = 3, CreatedAt = DateTime.UtcNow },
            };

            await context.Testimonials.AddRangeAsync(testimonials, cancellationToken);
            logger.LogInformation("Seeded {Count} testimonials.", testimonials.Count);
        }

        // Seed Blog Posts
        if (!await context.BlogPosts.AnyAsync(cancellationToken))
        {
            var blogPosts = new List<BlogPost>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "The Future of AI-Powered Lead Qualification",
                    Slug = "future-of-ai-powered-lead-qualification",
                    Excerpt = "Discover how artificial intelligence is revolutionizing the way businesses qualify and nurture leads, turning cold prospects into hot opportunities.",
                    Content = BuildBlogContent1(),
                    FeaturedImagePath = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
                    AuthorName = "Alex Thompson",
                    AuthorAvatarPath = "/images/authors/alex.jpg",
                    Category = "AI & Technology",
                    Tags = "AI,Lead Qualification,Sales,Automation",
                    MetaTitle = "The Future of AI-Powered Lead Qualification | QualiflowAI",
                    MetaDescription = "Learn how AI is transforming lead qualification and helping businesses convert more prospects into customers.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-3),
                    IsFeatured = true,
                    ReadingTimeMinutes = 5,
                    ViewCount = 1247,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "5 Customer Journey Templates Every Business Needs",
                    Slug = "5-customer-journey-templates-every-business-needs",
                    Excerpt = "Pre-built customer journey templates that help you engage leads at every touchpoint. From first contact to closed deal.",
                    Content = BuildBlogContent2(),
                    FeaturedImagePath = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
                    AuthorName = "Maria Santos",
                    AuthorAvatarPath = "/images/authors/maria.jpg",
                    Category = "Best Practices",
                    Tags = "Customer Journey,Templates,Automation,Marketing",
                    MetaTitle = "5 Customer Journey Templates Every Business Needs | QualiflowAI",
                    MetaDescription = "Discover the essential customer journey templates that will help your business convert more leads.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-7),
                    IsFeatured = true,
                    ReadingTimeMinutes = 7,
                    ViewCount = 892,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Omnichannel Communication: Why Your Business Needs It",
                    Slug = "omnichannel-communication-why-your-business-needs-it",
                    Excerpt = "SMS, WhatsApp, Email, Voice - learn why reaching customers on their preferred channel is the key to higher engagement.",
                    Content = BuildBlogContent3(),
                    FeaturedImagePath = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
                    AuthorName = "James Wilson",
                    AuthorAvatarPath = "/images/authors/james.jpg",
                    Category = "Communication",
                    Tags = "Omnichannel,SMS,WhatsApp,Email,Voice",
                    MetaTitle = "Omnichannel Communication: Why Your Business Needs It | QualiflowAI",
                    MetaDescription = "Understand the importance of omnichannel communication and how it can transform your customer engagement.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-14),
                    IsFeatured = false,
                    ReadingTimeMinutes = 6,
                    ViewCount = 654,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "How to Integrate Your CRM with QualiflowAI",
                    Slug = "how-to-integrate-crm-with-qualiflowai",
                    Excerpt = "Step-by-step guide to connecting HubSpot, Salesforce, and other CRMs with QualiflowAI for seamless lead management.",
                    Content = BuildBlogContent4(),
                    FeaturedImagePath = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
                    AuthorName = "David Park",
                    AuthorAvatarPath = "/images/authors/david.jpg",
                    Category = "Integrations",
                    Tags = "CRM,HubSpot,Salesforce,Integration,API",
                    MetaTitle = "How to Integrate Your CRM with QualiflowAI | QualiflowAI",
                    MetaDescription = "Complete guide to integrating your CRM system with QualiflowAI for automated lead syncing.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-21),
                    IsFeatured = false,
                    ReadingTimeMinutes = 8,
                    ViewCount = 1089,
                    CreatedAt = DateTime.UtcNow.AddDays(-22),
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Real Estate Lead Generation: A Complete Guide",
                    Slug = "real-estate-lead-generation-complete-guide",
                    Excerpt = "Learn how real estate professionals are using AI to capture, qualify, and convert more leads than ever before.",
                    Content = BuildBlogContent5(),
                    FeaturedImagePath = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop",
                    AuthorName = "Jennifer Lee",
                    AuthorAvatarPath = "/images/authors/jennifer.jpg",
                    Category = "Industry Guides",
                    Tags = "Real Estate,Lead Generation,AI,Property",
                    MetaTitle = "Real Estate Lead Generation: A Complete Guide | QualiflowAI",
                    MetaDescription = "The ultimate guide to real estate lead generation using AI-powered tools and automation.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-28),
                    IsFeatured = false,
                    ReadingTimeMinutes = 10,
                    ViewCount = 2341,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                },
            };

            await context.BlogPosts.AddRangeAsync(blogPosts, cancellationToken);
            logger.LogInformation("Seeded {Count} blog posts.", blogPosts.Count);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

#pragma warning disable S3400 // Methods should not return constants - blog content methods intentionally return fixed HTML
    private static string BuildBlogContent1() =>
        "<h2>Introduction</h2><p>In today's fast-paced business environment, the ability to quickly and accurately qualify leads can make or break your sales pipeline. Traditional lead qualification methods are time-consuming, inconsistent, and often miss critical opportunities. Enter AI-powered lead qualification – a game-changing approach that's transforming how businesses identify and nurture their most promising prospects.</p><h2>What is AI-Powered Lead Qualification?</h2><p>AI-powered lead qualification uses machine learning algorithms and natural language processing to analyze lead data, conversations, and behaviors. Unlike traditional scoring methods that rely on static rules, AI systems learn from your historical data to identify patterns that indicate a high-quality lead.</p><h2>Key Benefits</h2><ul><li><strong>24/7 Availability:</strong> AI agents work around the clock, ensuring no lead goes unattended</li><li><strong>Consistent Qualification:</strong> Every lead is evaluated using the same criteria, eliminating human bias</li><li><strong>Instant Response:</strong> Leads receive immediate engagement, dramatically improving conversion rates</li><li><strong>Scalability:</strong> Handle thousands of leads simultaneously without adding headcount</li></ul><h2>The BANT Framework, Reimagined</h2><p>QualiflowAI uses an enhanced BANT (Budget, Authority, Need, Timeline) framework powered by AI to score leads in real-time. Our system analyzes conversation context, tone, and intent to provide accurate qualification scores that help your sales team prioritize their efforts.</p><h2>Getting Started</h2><p>Ready to transform your lead qualification process? Start with a free trial of QualiflowAI and see the difference AI can make in your sales pipeline.</p>";

    private static string BuildBlogContent2() =>
        "<h2>Why Customer Journeys Matter</h2><p>A well-designed customer journey can increase conversion rates by up to 400%. Yet many businesses still rely on disconnected touchpoints that leave prospects confused and disengaged. Pre-built customer journey templates provide a proven framework for guiding leads from awareness to purchase.</p><h2>Template 1: The Welcome Sequence</h2><p>First impressions matter. This template delivers a series of personalized messages that introduce your brand, set expectations, and begin the qualification process. Includes SMS, email, and chat touchpoints.</p><h2>Template 2: The Nurture Flow</h2><p>Not every lead is ready to buy immediately. This template keeps your brand top-of-mind with valuable content, case studies, and gentle reminders – all timed perfectly based on engagement signals.</p><h2>Template 3: The Booking Journey</h2><p>Perfect for service businesses, this template automates the entire appointment booking process. From initial inquiry to confirmation and reminder, every step is handled automatically.</p><h2>Template 4: The Re-engagement Campaign</h2><p>Win back cold leads with this strategic re-engagement template. Uses behavioral triggers and personalized offers to reignite interest in dormant prospects.</p><h2>Template 5: The Post-Purchase Follow-up</h2><p>The journey doesn't end at purchase. This template ensures customer satisfaction, encourages reviews, and identifies upsell opportunities.</p><h2>Customization is Key</h2><p>While templates provide a starting point, the best results come from customizing journeys to match your unique business needs. QualiflowAI makes it easy to modify any template with our drag-and-drop journey builder.</p>";

    private static string BuildBlogContent3() =>
        "<h2>The Omnichannel Imperative</h2><p>Today's customers don't think in channels – they think in conversations. They expect to start a conversation on one channel and continue it seamlessly on another. Businesses that fail to meet this expectation risk losing customers to more agile competitors.</p><h2>Understanding Your Channels</h2><h3>SMS</h3><p>With 98% open rates, SMS remains one of the most effective channels for urgent communications. Ideal for appointment reminders, quick updates, and time-sensitive offers.</p><h3>WhatsApp</h3><p>Over 2 billion users worldwide make WhatsApp essential for international businesses. Rich media support allows for product catalogs, documents, and interactive messages.</p><h3>Email</h3><p>Still the backbone of business communication. Perfect for detailed information, newsletters, and formal correspondence.</p><h3>Voice (AI)</h3><p>AI-powered voice calls provide a personal touch at scale. Ideal for lead qualification, appointment scheduling, and customer support.</p><h2>The Unified Inbox Advantage</h2><p>Managing multiple channels doesn't have to mean multiple platforms. QualiflowAI's unified inbox brings all conversations into one view, ensuring no message is ever missed and providing complete context for every interaction.</p><h2>Best Practices</h2><ul><li>Let customers choose their preferred channel</li><li>Maintain conversation context across channels</li><li>Use channel-appropriate message formats</li><li>Respect opt-out preferences universally</li></ul>";

    private static string BuildBlogContent4() =>
        "<h2>Why CRM Integration Matters</h2><p>Your CRM is the source of truth for customer data. Integrating QualiflowAI with your CRM ensures that every conversation, qualification score, and lead update flows seamlessly between systems – eliminating manual data entry and reducing errors.</p><h2>Supported CRM Platforms</h2><ul><li><strong>HubSpot:</strong> Native integration with full bi-directional sync</li><li><strong>Salesforce:</strong> Complete integration including custom objects</li><li><strong>Pipedrive:</strong> Real-time lead and deal synchronization</li><li><strong>Zoho CRM:</strong> Automated contact and lead management</li><li><strong>Custom CRMs:</strong> API access for any system</li></ul><h2>Setting Up HubSpot Integration</h2><ol><li>Navigate to Settings &gt; Integrations in QualiflowAI</li><li>Click Connect HubSpot and authorize the connection</li><li>Map your custom fields between systems</li><li>Configure sync preferences (real-time or scheduled)</li><li>Test the integration with a sample lead</li></ol><h2>What Gets Synced</h2><p>QualiflowAI syncs contacts, companies, deals, conversation history, qualification scores, and custom properties. You control exactly what data flows in each direction.</p><h2>Advanced Features</h2><p>Use our workflow automation to trigger CRM actions based on conversation outcomes. For example, automatically create a deal when a lead is qualified as hot, or add a task for your sales rep when a meeting is booked.</p>";

    private static string BuildBlogContent5() =>
        "<h2>The Real Estate Lead Challenge</h2><p>Real estate professionals face a unique challenge: leads come from dozens of sources, expect instant responses, and require significant nurturing before they're ready to buy or sell. Traditional methods simply can't keep up with the volume and speed required in today's market.</p><h2>AI-Powered Lead Capture</h2><p>QualiflowAI's smart forms and chat widgets capture leads from your website, social media, and listing platforms. AI instantly engages each lead, gathering key information about their property needs, budget, and timeline.</p><h2>Automated Qualification</h2><p>Not all real estate leads are created equal. Our AI qualification system evaluates each lead based on:</p><ul><li>Buying/selling timeline</li><li>Pre-approval status</li><li>Property requirements</li><li>Budget range</li><li>Motivation level</li></ul><h2>Nurture Sequences That Work</h2><p>Keep leads engaged with automated property alerts, market updates, and personalized content. Our real estate-specific templates are designed by industry experts to match buyer and seller journeys.</p><h2>Appointment Scheduling</h2><p>Let AI handle the back-and-forth of scheduling showings and consultations. Integrated calendar sync ensures no double bookings, and automated reminders reduce no-shows by 60%.</p><h2>Success Story</h2><p>Since implementing QualiflowAI, our team has doubled our monthly closings while actually reducing time spent on lead management. The AI handles the initial qualification so we can focus on what we do best – closing deals. – Top-producing agent, Miami FL</p>";
#pragma warning restore S3400

    private static async Task SeedAuditLogsAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.AdminAuditLogs.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Audit logs already exist. Skipping.");
            return;
        }

        var adminUsers = await context.AdminUsers.ToListAsync(cancellationToken);
        if (adminUsers.Count == 0)
        {
            logger.LogWarning("No admin users found. Skipping audit log seeding.");
            return;
        }

        var random = new Random(42);
        var actions = new[] { "login", "view_business", "suspend_business", "update_user", "export_data", "view_ticket", "resolve_ticket" };
        var entityTypes = new[] { "Business", "User", "Subscription", "Ticket", "Export" };

        var logs = new List<AdminAuditLog>();
        for (int i = 0; i < 100; i++)
        {
            var admin = adminUsers[random.Next(adminUsers.Count)];
            var log = new AdminAuditLog
            {
                Id = Guid.NewGuid(),
                AdminUserId = admin.Id,
                Action = actions[random.Next(actions.Length)],
                EntityType = entityTypes[random.Next(entityTypes.Length)],
                EntityId = Guid.NewGuid().ToString(),
                OldValues = null,
                NewValues = "{}",
                IpAddress = $"192.168.1.{random.Next(1, 255)}",
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                HttpMethod = "GET",
                RequestPath = "/api/v1/admin/dashboard",
                StatusCode = 200,
                Success = true,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 90))
            };
            logs.Add(log);
        }

        await context.AdminAuditLogs.AddRangeAsync(logs, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} audit logs.", logs.Count);
    }

    private static SubscriptionStatus GetRandomStatus(Random random, string planName)
    {
        if (planName == "freeflow")
        {
            return random.Next(3) == 0 ? SubscriptionStatus.Trial : SubscriptionStatus.Active;
        }

        var weights = new[] { 0.1, 0.7, 0.1, 0.05, 0.05 }; // Trial, Active, Suspended, Cancelled, Expired
        var r = random.NextDouble();
        var cumulative = 0.0;
        for (int i = 0; i < weights.Length; i++)
        {
            cumulative += weights[i];
            if (r < cumulative)
            {
                return (SubscriptionStatus)i;
            }
        }

        return SubscriptionStatus.Active;
    }

    private static string GetBusinessName(int index)
    {
        var prefixes = new[] { "Tech", "Smart", "Pro", "Digital", "Cloud", "Swift", "Prime", "Elite", "Next", "Blue" };
        var suffixes = new[] { "Solutions", "Systems", "Labs", "Corp", "Inc", "Group", "Services", "Ventures", "Partners", "Co" };
        return $"{prefixes[index % prefixes.Length]}{suffixes[index % suffixes.Length]} {index}";
    }

    private static string GetFirstName(Random random)
    {
        var names = new[] { "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Sophia", "William", "Isabella", "Benjamin", "Mia", "Lucas", "Charlotte", "Henry", "Amelia" };
        return names[random.Next(names.Length)];
    }

    private static string GetLastName(Random random)
    {
        var names = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Jackson" };
        return names[random.Next(names.Length)];
    }

    private static string GetTicketSubject(Random random)
    {
        var subjects = new[]
        {
            "Cannot access my dashboard",
            "Billing question about my subscription",
            "Feature request: Custom reports",
            "Integration with Salesforce not working",
            "AI agent not responding correctly",
            "Need help with form builder",
            "How to set up WhatsApp channel?",
            "Password reset not working",
            "Data export failed",
            "Webhook delivery issues"
        };
        return subjects[random.Next(subjects.Length)];
    }
}
