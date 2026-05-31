// -----------------------------------------------------------------------
// <copyright file="IndustryScoringTemplateSeeder.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Data.Seeders;

/// <summary>
/// Seeds industry-specific scoring templates for lead qualification.
/// </summary>
public sealed partial class IndustryScoringTemplateSeeder
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<IndustryScoringTemplateSeeder> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="IndustryScoringTemplateSeeder"/> class.
    /// </summary>
    public IndustryScoringTemplateSeeder(
        QualiFlowDbContext context,
        ILogger<IndustryScoringTemplateSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds industry scoring templates if they don't exist.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var existingCount = await _context.IndustryScoringTemplates.CountAsync(cancellationToken);
        if (existingCount > 0)
        {
            LogTemplatesExist(existingCount);
            return;
        }

        LogSeeding();

        var templates = GetIndustryTemplates();
        await _context.IndustryScoringTemplates.AddRangeAsync(templates, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        LogSeeded(templates.Count);
    }

    private static List<IndustryScoringTemplate> GetIndustryTemplates()
    {
        return new List<IndustryScoringTemplate>
        {
            // Real Estate
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "Real Estate",
                Name = "Real Estate Default",
                Description = "Optimized for property buyers, sellers, and rental inquiries",
                IsDefault = true,
                QualificationThreshold = 65,
                AIWeight = 70,
                RulesWeight = 30,
                BudgetWeight = 30,
                AuthorityWeight = 25,
                NeedWeight = 25,
                TimelineWeight = 20,
                IndustryKeywords = "property,home,house,apartment,mortgage,listing,realtor,buyer,seller",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // SaaS / Technology
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "SaaS",
                Name = "SaaS / Technology Default",
                Description = "Optimized for software and technology sales",
                IsDefault = true,
                QualificationThreshold = 70,
                AIWeight = 75,
                RulesWeight = 25,
                BudgetWeight = 20,
                AuthorityWeight = 30,
                NeedWeight = 30,
                TimelineWeight = 20,
                IndustryKeywords = "software,integration,API,platform,subscription,license,deployment",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // Professional Services / Consulting
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "Consulting",
                Name = "Professional Services Default",
                Description = "Optimized for consulting, legal, and professional services",
                IsDefault = true,
                QualificationThreshold = 70,
                AIWeight = 65,
                RulesWeight = 35,
                BudgetWeight = 25,
                AuthorityWeight = 25,
                NeedWeight = 30,
                TimelineWeight = 20,
                IndustryKeywords = "consulting,advisor,strategy,project,engagement,retainer",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // Home Services
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "Home Services",
                Name = "Home Services Default",
                Description = "Optimized for contractors, plumbers, electricians, etc.",
                IsDefault = true,
                QualificationThreshold = 60,
                AIWeight = 60,
                RulesWeight = 40,
                BudgetWeight = 25,
                AuthorityWeight = 20,
                NeedWeight = 25,
                TimelineWeight = 30,
                IndustryKeywords = "repair,install,emergency,quote,estimate,service,maintenance",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // Healthcare
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "Healthcare",
                Name = "Healthcare Default",
                Description = "Optimized for medical practices, clinics, and healthcare providers",
                IsDefault = true,
                QualificationThreshold = 65,
                AIWeight = 60,
                RulesWeight = 40,
                BudgetWeight = 20,
                AuthorityWeight = 25,
                NeedWeight = 35,
                TimelineWeight = 20,
                IndustryKeywords = "patient,appointment,treatment,insurance,health,medical,clinic",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // E-Commerce / Retail
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "E-Commerce",
                Name = "E-Commerce / Retail Default",
                Description = "Optimized for online stores and retail businesses",
                IsDefault = true,
                QualificationThreshold = 55,
                AIWeight = 55,
                RulesWeight = 45,
                BudgetWeight = 30,
                AuthorityWeight = 15,
                NeedWeight = 30,
                TimelineWeight = 25,
                IndustryKeywords = "order,shipping,product,purchase,cart,checkout,discount",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // Financial Services
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "Finance",
                Name = "Financial Services Default",
                Description = "Optimized for banks, insurance, and financial advisors",
                IsDefault = true,
                QualificationThreshold = 75,
                AIWeight = 70,
                RulesWeight = 30,
                BudgetWeight = 30,
                AuthorityWeight = 25,
                NeedWeight = 25,
                TimelineWeight = 20,
                IndustryKeywords = "investment,loan,mortgage,insurance,portfolio,retirement,savings",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // Education
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "Education",
                Name = "Education Default",
                Description = "Optimized for schools, training, and educational services",
                IsDefault = true,
                QualificationThreshold = 65,
                AIWeight = 65,
                RulesWeight = 35,
                BudgetWeight = 20,
                AuthorityWeight = 25,
                NeedWeight = 30,
                TimelineWeight = 25,
                IndustryKeywords = "course,enrollment,training,certification,degree,tuition,student",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },

            // Default / General
            new()
            {
                Id = Guid.NewGuid(),
                Industry = "General",
                Name = "General / Other Default",
                Description = "Balanced default template for all industries",
                IsDefault = true,
                QualificationThreshold = 70,
                AIWeight = 60,
                RulesWeight = 40,
                BudgetWeight = 25,
                AuthorityWeight = 25,
                NeedWeight = 25,
                TimelineWeight = 25,
                IndustryKeywords = "inquiry,question,information,quote,pricing,service",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            },
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Industry scoring templates already exist ({Count} templates). Skipping seed.")]
    private partial void LogTemplatesExist(int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Seeding industry scoring templates...")]
    private partial void LogSeeding();

    [LoggerMessage(Level = LogLevel.Information, Message = "Seeded {Count} industry scoring templates")]
    private partial void LogSeeded(int count);
}
