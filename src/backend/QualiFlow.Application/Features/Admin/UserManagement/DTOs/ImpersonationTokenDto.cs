namespace QualiFlow.Application.Features.Admin.UserManagement.DTOs;

/// <summary>
/// DTO for impersonation token response.
/// </summary>
public class ImpersonationTokenDto
{
    /// <summary>
    /// Gets the JWT token for impersonation.
    /// </summary>
    public required string Token { get; init; }

    /// <summary>
    /// Gets the impersonated user ID.
    /// </summary>
    public required Guid ImpersonatedUserId { get; init; }

    /// <summary>
    /// Gets the impersonated user email.
    /// </summary>
    public required string ImpersonatedUserEmail { get; init; }

    /// <summary>
    /// Gets the impersonated user business ID.
    /// </summary>
    public required Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the impersonated user business name.
    /// </summary>
    public required string BusinessName { get; init; }

    /// <summary>
    /// Gets when the impersonation session expires (1 hour from creation).
    /// </summary>
    public required DateTime ExpiresAt { get; init; }
}

