using System.Diagnostics.CodeAnalysis;

using QualiFlow.Application.Features.Auth.DTOs;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for HubSpot OAuth 2.0 authentication and CRM integration.
/// Handles OAuth flow, token exchange, and CRM provider setup.
/// </summary>
public interface IHubSpotOAuthService
{
    /// <summary>
    /// Initiates the HubSpot OAuth flow by generating authorization URL.
    /// </summary>
    /// <param name="businessId">The business ID to link the HubSpot account to.</param>
    /// <param name="returnUrl">Optional URL to redirect to after OAuth completion.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>OAuth initiation response with authorization URL and state.</returns>
    [SuppressMessage("Design", "CA1054:URI parameters should not be strings", Justification = "Return URL is stored as string for flexibility and may be relative path")]
    Task<OAuthInitiateResponse> InitiateOAuthAsync(
        Guid businessId,
        string? returnUrl = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Handles the OAuth callback from HubSpot after user authorization.
    /// Exchanges authorization code for access/refresh tokens and creates CRMProvider record.
    /// </summary>
    /// <param name="code">Authorization code from HubSpot.</param>
    /// <param name="state">State parameter for CSRF protection.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>OAuth callback response with CRM provider details.</returns>
    Task<CRMOAuthCallbackResponse> HandleCallbackAsync(
        string code,
        string state,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refreshes the HubSpot OAuth access token using the refresh token.
    /// </summary>
    /// <param name="crmProviderId">The CRM provider ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if token refresh succeeded, false otherwise.</returns>
    Task<bool> RefreshTokenAsync(
        Guid crmProviderId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates the HubSpot OAuth connection by making a test API call.
    /// </summary>
    /// <param name="crmProviderId">The CRM provider ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if connection is valid, false otherwise.</returns>
    Task<bool> ValidateConnectionAsync(
        Guid crmProviderId,
        CancellationToken cancellationToken = default);
}

