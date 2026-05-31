namespace QualiFlow.Domain.Enums;

/// <summary>
/// Status of a webhook failure record.
/// </summary>
public enum WebhookFailureStatus
{
    /// <summary>Pending retry.</summary>
    Pending = 0,

    /// <summary>Currently being retried.</summary>
    Retrying = 1,

    /// <summary>Successfully processed on retry.</summary>
    Resolved = 2,

    /// <summary>Max retries exceeded, requires manual investigation.</summary>
    Failed = 3,

    /// <summary>Manually dismissed.</summary>
    Dismissed = 4,
}

