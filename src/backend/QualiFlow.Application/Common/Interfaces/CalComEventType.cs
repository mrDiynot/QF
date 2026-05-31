namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Represents a Cal.com event type.
/// </summary>
public record CalComEventType
{
    /// <summary>
    /// Gets the event type ID.
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Gets the event type title.
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Gets the event type slug.
    /// </summary>
    public string Slug { get; init; } = string.Empty;

    /// <summary>
    /// Gets the duration in minutes.
    /// </summary>
    public int DurationMinutes { get; init; }

    /// <summary>
    /// Gets the description.
    /// </summary>
    public string? Description { get; init; }
}

