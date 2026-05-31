namespace QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;

/// <summary>
/// Detailed view of a business with full information.
/// </summary>
public class AdminBusinessDetailDto
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
    /// Gets the business email.
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// Gets the business phone number.
    /// </summary>
    public string? Phone { get; init; }

    /// <summary>
    /// Gets the business industry.
    /// </summary>
    public string? Industry { get; init; }

    /// <summary>
    /// Gets the business size.
    /// </summary>
    public string? Size { get; init; }

    /// <summary>
    /// Gets the owner's ID.
    /// </summary>
    public required Guid OwnerId { get; init; }

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
    /// Gets the subscription status. Null if no subscription exists.
    /// </summary>
    public string? SubscriptionStatus { get; init; }

    /// <summary>
    /// Gets the subscription start date.
    /// </summary>
    public DateTime? SubscriptionStartDate { get; init; }

    /// <summary>
    /// Gets the subscription end date.
    /// </summary>
    public DateTime? SubscriptionEndDate { get; init; }

    /// <summary>
    /// Gets a value indicating whether the business is active.
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Gets the suspension reason if suspended.
    /// </summary>
    public string? SuspensionReason { get; init; }

    /// <summary>
    /// Gets the business creation date.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the business last update date.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }

    /// <summary>
    /// Gets the total number of users.
    /// </summary>
    public int TotalUsers { get; init; }

    /// <summary>
    /// Gets the total number of leads.
    /// </summary>
    public int TotalLeads { get; init; }

    /// <summary>
    /// Gets the total number of conversations.
    /// </summary>
    public int TotalConversations { get; init; }

    /// <summary>
    /// Gets the total number of messages.
    /// </summary>
    public int TotalMessages { get; init; }
}

