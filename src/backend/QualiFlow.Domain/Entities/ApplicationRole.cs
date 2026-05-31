using Microsoft.AspNetCore.Identity;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a role in the QualiFlow system.
/// Extends IdentityRole with custom properties and predefined role constants.
/// </summary>
public class ApplicationRole : IdentityRole<Guid>
{
    // ============================================================================
    // Role Constants (RBAC - Role-Based Access Control)
    // ============================================================================

    /// <summary>
    /// Owner role - Full access to all features and settings.
    /// Can manage users, billing, and delete the business.
    /// </summary>
    public const string Owner = "Owner";

    /// <summary>
    /// Admin role - Administrative access to most features.
    /// Can manage users, leads, conversations, and settings.
    /// Cannot delete the business or manage billing.
    /// </summary>
    public const string Admin = "Admin";

    /// <summary>
    /// Manager role - Operational access to leads and conversations.
    /// Can view and manage leads, conversations, and workflows.
    /// Cannot manage users or settings.
    /// </summary>
    public const string Manager = "Manager";

    /// <summary>
    /// Viewer role - Read-only access to leads and conversations.
    /// Can view leads, conversations, and analytics.
    /// Cannot create, update, or delete any data.
    /// </summary>
    public const string Viewer = "Viewer";

    // ============================================================================
    // Custom Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the role description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the role was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ============================================================================
    // Helper Methods
    // ============================================================================

    /// <summary>
    /// Gets all available role names.
    /// </summary>
    /// <returns>An array of role names.</returns>
    public static string[] GetAllRoles()
    {
        return [Owner, Admin, Manager, Viewer];
    }

    /// <summary>
    /// Checks if the given role name is valid.
    /// </summary>
    /// <param name="roleName">The role name to validate.</param>
    /// <returns>True if the role name is valid; otherwise, false.</returns>
    public static bool IsValidRole(string roleName)
    {
        return GetAllRoles().Contains(roleName, StringComparer.OrdinalIgnoreCase);
    }
}

