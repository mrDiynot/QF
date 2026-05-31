// <copyright file="SnapshotPeriod.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Snapshot period type for analytics.
/// </summary>
public enum SnapshotPeriod
{
    /// <summary>Hourly snapshot for real-time dashboards.</summary>
    Hourly = 0,

    /// <summary>Daily snapshot for trend analysis.</summary>
    Daily = 1,

    /// <summary>Weekly snapshot for reports.</summary>
    Weekly = 2,

    /// <summary>Monthly snapshot for historical data.</summary>
    Monthly = 3,
}
