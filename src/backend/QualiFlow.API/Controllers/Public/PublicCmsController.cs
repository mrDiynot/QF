using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.Admin.CMS.DTOs;
using QualiFlow.Application.Features.Admin.CMS.Services;

namespace QualiFlow.API.Controllers.Public;

/// <summary>
/// Public controller for CMS content (no authentication required).
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/public/cms")]
[AllowAnonymous]
[Produces("application/json")]
public partial class PublicCmsController : ControllerBase
{
    private readonly ICmsService _cmsService;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<PublicCmsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PublicCmsController"/> class.
    /// </summary>
    public PublicCmsController(
        ICmsService cmsService,
        IServiceScopeFactory serviceScopeFactory,
        ILogger<PublicCmsController> logger)
    {
        _cmsService = cmsService;
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    /// <summary>
    /// Gets all landing page data for the public website.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Complete landing page data.</returns>
    [HttpGet("landing-page")]
    [ProducesResponseType(typeof(LandingPageDataDto), StatusCodes.Status200OK)]
    [CacheControl(CacheStrategies.LongTerm)] // 1 hour - landing page content rarely changes
    public async Task<IActionResult> GetLandingPageData(CancellationToken cancellationToken)
    {
        var data = await _cmsService.GetLandingPageDataAsync(cancellationToken);
        return Ok(data);
    }

    /// <summary>
    /// Gets a CMS page by slug.
    /// </summary>
    /// <param name="slug">The page slug.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The CMS page.</returns>
    [HttpGet("pages/{slug}")]
    [ProducesResponseType(typeof(CmsPageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [CacheControl(CacheStrategies.LongTerm)] // 1 hour - CMS pages are curated content
    public async Task<IActionResult> GetPageBySlug(string slug, CancellationToken cancellationToken)
    {
        var page = await _cmsService.GetPageBySlugAsync(slug, cancellationToken);
        return page == null ? NotFound() : Ok(page);
    }

    /// <summary>
    /// Gets all active FAQs for the landing page.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of FAQs.</returns>
    [HttpGet("faqs")]
    [ProducesResponseType(typeof(List<FaqDto>), StatusCodes.Status200OK)]
    [CacheControl(CacheStrategies.LongTerm)] // 1 hour - FAQs are curated content
    public async Task<IActionResult> GetFaqs(CancellationToken cancellationToken)
    {
        var data = await _cmsService.GetLandingPageDataAsync(cancellationToken);
        return Ok(data.Faqs);
    }

    /// <summary>
    /// Gets all active testimonials.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of testimonials.</returns>
    [HttpGet("testimonials")]
    [ProducesResponseType(typeof(List<TestimonialDto>), StatusCodes.Status200OK)]
    [CacheControl(CacheStrategies.LongTerm)] // 1 hour - testimonials are curated content
    public async Task<IActionResult> GetTestimonials(CancellationToken cancellationToken)
    {
        var data = await _cmsService.GetLandingPageDataAsync(cancellationToken);
        return Ok(data.Testimonials);
    }

    /// <summary>
    /// Gets all pricing plans.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of pricing plans.</returns>
    [HttpGet("pricing")]
    [ProducesResponseType(typeof(PricingDataDto), StatusCodes.Status200OK)]
    [CacheControl(CacheStrategies.LongTerm)] // 1 hour - pricing plans rarely change
    public async Task<IActionResult> GetPricing(CancellationToken cancellationToken)
    {
        var data = await _cmsService.GetLandingPageDataAsync(cancellationToken);
        return Ok(new PricingDataDto
        {
            Plans = data.PricingPlans,
            AddOns = data.PricingAddOns,
            FeatureComparisons = data.FeatureComparisons,
        });
    }

    /// <summary>
    /// Gets all published blog posts.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of published blog posts.</returns>
    [HttpGet("blogs")]
    [ProducesResponseType(typeof(List<BlogPostListDto>), StatusCodes.Status200OK)]
    [CacheControl(CacheStrategies.ShortTerm)] // 5 min - blog list updates when admin publishes/edits posts
    public async Task<IActionResult> GetPublishedBlogPosts(CancellationToken cancellationToken)
    {
        var posts = await _cmsService.GetBlogPostsAsync(publishedOnly: true, cancellationToken);
        return Ok(posts);
    }

    /// <summary>
    /// Gets a published blog post by slug.
    /// </summary>
    /// <param name="slug">The blog post slug.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The blog post.</returns>
    [HttpGet("blogs/{slug}")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [CacheControl(CacheStrategies.ShortTerm)] // 5 min - blog content updates when admin edits posts
    public async Task<IActionResult> GetBlogPostBySlug(string slug, CancellationToken cancellationToken)
    {
        var post = await _cmsService.GetBlogPostBySlugAsync(slug, cancellationToken);
        if (post == null)
        {
            return NotFound();
        }

        // Increment view count in a background scope to avoid ObjectDisposedException
        var postId = post.Id;
        _ = Task.Run(
            async () =>
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var cmsService = scope.ServiceProvider.GetRequiredService<ICmsService>();
                await cmsService.IncrementBlogViewCountAsync(postId, CancellationToken.None);
            }
            catch (Exception ex)
            {
                // Log but don't throw — this is best-effort analytics
                LogViewCountError(_logger, postId, ex);
            }
        }, CancellationToken.None);

        return Ok(post);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to increment view count for blog post {PostId}")]
    private static partial void LogViewCountError(ILogger logger, Guid postId, Exception ex);
}

/// <summary>
/// DTO for pricing data.
/// </summary>
public class PricingDataDto
{
    /// <summary>Gets the pricing plans.</summary>
    public IReadOnlyList<CmsPricingPlanDto> Plans { get; init; } = [];

    /// <summary>Gets the pricing add-ons.</summary>
    public IReadOnlyList<CmsPricingAddOnDto> AddOns { get; init; } = [];

    /// <summary>Gets the feature comparisons.</summary>
    public IReadOnlyList<PricingFeatureComparisonDto> FeatureComparisons { get; init; } = [];
}

