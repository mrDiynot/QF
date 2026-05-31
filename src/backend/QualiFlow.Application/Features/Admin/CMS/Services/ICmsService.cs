using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using QualiFlow.Application.Features.Admin.CMS.DTOs;

#pragma warning disable CA1002 // Do not expose generic lists - DTOs need mutable collections for serialization
#pragma warning disable MA0016 // Prefer using collection abstraction - DTOs need concrete types for serialization

namespace QualiFlow.Application.Features.Admin.CMS.Services;

/// <summary>
/// Service interface for CMS operations.
/// </summary>
public interface ICmsService
{
    // ========================================================================
    // Landing Page Data (Public)
    // ========================================================================

    /// <summary>
    /// Gets all landing page data for the public website.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Complete landing page data.</returns>
    Task<LandingPageDataDto> GetLandingPageDataAsync(CancellationToken cancellationToken = default);

    // ========================================================================
    // FAQs
    // ========================================================================

    /// <summary>Gets all FAQs.</summary>
    /// <returns>List of FAQs.</returns>
    Task<List<FaqDto>> GetFaqsAsync(CancellationToken cancellationToken = default);

    /// <summary>Gets a FAQ by ID.</summary>
    /// <returns>The FAQ or null if not found.</returns>
    Task<FaqDto?> GetFaqByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Creates a new FAQ.</summary>
    /// <returns>The created FAQ.</returns>
    Task<FaqDto> CreateFaqAsync(FaqRequest request, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing FAQ.</summary>
    /// <returns>The updated FAQ or null if not found.</returns>
    Task<FaqDto?> UpdateFaqAsync(Guid id, FaqRequest request, CancellationToken cancellationToken = default);

    /// <summary>Deletes a FAQ.</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteFaqAsync(Guid id, CancellationToken cancellationToken = default);

    // ========================================================================
    // Testimonials
    // ========================================================================

    /// <summary>Gets all testimonials.</summary>
    /// <returns>List of testimonials.</returns>
    Task<List<TestimonialDto>> GetTestimonialsAsync(CancellationToken cancellationToken = default);

    /// <summary>Gets a testimonial by ID.</summary>
    /// <returns>The testimonial or null if not found.</returns>
    Task<TestimonialDto?> GetTestimonialByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Creates a new testimonial.</summary>
    /// <returns>The created testimonial.</returns>
    Task<TestimonialDto> CreateTestimonialAsync(TestimonialRequest request, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing testimonial.</summary>
    /// <returns>The updated testimonial or null if not found.</returns>
    Task<TestimonialDto?> UpdateTestimonialAsync(Guid id, TestimonialRequest request, CancellationToken cancellationToken = default);

    /// <summary>Deletes a testimonial.</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteTestimonialAsync(Guid id, CancellationToken cancellationToken = default);

    // ========================================================================
    // CMS Pages
    // ========================================================================

    /// <summary>Gets all CMS pages.</summary>
    /// <returns>List of CMS pages.</returns>
    Task<List<CmsPageDto>> GetPagesAsync(CancellationToken cancellationToken = default);

    /// <summary>Gets a CMS page by ID.</summary>
    /// <returns>The CMS page or null if not found.</returns>
    Task<CmsPageDto?> GetPageByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Gets a CMS page by slug.</summary>
    /// <returns>The CMS page or null if not found.</returns>
    Task<CmsPageDto?> GetPageBySlugAsync(string slug, CancellationToken cancellationToken = default);

    /// <summary>Creates a new CMS page.</summary>
    /// <returns>The created CMS page.</returns>
    Task<CmsPageDto> CreatePageAsync(CmsPageRequest request, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing CMS page.</summary>
    /// <returns>The updated CMS page or null if not found.</returns>
    Task<CmsPageDto?> UpdatePageAsync(Guid id, CmsPageRequest request, CancellationToken cancellationToken = default);

    /// <summary>Deletes a CMS page.</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeletePageAsync(Guid id, CancellationToken cancellationToken = default);

    // ========================================================================
    // Statistics
    // ========================================================================

    /// <summary>Gets all landing page statistics.</summary>
    /// <returns>List of statistics.</returns>
    Task<List<LandingPageStatisticDto>> GetStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>Updates a statistic.</summary>
    /// <returns>The updated statistic or null if not found.</returns>
    Task<LandingPageStatisticDto?> UpdateStatisticAsync(Guid id, string value, string label, int displayOrder, bool isActive, CancellationToken cancellationToken = default);

    // ========================================================================
    // Trusted Companies
    // ========================================================================

    /// <summary>Gets all trusted companies.</summary>
    /// <returns>List of trusted companies.</returns>
    Task<List<TrustedCompanyDto>> GetTrustedCompaniesAsync(CancellationToken cancellationToken = default);

    /// <summary>Updates a trusted company.</summary>
    /// <returns>The updated trusted company or null if not found.</returns>
    Task<TrustedCompanyDto?> UpdateTrustedCompanyAsync(Guid id, string name, string? logoPath, string? websiteLink, int displayOrder, bool isActive, CancellationToken cancellationToken = default);

    // ========================================================================
    // Pricing Add-Ons
    // ========================================================================

    /// <summary>Gets all pricing add-ons.</summary>
    /// <returns>List of pricing add-ons.</returns>
    Task<List<CmsPricingAddOnDto>> GetPricingAddOnsAsync(CancellationToken cancellationToken = default);

    /// <summary>Updates a pricing add-on.</summary>
    /// <returns>The updated pricing add-on or null if not found.</returns>
    Task<CmsPricingAddOnDto?> UpdatePricingAddOnAsync(Guid id, CmsPricingAddOnRequest request, CancellationToken cancellationToken = default);

    // ========================================================================
    // Feature Comparisons
    // ========================================================================

    /// <summary>Gets all feature comparisons.</summary>
    /// <returns>List of feature comparisons.</returns>
    Task<List<PricingFeatureComparisonDto>> GetFeatureComparisonsAsync(CancellationToken cancellationToken = default);

    /// <summary>Updates a feature comparison.</summary>
    /// <returns>The updated feature comparison or null if not found.</returns>
    Task<PricingFeatureComparisonDto?> UpdateFeatureComparisonAsync(Guid id, PricingFeatureComparisonRequest request, CancellationToken cancellationToken = default);

    // ========================================================================
    // Blog Posts
    // ========================================================================

    /// <summary>Gets all blog posts.</summary>
    /// <param name="publishedOnly">If true, returns only published posts.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of blog posts.</returns>
    Task<List<BlogPostListDto>> GetBlogPostsAsync(bool? publishedOnly = null, CancellationToken cancellationToken = default);

    /// <summary>Gets a blog post by ID.</summary>
    /// <returns>The blog post or null if not found.</returns>
    Task<BlogPostDto?> GetBlogPostByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Gets a published blog post by slug.</summary>
    /// <returns>The blog post or null if not found.</returns>
    Task<BlogPostDto?> GetBlogPostBySlugAsync(string slug, CancellationToken cancellationToken = default);

    /// <summary>Creates a new blog post.</summary>
    /// <returns>The created blog post.</returns>
    Task<BlogPostDto> CreateBlogPostAsync(CreateBlogPostRequest request, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing blog post.</summary>
    /// <returns>The updated blog post or null if not found.</returns>
    Task<BlogPostDto?> UpdateBlogPostAsync(Guid id, UpdateBlogPostRequest request, CancellationToken cancellationToken = default);

    /// <summary>Deletes a blog post.</summary>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteBlogPostAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Increments the view count for a blog post.</summary>
    /// <returns>True if incremented, false if not found.</returns>
    Task<bool> IncrementBlogViewCountAsync(Guid id, CancellationToken cancellationToken = default);
}

