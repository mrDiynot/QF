using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Admin.CMS.DTOs;
using QualiFlow.Application.Features.Admin.CMS.Services;
using QualiFlow.Domain.Entities.CMS;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services.CMS;

/// <summary>
/// Service implementation for CMS operations.
/// </summary>
public partial class CmsService : ICmsService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<CmsService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CmsService"/> class.
    /// </summary>
    public CmsService(QualiFlowDbContext context, ILogger<CmsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<LandingPageDataDto> GetLandingPageDataAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching landing page data");

        var statistics = await _context.LandingPageStatistics
            .Where(s => s.IsActive && s.DeletedAt == null)
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new LandingPageStatisticDto
            {
                Id = s.Id,
                Value = s.Value,
                Label = s.Label,
                DisplayOrder = s.DisplayOrder,
                IsActive = s.IsActive,
            })
            .ToListAsync(cancellationToken);

        var trustedCompanies = await _context.TrustedCompanies
            .Where(c => c.IsActive && c.DeletedAt == null)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new TrustedCompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                LogoPath = c.LogoPath,
                WebsiteLink = c.WebsiteLink,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
            })
            .ToListAsync(cancellationToken);

        var faqs = await _context.FrequentlyAskedQuestions
            .Where(f => f.IsActive && f.ShowOnLandingPage && f.DeletedAt == null)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new FaqDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer,
                Category = f.Category,
                DisplayOrder = f.DisplayOrder,
                IsActive = f.IsActive,
                ShowOnLandingPage = f.ShowOnLandingPage,
                ShowInHelpCenter = f.ShowInHelpCenter,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
            })
            .ToListAsync(cancellationToken);

        var testimonials = await _context.Testimonials
            .Where(t => t.IsActive && t.DeletedAt == null)
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialDto
            {
                Id = t.Id,
                Quote = t.Quote,
                AuthorName = t.AuthorName,
                AuthorRole = t.AuthorRole,
                CompanyName = t.CompanyName,
                AvatarPath = t.AvatarPath,
                CompanyLogoPath = t.CompanyLogoPath,
                Rating = t.Rating,
                IsFeatured = t.IsFeatured,
                IsActive = t.IsActive,
                DisplayOrder = t.DisplayOrder,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
            })
            .ToListAsync(cancellationToken);

        // Optimization: Combine 3 FeatureModules queries into 1 query grouped by Section
        var allFeatureModules = await _context.FeatureModules
            .Where(m => m.IsActive && m.DeletedAt == null)
            .Where(m => m.Section == FeatureSection.Module ||
                       m.Section == FeatureSection.LifecycleStep ||
                       m.Section == FeatureSection.FeatureCard)
            .OrderBy(m => m.DisplayOrder)
            .Select(m => new FeatureModuleDto
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                IconName = m.IconName,
                Gradient = m.Gradient,
                DisplayOrder = m.DisplayOrder,
                IsActive = m.IsActive,
                Section = m.Section.ToString(),
            })
            .ToListAsync(cancellationToken);

        var featureModules = allFeatureModules
            .Where(m => m.Section == FeatureSection.Module.ToString())
            .ToList();

        var lifecycleSteps = allFeatureModules
            .Where(m => m.Section == FeatureSection.LifecycleStep.ToString())
            .ToList();

        var featureCards = allFeatureModules
            .Where(m => m.Section == FeatureSection.FeatureCard.ToString())
            .ToList();

        var prebuiltJourneys = await _context.PrebuiltJourneys
            .Where(j => j.IsActive && j.DeletedAt == null)
            .OrderBy(j => j.DisplayOrder)
            .Select(j => new PrebuiltJourneyDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                IconName = j.IconName,
                Gradient = j.Gradient,
                BackgroundColor = j.BackgroundColor,
                AccentColor = j.AccentColor,
                DisplayOrder = j.DisplayOrder,
                IsActive = j.IsActive,
            })
            .ToListAsync(cancellationToken);

        return new LandingPageDataDto
        {
            Statistics = statistics,
            TrustedCompanies = trustedCompanies,
            Faqs = faqs,
            Testimonials = testimonials,
            FeatureModules = featureModules,
            LifecycleSteps = lifecycleSteps,
            FeatureCards = featureCards,
            PrebuiltJourneys = prebuiltJourneys,
            PricingPlans = await GetPricingPlansInternalAsync(cancellationToken),
            PricingAddOns = await GetPricingAddOnsAsync(cancellationToken),
            FeatureComparisons = await GetFeatureComparisonsAsync(cancellationToken),
        };
    }

    private async Task<List<CmsPricingPlanDto>> GetPricingPlansInternalAsync(CancellationToken cancellationToken)
    {
        var plans = await _context.CmsPricingPlans
            .AsNoTracking()
            .Where(p => p.IsActive && p.DeletedAt == null)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync(cancellationToken);

        return plans.Select(p => new CmsPricingPlanDto
        {
            Id = p.Id,
            Name = p.Name,
            MonthlyPrice = p.MonthlyPrice,
            AnnualPrice = p.AnnualPrice,
            QuarterlyPrice = p.QuarterlyPrice,
            PricePeriod = p.PricePeriod,
            Features = JsonSerializer.Deserialize<List<string>>(p.FeaturesJson) ?? [],
            IsPopular = p.IsPopular,
            IsActive = p.IsActive,
            DisplayOrder = p.DisplayOrder,
            CtaText = p.CtaText,
            CtaLink = p.CtaLink,
            Description = p.Description,
            OnboardingPrice = p.OnboardingPrice,
            OnboardingRequired = p.OnboardingRequired,
        }).ToList();
    }

    /// <inheritdoc/>
    public async Task<List<FaqDto>> GetFaqsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FrequentlyAskedQuestions
            .Where(f => f.DeletedAt == null)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new FaqDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer,
                Category = f.Category,
                DisplayOrder = f.DisplayOrder,
                IsActive = f.IsActive,
                ShowOnLandingPage = f.ShowOnLandingPage,
                ShowInHelpCenter = f.ShowInHelpCenter,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<FaqDto?> GetFaqByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var faq = await _context.FrequentlyAskedQuestions
            .FirstOrDefaultAsync(f => f.Id == id && f.DeletedAt == null, cancellationToken);

        if (faq == null)
        {
            return null;
        }

        return new FaqDto
        {
            Id = faq.Id,
            Question = faq.Question,
            Answer = faq.Answer,
            Category = faq.Category,
            DisplayOrder = faq.DisplayOrder,
            IsActive = faq.IsActive,
            ShowOnLandingPage = faq.ShowOnLandingPage,
            ShowInHelpCenter = faq.ShowInHelpCenter,
            CreatedAt = faq.CreatedAt,
            UpdatedAt = faq.UpdatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<FaqDto> CreateFaqAsync(FaqRequest request, CancellationToken cancellationToken = default)
    {
        var faq = new FrequentlyAskedQuestion
        {
            Question = request.Question,
            Answer = request.Answer,
            Category = request.Category,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            ShowOnLandingPage = request.ShowOnLandingPage,
            ShowInHelpCenter = request.ShowInHelpCenter,
            CreatedAt = DateTime.UtcNow,
        };

        _context.FrequentlyAskedQuestions.Add(faq);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created FAQ {FaqId}", faq.Id);

        return new FaqDto
        {
            Id = faq.Id,
            Question = faq.Question,
            Answer = faq.Answer,
            Category = faq.Category,
            DisplayOrder = faq.DisplayOrder,
            IsActive = faq.IsActive,
            ShowOnLandingPage = faq.ShowOnLandingPage,
            ShowInHelpCenter = faq.ShowInHelpCenter,
            CreatedAt = faq.CreatedAt,
            UpdatedAt = faq.UpdatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<FaqDto?> UpdateFaqAsync(Guid id, FaqRequest request, CancellationToken cancellationToken = default)
    {
        var faq = await _context.FrequentlyAskedQuestions
            .FirstOrDefaultAsync(f => f.Id == id && f.DeletedAt == null, cancellationToken);

        if (faq == null)
        {
            return null;
        }

        faq.Question = request.Question;
        faq.Answer = request.Answer;
        faq.Category = request.Category;
        faq.DisplayOrder = request.DisplayOrder;
        faq.IsActive = request.IsActive;
        faq.ShowOnLandingPage = request.ShowOnLandingPage;
        faq.ShowInHelpCenter = request.ShowInHelpCenter;
        faq.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated FAQ {FaqId}", faq.Id);

        return new FaqDto
        {
            Id = faq.Id,
            Question = faq.Question,
            Answer = faq.Answer,
            Category = faq.Category,
            DisplayOrder = faq.DisplayOrder,
            IsActive = faq.IsActive,
            ShowOnLandingPage = faq.ShowOnLandingPage,
            ShowInHelpCenter = faq.ShowInHelpCenter,
            CreatedAt = faq.CreatedAt,
            UpdatedAt = faq.UpdatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteFaqAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var faq = await _context.FrequentlyAskedQuestions
            .FirstOrDefaultAsync(f => f.Id == id && f.DeletedAt == null, cancellationToken);

        if (faq == null)
        {
            return false;
        }

        faq.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted FAQ {FaqId}", faq.Id);
        return true;
    }

    // ========================================================================
    // Testimonials
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<TestimonialDto>> GetTestimonialsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Testimonials
            .Where(t => t.DeletedAt == null)
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialDto
            {
                Id = t.Id,
                Quote = t.Quote,
                AuthorName = t.AuthorName,
                AuthorRole = t.AuthorRole,
                CompanyName = t.CompanyName,
                AvatarPath = t.AvatarPath,
                CompanyLogoPath = t.CompanyLogoPath,
                Rating = t.Rating,
                IsFeatured = t.IsFeatured,
                IsActive = t.IsActive,
                DisplayOrder = t.DisplayOrder,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<TestimonialDto?> GetTestimonialByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null, cancellationToken);

        if (testimonial == null)
        {
            return null;
        }

        return new TestimonialDto
        {
            Id = testimonial.Id,
            Quote = testimonial.Quote,
            AuthorName = testimonial.AuthorName,
            AuthorRole = testimonial.AuthorRole,
            CompanyName = testimonial.CompanyName,
            AvatarPath = testimonial.AvatarPath,
            CompanyLogoPath = testimonial.CompanyLogoPath,
            Rating = testimonial.Rating,
            IsFeatured = testimonial.IsFeatured,
            IsActive = testimonial.IsActive,
            DisplayOrder = testimonial.DisplayOrder,
            CreatedAt = testimonial.CreatedAt,
            UpdatedAt = testimonial.UpdatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<TestimonialDto> CreateTestimonialAsync(TestimonialRequest request, CancellationToken cancellationToken = default)
    {
        var testimonial = new Testimonial
        {
            Quote = request.Quote,
            AuthorName = request.AuthorName,
            AuthorRole = request.AuthorRole,
            CompanyName = request.CompanyName,
            AvatarPath = request.AvatarPath,
            CompanyLogoPath = request.CompanyLogoPath,
            Rating = request.Rating,
            IsFeatured = request.IsFeatured,
            IsActive = request.IsActive,
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Testimonials.Add(testimonial);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created testimonial {TestimonialId}", testimonial.Id);

        return new TestimonialDto
        {
            Id = testimonial.Id,
            Quote = testimonial.Quote,
            AuthorName = testimonial.AuthorName,
            AuthorRole = testimonial.AuthorRole,
            CompanyName = testimonial.CompanyName,
            AvatarPath = testimonial.AvatarPath,
            CompanyLogoPath = testimonial.CompanyLogoPath,
            Rating = testimonial.Rating,
            IsFeatured = testimonial.IsFeatured,
            IsActive = testimonial.IsActive,
            DisplayOrder = testimonial.DisplayOrder,
            CreatedAt = testimonial.CreatedAt,
            UpdatedAt = testimonial.UpdatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<TestimonialDto?> UpdateTestimonialAsync(Guid id, TestimonialRequest request, CancellationToken cancellationToken = default)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null, cancellationToken);

        if (testimonial == null)
        {
            return null;
        }

        testimonial.Quote = request.Quote;
        testimonial.AuthorName = request.AuthorName;
        testimonial.AuthorRole = request.AuthorRole;
        testimonial.CompanyName = request.CompanyName;
        testimonial.AvatarPath = request.AvatarPath;
        testimonial.CompanyLogoPath = request.CompanyLogoPath;
        testimonial.Rating = request.Rating;
        testimonial.IsFeatured = request.IsFeatured;
        testimonial.IsActive = request.IsActive;
        testimonial.DisplayOrder = request.DisplayOrder;
        testimonial.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated testimonial {TestimonialId}", testimonial.Id);

        return new TestimonialDto
        {
            Id = testimonial.Id,
            Quote = testimonial.Quote,
            AuthorName = testimonial.AuthorName,
            AuthorRole = testimonial.AuthorRole,
            CompanyName = testimonial.CompanyName,
            AvatarPath = testimonial.AvatarPath,
            CompanyLogoPath = testimonial.CompanyLogoPath,
            Rating = testimonial.Rating,
            IsFeatured = testimonial.IsFeatured,
            IsActive = testimonial.IsActive,
            DisplayOrder = testimonial.DisplayOrder,
            CreatedAt = testimonial.CreatedAt,
            UpdatedAt = testimonial.UpdatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteTestimonialAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var testimonial = await _context.Testimonials
            .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null, cancellationToken);

        if (testimonial == null)
        {
            return false;
        }

        testimonial.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted testimonial {TestimonialId}", testimonial.Id);
        return true;
    }

    // ========================================================================
    // CMS Pages
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<CmsPageDto>> GetPagesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CmsPages
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.DisplayOrder)
            .Select(p => new CmsPageDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Content = p.Content,
                MetaTitle = p.MetaTitle,
                MetaDescription = p.MetaDescription,
                IsPublished = p.IsPublished,
                PublishedAt = p.PublishedAt,
                DisplayOrder = p.DisplayOrder,
                Section = p.Section.ToString(),
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<CmsPageDto?> GetPageByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var page = await _context.CmsPages
            .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null, cancellationToken);

        return page == null ? null : MapPageToDto(page);
    }

    /// <inheritdoc/>
    public async Task<CmsPageDto?> GetPageBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var page = await _context.CmsPages
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished && p.DeletedAt == null, cancellationToken);

        return page == null ? null : MapPageToDto(page);
    }

    /// <inheritdoc/>
    public async Task<CmsPageDto> CreatePageAsync(CmsPageRequest request, CancellationToken cancellationToken = default)
    {
        var page = new CmsPage
        {
            Title = request.Title,
            Slug = request.Slug,
            Content = request.Content,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            IsPublished = request.IsPublished,
            PublishedAt = request.IsPublished ? DateTime.UtcNow : null,
            DisplayOrder = request.DisplayOrder,
            Section = Enum.TryParse<PageSection>(request.Section, out var section) ? section : PageSection.Other,
            CreatedAt = DateTime.UtcNow,
        };

        _context.CmsPages.Add(page);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created CMS page {PageId}", page.Id);
        return MapPageToDto(page);
    }

    /// <inheritdoc/>
    public async Task<CmsPageDto?> UpdatePageAsync(Guid id, CmsPageRequest request, CancellationToken cancellationToken = default)
    {
        var page = await _context.CmsPages
            .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null, cancellationToken);

        if (page == null)
        {
            return null;
        }

        page.Title = request.Title;
        page.Slug = request.Slug;
        page.Content = request.Content;
        page.MetaTitle = request.MetaTitle;
        page.MetaDescription = request.MetaDescription;
        page.IsPublished = request.IsPublished;
        page.PublishedAt = request.IsPublished && page.PublishedAt == null ? DateTime.UtcNow : page.PublishedAt;
        page.DisplayOrder = request.DisplayOrder;
        page.Section = Enum.TryParse<PageSection>(request.Section, out var section) ? section : PageSection.Other;
        page.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated CMS page {PageId}", page.Id);
        return MapPageToDto(page);
    }

    /// <inheritdoc/>
    public async Task<bool> DeletePageAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var page = await _context.CmsPages
            .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null, cancellationToken);

        if (page == null)
        {
            return false;
        }

        page.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted CMS page {PageId}", page.Id);
        return true;
    }

    private static CmsPageDto MapPageToDto(CmsPage page) => new()
    {
        Id = page.Id,
        Title = page.Title,
        Slug = page.Slug,
        Content = page.Content,
        MetaTitle = page.MetaTitle,
        MetaDescription = page.MetaDescription,
        IsPublished = page.IsPublished,
        PublishedAt = page.PublishedAt,
        DisplayOrder = page.DisplayOrder,
        Section = page.Section.ToString(),
        CreatedAt = page.CreatedAt,
        UpdatedAt = page.UpdatedAt,
    };

    // ========================================================================
    // Statistics
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<LandingPageStatisticDto>> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingPageStatistics
            .Where(s => s.DeletedAt == null)
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new LandingPageStatisticDto
            {
                Id = s.Id,
                Value = s.Value,
                Label = s.Label,
                DisplayOrder = s.DisplayOrder,
                IsActive = s.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<LandingPageStatisticDto?> UpdateStatisticAsync(Guid id, string value, string label, int displayOrder, bool isActive, CancellationToken cancellationToken = default)
    {
        var stat = await _context.LandingPageStatistics
            .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null, cancellationToken);

        if (stat == null)
        {
            return null;
        }

        stat.Value = value;
        stat.Label = label;
        stat.DisplayOrder = displayOrder;
        stat.IsActive = isActive;
        stat.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new LandingPageStatisticDto
        {
            Id = stat.Id,
            Value = stat.Value,
            Label = stat.Label,
            DisplayOrder = stat.DisplayOrder,
            IsActive = stat.IsActive,
        };
    }

    // ========================================================================
    // Trusted Companies
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<TrustedCompanyDto>> GetTrustedCompaniesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.TrustedCompanies
            .Where(c => c.DeletedAt == null)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new TrustedCompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                LogoPath = c.LogoPath,
                WebsiteLink = c.WebsiteLink,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<TrustedCompanyDto?> UpdateTrustedCompanyAsync(Guid id, string name, string? logoPath, string? websiteLink, int displayOrder, bool isActive, CancellationToken cancellationToken = default)
    {
        var company = await _context.TrustedCompanies
            .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null, cancellationToken);

        if (company == null)
        {
            return null;
        }

        company.Name = name;
        company.LogoPath = logoPath;
        company.WebsiteLink = websiteLink;
        company.DisplayOrder = displayOrder;
        company.IsActive = isActive;
        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new TrustedCompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            LogoPath = company.LogoPath,
            WebsiteLink = company.WebsiteLink,
            DisplayOrder = company.DisplayOrder,
            IsActive = company.IsActive,
        };
    }

    // ========================================================================
    // Pricing Add-Ons
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<CmsPricingAddOnDto>> GetPricingAddOnsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CmsPricingAddOns
            .Where(a => a.DeletedAt == null)
            .OrderBy(a => a.DisplayOrder)
            .Select(a => new CmsPricingAddOnDto
            {
                Id = a.Id,
                Title = a.Title,
                Price = a.Price,
                Unit = a.Unit,
                DisplayOrder = a.DisplayOrder,
                IsActive = a.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<CmsPricingAddOnDto?> UpdatePricingAddOnAsync(Guid id, CmsPricingAddOnRequest request, CancellationToken cancellationToken = default)
    {
        var addOn = await _context.CmsPricingAddOns
            .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null, cancellationToken);

        if (addOn == null)
        {
            return null;
        }

        addOn.Title = request.Title;
        addOn.Price = request.Price;
        addOn.Unit = request.Unit;
        addOn.DisplayOrder = request.DisplayOrder;
        addOn.IsActive = request.IsActive;
        addOn.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new CmsPricingAddOnDto
        {
            Id = addOn.Id,
            Title = addOn.Title,
            Price = addOn.Price,
            Unit = addOn.Unit,
            DisplayOrder = addOn.DisplayOrder,
            IsActive = addOn.IsActive,
        };
    }

    // ========================================================================
    // Feature Comparisons
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<PricingFeatureComparisonDto>> GetFeatureComparisonsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PricingFeatureComparisons
            .Where(f => f.DeletedAt == null)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new PricingFeatureComparisonDto
            {
                Id = f.Id,
                Category = f.Category,
                FeatureName = f.FeatureName,
                FreeFlowValue = f.FreeFlowValue,
                SmartFlowValue = f.SmartFlowValue,
                UltraFlowValue = f.UltraFlowValue,
                EnterpriseValue = f.EnterpriseValue,
                DisplayOrder = f.DisplayOrder,
                IsActive = f.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<PricingFeatureComparisonDto?> UpdateFeatureComparisonAsync(Guid id, PricingFeatureComparisonRequest request, CancellationToken cancellationToken = default)
    {
        var comparison = await _context.PricingFeatureComparisons
            .FirstOrDefaultAsync(f => f.Id == id && f.DeletedAt == null, cancellationToken);

        if (comparison == null)
        {
            return null;
        }

        comparison.Category = request.Category;
        comparison.FeatureName = request.FeatureName;
        comparison.FreeFlowValue = request.FreeFlowValue;
        comparison.SmartFlowValue = request.SmartFlowValue;
        comparison.UltraFlowValue = request.UltraFlowValue;
        comparison.EnterpriseValue = request.EnterpriseValue;
        comparison.DisplayOrder = request.DisplayOrder;
        comparison.IsActive = request.IsActive;
        comparison.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new PricingFeatureComparisonDto
        {
            Id = comparison.Id,
            Category = comparison.Category,
            FeatureName = comparison.FeatureName,
            FreeFlowValue = comparison.FreeFlowValue,
            SmartFlowValue = comparison.SmartFlowValue,
            UltraFlowValue = comparison.UltraFlowValue,
            EnterpriseValue = comparison.EnterpriseValue,
            DisplayOrder = comparison.DisplayOrder,
            IsActive = comparison.IsActive,
        };
    }

    // ========================================================================
    // Blog Posts
    // ========================================================================

    /// <inheritdoc/>
    public async Task<List<BlogPostListDto>> GetBlogPostsAsync(bool? publishedOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.BlogPosts
            .AsNoTracking()
            .Where(b => b.DeletedAt == null);

        if (publishedOnly == true)
        {
            query = query.Where(b => b.IsPublished);
        }

        return await query
            .OrderByDescending(b => b.PublishedAt ?? b.CreatedAt)
            .Select(b => new BlogPostListDto
            {
                Id = b.Id,
                Title = b.Title,
                Slug = b.Slug,
                Excerpt = b.Excerpt,
                FeaturedImagePath = b.FeaturedImagePath,
                AuthorName = b.AuthorName,
                AuthorAvatarPath = b.AuthorAvatarPath,
                Category = b.Category,
                IsPublished = b.IsPublished,
                PublishedAt = b.PublishedAt,
                IsFeatured = b.IsFeatured,
                ReadingTimeMinutes = b.ReadingTimeMinutes,
                CreatedAt = b.CreatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<BlogPostDto?> GetBlogPostByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null, cancellationToken);

        return post == null ? null : MapToBlogPostDto(post);
    }

    /// <inheritdoc/>
    public async Task<BlogPostDto?> GetBlogPostBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        // Normalize the incoming slug to handle leading/trailing slashes or whitespace
        var normalizedSlug = SanitizeSlug(slug);

        var post = await _context.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Slug == normalizedSlug && b.IsPublished && b.DeletedAt == null, cancellationToken);

        // Fallback: try matching the raw slug in case DB has un-sanitized data
        if (post == null && normalizedSlug != slug)
        {
            post = await _context.BlogPosts
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Slug == slug && b.IsPublished && b.DeletedAt == null, cancellationToken);
        }

        return post == null ? null : MapToBlogPostDto(post);
    }

    /// <inheritdoc/>
    public async Task<BlogPostDto> CreateBlogPostAsync(CreateBlogPostRequest request, CancellationToken cancellationToken = default)
    {
        // Generate a unique slug — auto-suffix with -2, -3, etc. if the base slug already exists
        var baseSlug = SanitizeSlug(request.Slug ?? GenerateSlug(request.Title));
        var slug = baseSlug;
        var counter = 2;
        while (await _context.BlogPosts.IgnoreQueryFilters().AnyAsync(b => b.Slug == slug, cancellationToken))
        {
            slug = $"{baseSlug}-{counter++}";
        }

        var post = new BlogPost
        {
            Title = request.Title,
            Slug = slug,
            Excerpt = request.Excerpt,
            Content = request.Content,
            FeaturedImagePath = request.FeaturedImagePath,
            AuthorName = request.AuthorName,
            AuthorAvatarPath = request.AuthorAvatarPath,
            Category = request.Category,
            Tags = request.Tags != null ? string.Join(",", request.Tags) : null,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            IsPublished = request.IsPublished,
            PublishedAt = request.IsPublished ? DateTime.UtcNow : null,
            IsFeatured = request.IsFeatured,
            ReadingTimeMinutes = CalculateReadingTime(request.Content),
            CreatedAt = DateTime.UtcNow,
        };

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created blog post {BlogPostId} with slug {Slug}", post.Id, post.Slug);

        return MapToBlogPostDto(post);
    }

    /// <inheritdoc/>
    public async Task<BlogPostDto?> UpdateBlogPostAsync(Guid id, UpdateBlogPostRequest request, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null, cancellationToken);

        if (post == null)
        {
            return null;
        }

        if (request.Title != null)
        {
            post.Title = request.Title;
        }

        if (request.Slug != null)
        {
            // Ensure slug uniqueness on update (exclude current post)
            var baseSlug = SanitizeSlug(request.Slug);
            var slug = baseSlug;
            var counter = 2;
            while (await _context.BlogPosts.IgnoreQueryFilters().AnyAsync(b => b.Slug == slug && b.Id != id, cancellationToken))
            {
                slug = $"{baseSlug}-{counter++}";
            }

            post.Slug = slug;
        }

        if (request.Excerpt != null)
        {
            post.Excerpt = request.Excerpt;
        }

        if (request.Content != null)
        {
            post.Content = request.Content;
            post.ReadingTimeMinutes = CalculateReadingTime(request.Content);
        }

        if (request.FeaturedImagePath != null)
        {
            post.FeaturedImagePath = request.FeaturedImagePath;
        }

        if (request.AuthorName != null)
        {
            post.AuthorName = request.AuthorName;
        }

        if (request.AuthorAvatarPath != null)
        {
            post.AuthorAvatarPath = request.AuthorAvatarPath;
        }

        if (request.Category != null)
        {
            post.Category = request.Category;
        }

        if (request.Tags != null)
        {
            post.Tags = string.Join(",", request.Tags);
        }

        if (request.MetaTitle != null)
        {
            post.MetaTitle = request.MetaTitle;
        }

        if (request.MetaDescription != null)
        {
            post.MetaDescription = request.MetaDescription;
        }

        if (request.IsFeatured.HasValue)
        {
            post.IsFeatured = request.IsFeatured.Value;
        }

        if (request.IsPublished.HasValue)
        {
            var wasPublished = post.IsPublished;
            post.IsPublished = request.IsPublished.Value;
            if (!wasPublished && request.IsPublished.Value)
            {
                post.PublishedAt = DateTime.UtcNow;
            }
        }

        post.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated blog post {BlogPostId}", post.Id);

        return MapToBlogPostDto(post);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteBlogPostAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null, cancellationToken);

        if (post == null)
        {
            return false;
        }

        post.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted blog post {BlogPostId}", post.Id);
        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> IncrementBlogViewCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null, cancellationToken);

        if (post == null)
        {
            return false;
        }

        post.ViewCount++;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static BlogPostDto MapToBlogPostDto(BlogPost post) => new()
    {
        Id = post.Id,
        Title = post.Title,
        Slug = post.Slug,
        Excerpt = post.Excerpt,
        Content = post.Content,
        FeaturedImagePath = post.FeaturedImagePath,
        AuthorName = post.AuthorName,
        AuthorAvatarPath = post.AuthorAvatarPath,
        Category = post.Category,
        Tags = post.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? [],
        MetaTitle = post.MetaTitle,
        MetaDescription = post.MetaDescription,
        IsPublished = post.IsPublished,
        PublishedAt = post.PublishedAt,
        IsFeatured = post.IsFeatured,
        ReadingTimeMinutes = post.ReadingTimeMinutes,
        ViewCount = post.ViewCount,
        CreatedAt = post.CreatedAt,
        UpdatedAt = post.UpdatedAt,
    };

    /// <summary>
    /// Sanitizes a slug by trimming whitespace, leading/trailing slashes, and converting to lowercase.
    /// </summary>
    private static string SanitizeSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return string.Empty;
        }

        return slug.Trim().Trim('/').ToLowerInvariant();
    }

    private static string GenerateSlug(string title)
    {
        var sb = new System.Text.StringBuilder();
        foreach (var c in title.ToLowerInvariant().Trim())
        {
            if (char.IsLetterOrDigit(c))
            {
                sb.Append(c);
            }
            else if (c == ' ' || c == '-')
            {
                sb.Append('-');
            }
        }

        var slug = sb.ToString();
        while (slug.Contains("--", StringComparison.Ordinal))
        {
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        }

        return slug.Trim('-');
    }

    private static int CalculateReadingTime(string content)
    {
        var wordCount = content.Split([' ', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries).Length;
        return Math.Max(1, (int)Math.Ceiling(wordCount / 200.0)); // 200 words per minute
    }
}

