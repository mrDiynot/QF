namespace QualiFlow.Domain.Enums;

/// <summary>
/// CRM synchronization strategies.
/// </summary>
public enum CRMSyncStrategy
{
    /// <summary>
    /// Real-time sync: Sync immediately when contact/deal is created or updated.
    /// Best for: Low volume, critical data.
    /// </summary>
    RealTime = 0,

    /// <summary>
    /// Scheduled sync: Sync every 30 minutes via Hangfire background job.
    /// Best for: High volume, non-critical data.
    /// </summary>
    Scheduled = 1,

    /// <summary>
    /// Bi-directional sync: Pull changes from external CRM and push changes to external CRM.
    /// Best for: Two-way data flow, conflict resolution needed.
    /// </summary>
    BiDirectional = 2
}

