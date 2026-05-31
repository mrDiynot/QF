namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a lead in the qualification pipeline.
/// </summary>
public enum LeadStatus
{
    /// <summary>
    /// Lead has been created but not yet contacted.
    /// </summary>
    New = 0,

    /// <summary>
    /// Lead has been contacted by the business.
    /// </summary>
    Contacted = 1,

    /// <summary>
    /// Lead is actively engaged in conversation.
    /// </summary>
    Engaged = 2,

    /// <summary>
    /// Lead has been qualified by AI or manual review.
    /// </summary>
    Qualified = 3,

    /// <summary>
    /// Lead has been identified as a sales opportunity.
    /// </summary>
    Opportunity = 4,

    /// <summary>
    /// Lead has been determined to be unqualified.
    /// </summary>
    Unqualified = 5,

    /// <summary>
    /// Lead has been converted to a customer.
    /// </summary>
    Converted = 6,

    /// <summary>
    /// Lead has been lost (no longer pursuing).
    /// </summary>
    Lost = 7,
}

