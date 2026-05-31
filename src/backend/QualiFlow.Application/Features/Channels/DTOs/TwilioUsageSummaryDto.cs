namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Summary of Twilio usage for a sub-account.
/// </summary>
public class TwilioUsageSummaryDto
{
    /// <summary>
    /// Gets or sets the sub-account SID.
    /// </summary>
    public string SubAccountSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the start date of the usage period.
    /// </summary>
    public DateOnly StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date of the usage period.
    /// </summary>
    public DateOnly EndDate { get; set; }

    /// <summary>
    /// Gets or sets the SMS usage details.
    /// </summary>
    public TwilioUsageCategoryDto Sms { get; set; } = new();

    /// <summary>
    /// Gets or sets the Voice usage details.
    /// </summary>
    public TwilioUsageCategoryDto Voice { get; set; } = new();

    /// <summary>
    /// Gets or sets the WhatsApp usage details.
    /// </summary>
    public TwilioUsageCategoryDto WhatsApp { get; set; } = new();

    /// <summary>
    /// Gets or sets the total cost for the period.
    /// </summary>
    public decimal TotalCost { get; set; }

    /// <summary>
    /// Gets or sets the currency code (e.g., "USD").
    /// </summary>
    public string Currency { get; set; } = "USD";
}

/// <summary>
/// Usage details for a specific Twilio category (SMS, Voice, WhatsApp).
/// </summary>
public class TwilioUsageCategoryDto
{
    /// <summary>
    /// Gets or sets the number of inbound messages/calls.
    /// </summary>
    public int InboundCount { get; set; }

    /// <summary>
    /// Gets or sets the number of outbound messages/calls.
    /// </summary>
    public int OutboundCount { get; set; }

    /// <summary>
    /// Gets the total count (inbound + outbound).
    /// </summary>
    public int TotalCount => InboundCount + OutboundCount;

    /// <summary>
    /// Gets or sets the total minutes (for voice calls).
    /// </summary>
    public decimal TotalMinutes { get; set; }

    /// <summary>
    /// Gets or sets the cost for this category.
    /// </summary>
    public decimal Cost { get; set; }
}

