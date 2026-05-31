#pragma warning disable SCS0027 // Open Redirect - URL is validated against allowed channel types
#pragma warning disable S1075 // Hardcoded URI - Frontend URL will be configured via options
#pragma warning disable CA1859 // Use concrete type for improved performance

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Meta.Interfaces;
using QualiFlow.Infrastructure.ExternalServices.Meta;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for Meta OAuth flow to connect Facebook Pages and Instagram accounts.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/meta/oauth")]
[Authorize]
[ApiExplorerSettings(GroupName = "v1")]
public partial class MetaOAuthController : ControllerBase
{
    private readonly IMetaOAuthService _oauthService;
    private readonly ICurrentUserService _currentUserService;
    private readonly MetaOptions _metaOptions;
    private readonly ILogger<MetaOAuthController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaOAuthController"/> class.
    /// </summary>
    public MetaOAuthController(
        IMetaOAuthService oauthService,
        ICurrentUserService currentUserService,
        IOptions<MetaOptions> metaOptions,
        ILogger<MetaOAuthController> logger)
    {
        _oauthService = oauthService;
        _currentUserService = currentUserService;
        _metaOptions = metaOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Initiates the OAuth flow to connect a Facebook Page or Instagram account.
    /// </summary>
    /// <param name="channelType">The channel type (facebook or instagram).</param>
    /// <returns>Redirect to Meta OAuth authorization page.</returns>
    [HttpGet("authorize")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    public IActionResult Authorize([FromQuery] string channelType = "facebook")
    {
        var businessId = _currentUserService.GetBusinessId();
        if (businessId == Guid.Empty)
        {
            return BadRequest(new { error = "Business ID not found" });
        }

        var state = Guid.NewGuid().ToString("N");
        var authUrl = _oauthService.GetAuthorizationUrl(businessId, state, channelType);

        LogOAuthInitiated(_logger, businessId, channelType);

        return Redirect(authUrl);
    }

    /// <summary>
    /// Handles the OAuth callback from Meta.
    /// </summary>
    /// <param name="code">The authorization code.</param>
    /// <param name="state">The state parameter.</param>
    /// <param name="error">Error from Meta if authorization failed.</param>
    /// <param name="errorDescription">Error description from Meta.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Redirect to frontend with result.</returns>
    [HttpGet("callback")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status302Found)]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        [FromQuery(Name = "error_description")] string? errorDescription,
        CancellationToken cancellationToken)
    {
        // Handle error from Meta
        if (!string.IsNullOrEmpty(error))
        {
            LogOAuthError(_logger, error, errorDescription);
            return RedirectToFrontend(false, errorDescription ?? error);
        }

        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            return RedirectToFrontend(false, "Missing code or state parameter");
        }

        var result = await _oauthService.HandleCallbackAsync(code, state, cancellationToken);

        if (!result.Success)
        {
            return RedirectToFrontend(false, result.ErrorMessage ?? "OAuth failed");
        }

        // Store pages in session or return them
        // For now, redirect with success and let frontend fetch pages
        LogOAuthSuccess(_logger, result.BusinessId ?? Guid.Empty, result.Pages?.Count ?? 0);

        return RedirectToFrontend(true, null, result.BusinessId, result.ChannelType);
    }

    /// <summary>
    /// Gets the list of Facebook Pages available for connection.
    /// </summary>
    /// <param name="userAccessToken">The user's access token from OAuth.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available pages.</returns>
    [HttpGet("pages")]
    [ProducesResponseType(typeof(IReadOnlyList<MetaPageInfo>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MetaPageInfo>>> GetPages(
        [FromQuery] string userAccessToken,
        CancellationToken cancellationToken)
    {
        var pages = await _oauthService.GetUserPagesAsync(userAccessToken, cancellationToken);
        return Ok(pages);
    }

    /// <summary>
    /// Connects a Facebook Page to the business.
    /// </summary>
    /// <param name="request">The connection request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created channel ID.</returns>
    [HttpPost("connect")]
    [ProducesResponseType(typeof(ConnectPageResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ConnectPageResponse>> ConnectPage(
        [FromBody] ConnectPageRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        if (businessId == Guid.Empty)
        {
            return BadRequest(new { error = "Business ID not found" });
        }

        var channelId = await _oauthService.ConnectPageAsync(
            businessId,
            request.PageId,
            request.PageAccessToken,
            request.PageName,
            request.ChannelType,
            cancellationToken);

        LogPageConnected(_logger, channelId, request.PageId);

        return Ok(new ConnectPageResponse { ChannelId = channelId, Success = true });
    }

    /// <summary>
    /// Disconnects a Meta channel.
    /// </summary>
    /// <param name="channelId">The channel ID to disconnect.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("disconnect/{channelId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Disconnect(Guid channelId, CancellationToken cancellationToken)
    {
        await _oauthService.DisconnectAsync(channelId, cancellationToken);
        LogPageDisconnected(_logger, channelId);
        return NoContent();
    }

    /// <summary>
    /// Disconnects a Meta channel (POST variant for frontend compatibility).
    /// </summary>
    /// <param name="request">The disconnect request containing the channel ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("disconnect")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DisconnectPost([FromBody] DisconnectRequest request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.ChannelId, out var channelId))
        {
            return BadRequest(new { error = "Invalid channel ID" });
        }

        await _oauthService.DisconnectAsync(channelId, cancellationToken);
        LogPageDisconnected(_logger, channelId);
        return NoContent();
    }

    /// <summary>
    /// Gets the Meta connection status for the current business.
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The connection status including connected pages.</returns>
    [HttpGet("status")]
    [ProducesResponseType(typeof(MetaConnectionStatusResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<MetaConnectionStatusResponse>> GetStatus(
        [FromServices] QualiFlow.Infrastructure.Data.QualiFlowDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        if (businessId == Guid.Empty)
        {
            return BadRequest(new { error = "Business ID not found" });
        }

        // Get all Meta channels (Facebook and Instagram) for this business
        var metaChannels = await dbContext.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId &&
                       (c.Type == QualiFlow.Domain.Enums.ChannelType.Facebook ||
                        c.Type == QualiFlow.Domain.Enums.ChannelType.Instagram) &&
                       c.DeletedAt == null)
            .Select(c => new MetaConnectedPage
            {
                Id = c.ExternalId ?? c.Id.ToString(),
                Name = c.Name,
                Category = c.Type == QualiFlow.Domain.Enums.ChannelType.Instagram ? "Instagram" : "Facebook Page",
                IsConnected = c.IsActive,
                ChannelId = c.Id.ToString(),
                InstagramBusinessAccountId = c.Type == QualiFlow.Domain.Enums.ChannelType.Instagram ? c.ExternalId : null,
                InstagramUsername = c.Type == QualiFlow.Domain.Enums.ChannelType.Instagram ? c.Name.Replace(" (Instagram)", string.Empty) : null,
            })
            .ToListAsync(cancellationToken);

        var hasActiveChannels = metaChannels.Exists(c => c.IsConnected);

        // Get the earliest expiry date from active channels
        var tokenExpiresAt = await dbContext.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId &&
                       (c.Type == QualiFlow.Domain.Enums.ChannelType.Facebook ||
                        c.Type == QualiFlow.Domain.Enums.ChannelType.Instagram) &&
                       c.DeletedAt == null &&
                       c.TokenExpiresAt != null)
            .OrderBy(c => c.TokenExpiresAt)
            .Select(c => c.TokenExpiresAt)
            .FirstOrDefaultAsync(cancellationToken);

        var lastVerifiedAt = await dbContext.Channels
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId &&
                       (c.Type == QualiFlow.Domain.Enums.ChannelType.Facebook ||
                        c.Type == QualiFlow.Domain.Enums.ChannelType.Instagram) &&
                       c.DeletedAt == null &&
                       c.LastVerifiedAt != null)
            .OrderByDescending(c => c.LastVerifiedAt)
            .Select(c => c.LastVerifiedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(new MetaConnectionStatusResponse
        {
            IsConnected = hasActiveChannels,
            ConnectedPages = metaChannels,
            TokenExpiresAt = tokenExpiresAt?.ToString("o"),
            LastVerifiedAt = lastVerifiedAt?.ToString("o"),
        });
    }

    private IActionResult RedirectToFrontend(bool success, string? error, Guid? businessId = null, string? channelType = null)
    {
        // Use configured frontend callback URL, fallback to localhost
        var baseUrl = !string.IsNullOrEmpty(_metaOptions.FrontendCallbackUrl)
            ? _metaOptions.FrontendCallbackUrl
            : "http://localhost:3000/channels/meta/callback";

        var queryParams = new List<string> { $"success={success.ToString().ToLowerInvariant()}" };

        if (!string.IsNullOrEmpty(error))
        {
            queryParams.Add($"error={Uri.EscapeDataString(error)}");
        }

        if (businessId.HasValue)
        {
            queryParams.Add($"businessId={businessId.Value}");
        }

        if (!string.IsNullOrEmpty(channelType))
        {
            queryParams.Add($"channelType={channelType}");
        }

        return Redirect($"{baseUrl}?{string.Join("&", queryParams)}");
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "OAuth initiated for business {BusinessId}, channel type {ChannelType}")]
    private static partial void LogOAuthInitiated(ILogger logger, Guid businessId, string channelType);

    [LoggerMessage(Level = LogLevel.Warning, Message = "OAuth error from Meta: {Error} - {Description}")]
    private static partial void LogOAuthError(ILogger logger, string error, string? description);

    [LoggerMessage(Level = LogLevel.Information, Message = "OAuth successful for business {BusinessId}, found {PageCount} pages")]
    private static partial void LogOAuthSuccess(ILogger logger, Guid businessId, int pageCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Page connected: channel {ChannelId}, page {PageId}")]
    private static partial void LogPageConnected(ILogger logger, Guid channelId, string pageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Page disconnected: channel {ChannelId}")]
    private static partial void LogPageDisconnected(ILogger logger, Guid channelId);
}

/// <summary>
/// Request to connect a Facebook Page.
/// </summary>
public record ConnectPageRequest
{
    /// <summary>
    /// Gets the page ID.
    /// </summary>
    public string PageId { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page access token.
    /// </summary>
    public string PageAccessToken { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page name.
    /// </summary>
    public string PageName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the channel type (facebook or instagram).
    /// </summary>
    public string ChannelType { get; init; } = "facebook";
}

/// <summary>
/// Response from connecting a page.
/// </summary>
public record ConnectPageResponse
{
    /// <summary>
    /// Gets the created channel ID.
    /// </summary>
    public Guid ChannelId { get; init; }

    /// <summary>
    /// Gets a value indicating whether the connection was successful.
    /// </summary>
    public bool Success { get; init; }
}

/// <summary>
/// Request to disconnect a Meta channel.
/// </summary>
public record DisconnectRequest
{
    /// <summary>
    /// Gets the channel ID to disconnect.
    /// </summary>
    public string ChannelId { get; init; } = string.Empty;
}

/// <summary>
/// Response containing Meta connection status.
/// </summary>
public record MetaConnectionStatusResponse
{
    /// <summary>
    /// Gets a value indicating whether any Meta channel is connected.
    /// </summary>
    public bool IsConnected { get; init; }

    /// <summary>
    /// Gets the list of connected pages.
    /// </summary>
    public IReadOnlyList<MetaConnectedPage> ConnectedPages { get; init; } = [];

    /// <summary>
    /// Gets when the access token expires (ISO 8601 format).
    /// </summary>
    public string? TokenExpiresAt { get; init; }

    /// <summary>
    /// Gets when the channel was last verified (ISO 8601 format).
    /// </summary>
    public string? LastVerifiedAt { get; init; }
}

/// <summary>
/// Information about a connected Meta page.
/// </summary>
public record MetaConnectedPage
{
    /// <summary>
    /// Gets the external page ID.
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page category.
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Gets a value indicating whether the channel is connected and active.
    /// </summary>
    public bool IsConnected { get; init; }

    /// <summary>
    /// Gets the QualiFlow channel ID.
    /// </summary>
    public string? ChannelId { get; init; }

    /// <summary>
    /// Gets the Instagram Business Account ID if connected.
    /// </summary>
    public string? InstagramBusinessAccountId { get; init; }

    /// <summary>
    /// Gets the Instagram username.
    /// </summary>
    public string? InstagramUsername { get; init; }
}
