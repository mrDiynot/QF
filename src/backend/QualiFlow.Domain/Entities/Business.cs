using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a business (tenant) in the QualiFlow system.
/// This is the root entity for multi-tenancy.
/// </summary>
public class Business : BaseEntity
{
    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the business email.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the business phone number.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the business industry sector.
    /// Valid values: Technology, Healthcare, Finance, Retail, Education, Real Estate, Legal, Consulting, Manufacturing, Other.
    /// </summary>
    public string? Industry { get; set; }

    /// <summary>
    /// Gets or sets the company size range.
    /// Valid values: 1-10, 11-50, 51-200, 201-500, 501-1000, 1001+.
    /// </summary>
    public string? CompanySize { get; set; }

    /// <summary>
    /// Gets or sets the business timezone (IANA timezone identifier).
    /// Example: America/New_York, Europe/London, Asia/Tokyo.
    /// </summary>
    public string? Timezone { get; set; }

    /// <summary>
    /// Gets or sets the business website URL.
    /// </summary>
    public string? Website { get; set; }

    /// <summary>
    /// Gets or sets the business logo URL.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Stored as string in database")]
    public string? LogoUrl { get; set; }

    /// <summary>
    /// Gets or sets the primary brand color (hex format).
    /// </summary>
    public string? PrimaryColor { get; set; }

    /// <summary>
    /// Gets or sets the business description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the business street address.
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Gets or sets the business city.
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// Gets or sets the business state/province.
    /// </summary>
    public string? State { get; set; }

    /// <summary>
    /// Gets or sets the business country.
    /// </summary>
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the business zip/postal code.
    /// </summary>
    public string? ZipCode { get; set; }

    /// <summary>
    /// Gets or sets the chat widget position.
    /// Valid values: bottom-right, bottom-left, top-right, top-left.
    /// </summary>
    public string? WidgetPosition { get; set; }

    /// <summary>
    /// Gets or sets the chat widget welcome message.
    /// </summary>
    public string? WidgetWelcomeMessage { get; set; }

    /// <summary>
    /// Gets or sets the chat widget offline message.
    /// </summary>
    public string? WidgetOfflineMessage { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the business is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the allowed email domain for team invitations.
    /// If set, only emails matching this domain can be invited.
    /// Example: "company.com" allows only *@company.com emails.
    /// If null or empty, any email domain is allowed.
    /// </summary>
    public string? AllowedEmailDomain { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether email domain restriction is enforced.
    /// When true, only emails matching AllowedEmailDomain can be invited.
    /// </summary>
    public bool EnforceEmailDomainRestriction { get; set; }

    // ============================================================================
    // Stripe Integration Fields (Sprint 7.5)
    // ============================================================================
    // Note: Subscription details are now in the Subscription entity (relationship-based)
    // These fields are kept only for Stripe customer/subscription ID tracking

    /// <summary>
    /// Gets or sets the Stripe customer ID.
    /// </summary>
    public string? StripeCustomerId { get; set; }

    /// <summary>
    /// Gets or sets the Stripe subscription ID.
    /// </summary>
    public string? StripeSubscriptionId { get; set; }

    // ============================================================================
    // Navigation Properties (Placeholder - will be populated in S1-BE-004)
    // ============================================================================

    /// <summary>
    /// Gets the users belonging to this business.
    /// </summary>
    public ICollection<ApplicationUser> Users { get; } = [];

    /// <summary>
    /// Gets the leads associated with this business.
    /// </summary>
    public ICollection<Lead> Leads { get; } = [];

    /// <summary>
    /// Gets the conversations associated with this business.
    /// </summary>
    public ICollection<Conversation> Conversations { get; } = [];

    /// <summary>
    /// Gets the channels configured for this business.
    /// </summary>
    public ICollection<Channel> Channels { get; } = [];

    /// <summary>
    /// Gets the bookings associated with this business.
    /// </summary>
    public ICollection<Booking> Bookings { get; } = [];

    /// <summary>
    /// Gets the forms associated with this business.
    /// </summary>
    public ICollection<Form> Forms { get; } = [];

    /// <summary>
    /// Gets the form submissions associated with this business.
    /// </summary>
    public ICollection<FormSubmission> FormSubmissions { get; } = [];

    /// <summary>
    /// Gets or sets the onboarding progress for this business.
    /// </summary>
    public OnboardingProgress? OnboardingProgress { get; set; }

    /// <summary>
    /// Gets or sets the AI configuration for this business.
    /// </summary>
    public AIConfiguration? AIConfiguration { get; set; }

    /// <summary>
    /// Gets the contacts associated with this business.
    /// </summary>
    public ICollection<Contact> Contacts { get; } = [];

    /// <summary>
    /// Gets the deals associated with this business.
    /// </summary>
    public ICollection<Deal> Deals { get; } = [];

    /// <summary>
    /// Gets or sets the subscription for this business.
    /// </summary>
    public Subscription? Subscription { get; set; }

    /// <summary>
    /// Gets or sets the usage counters for this business.
    /// </summary>
    public UsageCounters? UsageCounters { get; set; }

    /// <summary>
    /// Gets the billing transactions for this business.
    /// </summary>
    public ICollection<BillingTransaction> BillingTransactions { get; } = [];

    /// <summary>
    /// Gets the outbound calls for this business.
    /// </summary>
    public ICollection<OutboundCall> OutboundCalls { get; } = [];

    /// <summary>
    /// Gets the call scripts for this business.
    /// </summary>
    public ICollection<CallScript> CallScripts { get; } = [];
}

