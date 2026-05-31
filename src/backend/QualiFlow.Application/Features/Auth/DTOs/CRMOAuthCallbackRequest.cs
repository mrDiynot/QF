using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for handling CRM OAuth callback.
/// Contains the authorization code returned by the CRM provider.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public sealed record CRMOAuthCallbackRequest
{
    /// <summary>
    /// Gets the authorization code from the CRM provider.
    /// </summary>
    public required string Code { get; init; }

    /// <summary>
    /// Gets the state parameter for CSRF protection.
    /// </summary>
    public required string State { get; init; }

    /// <summary>
    /// Gets any error returned by the CRM provider.
    /// </summary>
    public string? Error { get; init; }

    /// <summary>
    /// Gets the error description from the CRM provider.
    /// </summary>
    public string? ErrorDescription { get; init; }
}

