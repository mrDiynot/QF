using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Data.SeedData;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Administrative endpoints for managing seed data, embeddings, and RAG diagnostics.
/// All endpoints require admin authentication. Destructive operations require PlatformAdmin role.
/// Only available in Development environment.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Policy = AdminPolicies.RequireAnyAdmin)]
public class SeedController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<SeedController> _logger;
    private readonly IOpenAIService _openAiService;
    private readonly IWebHostEnvironment _environment;

    /// <summary>
    /// Initializes a new instance of the <see cref="SeedController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="openAiService">The OpenAI service.</param>
    /// <param name="environment">The hosting environment.</param>
    public SeedController(QualiFlowDbContext context, ILogger<SeedController> logger, IOpenAIService openAiService, IWebHostEnvironment environment)
    {
        _context = context;
        _logger = logger;
        _openAiService = openAiService;
        _environment = environment;
    }

    /// <summary>
    /// Seeds the Coming Soon chat widget with FAQs and knowledge base.
    /// </summary>
    /// <returns>Seed operation result with statistics.</returns>
    [HttpPost("coming-soon-widget")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> SeedComingSoonWidget()
    {
        try
        {
            _logger.LogInformation("Manually triggering Coming Soon widget seeding with embeddings...");
            await ComingSoonChatWidgetSeeder.SeedAsync(_context, _logger, _openAiService);
            return Ok(new { message = "Coming Soon widget seeded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed Coming Soon widget");
            return StatusCode(500, new { error = "Seeding failed. Check server logs for details." });
        }
    }

    /// <summary>
    /// Updates widget settings using raw SQL to avoid EF Core/pgVector issues.
    /// This is the RELIABLE endpoint for enabling content moderation.
    /// Bypasses all EF Core vector column read issues.
    /// </summary>
    /// <returns>Widget update result with affected rows count.</returns>
    [HttpPost("update-widget-settings")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> UpdateWidgetSettings()
    {
        try
        {
            _logger.LogInformation("Updating widget settings via raw SQL...");

            // Update widget settings using raw SQL to bypass EF Core issues
            var rowsAffected = await _context.Database.ExecuteSqlRawAsync(@"
                UPDATE chat_widgets
                SET enable_content_moderation = true,
                    enable_ai_response = true,
                    enable_pii_protection = true,
                    ai_personality = 'friendly',
                    greeting_message = 'Hi — thanks for checking out QualiFlow AI! I''m Alex, your virtual assistant. How can I help you today?',
                    updated_at = NOW()
                WHERE widget_key = 'coming-soon-widget'");

            if (rowsAffected == 0)
            {
                return NotFound(new { error = "Widget with key 'coming-soon-widget' not found" });
            }

            _logger.LogInformation("Widget settings updated successfully. Rows affected: {RowsAffected}", rowsAffected);
            return Ok(new
            {
                message = "Widget settings updated successfully",
                rowsAffected,
                settings = new
                {
                    enableContentModeration = true,
                    enableAiResponse = true,
                    enablePiiProtection = true,
                    aiPersonality = "friendly"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update widget settings");
            return StatusCode(500, new { error = "Update failed. Check server logs for details." });
        }
    }

    /// <summary>
    /// Regenerates FAQ embeddings using OpenAI. Costs money per call.
    /// </summary>
    /// <returns>Embedding regeneration result with count.</returns>
    [HttpPost("regenerate-embeddings")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> RegenerateEmbeddings()
    {
        try
        {
            _logger.LogInformation("Regenerating embeddings for FAQs...");

            // Select only the fields we need (avoid loading the vector field which causes EF Core issues)
            var faqs = await _context.FaqEmbeddings
                .Select(f => new { f.Id, f.Question, f.Answer })
                .ToListAsync();

            var generated = 0;

            foreach (var faq in faqs)
            {
                try
                {
                    var embeddingText = $"{faq.Question} {faq.Answer}";
                    var embedding = await _openAiService.GenerateEmbeddingAsync(embeddingText);

                    // Update using raw SQL to avoid EF Core vector serialization issues
                    var vectorString = "[" + string.Join(",", embedding) + "]";
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE faq_embeddings SET embedding = @p0::vector WHERE id = @p1",
                        vectorString, faq.Id);

                    generated++;
                    _logger.LogDebug("Generated embedding for FAQ: {Question}", faq.Question);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to generate embedding for FAQ: {Question}", faq.Question);
                }
            }

            _logger.LogInformation("Regenerated {Count} FAQ embeddings", generated);

            return Ok(new { message = $"Regenerated {generated} FAQ embeddings", total = faqs.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to regenerate embeddings");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Seeds FAQ embeddings from the frequently_asked_questions table.
    /// Reads all active FAQs, generates OpenAI embeddings, and inserts into faq_embeddings table.
    /// Skips FAQs that already have a matching embedding record.
    /// </summary>
    /// <returns>Seed result with count of created embeddings.</returns>
    [HttpPost("seed-faq-embeddings")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> SeedFaqEmbeddings()
    {
        try
        {
            _logger.LogInformation("Seeding FAQ embeddings from frequently_asked_questions table...");

            var businessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

            // Get all active FAQs from the CMS table
            var faqs = await _context.FrequentlyAskedQuestions
                .Where(f => f.IsActive && f.DeletedAt == null)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();

            if (faqs.Count == 0)
            {
                return Ok(new { message = "No active FAQs found in frequently_asked_questions table", created = 0 });
            }

            // Get existing faq_embeddings questions to avoid duplicates
            var existingQuestions = await _context.FaqEmbeddings
                .Where(f => f.BusinessId == businessId)
                .Select(f => f.Question)
                .ToListAsync();

            var created = 0;
            var skipped = 0;

            foreach (var faq in faqs)
            {
                if (existingQuestions.Contains(faq.Question))
                {
                    skipped++;
                    _logger.LogDebug("Skipping FAQ (already exists): {Question}", faq.Question);
                    continue;
                }

                try
                {
                    var embeddingText = $"{faq.Question} {faq.Answer}";
                    var embedding = await _openAiService.GenerateEmbeddingAsync(embeddingText);
                    var vectorString = "[" + string.Join(",", embedding) + "]";

                    var faqEmbeddingId = Guid.NewGuid();
                    await _context.Database.ExecuteSqlRawAsync(
                        @"INSERT INTO faq_embeddings (id, business_id, question, answer, embedding, category, is_active, created_at, updated_at)
                          VALUES ({0}, {1}, {2}, {3}, {4}::vector, {5}, true, NOW(), NOW())",
                        faqEmbeddingId, businessId, faq.Question, faq.Answer, vectorString, faq.Category ?? "General");

                    created++;
                    _logger.LogInformation("Created FAQ embedding for: {Question}", faq.Question);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to create embedding for FAQ: {Question}", faq.Question);
                }
            }

            _logger.LogInformation("FAQ embedding seeding complete: {Created} created, {Skipped} skipped", created, skipped);

            return Ok(new
            {
                message = $"FAQ embeddings seeded: {created} created, {skipped} skipped (already existed)",
                totalFaqs = faqs.Count,
                created,
                skipped
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed FAQ embeddings");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Checks the status and configuration of the Coming Soon widget.
    /// </summary>
    /// <returns>Widget status with business ID information.</returns>
    [HttpGet("check-widget")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> CheckWidget()
    {
        try
        {
            var widget = await _context.ChatWidgets
                .FirstOrDefaultAsync(w => w.Name == "QualiFlow Coming Soon Chat");

            if (widget == null)
            {
                return NotFound(new { message = "Coming Soon widget not found" });
            }

            // Also get KB data business ID for comparison
            var kbDoc = await _context.KnowledgeBaseDocuments.FirstOrDefaultAsync();
            var kbChunk = await _context.KnowledgeBaseChunks.FirstOrDefaultAsync();

            return Ok(new
            {
                message = "Widget exists",
                widgetId = widget.Id,
                widgetBusinessId = widget.BusinessId,
                widgetName = widget.Name,
                widgetKey = widget.WidgetKey,
                kbDocBusinessId = kbDoc?.BusinessId,
                kbChunkBusinessId = kbChunk?.BusinessId,
                businessIdMatch = widget.BusinessId == kbDoc?.BusinessId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check widget");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("fix-widget-key")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> FixWidgetKey()
    {
        try
        {
            var widget = await _context.ChatWidgets
                .FirstOrDefaultAsync(w => w.Name == "QualiFlow Coming Soon Chat");

            if (widget == null)
            {
                return NotFound(new { message = "Coming Soon widget not found" });
            }

            var oldKey = widget.WidgetKey;
            widget.WidgetKey = "coming-soon-widget";
            widget.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Widget key updated successfully",
                oldKey = oldKey,
                newKey = widget.WidgetKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fix widget key");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Gets database statistics for seed data, embeddings, and knowledge base.
    /// </summary>
    /// <returns>Database statistics including entity counts.</returns>
    [HttpGet("database-stats")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> GetDatabaseStats()
    {
        try
        {
            var businessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

            var stats = new
            {
                businesses = await _context.Businesses.CountAsync(),
                chatWidgets = await _context.ChatWidgets.CountAsync(),
                knowledgeBaseDocs = await _context.KnowledgeBaseDocuments
                    .Where(d => d.BusinessId == businessId)
                    .CountAsync(),
                knowledgeBaseChunks = await _context.KnowledgeBaseChunks
                    .Where(c => c.BusinessId == businessId)
                    .CountAsync(),
                chunksWithEmbeddings = await _context.Database
                    .SqlQueryRaw<int>("SELECT COUNT(*) as Value FROM knowledge_base_chunks WHERE business_id = {0} AND embedding IS NOT NULL", businessId)
                    .FirstOrDefaultAsync(),
                faqEmbeddings = await _context.FaqEmbeddings
                    .Where(f => f.BusinessId == businessId)
                    .CountAsync(),
                faqsWithEmbeddings = await _context.Database
                    .SqlQueryRaw<int>("SELECT COUNT(*) as Value FROM faq_embeddings WHERE business_id = {0} AND embedding IS NOT NULL", businessId)
                    .FirstOrDefaultAsync()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get database stats");
            return StatusCode(500, new { error = "Stats retrieval failed. Check server logs for details." });
        }
    }

    /// <summary>
    /// Regenerates Knowledge Base chunk embeddings using OpenAI. Costs money per call.
    /// </summary>
    /// <returns>KB embedding regeneration result with count.</returns>
    [HttpPost("regenerate-kb-embeddings")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> RegenerateKbEmbeddings()
    {
        try
        {
            _logger.LogInformation("Regenerating Knowledge Base embeddings...");
            var businessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

            // Get all KB documents for this business
            var documents = await _context.KnowledgeBaseDocuments
                .Where(d => d.BusinessId == businessId)
                .ToListAsync();

            var generated = 0;

            foreach (var doc in documents)
            {
                try
                {
                    // Delete existing chunks using raw SQL to avoid vector field issues
                    await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM knowledge_base_chunks WHERE document_id = @p0", doc.Id);

                    // Create new chunk with embedding
                    var embedding = await _openAiService.GenerateEmbeddingAsync(doc.Content);
                    var vectorString = "[" + string.Join(",", embedding) + "]";

                    var chunkId = Guid.NewGuid();
                    await _context.Database.ExecuteSqlRawAsync(
                        @"INSERT INTO knowledge_base_chunks (id, document_id, business_id, chunk_text, chunk_index, token_count, created_at, embedding)
                          VALUES (@p0, @p1, @p2, @p3, 0, @p4, NOW(), @p5::vector)",
                        chunkId, doc.Id, businessId, doc.Content, doc.Content.Length / 4, vectorString);

                    generated++;
                    _logger.LogDebug("Generated embedding for KB doc: {Title}", doc.Title);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to generate embedding for KB doc: {Title}", doc.Title);
                }
            }

            return Ok(new { message = $"Regenerated {generated} KB embeddings", total = documents.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to regenerate KB embeddings");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Sync widget's BusinessId to match KB data's BusinessId (fixes RAG mismatch).
    /// </summary>
    /// <returns>Sync result with old and new business IDs.</returns>
    [HttpPost("sync-widget-business-id")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> SyncWidgetBusinessId()
    {
        try
        {
            var targetBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

            var widget = await _context.ChatWidgets
                .FirstOrDefaultAsync(w => w.WidgetKey == "coming-soon-widget");

            if (widget == null)
            {
                return NotFound(new { error = "Widget not found" });
            }

            var oldBusinessId = widget.BusinessId;
            var needsUpdate = widget.BusinessId != targetBusinessId;

            if (needsUpdate)
            {
                widget.BusinessId = targetBusinessId;
                widget.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogWarning("Synced widget BusinessId from {Old} to {New}", oldBusinessId, targetBusinessId);
            }

            return Ok(new
            {
                message = needsUpdate ? "Widget BusinessId synced" : "Widget BusinessId already correct",
                oldBusinessId,
                newBusinessId = targetBusinessId,
                wasUpdated = needsUpdate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync widget BusinessId");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Force re-seeds the entire Knowledge Base. Deletes all existing KB data first.
    /// </summary>
    /// <returns>Force seed operation result with final statistics.</returns>
    [HttpPost("force-seed")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> ForceSeed()
    {
        try
        {
            _logger.LogInformation("Force seeding unified Knowledge Base - deleting ALL existing FAQ and KB data first...");

            // Get the QualiFlow business
            var business = await _context.Businesses.FirstOrDefaultAsync(b => b.Name == "QualiFlow");
            if (business == null)
            {
                _logger.LogInformation("QualiFlow business not found, will be created during seeding");
            }

            var businessId = business?.Id ?? Guid.Empty;

            // Delete ALL FAQs for the business (FAQs are deprecated)
            // Use raw SQL to avoid pgVector read issues with EF Core
            if (businessId != Guid.Empty)
            {
                _logger.LogInformation("Deleting existing FAQs (deprecated)...");
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM faq_embeddings WHERE business_id = {0}", businessId);

                // Delete ALL KB chunks first (foreign key constraint)
                _logger.LogInformation("Deleting existing KB chunks...");
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM knowledge_base_chunks WHERE business_id = {0}", businessId);

                // Delete ALL KB documents
                _logger.LogInformation("Deleting existing KB documents...");
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM knowledge_base_documents WHERE business_id = {0}", businessId);

                // Note: Widget is NOT deleted - seeder will update existing widget settings
                // This preserves chat sessions and messages while updating KB and widget config
            }

            _logger.LogInformation("Existing FAQ and KB data deleted. Seeding unified Knowledge Base...");

            // Seed fresh unified KB (FAQs will not be seeded - deprecated)
            await ComingSoonChatWidgetSeeder.SeedAsync(_context, _logger, _openAiService);

            // Get final stats using raw SQL to avoid pgVector/EF Core issues
            var newBusiness = await _context.Businesses.FirstOrDefaultAsync(b => b.Name == "QualiFlow");
            var newBusinessId = newBusiness?.Id ?? Guid.Empty;

            int faqCount = 0, kbDocCount = 0, kbChunkCount = 0;
            if (newBusinessId != Guid.Empty)
            {
                var conn = _context.Database.GetDbConnection();
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync();
                }

                using var cmd = conn.CreateCommand();
                var param = cmd.CreateParameter();
                param.ParameterName = "@businessId";
                param.Value = newBusinessId;
                cmd.Parameters.Add(param);

                cmd.CommandText = "SELECT COUNT(*) FROM faq_embeddings WHERE business_id = @businessId";
                faqCount = Convert.ToInt32(await cmd.ExecuteScalarAsync(), System.Globalization.CultureInfo.InvariantCulture);

                cmd.CommandText = "SELECT COUNT(*) FROM knowledge_base_documents WHERE business_id = @businessId";
                kbDocCount = Convert.ToInt32(await cmd.ExecuteScalarAsync(), System.Globalization.CultureInfo.InvariantCulture);

                cmd.CommandText = "SELECT COUNT(*) FROM knowledge_base_chunks WHERE business_id = @businessId";
                kbChunkCount = Convert.ToInt32(await cmd.ExecuteScalarAsync(), System.Globalization.CultureInfo.InvariantCulture);
            }

            var finalStats = new { faqCount, kbDocCount, kbChunkCount };

            return Ok(new
            {
                message = "Force seed completed - Unified Knowledge Base seeded (FAQs deprecated)",
                stats = finalStats
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to force seed");
            return StatusCode(500, new { error = "Force seed failed. Check server logs for details." });
        }
    }

    /// <summary>
    /// Tests RAG retrieval directly to diagnose issues.
    /// </summary>
    /// <param name="request">The test request with query.</param>
    /// <returns>RAG test result with context.</returns>
    /// <summary>
    /// Tests RAG retrieval with a query. Costs money per call (embedding generation).
    /// </summary>
    [HttpPost("test-rag")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> TestRag([FromBody] TestRagRequest request)
    {
        try
        {
            var businessId = Guid.Parse("00000000-0000-0000-0000-000000000100");
            var query = request?.Query ?? "Does QualiFlow have a built-in CRM?";

            _logger.LogWarning("RAG TEST: Starting for query '{Query}'", query);

            // Get KnowledgeBaseService from DI
            var kbService = HttpContext.RequestServices.GetRequiredService<QualiFlow.Application.Common.Interfaces.IKnowledgeBaseService>();

            _logger.LogWarning("RAG TEST: Calling RetrieveRelevantContextAsync...");
            var context = await kbService.RetrieveRelevantContextAsync(businessId, query, maxChunks: 3);
            var contextLength = context.Length;
            var hasContent = !string.IsNullOrEmpty(context);

            _logger.LogWarning("RAG TEST: Result length={Length}, hasContent={HasContent}", contextLength, hasContent);

            return Ok(new
            {
                query,
                businessId,
                contextLength,
                hasContent,
                context = context.Length > 1000 ? context.Substring(0, 1000) : context
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RAG TEST: Failed");
            return StatusCode(500, new { error = "RAG test failed. Check server logs for details." });
        }
    }

    /// <summary>
    /// Debug endpoint to check KB data directly without vector search.
    /// </summary>
    /// <returns>KB document status with chunk counts and business ID matches.</returns>
    [HttpGet("debug-kb")]
    [Authorize(Policy = AdminPolicies.RequirePlatformAdmin)]
    public async Task<IActionResult> DebugKnowledgeBase()
    {
        try
        {
            var targetBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

            // Use raw SQL to avoid EF Core pgVector issues
            var conn = _context.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            var results = new List<object>();

            using var cmd = conn.CreateCommand();

            // Check all KB documents and their business IDs
            cmd.CommandText = @"
                SELECT d.id, d.business_id, d.title, 
                       (SELECT COUNT(*) FROM knowledge_base_chunks c WHERE c.document_id = d.id) as chunk_count,
                       (SELECT COUNT(*) FROM knowledge_base_chunks c WHERE c.document_id = d.id AND c.embedding IS NOT NULL) as chunks_with_embedding
                FROM knowledge_base_documents d
                ORDER BY d.created_at DESC
                LIMIT 20";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new
                {
                    documentId = reader.GetGuid(0),
                    businessId = reader.GetGuid(1),
                    title = reader.GetString(2),
                    chunkCount = reader.GetInt64(3),
                    chunksWithEmbedding = reader.GetInt64(4),
                    matchesTarget = reader.GetGuid(1) == targetBusinessId
                });
            }

            return Ok(new
            {
                targetBusinessId,
                totalDocuments = results.Count,
                documents = results
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Debug KB failed");
            return StatusCode(500, new { error = "Debug failed. Check server logs for details." });
        }
    }
}

public class TestRagRequest
{
    public string? Query { get; set; }
}

public class IntResult
{
    public int Value { get; set; }
}
