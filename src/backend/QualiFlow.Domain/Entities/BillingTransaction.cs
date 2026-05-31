using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a billing transaction (payment, refund, overage charge).
/// </summary>
public class BillingTransaction : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the subscription ID.
    /// </summary>
    public Guid? SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the transaction type (subscription, overage, addon, refund).
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the transaction amount.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the currency code (e.g., USD, EUR).
    /// </summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Gets or sets the transaction status (pending, succeeded, failed, refunded).
    /// </summary>
    public string Status { get; set; } = "pending";

    /// <summary>
    /// Gets or sets the transaction description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the line items as JSON (detailed breakdown).
    /// </summary>
    public string? LineItemsJson { get; set; }

    /// <summary>
    /// Gets or sets the Stripe invoice ID.
    /// </summary>
    public string? StripeInvoiceId { get; set; }

    /// <summary>
    /// Gets or sets the Stripe payment intent ID.
    /// </summary>
    public string? StripePaymentIntentId { get; set; }

    /// <summary>
    /// Gets or sets the Stripe charge ID.
    /// </summary>
    public string? StripeChargeId { get; set; }

    /// <summary>
    /// Gets or sets the transaction date.
    /// </summary>
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this transaction belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the subscription this transaction is for.
    /// </summary>
    public Subscription? Subscription { get; set; }
}

