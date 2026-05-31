namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for handling Microsoft ID token authentication.
/// Used by NextAuth.js which sends ID tokens directly.
/// </summary>
public sealed record MicrosoftIdTokenRequest
{
    /// <summary>
    /// Gets the ID token from Microsoft OAuth.
    /// </summary>
    public required string IdToken { get; init; }

    /// <summary>
    /// Gets the selected subscription plan for new users.
    /// Optional - defaults to FreeFlow if not provided.
    /// Valid values: freeflow, smartflow, ultraflow, enterprise.
    /// </summary>
    public string? SelectedPlan { get; init; }
}
