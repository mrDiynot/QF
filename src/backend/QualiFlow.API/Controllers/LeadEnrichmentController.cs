// -----------------------------------------------------------------------
// <copyright file="LeadEnrichmentController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for lead enrichment API operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/leads/enrich")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class LeadEnrichmentController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<LeadEnrichmentController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadEnrichmentController"/> class.
    /// </summary>
    public LeadEnrichmentController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<LeadEnrichmentController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Enriches a single lead with additional data.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enriched lead data.</returns>
    [HttpPost("{leadId:guid}")]
    [ProducesResponseType(typeof(EnrichmentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnrichmentResult>> EnrichLeadAsync(
        Guid leadId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var lead = await _context.Leads
            .FirstOrDefaultAsync(l => l.Id == leadId && l.BusinessId == businessId && l.DeletedAt == null, cancellationToken);

        if (lead == null)
        {
            return NotFound();
        }

        _logger.LogInformation("Enriching lead {LeadId} for business {BusinessId}", leadId, businessId);

        // Simulate enrichment (in production, this would call external APIs like Clearbit, ZoomInfo, etc.)
        var enrichedData = new EnrichmentResult
        {
            LeadId = leadId,
            EnrichedAt = DateTime.UtcNow,
            Source = "QualiFlow Enrichment",
            Data = new EnrichedLeadData
            {
                CompanyName = GenerateCompanyName(lead.Email),
                CompanySize = "11-50",
                Industry = "Technology",
                CompanyLinkedIn = GenerateLinkedInUrl("company"),
                PersonLinkedIn = GenerateLinkedInUrl(lead.Name),
                JobTitle = "Manager",
                Location = "United States",
                CompanyWebsite = GenerateWebsiteUrl(lead.Email),
                CompanyRevenue = "$1M-$10M",
                TechnologyStack = new[] { "React", "Node.js", "AWS" },
                SocialProfiles = new Dictionary<string, string>
                {
                    ["linkedin"] = GenerateLinkedInUrl(lead.Name),
                    ["twitter"] = $"https://twitter.com/{lead.Name.Replace(" ", string.Empty, StringComparison.Ordinal).ToLowerInvariant()}",
                },
            },
            ConfidenceScore = 0.85m,
        };

        return Ok(enrichedData);
    }

    /// <summary>
    /// Bulk enriches multiple leads.
    /// </summary>
    /// <param name="request">Bulk enrichment request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk enrichment results.</returns>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(BulkEnrichmentResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<BulkEnrichmentResult>> BulkEnrichLeadsAsync(
        [FromBody] BulkEnrichmentRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var leads = await _context.Leads
            .Where(l => request.LeadIds.Contains(l.Id) && l.BusinessId == businessId && l.DeletedAt == null)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Bulk enriching {Count} leads for business {BusinessId}", leads.Count, businessId);

        var results = new List<EnrichmentResult>();
        var enrichedCount = 0;
        var failedCount = 0;

        foreach (var lead in leads)
        {
            try
            {
                var enrichedData = new EnrichmentResult
                {
                    LeadId = lead.Id,
                    EnrichedAt = DateTime.UtcNow,
                    Source = "QualiFlow Enrichment",
                    Data = new EnrichedLeadData
                    {
                        CompanyName = GenerateCompanyName(lead.Email),
                        CompanySize = "11-50",
                        Industry = "Technology",
                        JobTitle = "Manager",
                    },
                    ConfidenceScore = 0.85m,
                };

                results.Add(enrichedData);
                enrichedCount++;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to enrich lead {LeadId}", lead.Id);
                failedCount++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new BulkEnrichmentResult
        {
            TotalRequested = request.LeadIds.Count,
            EnrichedCount = enrichedCount,
            FailedCount = failedCount,
            Results = results,
        });
    }

    /// <summary>
    /// Looks up company information by domain.
    /// </summary>
    /// <param name="domain">Company domain.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Company information.</returns>
    [HttpGet("company")]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(CompanyInfo), StatusCodes.Status200OK)]
    public Task<ActionResult<CompanyInfo>> LookupCompanyAsync(
        [FromQuery] string domain,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Looking up company info for domain {Domain}", domain);

        // Simulate company lookup
        var companyInfo = new CompanyInfo
        {
            Domain = domain,
            Name = ExtractCompanyNameFromDomain(domain),
            Industry = "Technology",
            Size = "51-200",
            Location = "San Francisco, CA",
            Website = $"https://{domain}",
            Description = $"A leading company in the technology sector.",
            Founded = 2015,
            LinkedIn = $"https://linkedin.com/company/{ExtractCompanyNameFromDomain(domain).ToLowerInvariant().Replace(" ", "-", StringComparison.Ordinal)}",
            Revenue = "$10M-$50M",
            Technologies = new[] { "AWS", "React", "PostgreSQL", "Docker" },
        };

        return Task.FromResult<ActionResult<CompanyInfo>>(Ok(companyInfo));
    }

    /// <summary>
    /// Looks up person information by email.
    /// </summary>
    /// <param name="email">Person's email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Person information.</returns>
    [HttpGet("person")]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(PersonInfo), StatusCodes.Status200OK)]
    public Task<ActionResult<PersonInfo>> LookupPersonAsync(
        [FromQuery] string email,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Looking up person info for email {Email}", email);

        var name = ExtractNameFromEmail(email);
        var domain = email.Contains('@', StringComparison.Ordinal) ? email.Split('@')[1] : "unknown.com";

        var personInfo = new PersonInfo
        {
            Email = email,
            FullName = name,
            FirstName = name.Split(' ')[0],
            LastName = name.Contains(' ', StringComparison.Ordinal) ? name.Split(' ')[^1] : string.Empty,
            JobTitle = "Manager",
            Company = ExtractCompanyNameFromDomain(domain),
            Location = "United States",
            LinkedIn = $"https://linkedin.com/in/{name.ToLowerInvariant().Replace(" ", "-", StringComparison.Ordinal)}",
            Twitter = $"https://twitter.com/{name.ToLowerInvariant().Replace(" ", string.Empty, StringComparison.Ordinal)}",
            Bio = "Professional with experience in the technology industry.",
        };

        return Task.FromResult<ActionResult<PersonInfo>>(Ok(personInfo));
    }

    // Helper methods
    private static string GenerateCompanyName(string? email)
    {
        if (string.IsNullOrEmpty(email) || !email.Contains('@', StringComparison.Ordinal))
        {
            return "Unknown Company";
        }

        var domain = email.Split('@')[1];
        return ExtractCompanyNameFromDomain(domain);
    }

    private static string ExtractCompanyNameFromDomain(string domain)
    {
        var name = domain.Split('.')[0];
        return char.ToUpperInvariant(name[0]) + name[1..];
    }

    private static string ExtractNameFromEmail(string email)
    {
        var localPart = email.Contains('@', StringComparison.Ordinal) ? email.Split('@')[0] : email;
        var parts = localPart.Split(['.', '_', '-'], StringSplitOptions.RemoveEmptyEntries);
        return string.Join(" ", parts.Select(p => char.ToUpperInvariant(p[0]) + p[1..]));
    }

    private static string GenerateLinkedInUrl(string? name)
    {
        if (string.IsNullOrEmpty(name))
        {
            return "https://linkedin.com";
        }

        return $"https://linkedin.com/in/{name.ToLowerInvariant().Replace(" ", "-", StringComparison.Ordinal)}";
    }

#pragma warning disable IDE0060 // Remove unused parameter - context will be used in production
    private static string GenerateWebsiteUrl(string? email)
    {
        if (string.IsNullOrEmpty(email) || !email.Contains('@', StringComparison.Ordinal))
        {
            return "https://example.com";
        }

        return $"https://{email.Split('@')[1]}";
    }
}

// ============================================================================
// DTOs
// ============================================================================

#pragma warning disable CA1002, CA2227, MA0016, CA1819 // Collection/array rules - DTOs need mutable collections for serialization

/// <summary>
/// Result of lead enrichment.
/// </summary>
public class EnrichmentResult
{
    public Guid LeadId { get; set; }
    public DateTime EnrichedAt { get; set; }
    public string Source { get; set; } = string.Empty;
    public EnrichedLeadData Data { get; set; } = new();
    public decimal ConfidenceScore { get; set; }
}

/// <summary>
/// Enriched lead data.
/// </summary>
public class EnrichedLeadData
{
    public string? CompanyName { get; set; }
    public string? CompanySize { get; set; }
    public string? Industry { get; set; }
    public string? CompanyLinkedIn { get; set; }
    public string? PersonLinkedIn { get; set; }
    public string? JobTitle { get; set; }
    public string? Location { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanyRevenue { get; set; }
    public string[]? TechnologyStack { get; set; }
    public Dictionary<string, string>? SocialProfiles { get; set; }
}

/// <summary>
/// Request for bulk lead enrichment.
/// </summary>
public class BulkEnrichmentRequest
{
    public List<Guid> LeadIds { get; set; } = [];
}

/// <summary>
/// Result of bulk lead enrichment.
/// </summary>
public class BulkEnrichmentResult
{
    public int TotalRequested { get; set; }
    public int EnrichedCount { get; set; }
    public int FailedCount { get; set; }
    public List<EnrichmentResult> Results { get; set; } = [];
}

/// <summary>
/// Company information from enrichment.
/// </summary>
public class CompanyInfo
{
    public string Domain { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Size { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public int? Founded { get; set; }
    public string? LinkedIn { get; set; }
    public string? Revenue { get; set; }
    public string[]? Technologies { get; set; }
}

/// <summary>
/// Person information from enrichment.
/// </summary>
public class PersonInfo
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? JobTitle { get; set; }
    public string? Company { get; set; }
    public string? Location { get; set; }
    public string? LinkedIn { get; set; }
    public string? Twitter { get; set; }
    public string? Bio { get; set; }
}
