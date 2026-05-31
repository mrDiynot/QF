// -----------------------------------------------------------------------
// <copyright file="ComingSoonChatWidgetSeeder.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pgvector;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.SeedData;

/// <summary>
/// Seeds the Coming Soon landing page chat widget with FAQs and knowledge base.
/// </summary>
public static class ComingSoonChatWidgetSeeder
{
    /// <summary>
    /// Seeds the Coming Soon chat widget, FAQs, and knowledge base documents.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">Optional logger for seeding progress.</param>
    /// <param name="openAiService">Optional OpenAI service for generating embeddings.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public static async Task SeedAsync(QualiFlowDbContext context, ILogger? logger = null, IOpenAIService? openAiService = null)
    {
        logger?.LogInformation("Starting Coming Soon chat widget seeding...");
        await SeedComingSoonChatAsync(context, logger, openAiService);
        logger?.LogInformation("Coming Soon chat widget seeding completed");
    }

    /// <summary>
    /// Seeds the Coming Soon chat widget, FAQs, and knowledge base documents.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">Optional logger for seeding progress.</param>
    /// <param name="openAiService">Optional OpenAI service for generating embeddings.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public static async Task SeedComingSoonChatAsync(QualiFlowDbContext context, ILogger? logger = null, IOpenAIService? openAiService = null)
    {
        // Known QualiFlow business ID used by the Coming Soon widget
        var knownBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

        // Get or create the QualiFlow business (for Coming Soon page)
        // Check by ID first (most reliable), then by name variations
        var qualiflowBusiness = await context.Businesses
            .FirstOrDefaultAsync(b => b.Id == knownBusinessId);

        if (qualiflowBusiness == null)
        {
            // Fallback: check by name variations
            qualiflowBusiness = await context.Businesses
                .FirstOrDefaultAsync(b => b.Name == "QualiFlow" || b.Name == "QualiFlowAI Platform");
        }

        if (qualiflowBusiness == null)
        {
            qualiflowBusiness = new Business
            {
                Id = knownBusinessId,
                Name = "QualiFlowAI Platform",
                Email = "info@qualiflow.ai",
                Phone = "+1 (877) 676-5329",
                Website = "https://dev.qualiflow.ai",
                Industry = "SaaS",
                CompanySize = "1-10",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Businesses.Add(qualiflowBusiness);
            await context.SaveChangesAsync();
            logger?.LogInformation("Created QualiFlow business with ID {BusinessId}", knownBusinessId);
        }
        else
        {
            logger?.LogInformation("Using existing QualiFlow business: {BusinessId} ({Name})", qualiflowBusiness.Id, qualiflowBusiness.Name);
        }

        // Check if we already have a Coming Soon widget (by widget_key which is unique)
        var existingWidget = await context.ChatWidgets
            .FirstOrDefaultAsync(w => w.WidgetKey == "coming-soon-widget" || w.Name == "QualiFlow Coming Soon Chat");

        if (existingWidget == null)
        {
            // Create the Coming Soon chat widget
            var widget = new ChatWidget
            {
                Id = Guid.NewGuid(),
                BusinessId = qualiflowBusiness.Id,
                Name = "QualiFlow Coming Soon Chat",
                WidgetKey = "coming-soon-widget",
                IsActive = true,
                BusinessName = "QualiFlow",
                AiPersonality = "friendly",
                IndustryType = "saas",
                EnableAIResponse = true,
                EnableContentModeration = true,
                EnablePiiProtection = true,
                GreetingMessage = "Hi — thanks for checking out QualiFlow AI! I'm Alex, your virtual assistant. How can I help you today?",
                PrimaryColor = "#FF7A3C",
                Position = "bottom-right",
                AllowedDomains = "qualiflow.ai,localhost",
                ShowPreChatForm = false,
                AIResponseDelayMs = 1500,
                SessionTimeoutMinutes = 30,
                AutoCreateLead = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.ChatWidgets.Add(widget);
            await context.SaveChangesAsync();
            logger?.LogInformation("Created Coming Soon chat widget");
        }
        else
        {
            // Update existing widget to ensure correct settings (especially EnableContentModeration)
            // CRITICAL: Always use knownBusinessId (the hardcoded one) to match regenerate-kb-embeddings
            if (existingWidget.BusinessId != knownBusinessId)
            {
                logger?.LogWarning(
                    "Widget BusinessId mismatch! Widget has {WidgetBusinessId}, expected {KnownBusinessId}. Updating widget...",
                    existingWidget.BusinessId, knownBusinessId);
                existingWidget.BusinessId = knownBusinessId;
            }

            existingWidget.EnableAIResponse = true;
            existingWidget.EnableContentModeration = true;
            existingWidget.EnablePiiProtection = true;
            existingWidget.AiPersonality = "friendly";
            existingWidget.GreetingMessage = "Hi — thanks for checking out QualiFlow AI! I'm Alex, your virtual assistant. How can I help you today?";
            existingWidget.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            logger?.LogInformation("Updated Coming Soon chat widget settings (EnableContentModeration={Enabled}, BusinessId={BusinessId})", existingWidget.EnableContentModeration, existingWidget.BusinessId);
        }

        // Always seed FAQs and Knowledge Base (even if widget exists)
        // This ensures KB data is populated on Azure where widget exists but KB is missing
        logger?.LogInformation("Seeding FAQs with embeddings...");
        await SeedFaqsAsync(context, qualiflowBusiness.Id, logger, openAiService);

        logger?.LogInformation("Seeding Knowledge Base with embeddings...");
        await SeedKnowledgeBaseAsync(context, qualiflowBusiness.Id, logger, openAiService);
    }

#pragma warning disable S1172 // Unused parameters kept for API compatibility
    private static async Task SeedFaqsAsync(QualiFlowDbContext context, Guid businessId, ILogger? logger, IOpenAIService? openAiService)
#pragma warning restore S1172
    {
        // FAQs are DEPRECATED - All content is now in the unified Knowledge Base
        // This method is kept for backward compatibility but seeds no FAQ data
        // The force-seed endpoint will delete existing FAQs
        // Parameters kept for API compatibility with existing callers
        _ = context;
        _ = businessId;
        _ = openAiService;
        logger?.LogInformation("FAQ seeding skipped - using unified Knowledge Base approach");
        await Task.CompletedTask;
    }

    private static async Task SeedKnowledgeBaseAsync(QualiFlowDbContext context, Guid businessId, ILogger? logger, IOpenAIService? openAiService)
    {
        // Unified Knowledge Base from ai_kb_qualiflow - 6 documents covering all 17 sections
        var documents = new[]
        {
            // Document 1: Platform Overview (Sections 1, 2, 17)
            new KnowledgeBaseDocument
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Title = "QualiFlow AI Platform Overview",
                Content = @"# What QualiFlow AI Is

QualiFlow AI is an AI-powered Automated Customer Journey Platform.

At its core, QualiFlow ensures:
- Every lead is captured
- Every inquiry gets an instant response
- Every conversation is qualified
- Every opportunity is followed up
- Every booking is handled automatically
- Every interaction is logged and synced to a CRM

QualiFlow replaces the need for:
- Missed-call handling
- Manual lead follow-up
- Disconnected inboxes
- Slow response times
- Rigid workflows
- Multiple tools stitched together

It works out of the box with prebuilt journeys and requires little to no setup.

# What QualiFlow AI Is NOT

QualiFlow AI is NOT:
- Just a chatbot
- Just an AI receptionist
- Just a CRM plugin
- Just a workflow builder
- Just a messaging tool

Instead of requiring users to build logic, QualiFlow focuses on outcomes. You define the goal (book the appointment, recover the lead, get the review) — QualiFlow decides how to achieve it.

# Summary

QualiFlow AI is a fully automated, AI-driven customer journey platform that captures, qualifies, books, follows up, and syncs every conversation across every channel — automatically.",
                Category = "Platform",
                SourceUrl = "https://qualiflow.ai/overview",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // Document 2: Journey Automation Engine (Sections 3, 12)
            new KnowledgeBaseDocument
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Title = "Journey Automation Engine",
                Content = @"# The Journey Automation Engine™

The QualiFlow Journey Automation Engine™ is the intelligence layer that powers everything.

It continuously decides the next best action based on:
- Channel used
- Lead intent
- Conversation history
- Time of day
- Engagement level
- CRM data
- Past outcomes

Possible actions include:
- Send SMS
- Send email
- Make AI voice calls (inbound or outbound)
- Ask qualification questions
- Book or reschedule appointments
- Send proposals
- Trigger reminders
- Recover no-shows
- Collect reviews
- Launch nurture sequences
- Escalate to a human

No rigid flows. No manual rules.

# Automation Philosophy

QualiFlow does NOT rely on:
- n8n
- Make
- Zapier-style customer-built flows

Automations are:
- Built-in
- Backend-driven
- AI-decided

A visual automation builder may exist later, but the platform works fully without it. The AI decides the next best action automatically based on context, eliminating the need for complex workflow configuration.",
                Category = "Technology",
                SourceUrl = "https://qualiflow.ai/engine",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // Document 3: Channels & AI Voice (Sections 4, 5)
            new KnowledgeBaseDocument
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Title = "Omnichannel Communication & AI Voice",
                Content = @"# Channels Supported (Omnichannel by Default)

## Lead Capture Channels
- Phone calls (inbound)
- SMS / Text messages
- Website chat widget
- Instagram DMs
- Instagram comments
- Facebook Messenger
- Web forms
- Landing pages
- QR code forms
- Missed calls (automatic recovery)

## Response Channels
- SMS
- Email
- AI voice calls (outbound)
- Web chat
- Social DMs

All channels flow into one unified inbox.

# AI Voice (AI Receptionist)

QualiFlow does provide an AI receptionist.

## Inbound Voice
- AI answers calls
- Greets callers
- Asks qualifying questions
- Understands intent
- Books appointments
- Logs summaries
- Syncs to CRM

## Outbound Voice
- Calls new leads automatically
- Follows up on missed calls
- Calls after proposal views
- Revives cold leads
- Escalates to humans when needed

Voice works alongside SMS, email, and chat — not in isolation. The AI receptionist is fully integrated with the Journey Automation Engine™ to provide seamless handoffs between channels.",
                Category = "Channels",
                SourceUrl = "https://qualiflow.ai/channels",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // Document 4: Customer Journeys & Proposals (Sections 6, 11)
            new KnowledgeBaseDocument
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Title = "Prebuilt Customer Journeys & Smart Proposals",
                Content = @"# Prebuilt Customer Journeys (Turnkey)

These are already built into the platform:

## 1. New Lead → Qualification → Booking
- Instant response
- AI qualification
- Calendar availability
- Booking
- Confirmation & reminders
- CRM sync

## 2. Missed Call Recovery
- Missed call detected
- SMS follow-up
- Email follow-up
- AI outbound call if needed

## 3. Post-Appointment → Reviews → Retention
- Thank-you message
- Review request
- Survey
- Loyalty / rebooking

## 4. Proposal Follow-Up
- Auto follow-ups
- AI calls
- Booking after acceptance

## 5. Cold Lead Revival
- Detect inactivity
- Multi-channel reactivation
- Move back to warm or nurture

## 6. Form Abandonment Recovery
- Detect incomplete forms
- Recover via SMS
- Push data to CRM

## 7. Monthly Re-Engagement
- Seasonal outreach
- Promotions
- Retention loops

# Smart Proposals

QualiFlow includes an AI-powered proposal engine.

Capabilities:
- AI-drafted proposals
- Send via SMS or email
- View tracking
- Acceptance tracking
- Auto follow-ups
- Auto booking after acceptance

Proposals are integrated with the Journey Automation Engine™ for automatic follow-up and booking upon acceptance.",
                Category = "Journeys",
                SourceUrl = "https://qualiflow.ai/journeys",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // Document 5: CRM & Operations (Sections 7, 8, 9, 10)
            new KnowledgeBaseDocument
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Title = "CRM, Inbox, Booking & Forms",
                Content = @"# Unified Inbox

All conversations appear in one place.

Includes:
- Channel icons
- Conversation history
- AI summaries
- Call transcripts
- Lead score
- Tags
- Assigned owner
- Timeline

# Built-In CRM (And External CRM Sync)

QualiFlow will include a built-in CRM, so customers will NOT need an existing CRM to use the platform.

## Built-In CRM Features
- Contacts
- Smart lists (hot, warm, cold)
- Lead scoring
- Notes
- Tasks
- Timeline
- Appointments
- Proposals
- Auto-segmentation

## External CRM Integrations

QualiFlow is designed to integrate with CRMs regardless of which one a customer uses.

Supported / Planned CRMs will include:
- HubSpot
- Salesforce
- Zoho
- Pipedrive
- GoHighLevel
- Monday
- Close CRM
- Freshsales
- ActiveCampaign
- Copper
- CDK

If a CRM is not listed, QualiFlow will still support integration via setup. Customers will never be blocked from onboarding.

CRM sync will include: Contacts, Conversations, Summaries, Appointments, Status updates, Tags

# Booking & Scheduling

QualiFlow includes a full booking system.

Features:
- Smart availability
- Multi-calendar support
- Confirmation messages
- Reminder messages
- No-show prevention
- Rescheduling

Calendars supported:
- Google Calendar
- Outlook
- Calendly (via sync)

# Forms, Surveys & QR Codes

QualiFlow includes:
- Form builder
- Survey builder
- QR code generation
- Analytics

AI can:
- Trigger journeys
- Recover abandoned forms
- Extract structured data",
                Category = "Operations",
                SourceUrl = "https://qualiflow.ai/crm",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // Document 6: Business & Security (Sections 13, 14, 15, 16)
            new KnowledgeBaseDocument
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                Title = "Analytics, Security & Target Market",
                Content = @"# Analytics & Reporting

Dashboards include:
- Leads by channel
- Response times
- Qualification rates
- Booking rates
- No-show reduction
- Proposal performance
- Reviews
- Retention
- Revenue influence

# Users, Teams & Roles

- Multi-user per business
- Role-based access
- Team assignment
- Usage tracking

# Security & Infrastructure

- Hosted on Microsoft Azure
- Secure authentication
- Role-based access
- Audit logs (tier dependent)
- SOC2-ready architecture (enterprise)

# Who QualiFlow Is For

QualiFlow is designed for:
- Any appointment-based business
- SMBs (Small and Medium Businesses)
- Enterprises
- Agencies
- Dealerships
- Clinics
- Med spas
- Salons
- Dentists
- Realtors
- Gyms

If your business relies on appointments, lead follow-up, or customer communication, QualiFlow AI is built for you.",
                Category = "Business",
                SourceUrl = "https://qualiflow.ai/business",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        // Check existing documents and update content if changed (e.g., pre-launch tone fixes)
        var existingDocs = await context.KnowledgeBaseDocuments
            .Where(d => d.BusinessId == businessId)
            .ToListAsync();

        var existingByTitle = existingDocs.ToDictionary(d => d.Title, d => d);
        var newDocuments = new List<KnowledgeBaseDocument>();
        var updatedCount = 0;

        foreach (var doc in documents)
        {
            if (existingByTitle.TryGetValue(doc.Title, out var existing))
            {
                // Update content if it changed (keeps embeddings in sync with source)
                if (!string.Equals(existing.Content, doc.Content, StringComparison.Ordinal))
                {
                    existing.Content = doc.Content;
                    existing.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;
                }
            }
            else
            {
                newDocuments.Add(doc);
            }
        }

        if (newDocuments.Count > 0)
        {
            await context.KnowledgeBaseDocuments.AddRangeAsync(newDocuments);
            logger?.LogInformation("Added {Count} new Knowledge Base documents", newDocuments.Count);
        }

        if (updatedCount > 0)
        {
            logger?.LogInformation("Updated content for {Count} existing Knowledge Base documents", updatedCount);
        }

        if (newDocuments.Count > 0 || updatedCount > 0)
        {
            await context.SaveChangesAsync();
        }
        else
        {
            logger?.LogInformation("All Knowledge Base documents already up to date, skipping");
        }

        // Check for existing documents that are MISSING chunks (need to recreate)
        // This handles cases where documents exist but chunks were deleted/lost
        var existingDocIds = existingDocs.Select(d => d.Id).ToList();
        var docsWithChunks = new HashSet<Guid>();
        if (existingDocIds.Count > 0)
        {
            try
            {
                var conn = context.Database.GetDbConnection();
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync();
                }

                using var cmd = conn.CreateCommand();
                cmd.CommandText = "SELECT DISTINCT document_id FROM knowledge_base_chunks WHERE business_id = @businessId AND embedding IS NOT NULL";
                var param = cmd.CreateParameter();
                param.ParameterName = "@businessId";
                param.Value = businessId;
                cmd.Parameters.Add(param);

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    docsWithChunks.Add(reader.GetGuid(0));
                }
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "Failed to check existing chunks - will proceed with new documents only");
            }
        }

        // Find existing documents that need chunks recreated
        var docsNeedingChunks = await context.KnowledgeBaseDocuments
            .Where(d => d.BusinessId == businessId && !docsWithChunks.Contains(d.Id))
            .ToListAsync();

        // Combine new documents + existing docs missing chunks + updated docs (need new embeddings)
        var updatedDocIds = existingDocs.Where(d => d.UpdatedAt.HasValue && d.UpdatedAt.Value > DateTime.UtcNow.AddMinutes(-1)).Select(d => d.Id).ToHashSet();
        var updatedDocsNeedingChunks = existingDocs.Where(d => updatedDocIds.Contains(d.Id)).ToList();
        var allDocsToProcess = newDocuments.Concat(docsNeedingChunks).Concat(updatedDocsNeedingChunks).DistinctBy(d => d.Id).ToArray();

        if (docsNeedingChunks.Count > 0)
        {
            logger?.LogWarning("Found {Count} existing documents missing chunks - will regenerate embeddings", docsNeedingChunks.Count);
        }

        // Create knowledge base chunks with embeddings for RAG
        if (openAiService != null && allDocsToProcess.Length > 0)
        {
            logger?.LogInformation("Creating knowledge base chunks with embeddings for {Count} documents...", allDocsToProcess.Length);
            var chunks = new List<KnowledgeBaseChunk>();

            foreach (var doc in allDocsToProcess)
            {
                try
                {
                    // Split content into chunks (by paragraphs, max ~1500 chars each)
                    var paragraphs = doc.Content.Split(new[] { "\n\n", "\r\n\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                    var currentChunk = new System.Text.StringBuilder();
                    var chunkIndex = 0;

                    foreach (var paragraph in paragraphs)
                    {
                        if (currentChunk.Length + paragraph.Length > 1500 && currentChunk.Length > 0)
                        {
                            // Save current chunk with embedding
                            var chunkText = currentChunk.ToString();
                            var embedding = await openAiService.GenerateEmbeddingAsync(chunkText);
                            chunks.Add(new KnowledgeBaseChunk
                            {
                                Id = Guid.NewGuid(),
                                DocumentId = doc.Id,
                                BusinessId = doc.BusinessId,
                                ChunkText = chunkText.Trim(),
                                ChunkIndex = chunkIndex++,
                                Embedding = new Vector(embedding),
                                TokenCount = chunkText.Length / 4,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            });
                            currentChunk.Clear();
                            currentChunk.Append(paragraph);
                        }
                        else
                        {
                            if (currentChunk.Length > 0)
                            {
                                currentChunk.Append("\n\n");
                            }

                            currentChunk.Append(paragraph);
                        }
                    }

                    // Save final chunk
                    if (currentChunk.Length > 0)
                    {
                        var chunkText = currentChunk.ToString();
                        var embedding = await openAiService.GenerateEmbeddingAsync(chunkText);
                        chunks.Add(new KnowledgeBaseChunk
                        {
                            Id = Guid.NewGuid(),
                            DocumentId = doc.Id,
                            BusinessId = doc.BusinessId,
                            ChunkText = chunkText.Trim(),
                            ChunkIndex = chunkIndex,
                            Embedding = new Vector(embedding),
                            TokenCount = chunkText.Length / 4,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }

                    logger?.LogDebug("Created {Count} chunks for document: {Title}", chunkIndex + 1, doc.Title);
                }
                catch (Exception ex)
                {
                    logger?.LogWarning(ex, "Failed to create chunks for document: {Title}", doc.Title);
                }
            }

            if (chunks.Count > 0)
            {
                try
                {
                    // Use raw SQL for ALL vector operations - EF Core has issues with pgVector
                    var conn = context.Database.GetDbConnection();
                    if (conn.State != System.Data.ConnectionState.Open)
                    {
                        await conn.OpenAsync();
                    }

                    // Check existing chunks
                    var existingChunkDocIds = new HashSet<Guid>();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "SELECT DISTINCT document_id FROM knowledge_base_chunks WHERE business_id = @businessId";
                        var param = cmd.CreateParameter();
                        param.ParameterName = "@businessId";
                        param.Value = businessId;
                        cmd.Parameters.Add(param);

                        using var reader = await cmd.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            existingChunkDocIds.Add(reader.GetGuid(0));
                        }
                    }

                    // Delete old chunks for updated documents so new embeddings take effect
                    var updatedDocIdsWithChunks = updatedDocIds.Where(id => existingChunkDocIds.Contains(id)).ToList();
                    if (updatedDocIdsWithChunks.Count > 0)
                    {
                        foreach (var docId in updatedDocIdsWithChunks)
                        {
                            await context.Database.ExecuteSqlRawAsync(
                                "DELETE FROM knowledge_base_chunks WHERE document_id = {0} AND business_id = {1}",
                                docId, businessId);
                        }

                        logger?.LogInformation("Deleted old chunks for {Count} updated documents", updatedDocIdsWithChunks.Count);

                        // Remove from existing set so new chunks get inserted
                        foreach (var docId in updatedDocIdsWithChunks)
                        {
                            existingChunkDocIds.Remove(docId);
                        }
                    }

                    // Only insert chunks for documents that don't already have chunks
                    var newChunks = chunks.Where(c => !existingChunkDocIds.Contains(c.DocumentId)).ToList();

                    if (newChunks.Count > 0)
                    {
                        // Use raw SQL to insert chunks with vectors to bypass EF Core pgVector issues
                        foreach (var chunk in newChunks)
                        {
                            var vectorString = "[" + string.Join(",", chunk.Embedding!.ToArray()) + "]";
                            var updatedAt = chunk.UpdatedAt ?? DateTime.UtcNow;
                            object[] parameters = [chunk.Id, chunk.DocumentId, chunk.BusinessId, chunk.ChunkText, chunk.ChunkIndex,
                                chunk.TokenCount, chunk.CreatedAt, updatedAt, vectorString];
                            await context.Database.ExecuteSqlRawAsync(
                                @"INSERT INTO knowledge_base_chunks (id, document_id, business_id, chunk_text, chunk_index, token_count, created_at, updated_at, embedding)
                                  VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}::vector)",
                                parameters);
                        }

                        logger?.LogInformation("Created {Count} knowledge base chunks with embeddings via raw SQL", newChunks.Count);
                    }
                    else
                    {
                        logger?.LogInformation("All knowledge base chunks already exist, skipping");
                    }
                }
                catch (Exception ex)
                {
                    // Handle test environments where DB connection may not be available
                    logger?.LogWarning(ex, "Failed to insert knowledge base chunks - this is expected in test environments");
                }
            }
        }
        else
        {
            logger?.LogWarning("OpenAI service not available - knowledge base chunks will not be created");
        }

        // Post-seeding: Ensure chunk text is consistent with document content
        // This handles cases where documents were updated but chunks have stale text
        await EnsureChunkTextConsistencyAsync(context, businessId, documents, logger);
    }

    private static async Task EnsureChunkTextConsistencyAsync(
        QualiFlowDbContext context,
        Guid businessId,
        KnowledgeBaseDocument[] documents,
        ILogger? logger)
    {
        try
        {
            var conn = context.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            var updatedChunkCount = 0;

            foreach (var doc in documents)
            {
                // Find the persisted version of this document
                var persistedDoc = await context.KnowledgeBaseDocuments
                    .FirstOrDefaultAsync(d => d.BusinessId == businessId && d.Title == doc.Title);

                if (persistedDoc == null)
                {
                    continue;
                }

                // Re-split current content into expected chunks
                var paragraphs = persistedDoc.Content.Split(new[] { "\n\n", "\r\n\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                var expectedChunks = new List<string>();
                var currentChunk = new System.Text.StringBuilder();

                foreach (var para in paragraphs)
                {
                    if (currentChunk.Length + para.Length > 1500 && currentChunk.Length > 0)
                    {
                        expectedChunks.Add(currentChunk.ToString().Trim());
                        currentChunk.Clear();
                    }

                    currentChunk.AppendLine(para);
                }

                if (currentChunk.Length > 0)
                {
                    expectedChunks.Add(currentChunk.ToString().Trim());
                }

                // Check each chunk and update if text differs
                for (int i = 0; i < expectedChunks.Count; i++)
                {
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = "SELECT chunk_text FROM knowledge_base_chunks WHERE document_id = @docId AND business_id = @bizId AND chunk_index = @idx LIMIT 1";

                    var p1 = cmd.CreateParameter();
                    p1.ParameterName = "@docId";
                    p1.Value = persistedDoc.Id;
                    cmd.Parameters.Add(p1);

                    var p2 = cmd.CreateParameter();
                    p2.ParameterName = "@bizId";
                    p2.Value = businessId;
                    cmd.Parameters.Add(p2);

                    var p3 = cmd.CreateParameter();
                    p3.ParameterName = "@idx";
                    p3.Value = i;
                    cmd.Parameters.Add(p3);

                    var existingText = (string?)await cmd.ExecuteScalarAsync();

                    if (existingText != null && !string.Equals(existingText.Trim(), expectedChunks[i], StringComparison.Ordinal))
                    {
                        await context.Database.ExecuteSqlRawAsync(
                            "UPDATE knowledge_base_chunks SET chunk_text = {0}, updated_at = {1} WHERE document_id = {2} AND business_id = {3} AND chunk_index = {4}",
                            expectedChunks[i], DateTime.UtcNow, persistedDoc.Id, businessId, i);
                        updatedChunkCount++;
                    }
                }
            }

            if (updatedChunkCount > 0)
            {
                logger?.LogInformation("Chunk consistency check: updated {Count} stale chunks to match current document content", updatedChunkCount);
            }
            else
            {
                logger?.LogDebug("Chunk consistency check: all chunks up to date");
            }
        }
        catch (Exception ex)
        {
            logger?.LogWarning(ex, "Chunk consistency check failed - this is expected in test environments");
        }
    }
}
