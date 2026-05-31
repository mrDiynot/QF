// -----------------------------------------------------------------------
// <copyright file="ABTestStatus.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Status of an A/B test.
/// </summary>
public enum ABTestStatus
{
    /// <summary>Test is being configured.</summary>
    Draft = 0,

    /// <summary>Test is scheduled but not started.</summary>
    Scheduled = 1,

    /// <summary>Test is actively running.</summary>
    Running = 2,

    /// <summary>Test is paused.</summary>
    Paused = 3,

    /// <summary>Test has completed with a winner.</summary>
    Completed = 4,

    /// <summary>Test was cancelled without results.</summary>
    Cancelled = 5,
}
