namespace QualiFlow.Application.Features.RealTime.DTOs;

/// <summary>
/// Event DTO for broadcasting user connection status changes.
/// </summary>
public class UserConnectionEvent
{
    /// <summary>
    /// Gets or sets the user ID.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user email.
    /// </summary>
    public string? UserEmail { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user is online.
    /// </summary>
    public bool IsOnline { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the connection event.
    /// </summary>
    public DateTime Timestamp { get; set; }
}

