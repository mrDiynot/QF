// -----------------------------------------------------------------------
// <copyright file="IAdminBillingService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Admin.Billing;

/// <summary>
/// Service interface for admin billing analytics operations.
/// </summary>
public interface IAdminBillingService
{
    /// <summary>
    /// Gets revenue metrics for the admin dashboard.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Revenue metrics including MRR, ARR, churn, and trends.</returns>
    Task<RevenueMetricsDto> GetRevenueMetricsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets MRR history for trend analysis.
    /// </summary>
    /// <param name="months">Number of months to include.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Monthly MRR data.</returns>
    Task<IReadOnlyList<MonthlyRevenueDto>> GetMrrHistoryAsync(int months = 6, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all invoices across all businesses.
    /// </summary>
    /// <param name="limit">Maximum number of invoices to return.</param>
    /// <param name="status">Filter by invoice status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of invoices.</returns>
    Task<IReadOnlyList<AdminInvoiceDto>> GetAllInvoicesAsync(int limit = 50, string? status = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Resends an invoice email to the customer.
    /// </summary>
    /// <param name="invoiceId">The invoice ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Task.</returns>
    Task ResendInvoiceAsync(string invoiceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a refund for an invoice.
    /// </summary>
    /// <param name="invoiceId">The invoice ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Refund result.</returns>
    Task<AdminRefundResultDto> RefundInvoiceAsync(string invoiceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all payment methods across all businesses.
    /// </summary>
    /// <param name="limit">Maximum number of payment methods to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of payment methods.</returns>
    Task<IReadOnlyList<AdminPaymentMethodDto>> GetAllPaymentMethodsAsync(int limit = 50, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all disputes across all businesses.
    /// </summary>
    /// <param name="limit">Maximum number of disputes to return.</param>
    /// <param name="status">Filter by dispute status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of disputes.</returns>
    Task<IReadOnlyList<AdminDisputeDto>> GetAllDisputesAsync(int limit = 50, string? status = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for revenue metrics.
/// </summary>
public class RevenueMetricsDto
{
    /// <summary>Gets total MRR.</summary>
    public decimal TotalMRR { get; init; }

    /// <summary>Gets MRR growth percentage from last month.</summary>
    public decimal MrrGrowthPercent { get; init; }

    /// <summary>Gets total ARR (MRR * 12).</summary>
    public decimal TotalARR { get; init; }

    /// <summary>Gets new MRR from new subscriptions this month.</summary>
    public decimal NewMRR { get; init; }

    /// <summary>Gets churned MRR from cancellations this month.</summary>
    public decimal ChurnedMRR { get; init; }

    /// <summary>Gets expansion MRR from upgrades this month.</summary>
    public decimal ExpansionMRR { get; init; }

    /// <summary>Gets net new MRR (new + expansion - churned).</summary>
    public decimal NetNewMRR { get; init; }

    /// <summary>Gets average revenue per user.</summary>
    public decimal ARPU { get; init; }

    /// <summary>Gets customer lifetime value.</summary>
    public decimal LTV { get; init; }

    /// <summary>Gets monthly churn rate percentage.</summary>
    public decimal ChurnRate { get; init; }

    /// <summary>Gets total paying customers.</summary>
    public int PayingCustomers { get; init; }
}

/// <summary>
/// DTO for monthly revenue data.
/// </summary>
public class MonthlyRevenueDto
{
    /// <summary>Gets the month (e.g., "Jan 2024").</summary>
    public string Month { get; init; } = string.Empty;

    /// <summary>Gets the year.</summary>
    public int Year { get; init; }

    /// <summary>Gets the month number.</summary>
    public int MonthNumber { get; init; }

    /// <summary>Gets the MRR for this month.</summary>
    public decimal MRR { get; init; }

    /// <summary>Gets the customer count for this month.</summary>
    public int CustomerCount { get; init; }

    /// <summary>Gets new subscriptions this month.</summary>
    public int NewSubscriptions { get; init; }

    /// <summary>Gets cancellations this month.</summary>
    public int Cancellations { get; init; }
}

/// <summary>
/// DTO for admin invoice data.
/// </summary>
public class AdminInvoiceDto
{
    /// <summary>Gets the invoice ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the invoice number.</summary>
    public string InvoiceNumber { get; init; } = string.Empty;

    /// <summary>Gets the business ID.</summary>
    public Guid BusinessId { get; init; }

    /// <summary>Gets the business name.</summary>
    public string BusinessName { get; init; } = string.Empty;

    /// <summary>Gets the invoice amount in cents.</summary>
    public decimal Amount { get; init; }

    /// <summary>Gets the invoice status.</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Gets the invoice date.</summary>
    public DateTime Date { get; init; }

    /// <summary>Gets the due date.</summary>
    public DateTime? DueDate { get; init; }

    /// <summary>Gets the paid date.</summary>
    public DateTime? PaidDate { get; init; }

    /// <summary>Gets the invoice PDF URL.</summary>
#pragma warning disable CA1056 // URI properties should not be strings
    public string? PdfUrl { get; init; }
#pragma warning restore CA1056
}

/// <summary>
/// DTO for admin payment method data.
/// </summary>
public class AdminPaymentMethodDto
{
    /// <summary>Gets the payment method ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the business ID.</summary>
    public Guid BusinessId { get; init; }

    /// <summary>Gets the business name.</summary>
    public string BusinessName { get; init; } = string.Empty;

    /// <summary>Gets the payment method type (card, bank_account).</summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>Gets the card brand (visa, mastercard, etc.).</summary>
    public string? Brand { get; init; }

    /// <summary>Gets the last 4 digits.</summary>
    public string Last4 { get; init; } = string.Empty;

    /// <summary>Gets the expiry month.</summary>
    public int? ExpiryMonth { get; init; }

    /// <summary>Gets the expiry year.</summary>
    public int? ExpiryYear { get; init; }

    /// <summary>Gets a value indicating whether this is the default payment method.</summary>
    public bool IsDefault { get; init; }
}

/// <summary>
/// DTO for admin dispute data.
/// </summary>
public class AdminDisputeDto
{
    /// <summary>Gets the dispute ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the business ID.</summary>
    public Guid BusinessId { get; init; }

    /// <summary>Gets the business name.</summary>
    public string BusinessName { get; init; } = string.Empty;

    /// <summary>Gets the disputed amount in cents.</summary>
    public decimal Amount { get; init; }

    /// <summary>Gets the dispute reason.</summary>
    public string Reason { get; init; } = string.Empty;

    /// <summary>Gets the dispute status.</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Gets the date the dispute was created.</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Gets the date evidence is due by.</summary>
    public DateTime? DueBy { get; init; }

    /// <summary>Gets the charge ID.</summary>
    public string ChargeId { get; init; } = string.Empty;
}

/// <summary>
/// DTO for refund result.
/// </summary>
public class AdminRefundResultDto
{
    /// <summary>Gets the refund ID.</summary>
    public string RefundId { get; init; } = string.Empty;

    /// <summary>Gets the refund amount.</summary>
    public decimal Amount { get; init; }

    /// <summary>Gets the refund status.</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Gets a value indicating whether the refund was successful.</summary>
    public bool Success { get; init; }
}
