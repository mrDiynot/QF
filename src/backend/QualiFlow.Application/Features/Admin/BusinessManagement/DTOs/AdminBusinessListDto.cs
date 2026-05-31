namespace QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;

/// <summary>
/// Summary view of a business for list display.
/// </summary>
public class AdminBusinessListDto
{
    /// <summary>
    /// Gets the business ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the business name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the owner's email.
    /// </summary>
    public required string OwnerEmail { get; init; }

    /// <summary>
    /// Gets the owner's name.
    /// </summary>
    public required string OwnerName { get; init; }

    /// <summary>
    /// Gets the subscription tier. Null if no subscription exists.
    /// </summary>
    public string? SubscriptionTier { get; init; }

    /// <summary>
    /// Gets the total number of users in this business.
    /// </summary>
    public int TotalUsers { get; init; }

    /// <summary>
    /// Gets the total number of leads.
    /// </summary>
    public int TotalLeads { get; init; }

    /// <summary>
    /// Gets a value indicating whether the business is active.
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Gets the business creation date.
    /// </summary>
    public required DateTime CreatedAt { get; init; }
}

