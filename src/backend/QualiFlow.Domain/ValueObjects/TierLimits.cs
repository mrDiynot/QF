namespace QualiFlow.Domain.ValueObjects;

/// <summary>
/// Value object representing subscription tier limits and features.
/// </summary>
public sealed record TierLimits
{
    /// <summary>
    /// Gets the maximum number of active leads allowed.
    /// </summary>
    public int MaxLeads { get; init; }

    /// <summary>
    /// Gets the maximum number of messages per month.
    /// </summary>
    public int MaxMessages { get; init; }

    /// <summary>
    /// Gets the maximum number of active channels.
    /// </summary>
    public int MaxChannels { get; init; }

    /// <summary>
    /// Gets the maximum number of phone numbers.
    /// </summary>
    public int MaxPhoneNumbers { get; init; }

    /// <summary>
    /// Gets the maximum number of team seats.
    /// </summary>
    public int MaxSeats { get; init; }

    /// <summary>
    /// Gets the maximum storage in gigabytes.
    /// </summary>
    public int MaxStorageGB { get; init; }

    /// <summary>
    /// Gets the maximum number of active workflows.
    /// </summary>
    public int MaxWorkflows { get; init; }

    /// <summary>
    /// Gets the maximum number of CRM contacts.
    /// </summary>
    public int MaxCrmContacts { get; init; }

    /// <summary>
    /// Gets the API rate limit per hour.
    /// </summary>
    public int ApiRateLimitPerHour { get; init; }

    /// <summary>
    /// Gets the list of available features for this tier.
    /// </summary>
    public IReadOnlyList<string> Features { get; init; } = Array.Empty<string>();

    /// <summary>
    /// Checks if a specific feature is available in this tier.
    /// </summary>
    /// <param name="featureKey">The feature key to check.</param>
    /// <returns>True if the feature is available, false otherwise.</returns>
    public bool HasFeature(string featureKey)
    {
        return Features.Contains(featureKey, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks if the tier has unlimited capacity for a specific metric.
    /// </summary>
    /// <param name="metric">The metric to check (e.g., "leads", "messages").</param>
    /// <returns>True if unlimited, false otherwise.</returns>
    public bool IsUnlimited(string metric)
    {
        return metric.ToUpperInvariant() switch
        {
            "LEADS" => MaxLeads == int.MaxValue,
            "MESSAGES" => MaxMessages == int.MaxValue,
            "CHANNELS" => MaxChannels == int.MaxValue,
            "PHONENUMBERS" => MaxPhoneNumbers == int.MaxValue,
            "SEATS" => MaxSeats == int.MaxValue,
            "STORAGE" => MaxStorageGB == int.MaxValue,
            "WORKFLOWS" => MaxWorkflows == int.MaxValue,
            "CRMCONTACTS" => MaxCrmContacts == int.MaxValue,
            _ => false
        };
    }
}

