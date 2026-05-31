using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for initiating Google OAuth authentication.
/// </summary>
public sealed record GoogleOAuthRequest
{
    /// <summary>
    /// Gets the URL to redirect to after successful authentication.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Used for JSON serialization")]
    public string? ReturnUrl { get; init; }

    /// <summary>
    /// Gets the business ID for account linking (optional).
    /// If provided, the OAuth user will be linked to this business.
    /// </summary>
    public Guid? BusinessId { get; init; }
}

