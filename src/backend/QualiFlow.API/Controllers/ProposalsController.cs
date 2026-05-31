#pragma warning disable SA1615 // Element return value should be documented
#pragma warning disable SA1503 // Braces should not be omitted

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Proposals.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;
using System.Security.Cryptography;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing business proposals.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class ProposalsController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ProposalsController> _logger;

    public ProposalsController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ProposalsController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all proposals for the current business.
    /// </summary>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    public async Task<ActionResult<IEnumerable<ProposalDto>>> GetProposals(
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _context.Proposals
            .Where(p => p.BusinessId == businessId && p.DeletedAt == null);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        var proposals = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);

        return Ok(proposals);
    }

    /// <summary>
    /// Gets proposal statistics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<ProposalStats>> GetStats(CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var proposals = await _context.Proposals
            .Where(p => p.BusinessId == businessId && p.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var stats = new ProposalStats
        {
            TotalProposals = proposals.Count,
            DraftCount = proposals.Count(p => p.Status == "draft"),
            SentCount = proposals.Count(p => p.Status == "sent"),
            ViewedCount = proposals.Count(p => p.ViewedAt != null),
            AcceptedCount = proposals.Count(p => p.Status == "accepted"),
            DeclinedCount = proposals.Count(p => p.Status == "declined"),
            TotalValue = proposals.Sum(p => p.Amount),
            AcceptedValue = proposals.Where(p => p.Status == "accepted").Sum(p => p.Amount),
            AcceptanceRate = proposals.Count > 0
                ? Math.Round((decimal)proposals.Count(p => p.Status == "accepted") / proposals.Count * 100, 1)
                : 0,
        };

        return Ok(stats);
    }

    /// <summary>
    /// Gets a proposal by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProposalDto>> GetProposal(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        return Ok(MapToDto(proposal));
    }

    /// <summary>
    /// Creates a new proposal.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProposalDto>> CreateProposal(
        [FromBody] CreateProposalRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            LeadId = request.LeadId,
            Title = request.Title,
            ClientName = request.ClientName,
            ClientEmail = request.ClientEmail,
            ClientCompany = request.ClientCompany,
            Amount = request.Amount,
            Currency = request.Currency,
            Content = request.Content,
            TemplateId = request.TemplateId,
            ValidUntil = request.ValidUntil,
            Notes = request.Notes,
            Status = "draft",
            AccessToken = GenerateAccessToken(),
            CreatedAt = DateTime.UtcNow,
        };

        _context.Proposals.Add(proposal);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created proposal {ProposalId} for business {BusinessId}", proposal.Id, businessId);

        return CreatedAtAction(nameof(GetProposal), new { id = proposal.Id }, MapToDto(proposal));
    }

    /// <summary>
    /// Updates a proposal.
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ProposalDto>> UpdateProposal(
        Guid id,
        [FromBody] UpdateProposalRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        if (request.Title != null) proposal.Title = request.Title;
        if (request.ClientName != null) proposal.ClientName = request.ClientName;
        if (request.ClientEmail != null) proposal.ClientEmail = request.ClientEmail;
        if (request.ClientCompany != null) proposal.ClientCompany = request.ClientCompany;
        if (request.Status != null) proposal.Status = request.Status;
        if (request.Amount.HasValue) proposal.Amount = request.Amount.Value;
        if (request.Currency != null) proposal.Currency = request.Currency;
        if (request.Content != null) proposal.Content = request.Content;
        if (request.ValidUntil.HasValue) proposal.ValidUntil = request.ValidUntil;
        if (request.Notes != null) proposal.Notes = request.Notes;

        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(proposal));
    }

    /// <summary>
    /// Sends a proposal to the client.
    /// </summary>
    [HttpPost("{id:guid}/send")]
    public async Task<ActionResult<ProposalDto>> SendProposal(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        proposal.Status = "sent";
        proposal.SentAt = DateTime.UtcNow;
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sent proposal {ProposalId}", id);

        return Ok(MapToDto(proposal));
    }

    /// <summary>
    /// Deletes a proposal (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProposal(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        proposal.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Public endpoint to view a proposal by access token.
    /// </summary>
    [HttpGet("public/{accessToken}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProposalDto>> GetPublicProposal(string accessToken, CancellationToken cancellationToken = default)
    {
        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.AccessToken == accessToken && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        // Track view
        proposal.ViewCount++;
        if (proposal.ViewedAt == null)
        {
            proposal.ViewedAt = DateTime.UtcNow;
            proposal.Status = "viewed";
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(proposal));
    }

    /// <summary>
    /// Public endpoint to accept a proposal.
    /// </summary>
    [HttpPost("public/{accessToken}/accept")]
    [AllowAnonymous]
    public async Task<ActionResult<ProposalDto>> AcceptProposal(
        string accessToken,
        [FromBody] AcceptProposalRequest request,
        CancellationToken cancellationToken = default)
    {
        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.AccessToken == accessToken && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        if (proposal.Status == "accepted" || proposal.Status == "declined")
            return BadRequest("Proposal has already been responded to.");

        proposal.Status = "accepted";
        proposal.AcceptedAt = DateTime.UtcNow;
        proposal.SignerName = request.SignerName;
        proposal.SignatureData = request.SignatureData;
        proposal.SignerIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Proposal {ProposalId} accepted by {SignerName}", proposal.Id, request.SignerName);

        return Ok(MapToDto(proposal));
    }

    /// <summary>
    /// Public endpoint to decline a proposal.
    /// </summary>
    [HttpPost("public/{accessToken}/decline")]
    [AllowAnonymous]
    public async Task<ActionResult<ProposalDto>> DeclineProposal(
        string accessToken,
        [FromBody] DeclineProposalRequest request,
        CancellationToken cancellationToken = default)
    {
        var proposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.AccessToken == accessToken && p.DeletedAt == null, cancellationToken);

        if (proposal == null)
            return NotFound();

        if (proposal.Status == "accepted" || proposal.Status == "declined")
            return BadRequest("Proposal has already been responded to.");

        proposal.Status = "declined";
        proposal.DeclinedAt = DateTime.UtcNow;
        proposal.DeclineReason = request.Reason;
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Proposal {ProposalId} declined", proposal.Id);

        return Ok(MapToDto(proposal));
    }

    private static string GenerateAccessToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .Replace("=", string.Empty, StringComparison.Ordinal);
    }

    private static ProposalDto MapToDto(Proposal p)
    {
        return new ProposalDto
        {
            Id = p.Id,
            LeadId = p.LeadId,
            Title = p.Title,
            ClientName = p.ClientName,
            ClientEmail = p.ClientEmail,
            ClientCompany = p.ClientCompany,
            Status = p.Status,
            Amount = p.Amount,
            Currency = p.Currency,
            Content = p.Content,
            TemplateId = p.TemplateId,
            ValidUntil = p.ValidUntil,
            SentAt = p.SentAt,
            ViewedAt = p.ViewedAt,
            ViewCount = p.ViewCount,
            AcceptedAt = p.AcceptedAt,
            DeclinedAt = p.DeclinedAt,
            DeclineReason = p.DeclineReason,
            IsSigned = !string.IsNullOrEmpty(p.SignatureData),
            SignerName = p.SignerName,
            Notes = p.Notes,
            PublicUrl = $"/proposals/view/{p.AccessToken}",
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
        };
    }
}

#pragma warning restore SA1503
#pragma warning restore SA1615
