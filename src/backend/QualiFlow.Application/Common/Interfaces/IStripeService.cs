using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service for Stripe payment integration.
/// </summary>
public interface IStripeService
{
    /// <summary>
    /// Creates a Stripe checkout session for subscription upgrade.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="targetPlanId">The target subscription plan ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The checkout session URL.</returns>
    Task<string> CreateCheckoutSessionAsync(
        Guid businessId,
        Guid targetPlanId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Creates a Stripe checkout session for subscription with billing interval and custom URLs.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="targetPlanId">The target subscription plan ID.</param>
    /// <param name="billingInterval">The billing interval (monthly, quarterly, yearly).</param>
    /// <param name="includeOnboarding">Whether to include optional onboarding in billing.</param>
    /// <param name="successUrl">Optional custom success URL.</param>
    /// <param name="cancelUrl">Optional custom cancel URL.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The checkout session URL.</returns>
#pragma warning disable CA1054 // URI parameters should not be strings - URLs come from frontend as strings
    Task<string> CreateCheckoutSessionAsync(
        Guid businessId,
        Guid targetPlanId,
        string billingInterval,
        bool includeOnboarding,
        string? successUrl,
        string? cancelUrl,
        CancellationToken cancellationToken);
#pragma warning restore CA1054

    /// <summary>
    /// Handles Stripe webhook events.
    /// </summary>
    /// <param name="json">The webhook JSON payload.</param>
    /// <param name="signature">The Stripe signature header.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task HandleWebhookAsync(
        string json,
        string signature,
        CancellationToken cancellationToken);

    /// <summary>
    /// Creates a Stripe customer for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="email">The customer email.</param>
    /// <param name="name">The customer name.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The Stripe customer ID.</returns>
    Task<string> CreateCustomerAsync(
        Guid businessId,
        string email,
        string name,
        CancellationToken cancellationToken);

    /// <summary>
    /// Cancels a Stripe subscription.
    /// </summary>
    /// <param name="stripeSubscriptionId">The Stripe subscription ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CancelStripeSubscriptionAsync(
        string stripeSubscriptionId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Updates a Stripe subscription to a new price.
    /// </summary>
    /// <param name="stripeSubscriptionId">The Stripe subscription ID.</param>
    /// <param name="newPriceId">The new Stripe price ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateSubscriptionAsync(
        string stripeSubscriptionId,
        string newPriceId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Verifies a Stripe checkout session and returns details.
    /// </summary>
    /// <param name="sessionId">The Stripe checkout session ID.</param>
    /// <param name="businessId">The business ID to verify ownership.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The checkout session details or null if not found/unauthorized.</returns>
    Task<CheckoutSessionDetails?> VerifyCheckoutSessionAsync(
        string sessionId,
        Guid businessId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Gets invoice history for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="limit">Maximum number of invoices to return.</param>
    /// <param name="startingAfter">Pagination cursor for next page.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of invoices.</returns>
    Task<InvoiceListResult> GetInvoicesAsync(
        Guid businessId,
        int limit = 10,
        string? startingAfter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific invoice by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="invoiceId">The Stripe invoice ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The invoice details or null if not found.</returns>
    Task<InvoiceDto?> GetInvoiceByIdAsync(
        Guid businessId,
        string invoiceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets payment methods for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of payment methods.</returns>
    Task<IReadOnlyList<PaymentMethodDto>> GetPaymentMethodsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a setup intent for adding a new payment method.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The setup intent client secret.</returns>
    Task<string> CreateSetupIntentAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sets a payment method as the default for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="paymentMethodId">The Stripe payment method ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> SetDefaultPaymentMethodAsync(
        Guid businessId,
        string paymentMethodId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a payment method.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="paymentMethodId">The Stripe payment method ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> DeletePaymentMethodAsync(
        Guid businessId,
        string paymentMethodId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a Stripe billing portal session for managing subscription.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="returnUrl">The URL to return to after the portal session.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The billing portal URL.</returns>
#pragma warning disable CA1054 // URI parameters should not be strings - URLs come from frontend as strings
    Task<string> CreateBillingPortalSessionAsync(
        Guid businessId,
        string returnUrl,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054
}

/// <summary>
/// Details of a verified checkout session.
/// </summary>
public record CheckoutSessionDetails(
    string SessionId,
    string Status,
    string? PaymentStatus,
    string? CustomerEmail,
    string? BusinessName,
    string PlanName,
    string? PlanDisplayName,
    string BillingInterval,
    decimal AmountTotal,
    string Currency,
    bool IncludeOnboarding,
    decimal? OnboardingAmount,
    DateTime? SubscriptionStart,
    DateTime? SubscriptionEnd,
    IReadOnlyList<string> Features);

/// <summary>
/// Invoice DTO for Stripe invoices.
/// </summary>
public record InvoiceDto
{
    /// <summary>Gets the Stripe invoice ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the invoice number.</summary>
    public string? Number { get; init; }

    /// <summary>Gets the invoice status.</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Gets the total amount in cents.</summary>
    public long AmountDue { get; init; }

    /// <summary>Gets the amount paid in cents.</summary>
    public long AmountPaid { get; init; }

    /// <summary>Gets the currency.</summary>
    public string Currency { get; init; } = "usd";

    /// <summary>Gets the invoice creation date.</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Gets the due date.</summary>
    public DateTime? DueDate { get; init; }

    /// <summary>Gets the paid date.</summary>
    public DateTime? PaidAt { get; init; }

    /// <summary>Gets the description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the hosted invoice URL.</summary>
#pragma warning disable CA1056 // URI properties should not be strings - URLs from Stripe are strings
    public string? HostedInvoiceUrl { get; init; }

    /// <summary>Gets the invoice PDF URL.</summary>
    public string? InvoicePdfUrl { get; init; }
#pragma warning restore CA1056

    /// <summary>Gets the line items.</summary>
    public IReadOnlyList<InvoiceLineItemDto> LineItems { get; init; } = [];
}

/// <summary>
/// Invoice line item DTO.
/// </summary>
public record InvoiceLineItemDto
{
    /// <summary>Gets the description.</summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>Gets the quantity.</summary>
    public long Quantity { get; init; }

    /// <summary>Gets the unit amount in cents.</summary>
    public long UnitAmount { get; init; }

    /// <summary>Gets the total amount in cents.</summary>
    public long Amount { get; init; }
}

/// <summary>
/// Invoice list result with pagination.
/// </summary>
public record InvoiceListResult
{
    /// <summary>Gets the invoices.</summary>
    public IReadOnlyList<InvoiceDto> Invoices { get; init; } = [];

    /// <summary>Gets a value indicating whether there are more invoices.</summary>
    public bool HasMore { get; init; }

    /// <summary>Gets the cursor for the next page.</summary>
    public string? NextCursor { get; init; }
}

/// <summary>
/// Payment method DTO.
/// </summary>
public record PaymentMethodDto
{
    /// <summary>Gets the Stripe payment method ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the payment method type (card, bank_account, etc.).</summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>Gets the card brand (visa, mastercard, etc.).</summary>
    public string? CardBrand { get; init; }

    /// <summary>Gets the last 4 digits of the card.</summary>
    public string? CardLast4 { get; init; }

    /// <summary>Gets the card expiration month.</summary>
    public int? CardExpMonth { get; init; }

    /// <summary>Gets the card expiration year.</summary>
    public int? CardExpYear { get; init; }

    /// <summary>Gets a value indicating whether this is the default payment method.</summary>
    public bool IsDefault { get; init; }

    /// <summary>Gets the creation date.</summary>
    public DateTime CreatedAt { get; init; }
}

