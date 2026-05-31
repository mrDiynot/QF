using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for initiating CRM OAuth flow.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public sealed record InitiateCRMOAuthRequest
{
    /// <summary>
    /// Gets the URL to return to after OAuth completion.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Return URL is stored as string for flexibility and may be relative path")]
    public string? ReturnUrl { get; init; }
}

