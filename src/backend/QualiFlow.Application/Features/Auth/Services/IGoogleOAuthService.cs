using System.Diagnostics.CodeAnalysis;

using QualiFlow.Application.Features.Auth.DTOs;

namespace QualiFlow.Application.Features.Auth.Services;

/// <summary>
/// Service for handling Google OAuth authentication.
/// Manages OAuth flow, token exchange, and user account creation/linking.
/// </summary>
public interface IGoogleOAuthService
{
    /// <summary>
    /// Generates the Google OAuth authorization URL for user authentication.
    /// </summary>
    /// <param name="returnUrl">The URL to redirect to after authentication.</param>
    /// <param name="businessId">Optional business ID for account linking.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Response containing the authorization URL and state.</returns>
    [SuppressMessage("Design", "CA1054:URI-like parameters should not be strings", Justification = "Used for JSON serialization")]
    Task<OAuthInitiateResponse> InitiateOAuthAsync(
        string? returnUrl,
        Guid? businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Handles the OAuth callback from Google and authenticates the user.
    /// Creates a new user account if one doesn't exist, or links to an existing account.
    /// </summary>
    /// <param name="code">The authorization code from Google.</param>
    /// <param name="state">The state parameter for CSRF protection.</param>
    /// <param name="ipAddress">The IP address of the client.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth login response with tokens and user info.</returns>
    Task<OAuthLoginResponse> HandleCallbackAsync(
        string code,
        string state,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates an OAuth state parameter against the stored state.
    /// </summary>
    /// <param name="state">The state parameter to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the state is valid, false otherwise.</returns>
    Task<bool> ValidateStateAsync(string state, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the OAuth status for a user (provider info, linked accounts).
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth status information.</returns>
    Task<OAuthStatusResponse> GetOAuthStatusAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Authenticates a user using a Google ID token.
    /// Used by NextAuth.js which sends ID tokens directly instead of authorization codes.
    /// </summary>
    /// <param name="idToken">The Google ID token.</param>
    /// <param name="ipAddress">The IP address of the client.</param>
    /// <param name="selectedPlan">Optional subscription plan for new users (freeflow, smartflow, ultraflow, enterprise).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth login response with tokens and user info.</returns>
    Task<OAuthLoginResponse> AuthenticateWithIdTokenAsync(
        string idToken,
        string? ipAddress,
        string? selectedPlan = null,
        CancellationToken cancellationToken = default);
}
