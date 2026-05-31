using Asp.Versioning;
using System.Diagnostics.CodeAnalysis;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Auth.DTOs;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for CRM OAuth operations (HubSpot, Salesforce).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/crm")]
[Produces("application/json")]
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public partial class CRMOAuthController : ControllerBase
{
    private readonly IHubSpotOAuthService _hubSpotOAuthService;
    private readonly ISalesforceOAuthService _salesforceOAuthService;
    private readonly ILogger<CRMOAuthController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CRMOAuthController"/> class.
    /// </summary>
    /// <param name="hubSpotOAuthService">The HubSpot OAuth service.</param>
    /// <param name="salesforceOAuthService">The Salesforce OAuth service.</param>
    /// <param name="logger">The logger.</param>
    public CRMOAuthController(
        IHubSpotOAuthService hubSpotOAuthService,
        ISalesforceOAuthService salesforceOAuthService,
        ILogger<CRMOAuthController> logger)
    {
        _hubSpotOAuthService = hubSpotOAuthService;
        _salesforceOAuthService = salesforceOAuthService;
        _logger = logger;
    }

    // ============================================================================
    // HUBSPOT OAUTH ENDPOINTS (S7-BE-001 to S7-BE-004)
    // ============================================================================

    /// <summary>
    /// Initiates HubSpot OAuth authentication flow.
    /// Returns the HubSpot authorization URL for the user to authenticate.
    /// </summary>
    /// <param name="request">The OAuth initiation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth initiation response with authorization URL.</returns>
    /// <response code="200">OAuth initiation successful. Returns authorization URL.</response>
    /// <response code="401">User not authenticated.</response>
    [HttpPost("hubspot/initiate")]
    [Authorize]
    [ProducesResponseType(typeof(OAuthInitiateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OAuthInitiateResponse>> InitiateHubSpotOAuthAsync(
        [FromBody] InitiateCRMOAuthRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = GetBusinessIdFromClaims();
        if (businessId == Guid.Empty)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Business ID not found in user claims.",
            });
        }

        LogHubSpotOAuthInitiated(_logger, businessId, request.ReturnUrl);

        var response = await _hubSpotOAuthService.InitiateOAuthAsync(
            businessId,
            request.ReturnUrl,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Handles the HubSpot OAuth callback.
    /// Exchanges the authorization code for tokens and stores CRM provider connection.
    /// </summary>
    /// <param name="request">The OAuth callback request with authorization code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The CRM OAuth callback response with provider details.</returns>
    /// <response code="200">OAuth authentication successful. Returns CRM provider details.</response>
    /// <response code="400">OAuth error or invalid state.</response>
    [HttpPost("hubspot/callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CRMOAuthCallbackResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CRMOAuthCallbackResponse>> HandleHubSpotCallbackAsync(
        [FromBody] CRMOAuthCallbackRequest request,
        CancellationToken cancellationToken)
    {
        // Check for OAuth errors from HubSpot
        if (!string.IsNullOrEmpty(request.Error))
        {
            LogHubSpotOAuthError(_logger, request.Error, request.ErrorDescription);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Error",
                Detail = request.ErrorDescription ?? request.Error,
            });
        }

        try
        {
            var response = await _hubSpotOAuthService.HandleCallbackAsync(
                request.Code,
                request.State,
                cancellationToken);

            if (!response.Success)
            {
                LogHubSpotOAuthFailed(_logger, response.ErrorMessage);
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "OAuth Failed",
                    Detail = response.ErrorMessage ?? "Failed to complete HubSpot OAuth flow.",
                });
            }

            LogHubSpotOAuthSuccess(_logger, response.CRMProviderId, response.ExternalAccountId);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            LogHubSpotOAuthException(_logger, ex);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Error",
                Detail = ex.Message,
            });
        }
    }

    // ============================================================================
    // SALESFORCE OAUTH ENDPOINTS (S7-BE-005 to S7-BE-008)
    // ============================================================================

    /// <summary>
    /// Initiates Salesforce OAuth authentication flow.
    /// Returns the Salesforce authorization URL for the user to authenticate.
    /// </summary>
    /// <param name="request">The OAuth initiation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth initiation response with authorization URL.</returns>
    /// <response code="200">OAuth initiation successful. Returns authorization URL.</response>
    /// <response code="401">User not authenticated.</response>
    [HttpPost("salesforce/initiate")]
    [Authorize]
    [ProducesResponseType(typeof(OAuthInitiateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OAuthInitiateResponse>> InitiateSalesforceOAuthAsync(
        [FromBody] InitiateCRMOAuthRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = GetBusinessIdFromClaims();
        if (businessId == Guid.Empty)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Business ID not found in user claims.",
            });
        }

        LogSalesforceOAuthInitiated(_logger, businessId, request.ReturnUrl);

        var response = await _salesforceOAuthService.InitiateOAuthAsync(
            businessId,
            request.ReturnUrl,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Handles the Salesforce OAuth callback.
    /// Exchanges the authorization code for tokens and stores CRM provider connection.
    /// </summary>
    /// <param name="request">The OAuth callback request with authorization code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The CRM OAuth callback response with provider details.</returns>
    /// <response code="200">OAuth authentication successful. Returns CRM provider details.</response>
    /// <response code="400">OAuth error or invalid state.</response>
    [HttpPost("salesforce/callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CRMOAuthCallbackResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CRMOAuthCallbackResponse>> HandleSalesforceCallbackAsync(
        [FromBody] CRMOAuthCallbackRequest request,
        CancellationToken cancellationToken)
    {
        // Check for OAuth errors from Salesforce
        if (!string.IsNullOrEmpty(request.Error))
        {
            LogSalesforceOAuthError(_logger, request.Error, request.ErrorDescription);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Error",
                Detail = request.ErrorDescription ?? request.Error,
            });
        }

        try
        {
            var response = await _salesforceOAuthService.HandleCallbackAsync(
                request.Code,
                request.State,
                cancellationToken);

            if (!response.Success)
            {
                LogSalesforceOAuthFailed(_logger, response.ErrorMessage);
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "OAuth Failed",
                    Detail = response.ErrorMessage ?? "Failed to complete Salesforce OAuth flow.",
                });
            }

            LogSalesforceOAuthSuccess(_logger, response.CRMProviderId, response.ExternalAccountId);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            LogSalesforceOAuthException(_logger, ex);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Error",
                Detail = ex.Message,
            });
        }
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private Guid GetBusinessIdFromClaims()
    {
        var businessIdClaim = User.FindFirst("business_id")?.Value;
        return businessIdClaim != null && Guid.TryParse(businessIdClaim, out var businessId)
            ? businessId
            : Guid.Empty;
    }

    // ============================================================================
    // LOGGING METHODS
    // ============================================================================

    [SuppressMessage("StyleCop.CSharp.OrderingRules", "SA1204:Static members should appear before non-static members", Justification = "Logging methods are conventionally placed at the end of the file for better readability")]
    [LoggerMessage(Level = LogLevel.Information, Message = "HubSpot OAuth initiated for business {BusinessId}, return URL: {ReturnUrl}")]
    private static partial void LogHubSpotOAuthInitiated(ILogger logger, Guid businessId, string? returnUrl);

    [LoggerMessage(Level = LogLevel.Error, Message = "HubSpot OAuth error: {Error}, Description: {ErrorDescription}")]
    private static partial void LogHubSpotOAuthError(ILogger logger, string error, string? errorDescription);

    [LoggerMessage(Level = LogLevel.Error, Message = "HubSpot OAuth failed: {ErrorMessage}")]
    private static partial void LogHubSpotOAuthFailed(ILogger logger, string? errorMessage);

    [LoggerMessage(Level = LogLevel.Information, Message = "HubSpot OAuth successful for CRM provider {CRMProviderId}, account: {ExternalAccountId}")]
    private static partial void LogHubSpotOAuthSuccess(ILogger logger, Guid crmProviderId, string? externalAccountId);

    [LoggerMessage(Level = LogLevel.Error, Message = "HubSpot OAuth exception")]
    private static partial void LogHubSpotOAuthException(ILogger logger, Exception ex);

    [LoggerMessage(Level = LogLevel.Information, Message = "Salesforce OAuth initiated for business {BusinessId}, return URL: {ReturnUrl}")]
    private static partial void LogSalesforceOAuthInitiated(ILogger logger, Guid businessId, string? returnUrl);

    [LoggerMessage(Level = LogLevel.Error, Message = "Salesforce OAuth error: {Error}, Description: {ErrorDescription}")]
    private static partial void LogSalesforceOAuthError(ILogger logger, string error, string? errorDescription);

    [LoggerMessage(Level = LogLevel.Error, Message = "Salesforce OAuth failed: {ErrorMessage}")]
    private static partial void LogSalesforceOAuthFailed(ILogger logger, string? errorMessage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Salesforce OAuth successful for CRM provider {CRMProviderId}, account: {ExternalAccountId}")]
    private static partial void LogSalesforceOAuthSuccess(ILogger logger, Guid crmProviderId, string? externalAccountId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Salesforce OAuth exception")]
    private static partial void LogSalesforceOAuthException(ILogger logger, Exception ex);
}
