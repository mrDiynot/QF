// <copyright file="CalComIntegrationStatus.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Status of the Cal.com integration.
/// </summary>
public enum CalComIntegrationStatus
{
    /// <summary>
    /// Integration is active and working.
    /// </summary>
    Active = 0,

    /// <summary>
    /// Integration is inactive (disabled by user).
    /// </summary>
    Inactive = 1,

    /// <summary>
    /// Integration has an error (invalid API key, etc.).
    /// </summary>
    Error = 2,
}
