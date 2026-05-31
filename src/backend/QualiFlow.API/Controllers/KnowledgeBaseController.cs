using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing knowledge base articles used for AI training and automated responses.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/knowledge-base")]
[Authorize(AuthenticationSchemes = "Bearer", Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class KnowledgeBaseController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<KnowledgeBaseController> _logger;

    public KnowledgeBaseController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<KnowledgeBaseController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all knowledge base articles for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="isPublished">Optional published filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of knowledge base articles.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<KnowledgeBaseArticleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<KnowledgeBaseArticleDto>>> GetArticlesAsync(
        [FromQuery] string? category,
        [FromQuery] bool? isPublished,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _context.KnowledgeBaseArticles
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId && a.DeletedAt == null);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(a => a.Category == category);
        }

        if (isPublished.HasValue)
        {
            query = query.Where(a => a.IsPublished == isPublished.Value);
        }

        var articles = await query
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = articles.Select(MapToDto);

        return Ok(dtos);
    }

    /// <summary>
    /// Gets a single knowledge base article by ID.
    /// </summary>
    /// <param name="id">Article ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The knowledge base article.</returns>
    [HttpGet("{id}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(KnowledgeBaseArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<KnowledgeBaseArticleDto>> GetArticleAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var article = await _context.KnowledgeBaseArticles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                a => a.Id == id && a.BusinessId == businessId && a.DeletedAt == null,
                cancellationToken);

        if (article == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(article));
    }

    /// <summary>
    /// Creates a new knowledge base article.
    /// </summary>
    /// <param name="request">Article creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created article.</returns>
    [HttpPost]
    [NoCache]
    [ProducesResponseType(typeof(KnowledgeBaseArticleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KnowledgeBaseArticleDto>> CreateArticleAsync(
        [FromBody] CreateKnowledgeBaseArticleRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var article = new KnowledgeBaseArticle
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            Tags = request.Tags,
            IsActive = request.IsActive ?? true,
            IsPublished = request.IsPublished ?? false,
            Priority = request.Priority ?? 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.KnowledgeBaseArticles.Add(article);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created knowledge base article {ArticleId} for business {BusinessId}",
            article.Id,
            businessId);

        return CreatedAtAction(
            nameof(GetArticleAsync),
            new { id = article.Id },
            MapToDto(article));
    }

    /// <summary>
    /// Updates an existing knowledge base article.
    /// </summary>
    /// <param name="id">Article ID.</param>
    /// <param name="request">Article update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated article.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(KnowledgeBaseArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<KnowledgeBaseArticleDto>> UpdateArticleAsync(
        Guid id,
        [FromBody] UpdateKnowledgeBaseArticleRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var article = await _context.KnowledgeBaseArticles
            .FirstOrDefaultAsync(
                a => a.Id == id && a.BusinessId == businessId && a.DeletedAt == null,
                cancellationToken);

        if (article == null)
        {
            return NotFound();
        }

        // Update fields
        if (request.Title != null)
        {
            article.Title = request.Title;
        }

        if (request.Content != null)
        {
            article.Content = request.Content;
        }

        if (request.Category != null)
        {
            article.Category = request.Category;
        }

        if (request.Tags != null)
        {
            article.Tags = request.Tags;
        }

        if (request.IsActive.HasValue)
        {
            article.IsActive = request.IsActive.Value;
        }

        if (request.IsPublished.HasValue)
        {
            article.IsPublished = request.IsPublished.Value;
        }

        if (request.Priority.HasValue)
        {
            article.Priority = request.Priority.Value;
        }

        article.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Updated knowledge base article {ArticleId}",
            article.Id);

        return Ok(MapToDto(article));
    }

    /// <summary>
    /// Deletes a knowledge base article (soft delete).
    /// </summary>
    /// <param name="id">Article ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteArticleAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var article = await _context.KnowledgeBaseArticles
            .FirstOrDefaultAsync(
                a => a.Id == id && a.BusinessId == businessId && a.DeletedAt == null,
                cancellationToken);

        if (article == null)
        {
            return NotFound();
        }

        article.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Deleted knowledge base article {ArticleId}",
            article.Id);

        return NoContent();
    }

    /// <summary>
    /// Gets article categories for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of unique categories.</returns>
    [HttpGet("categories")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<string>>> GetCategoriesAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var categories = await _context.KnowledgeBaseArticles
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId && a.DeletedAt == null && a.Category != null)
            .Select(a => a.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    // ============================================================================
    // FAQs Endpoints
    // ============================================================================

    /// <summary>
    /// Gets all FAQs for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of FAQs.</returns>
    [HttpGet("faqs")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<KnowledgeBaseFaqDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<KnowledgeBaseFaqDto>>> GetFaqsAsync(
        [FromQuery] string? category,
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _context.BusinessKnowledgeBases
            .AsNoTracking()
            .Where(kb => kb.BusinessId == businessId
                && kb.DeletedAt == null
                && kb.EntryType == Domain.Enums.KnowledgeEntryType.FAQ);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(kb => kb.Category == category);
        }

        if (isActive.HasValue)
        {
            query = query.Where(kb => kb.IsActive == isActive.Value);
        }

        var faqs = await query
            .OrderByDescending(kb => kb.Priority)
            .ThenByDescending(kb => kb.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = faqs.Select(MapToFaqDto);

        return Ok(dtos);
    }

    /// <summary>
    /// Creates a new FAQ.
    /// </summary>
    /// <param name="request">FAQ creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created FAQ.</returns>
    [HttpPost("faqs")]
    [NoCache]
    [ProducesResponseType(typeof(KnowledgeBaseFaqDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KnowledgeBaseFaqDto>> CreateFaqAsync(
        [FromBody] CreateFaqRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "CreateFaqAsync called with Question={Question}, Answer={Answer}",
            request?.Question ?? "NULL",
            request?.Answer ?? "NULL");

        if (request == null || string.IsNullOrEmpty(request.Question) || string.IsNullOrEmpty(request.Answer))
        {
            return BadRequest(new { message = "Question and Answer are required" });
        }

        var businessId = _currentUserService.GetBusinessId();

        var faq = new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            EntryType = Domain.Enums.KnowledgeEntryType.FAQ,
            Title = request.Question,
            Content = request.Answer,
            Category = request.Category,
            Keywords = request.Keywords != null ? string.Join(",", request.Keywords) : null,
            Priority = request.Priority ?? 50,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.BusinessKnowledgeBases.Add(faq);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created FAQ {FaqId} for business {BusinessId}", faq.Id, businessId);

        return Created(new Uri($"/api/v1/knowledge-base/faqs/{faq.Id}", UriKind.Relative), MapToFaqDto(faq));
    }

    /// <summary>
    /// Updates an existing FAQ.
    /// </summary>
    /// <param name="id">FAQ ID.</param>
    /// <param name="request">FAQ update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated FAQ.</returns>
    [HttpPut("faqs/{id}")]
    [ProducesResponseType(typeof(KnowledgeBaseFaqDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<KnowledgeBaseFaqDto>> UpdateFaqAsync(
        Guid id,
        [FromBody] UpdateFaqRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var faq = await _context.BusinessKnowledgeBases
            .FirstOrDefaultAsync(
                kb => kb.Id == id && kb.BusinessId == businessId
                    && kb.EntryType == Domain.Enums.KnowledgeEntryType.FAQ
                    && kb.DeletedAt == null,
                cancellationToken);

        if (faq == null)
        {
            return NotFound();
        }

        if (request.Question != null)
        {
            faq.Title = request.Question;
        }

        if (request.Answer != null)
        {
            faq.Content = request.Answer;
        }

        if (request.Category != null)
        {
            faq.Category = request.Category;
        }

        if (request.Keywords != null)
        {
            faq.Keywords = string.Join(",", request.Keywords);
        }

        if (request.Priority.HasValue)
        {
            faq.Priority = request.Priority.Value;
        }

        if (request.IsActive.HasValue)
        {
            faq.IsActive = request.IsActive.Value;
        }

        faq.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(MapToFaqDto(faq));
    }

    /// <summary>
    /// Deletes a FAQ (soft delete).
    /// </summary>
    /// <param name="id">FAQ ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("faqs/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFaqAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var faq = await _context.BusinessKnowledgeBases
            .FirstOrDefaultAsync(
                kb => kb.Id == id && kb.BusinessId == businessId
                    && kb.EntryType == Domain.Enums.KnowledgeEntryType.FAQ
                    && kb.DeletedAt == null,
                cancellationToken);

        if (faq == null)
        {
            return NotFound();
        }

        faq.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted FAQ {FaqId}", faq.Id);

        return NoContent();
    }

    // ============================================================================
    // Documents Endpoints
    // ============================================================================

    /// <summary>
    /// Gets all documents for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of documents.</returns>
    [HttpGet("documents")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<KnowledgeBaseDocumentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<KnowledgeBaseDocumentDto>>> GetDocumentsAsync(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var documents = await _context.BusinessKnowledgeBases
            .AsNoTracking()
            .Where(kb => kb.BusinessId == businessId
                && kb.DeletedAt == null
                && (kb.EntryType == Domain.Enums.KnowledgeEntryType.Document
                    || kb.EntryType == Domain.Enums.KnowledgeEntryType.URL))
            .OrderByDescending(kb => kb.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = documents.Select(MapToDocumentDto);

        return Ok(dtos);
    }

    /// <summary>
    /// Uploads a document.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created document.</returns>
    [HttpPost("documents")]
    [NoCache]
    [ProducesResponseType(typeof(KnowledgeBaseDocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KnowledgeBaseDocumentDto>> UploadDocumentAsync(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Read file content
        using var reader = new StreamReader(file.OpenReadStream());
        var content = await reader.ReadToEndAsync(cancellationToken);

        var document = new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            EntryType = Domain.Enums.KnowledgeEntryType.Document,
            Title = file.FileName,
            Content = content,
            Priority = 50,
            IsActive = true,
            MetadataJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                Size = file.Length,
                ContentType = file.ContentType,
                Status = "ready",
                Chunks = (int)Math.Ceiling(content.Length / 1000.0)
            }),
            CreatedAt = DateTime.UtcNow
        };

        _context.BusinessKnowledgeBases.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Uploaded document {DocumentId} for business {BusinessId}", document.Id, businessId);

        return CreatedAtAction(nameof(GetDocumentsAsync), MapToDocumentDto(document));
    }

    /// <summary>
    /// Adds a URL to the knowledge base.
    /// </summary>
    /// <param name="request">URL request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created document entry.</returns>
    [HttpPost("urls")]
    [NoCache]
    [ProducesResponseType(typeof(KnowledgeBaseDocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KnowledgeBaseDocumentDto>> AddUrlAsync(
        [FromBody] AddUrlRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return BadRequest("URL is required");
        }

        var document = new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            EntryType = Domain.Enums.KnowledgeEntryType.URL,
            Title = request.Name ?? new Uri(request.Url).Host,
            Content = request.Url,
            Priority = 50,
            IsActive = true,
            MetadataJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                Url = request.Url,
                Status = "processing",
                Chunks = 0
            }),
            CreatedAt = DateTime.UtcNow
        };

        _context.BusinessKnowledgeBases.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Added URL {Url} for business {BusinessId}", request.Url, businessId);

        return CreatedAtAction(nameof(GetDocumentsAsync), MapToDocumentDto(document));
    }

    /// <summary>
    /// Deletes a document (soft delete).
    /// </summary>
    /// <param name="id">Document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("documents/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDocumentAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var document = await _context.BusinessKnowledgeBases
            .FirstOrDefaultAsync(
                kb => kb.Id == id && kb.BusinessId == businessId
                    && (kb.EntryType == Domain.Enums.KnowledgeEntryType.Document
                        || kb.EntryType == Domain.Enums.KnowledgeEntryType.URL)
                    && kb.DeletedAt == null,
                cancellationToken);

        if (document == null)
        {
            return NotFound();
        }

        document.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted document {DocumentId}", document.Id);

        return NoContent();
    }

    // ============================================================================
    // Stats Endpoint
    // ============================================================================

    /// <summary>
    /// Gets knowledge base statistics for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Knowledge base statistics.</returns>
    [HttpGet("stats")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(KnowledgeBaseStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<KnowledgeBaseStatsDto>> GetStatsAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var totalArticles = await _context.KnowledgeBaseArticles
            .CountAsync(a => a.BusinessId == businessId && a.DeletedAt == null, cancellationToken);

        var totalFaqs = await _context.BusinessKnowledgeBases
            .CountAsync(
                kb => kb.BusinessId == businessId
                    && kb.DeletedAt == null
                    && kb.EntryType == Domain.Enums.KnowledgeEntryType.FAQ,
                cancellationToken);

        var totalDocuments = await _context.BusinessKnowledgeBases
            .CountAsync(
                kb => kb.BusinessId == businessId
                    && kb.DeletedAt == null
                    && (kb.EntryType == Domain.Enums.KnowledgeEntryType.Document
                        || kb.EntryType == Domain.Enums.KnowledgeEntryType.URL),
                cancellationToken);

        // Calculate storage used (estimate based on content length)
        var articleStorage = await _context.KnowledgeBaseArticles
            .Where(a => a.BusinessId == businessId && a.DeletedAt == null)
            .SumAsync(a => (long)a.Content.Length, cancellationToken);

        var kbStorage = await _context.BusinessKnowledgeBases
            .Where(kb => kb.BusinessId == businessId && kb.DeletedAt == null)
            .SumAsync(kb => (long)kb.Content.Length, cancellationToken);

        var storageUsed = articleStorage + kbStorage;

        // Get business subscription storage limit (default 100MB)
        var subscription = await _context.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.BusinessId == businessId && s.Status == Domain.Enums.SubscriptionStatus.Active)
            .FirstOrDefaultAsync(cancellationToken);

        // Default storage limit based on subscription tier
        long storageLimit = 5 * 1024 * 1024; // 5MB default (FreeFlow)
        if (subscription?.Plan != null)
        {
            var planName = subscription.Plan.Name.Replace(" ", string.Empty, StringComparison.Ordinal);
            storageLimit = planName switch
            {
                "FreeFlow" => 5 * 1024 * 1024,      // 5MB
                "SmartFlow" => 100 * 1024 * 1024,   // 100MB
                "UltraFlow" => 500 * 1024 * 1024,   // 500MB
                "Enterprise" => 5L * 1024 * 1024 * 1024, // 5GB
                _ => 100 * 1024 * 1024
            };
        }

        return Ok(new KnowledgeBaseStatsDto
        {
            TotalArticles = totalArticles,
            TotalDocuments = totalDocuments,
            TotalFaqs = totalFaqs,
            StorageUsedBytes = storageUsed,
            StorageLimitBytes = storageLimit,
            LastUpdated = DateTime.UtcNow
        });
    }

    // ============================================================================
    // Mapping Helpers
    // ============================================================================

    private static KnowledgeBaseArticleDto MapToDto(KnowledgeBaseArticle article)
    {
        return new KnowledgeBaseArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            Category = article.Category,
            Tags = article.Tags,
            IsActive = article.IsActive,
            IsPublished = article.IsPublished,
            Priority = article.Priority,
            UsageCount = article.UsageCount,
            LastUsedAt = article.LastUsedAt,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt
        };
    }

    private static KnowledgeBaseFaqDto MapToFaqDto(BusinessKnowledgeBase faq)
    {
        return new KnowledgeBaseFaqDto
        {
            Id = faq.Id,
            BusinessId = faq.BusinessId,
            Question = faq.Title,
            Answer = faq.Content,
            Category = faq.Category,
            Keywords = faq.Keywords?.Split(',', StringSplitOptions.RemoveEmptyEntries),
            Priority = faq.Priority,
            IsActive = faq.IsActive,
            CreatedAt = faq.CreatedAt,
            UpdatedAt = faq.UpdatedAt
        };
    }

    private static KnowledgeBaseDocumentDto MapToDocumentDto(BusinessKnowledgeBase doc)
    {
        // Parse metadata
        long? size = null;
        string status = "ready";
        int? chunks = null;
        string? url = null;

        if (!string.IsNullOrEmpty(doc.MetadataJson))
        {
            try
            {
                using var jsonDoc = System.Text.Json.JsonDocument.Parse(doc.MetadataJson);
                var root = jsonDoc.RootElement;

                if (root.TryGetProperty("Size", out var sizeEl))
                {
                    size = sizeEl.GetInt64();
                }

                if (root.TryGetProperty("Status", out var statusEl))
                {
                    status = statusEl.GetString() ?? "ready";
                }

                if (root.TryGetProperty("Chunks", out var chunksEl))
                {
                    chunks = chunksEl.GetInt32();
                }

                if (root.TryGetProperty("Url", out var urlEl))
                {
                    url = urlEl.GetString();
                }
            }
            catch
            {
                // Ignore parse errors
            }
        }

        return new KnowledgeBaseDocumentDto
        {
            Id = doc.Id,
            BusinessId = doc.BusinessId,
            Name = doc.Title,
            Type = doc.EntryType == Domain.Enums.KnowledgeEntryType.URL ? "url" : "document",
            Status = status,
            Size = size,
            Url = url ?? (doc.EntryType == Domain.Enums.KnowledgeEntryType.URL ? doc.Content : null),
            Content = doc.EntryType == Domain.Enums.KnowledgeEntryType.Document ? doc.Content : null,
            Chunks = chunks,
            CreatedAt = doc.CreatedAt,
            UpdatedAt = doc.UpdatedAt
        };
    }
}

// ============================================================================
// DTOs
// ============================================================================

/// <summary>
/// Knowledge base article DTO.
/// </summary>
public record KnowledgeBaseArticleDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string? Category { get; init; }
    public string? Tags { get; init; }
    public bool IsActive { get; init; }
    public bool IsPublished { get; init; }
    public int Priority { get; init; }
    public int UsageCount { get; init; }
    public DateTime? LastUsedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create a knowledge base article.
/// </summary>
public record CreateKnowledgeBaseArticleRequest
{
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string? Category { get; init; }
    public string? Tags { get; init; }
    public bool? IsActive { get; init; }
    public bool? IsPublished { get; init; }
    public int? Priority { get; init; }
}

/// <summary>
/// Request to update a knowledge base article.
/// </summary>
public record UpdateKnowledgeBaseArticleRequest
{
    public string? Title { get; init; }
    public string? Content { get; init; }
    public string? Category { get; init; }
    public string? Tags { get; init; }
    public bool? IsActive { get; init; }
    public bool? IsPublished { get; init; }
    public int? Priority { get; init; }
}

// ============================================================================
// FAQ DTOs
// ============================================================================

/// <summary>
/// Knowledge base FAQ DTO.
/// </summary>
public record KnowledgeBaseFaqDto
{
    public Guid Id { get; init; }
    public Guid BusinessId { get; init; }
    public string Question { get; init; } = string.Empty;
    public string Answer { get; init; } = string.Empty;
    public string? Category { get; init; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1819:Properties should not return arrays", Justification = "DTO for API response")]
    public string[]? Keywords { get; init; }

    public int Priority { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create a FAQ.
/// </summary>
public record CreateFaqRequest
{
    public string Question { get; init; } = string.Empty;
    public string Answer { get; init; } = string.Empty;
    public string? Category { get; init; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1819:Properties should not return arrays", Justification = "DTO for API request")]
    public string[]? Keywords { get; init; }

    public int? Priority { get; init; }
}

/// <summary>
/// Request to update a FAQ.
/// </summary>
public record UpdateFaqRequest
{
    public string? Question { get; init; }
    public string? Answer { get; init; }
    public string? Category { get; init; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1819:Properties should not return arrays", Justification = "DTO for API request")]
    public string[]? Keywords { get; init; }

    public int? Priority { get; init; }
    public bool? IsActive { get; init; }
}

// ============================================================================
// Document DTOs
// ============================================================================

/// <summary>
/// Knowledge base document DTO.
/// </summary>
public record KnowledgeBaseDocumentDto
{
    public Guid Id { get; init; }
    public Guid BusinessId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = "document";
    public string Status { get; init; } = "ready";
    public long? Size { get; init; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "DTO for API response")]
    public string? Url { get; init; }

    public string? Content { get; init; }
    public int? Chunks { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to add a URL.
/// </summary>
public record AddUrlRequest
{
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "DTO for API request")]
    public string Url { get; init; } = string.Empty;

    public string? Name { get; init; }
}

// ============================================================================
// Stats DTO
// ============================================================================

/// <summary>
/// Knowledge base statistics DTO.
/// </summary>
public record KnowledgeBaseStatsDto
{
    public int TotalArticles { get; init; }
    public int TotalDocuments { get; init; }
    public int TotalFaqs { get; init; }
    public long StorageUsedBytes { get; init; }
    public long StorageLimitBytes { get; init; }
    public DateTime LastUpdated { get; init; }
}
