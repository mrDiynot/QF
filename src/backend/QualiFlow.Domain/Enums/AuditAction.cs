// <copyright file="AuditAction.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the type of action performed in an audit log entry.
/// </summary>
public enum AuditAction
{
    /// <summary>
    /// No action or unknown action.
    /// </summary>
    None = 0,

    /// <summary>
    /// Entity was created.
    /// </summary>
    Create = 1,

    /// <summary>
    /// Entity was read/viewed.
    /// </summary>
    Read = 2,

    /// <summary>
    /// Entity was updated.
    /// </summary>
    Update = 3,

    /// <summary>
    /// Entity was deleted (soft or hard delete).
    /// </summary>
    Delete = 4,

    /// <summary>
    /// User logged in.
    /// </summary>
    Login = 5,

    /// <summary>
    /// User logged out.
    /// </summary>
    Logout = 6,

    /// <summary>
    /// Failed login attempt.
    /// </summary>
    LoginFailed = 7,

    /// <summary>
    /// Password was changed.
    /// </summary>
    PasswordChanged = 8,

    /// <summary>
    /// Password reset was requested.
    /// </summary>
    PasswordResetRequested = 9,

    /// <summary>
    /// Bulk operation was performed.
    /// </summary>
    BulkOperation = 10,

    /// <summary>
    /// Data was exported.
    /// </summary>
    Export = 11,

    /// <summary>
    /// Data was imported.
    /// </summary>
    Import = 12,

    /// <summary>
    /// Security policy violation detected.
    /// </summary>
    SecurityViolation = 13,
}

