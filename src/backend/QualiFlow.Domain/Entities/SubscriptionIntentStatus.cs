namespace QualiFlow.Domain.Entities;

/// <summary>
/// Status of a subscription intent.
/// </summary>
public enum SubscriptionIntentStatus
{
    /// <summary>
    /// Intent created, awaiting payment.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Payment completed, subscription activated.
    /// </summary>
    Completed = 1,

    /// <summary>
    /// Payment failed or was declined.
    /// </summary>
    Failed = 2,

    /// <summary>
    /// Intent expired without completion.
    /// </summary>
    Expired = 3,

    /// <summary>
    /// User cancelled the checkout.
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Requires manual reconciliation.
    /// </summary>
    RequiresReconciliation = 5,
}

