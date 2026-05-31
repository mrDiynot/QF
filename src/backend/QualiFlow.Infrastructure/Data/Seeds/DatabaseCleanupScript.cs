// -----------------------------------------------------------------------
// <copyright file="DatabaseCleanupScript.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Data.Seeds;

/// <summary>
/// Cleans up all test/seeded data from the database.
/// Keeps only essential CMS content needed for website and coming soon landing pages.
/// </summary>
public static class DatabaseCleanupScript
{
    /// <summary>
    /// Removes all test data while preserving essential CMS content.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public static async Task CleanupTestDataAsync(
        QualiFlowDbContext context,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Starting database cleanup - removing all test/seeded data...");

        var deletedCounts = new Dictionary<string, int>();

        // 1. Delete all audit logs (test data)
        var auditLogs = await context.AdminAuditLogs.ToListAsync(cancellationToken);
        if (auditLogs.Count > 0)
        {
            context.AdminAuditLogs.RemoveRange(auditLogs);
            deletedCounts["AuditLogs"] = auditLogs.Count;
        }

        // 2. Delete all support ticket messages
        var ticketMessages = await context.TicketMessages.ToListAsync(cancellationToken);
        if (ticketMessages.Count > 0)
        {
            context.TicketMessages.RemoveRange(ticketMessages);
            deletedCounts["TicketMessages"] = ticketMessages.Count;
        }

        // 3. Delete all support tickets
        var supportTickets = await context.SupportTickets.ToListAsync(cancellationToken);
        if (supportTickets.Count > 0)
        {
            context.SupportTickets.RemoveRange(supportTickets);
            deletedCounts["SupportTickets"] = supportTickets.Count;
        }

        // 4. Delete all subscriptions
        var subscriptions = await context.Subscriptions.ToListAsync(cancellationToken);
        if (subscriptions.Count > 0)
        {
            context.Subscriptions.RemoveRange(subscriptions);
            deletedCounts["Subscriptions"] = subscriptions.Count;
        }

        // 5. Delete all application users (business users)
        var users = await context.Users.ToListAsync(cancellationToken);
        if (users.Count > 0)
        {
            context.Users.RemoveRange(users);
            deletedCounts["Users"] = users.Count;
        }

        // 6. Delete all channels
        var channels = await context.Channels.ToListAsync(cancellationToken);
        if (channels.Count > 0)
        {
            context.Channels.RemoveRange(channels);
            deletedCounts["Channels"] = channels.Count;
        }

        // 7. Delete all businesses
        var businesses = await context.Businesses.ToListAsync(cancellationToken);
        if (businesses.Count > 0)
        {
            context.Businesses.RemoveRange(businesses);
            deletedCounts["Businesses"] = businesses.Count;
        }

        // 8. Delete all leads
        var leads = await context.Leads.ToListAsync(cancellationToken);
        if (leads.Count > 0)
        {
            context.Leads.RemoveRange(leads);
            deletedCounts["Leads"] = leads.Count;
        }

        // 9. Delete all conversations
        var conversations = await context.Conversations.ToListAsync(cancellationToken);
        if (conversations.Count > 0)
        {
            context.Conversations.RemoveRange(conversations);
            deletedCounts["Conversations"] = conversations.Count;
        }

        // 10. Delete all forms
        var forms = await context.Forms.ToListAsync(cancellationToken);
        if (forms.Count > 0)
        {
            context.Forms.RemoveRange(forms);
            deletedCounts["Forms"] = forms.Count;
        }

        // Save all deletions
        await context.SaveChangesAsync(cancellationToken);

        // Log summary
        logger.LogInformation("Database cleanup completed successfully:");
        foreach (var (entity, count) in deletedCounts.OrderByDescending(x => x.Value))
        {
            logger.LogInformation("  - Deleted {Count} {Entity}", count, entity);
        }

        var totalDeleted = deletedCounts.Values.Sum();
        logger.LogInformation("Total records deleted: {Total}", totalDeleted);

        // Log what was kept
        var keptFaqs = await context.FrequentlyAskedQuestions.CountAsync(cancellationToken);
        var keptTestimonials = await context.Testimonials.CountAsync(cancellationToken);
        var keptBlogPosts = await context.BlogPosts.CountAsync(cancellationToken);
        var keptPlans = await context.SubscriptionPlans.CountAsync(cancellationToken);
        var keptAdmins = await context.AdminUsers.CountAsync(cancellationToken);

        logger.LogInformation("Essential data preserved:");
        logger.LogInformation("  - {Count} FAQs (for website)", keptFaqs);
        logger.LogInformation("  - {Count} Testimonials (for website)", keptTestimonials);
        logger.LogInformation("  - {Count} Blog Posts (for website)", keptBlogPosts);
        logger.LogInformation("  - {Count} Subscription Plans (required)", keptPlans);
        logger.LogInformation("  - {Count} Admin Users (SuperAdmin)", keptAdmins);
    }
}
