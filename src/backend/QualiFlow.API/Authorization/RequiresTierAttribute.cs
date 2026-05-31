using Microsoft.AspNetCore.Authorization;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Authorization;

/// <summary>
/// Authorization attribute to require a minimum subscription tier.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequiresTierAttribute : AuthorizeAttribute, IAuthorizationRequirement
{
    /// <summary>
    /// Initializes a new instance of the <see cref="RequiresTierAttribute"/> class.
    /// </summary>
    /// <param name="minimumTier">The minimum subscription tier required.</param>
    public RequiresTierAttribute(SubscriptionTier minimumTier)
    {
        MinimumTier = minimumTier;
        Policy = $"RequiresTier_{minimumTier}";
    }

    /// <summary>
    /// Gets the minimum subscription tier required.
    /// </summary>
    public SubscriptionTier MinimumTier { get; }
}

