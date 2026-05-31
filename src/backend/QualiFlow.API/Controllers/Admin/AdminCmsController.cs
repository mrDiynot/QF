using Asp.Versioning;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.CMS.DTOs;
using QualiFlow.Application.Features.Admin.CMS.Services;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for CMS management.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/cms")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequireContentAdmin)]
[Produces("application/json")]
public class AdminCmsController : ControllerBase
{
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ];

    private readonly ICmsService _cmsService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminCmsController"/> class.
    /// </summary>
    public AdminCmsController(ICmsService cmsService)
    {
        _cmsService = cmsService;
    }

    // ========================================================================
    // FAQs
    // ========================================================================

    /// <summary>Gets all FAQs.</summary>
    /// <returns>List of FAQs.</returns>
    [HttpGet("faqs")]
    [ProducesResponseType(typeof(List<FaqDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFaqs(CancellationToken cancellationToken)
    {
        var faqs = await _cmsService.GetFaqsAsync(cancellationToken);
        return Ok(faqs);
    }

    /// <summary>Gets a FAQ by ID.</summary>
    /// <returns>The FAQ or NotFound.</returns>
    [HttpGet("faqs/{id:guid}")]
    [ProducesResponseType(typeof(FaqDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFaq(Guid id, CancellationToken cancellationToken)
    {
        var faq = await _cmsService.GetFaqByIdAsync(id, cancellationToken);
        return faq == null ? NotFound() : Ok(faq);
    }

    /// <summary>Creates a new FAQ.</summary>
    /// <returns>The created FAQ.</returns>
    [HttpPost("faqs")]
    [ProducesResponseType(typeof(FaqDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFaq([FromBody] FaqRequest request, CancellationToken cancellationToken)
    {
        var faq = await _cmsService.CreateFaqAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetFaq), new { id = faq.Id }, faq);
    }

    /// <summary>Updates an existing FAQ.</summary>
    /// <returns>The updated FAQ or NotFound.</returns>
    [HttpPut("faqs/{id:guid}")]
    [ProducesResponseType(typeof(FaqDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFaq(Guid id, [FromBody] FaqRequest request, CancellationToken cancellationToken)
    {
        var faq = await _cmsService.UpdateFaqAsync(id, request, cancellationToken);
        return faq == null ? NotFound() : Ok(faq);
    }

    /// <summary>Deletes a FAQ.</summary>
    /// <returns>NoContent or NotFound.</returns>
    [HttpDelete("faqs/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFaq(Guid id, CancellationToken cancellationToken)
    {
        var result = await _cmsService.DeleteFaqAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }

    // ========================================================================
    // Testimonials
    // ========================================================================

    /// <summary>Gets all testimonials.</summary>
    /// <returns>List of testimonials.</returns>
    [HttpGet("testimonials")]
    [ProducesResponseType(typeof(List<TestimonialDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTestimonials(CancellationToken cancellationToken)
    {
        var testimonials = await _cmsService.GetTestimonialsAsync(cancellationToken);
        return Ok(testimonials);
    }

    /// <summary>Gets a testimonial by ID.</summary>
    /// <returns>The testimonial or NotFound.</returns>
    [HttpGet("testimonials/{id:guid}")]
    [ProducesResponseType(typeof(TestimonialDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTestimonial(Guid id, CancellationToken cancellationToken)
    {
        var testimonial = await _cmsService.GetTestimonialByIdAsync(id, cancellationToken);
        return testimonial == null ? NotFound() : Ok(testimonial);
    }

    /// <summary>Creates a new testimonial.</summary>
    /// <returns>The created testimonial.</returns>
    [HttpPost("testimonials")]
    [ProducesResponseType(typeof(TestimonialDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateTestimonial([FromBody] TestimonialRequest request, CancellationToken cancellationToken)
    {
        var testimonial = await _cmsService.CreateTestimonialAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetTestimonial), new { id = testimonial.Id }, testimonial);
    }

    /// <summary>Updates an existing testimonial.</summary>
    /// <returns>The updated testimonial or NotFound.</returns>
    [HttpPut("testimonials/{id:guid}")]
    [ProducesResponseType(typeof(TestimonialDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTestimonial(Guid id, [FromBody] TestimonialRequest request, CancellationToken cancellationToken)
    {
        var testimonial = await _cmsService.UpdateTestimonialAsync(id, request, cancellationToken);
        return testimonial == null ? NotFound() : Ok(testimonial);
    }

    /// <summary>Deletes a testimonial.</summary>
    /// <returns>NoContent or NotFound.</returns>
    [HttpDelete("testimonials/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTestimonial(Guid id, CancellationToken cancellationToken)
    {
        var result = await _cmsService.DeleteTestimonialAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }

    // ========================================================================
    // CMS Pages
    // ========================================================================

    /// <summary>Gets all CMS pages.</summary>
    /// <returns>List of CMS pages.</returns>
    [HttpGet("pages")]
    [ProducesResponseType(typeof(List<CmsPageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPages(CancellationToken cancellationToken)
    {
        var pages = await _cmsService.GetPagesAsync(cancellationToken);
        return Ok(pages);
    }

    /// <summary>Gets a CMS page by ID.</summary>
    /// <returns>The CMS page or NotFound.</returns>
    [HttpGet("pages/{id:guid}")]
    [ProducesResponseType(typeof(CmsPageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPage(Guid id, CancellationToken cancellationToken)
    {
        var page = await _cmsService.GetPageByIdAsync(id, cancellationToken);
        return page == null ? NotFound() : Ok(page);
    }

    /// <summary>Creates a new CMS page.</summary>
    /// <returns>The created CMS page.</returns>
    [HttpPost("pages")]
    [ProducesResponseType(typeof(CmsPageDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreatePage([FromBody] CmsPageRequest request, CancellationToken cancellationToken)
    {
        var page = await _cmsService.CreatePageAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetPage), new { id = page.Id }, page);
    }

    /// <summary>Updates an existing CMS page.</summary>
    /// <returns>The updated CMS page or NotFound.</returns>
    [HttpPut("pages/{id:guid}")]
    [ProducesResponseType(typeof(CmsPageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePage(Guid id, [FromBody] CmsPageRequest request, CancellationToken cancellationToken)
    {
        var page = await _cmsService.UpdatePageAsync(id, request, cancellationToken);
        return page == null ? NotFound() : Ok(page);
    }

    /// <summary>Deletes a CMS page.</summary>
    /// <returns>NoContent or NotFound.</returns>
    [HttpDelete("pages/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePage(Guid id, CancellationToken cancellationToken)
    {
        var result = await _cmsService.DeletePageAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }

    // ========================================================================
    // Statistics
    // ========================================================================

    /// <summary>Gets all landing page statistics.</summary>
    /// <returns>List of statistics.</returns>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(List<LandingPageStatisticDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        var stats = await _cmsService.GetStatisticsAsync(cancellationToken);
        return Ok(stats);
    }

    /// <summary>Updates a landing page statistic.</summary>
    /// <returns>The updated statistic or NotFound.</returns>
    [HttpPut("statistics/{id:guid}")]
    [ProducesResponseType(typeof(LandingPageStatisticDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatistic(Guid id, [FromBody] UpdateStatisticRequest request, CancellationToken cancellationToken)
    {
        var stat = await _cmsService.UpdateStatisticAsync(id, request.Value, request.Label, request.DisplayOrder, request.IsActive, cancellationToken);
        return stat == null ? NotFound() : Ok(stat);
    }

    // ========================================================================
    // Trusted Companies
    // ========================================================================

    /// <summary>Gets all trusted companies.</summary>
    /// <returns>List of trusted companies.</returns>
    [HttpGet("trusted-companies")]
    [ProducesResponseType(typeof(List<TrustedCompanyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrustedCompanies(CancellationToken cancellationToken)
    {
        var companies = await _cmsService.GetTrustedCompaniesAsync(cancellationToken);
        return Ok(companies);
    }

    /// <summary>Updates a trusted company.</summary>
    /// <returns>The updated company or NotFound.</returns>
    [HttpPut("trusted-companies/{id:guid}")]
    [ProducesResponseType(typeof(TrustedCompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTrustedCompany(Guid id, [FromBody] UpdateTrustedCompanyRequest request, CancellationToken cancellationToken)
    {
        var company = await _cmsService.UpdateTrustedCompanyAsync(id, request.Name, request.LogoPath, request.WebsiteLink, request.DisplayOrder, request.IsActive, cancellationToken);
        return company == null ? NotFound() : Ok(company);
    }

    // ========================================================================
    // Pricing Add-Ons
    // ========================================================================

    /// <summary>Gets all pricing add-ons.</summary>
    /// <returns>List of pricing add-ons.</returns>
    [HttpGet("pricing-addons")]
    [ProducesResponseType(typeof(List<CmsPricingAddOnDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPricingAddOns(CancellationToken cancellationToken)
    {
        var addOns = await _cmsService.GetPricingAddOnsAsync(cancellationToken);
        return Ok(addOns);
    }

    /// <summary>Updates a pricing add-on.</summary>
    /// <returns>The updated add-on or NotFound.</returns>
    [HttpPut("pricing-addons/{id:guid}")]
    [ProducesResponseType(typeof(CmsPricingAddOnDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePricingAddOn(Guid id, [FromBody] CmsPricingAddOnRequest request, CancellationToken cancellationToken)
    {
        var addOn = await _cmsService.UpdatePricingAddOnAsync(id, request, cancellationToken);
        return addOn == null ? NotFound() : Ok(addOn);
    }

    // ========================================================================
    // Feature Comparisons
    // ========================================================================

    /// <summary>Gets all feature comparisons.</summary>
    /// <returns>List of feature comparisons.</returns>
    [HttpGet("feature-comparisons")]
    [ProducesResponseType(typeof(List<PricingFeatureComparisonDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeatureComparisons(CancellationToken cancellationToken)
    {
        var comparisons = await _cmsService.GetFeatureComparisonsAsync(cancellationToken);
        return Ok(comparisons);
    }

    /// <summary>Updates a feature comparison.</summary>
    /// <returns>The updated comparison or NotFound.</returns>
    [HttpPut("feature-comparisons/{id:guid}")]
    [ProducesResponseType(typeof(PricingFeatureComparisonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFeatureComparison(Guid id, [FromBody] PricingFeatureComparisonRequest request, CancellationToken cancellationToken)
    {
        var comparison = await _cmsService.UpdateFeatureComparisonAsync(id, request, cancellationToken);
        return comparison == null ? NotFound() : Ok(comparison);
    }

    // ========================================================================
    // Blog Posts
    // ========================================================================

    /// <summary>Gets all blog posts (including drafts).</summary>
    /// <returns>List of blog posts.</returns>
    [HttpGet("blogs")]
    [ProducesResponseType(typeof(List<BlogPostListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBlogPosts(CancellationToken cancellationToken)
    {
        var posts = await _cmsService.GetBlogPostsAsync(publishedOnly: null, cancellationToken);
        return Ok(posts);
    }

    /// <summary>Gets a blog post by ID.</summary>
    /// <returns>The blog post or NotFound.</returns>
    [HttpGet("blogs/{id:guid}")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBlogPost(Guid id, CancellationToken cancellationToken)
    {
        var post = await _cmsService.GetBlogPostByIdAsync(id, cancellationToken);
        return post == null ? NotFound() : Ok(post);
    }

    /// <summary>Creates a new blog post.</summary>
    /// <returns>The created blog post.</returns>
    [HttpPost("blogs")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBlogPost([FromBody] CreateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var post = await _cmsService.CreateBlogPostAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetBlogPost), new { id = post.Id }, post);
    }

    /// <summary>Updates an existing blog post.</summary>
    /// <returns>The updated blog post or NotFound.</returns>
    [HttpPut("blogs/{id:guid}")]
    [ProducesResponseType(typeof(BlogPostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBlogPost(Guid id, [FromBody] UpdateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var post = await _cmsService.UpdateBlogPostAsync(id, request, cancellationToken);
        return post == null ? NotFound() : Ok(post);
    }

    /// <summary>Deletes a blog post.</summary>
    /// <returns>NoContent or NotFound.</returns>
    [HttpDelete("blogs/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBlogPost(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _cmsService.DeleteBlogPostAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    // ========================================================================
    // Image Upload
    // ========================================================================

    /// <summary>
    /// Uploads an image for use in blog posts (featured image, author avatar, inline content).
    /// </summary>
    /// <param name="file">The image file to upload.</param>
    /// <param name="blobStorageService">The blob storage service (injected per-request).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The URL of the uploaded image.</returns>
    /// <response code="200">Image uploaded successfully.</response>
    /// <response code="400">Invalid file type or size.</response>
    [HttpPost("upload-image")]
    [ProducesResponseType(typeof(ImageUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromServices] IBlobStorageService blobStorageService,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No file provided." });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new { error = "File size exceeds the 10 MB limit." });
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest(new { error = $"File type '{file.ContentType}' is not allowed. Allowed types: JPEG, PNG, GIF, WebP, SVG." });
        }

        // Generate a unique blob name: cms-images/{year}/{month}/{guid}-{filename}
        var now = DateTime.UtcNow;
        var safeFileName = Path.GetFileName(file.FileName).Replace(" ", "-", StringComparison.Ordinal);
        var blobName = $"{now:yyyy}/{now:MM}/{Guid.NewGuid():N}-{safeFileName}";

        await using var stream = file.OpenReadStream();
        var url = await blobStorageService.UploadAsync(
            "cms-images",
            blobName,
            stream,
            file.ContentType,
            cancellationToken);

        return Ok(new ImageUploadResponse
        {
            Url = url,
            FileName = file.FileName,
            ContentType = file.ContentType,
            SizeBytes = file.Length,
        });
    }
}

/// <summary>Response from an image upload.</summary>
public class ImageUploadResponse
{
    /// <summary>Gets or sets the URL of the uploaded image.</summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like return values should not be strings", Justification = "DTO property returned as JSON string")]
    public string Url { get; set; } = string.Empty;

    /// <summary>Gets or sets the original file name.</summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>Gets or sets the content type.</summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>Gets or sets the file size in bytes.</summary>
    public long SizeBytes { get; set; }
}

/// <summary>Request to update a statistic.</summary>
public class UpdateStatisticRequest
{
    /// <summary>Gets or sets the value.</summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>Gets or sets the label.</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the statistic is active.</summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>Request to update a trusted company.</summary>
public class UpdateTrustedCompanyRequest
{
    /// <summary>Gets or sets the name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the logo path.</summary>
    public string? LogoPath { get; set; }

    /// <summary>Gets or sets the website link.</summary>
    public string? WebsiteLink { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the company is active.</summary>
    public bool IsActive { get; set; } = true;
}

