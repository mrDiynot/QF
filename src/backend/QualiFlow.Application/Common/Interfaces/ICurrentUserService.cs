namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service for accessing information about the currently authenticated user.
/// Provides access to user ID, business ID, and other claims from the JWT token.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's ID from JWT claims.
    /// </summary>
    /// <returns>The user's ID, or null if not authenticated.</returns>
    Guid? GetUserId();

    /// <summary>
    /// Gets the current user's business ID (tenant ID) from JWT claims.
    /// This is used for multi-tenancy query filtering.
    /// </summary>
    /// <returns>The business ID.</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when the user is not authenticated or businessId claim is missing.</exception>
    Guid GetBusinessId();

    /// <summary>
    /// Tries to get the current user's business ID (tenant ID) from JWT claims.
    /// This is safe to call in contexts where authentication may not be present (e.g., registration).
    /// </summary>
    /// <returns>The business ID if authenticated and claim exists; otherwise, null.</returns>
    Guid? TryGetBusinessId();

    /// <summary>
    /// Gets the current user's email from JWT claims.
    /// </summary>
    /// <returns>The user's email, or null if not authenticated.</returns>
    string? GetUserEmail();

    /// <summary>
    /// Gets a value indicating whether the current user is authenticated.
    /// </summary>
    /// <returns>True if the user is authenticated; otherwise, false.</returns>
    bool IsAuthenticated();
}

