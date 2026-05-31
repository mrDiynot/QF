namespace QualiFlow.Domain.Entities;

/// <summary>
/// Email delivery status.
/// </summary>
public enum EmailStatus
{
    /// <summary>
    /// Email is queued for sending.
    /// </summary>
    Queued,

    /// <summary>
    /// Email is being sent.
    /// </summary>
    Sending,

    /// <summary>
    /// Email was sent successfully.
    /// </summary>
    Sent,

    /// <summary>
    /// Email was delivered to recipient's inbox.
    /// </summary>
    Delivered,

    /// <summary>
    /// Email was opened by recipient.
    /// </summary>
    Opened,

    /// <summary>
    /// Email link was clicked by recipient.
    /// </summary>
    Clicked,

    /// <summary>
    /// Email bounced (hard or soft bounce).
    /// </summary>
    Bounced,

    /// <summary>
    /// Email sending failed.
    /// </summary>
    Failed,
}

