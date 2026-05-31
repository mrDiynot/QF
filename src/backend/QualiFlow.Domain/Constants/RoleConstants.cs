// -----------------------------------------------------------------------
// <copyright file="RoleConstants.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Constants;

/// <summary>
/// Constants for role names used in the ASP.NET Identity roles table.
/// These roles are seeded during database migration and used for RBAC authorization.
/// IMPORTANT: These values MUST match the database seed data exactly.
/// Note: ApplicationRole entity also defines these constants for backward compatibility.
/// </summary>
public static class RoleConstants
{
    // ========================================================================
    // Business User Roles
    // ========================================================================

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

    // ========================================================================
    // All Role Names (for validation)
    // ========================================================================

    /// <summary>
    /// Gets all defined role names for validation purposes.
    /// </summary>
    public static readonly string[] AllRoles =
    [
        Owner,
        Admin,
        Manager,
        Viewer
    ];
}

