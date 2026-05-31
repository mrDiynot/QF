namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the stage of a deal in the sales pipeline.
/// Deals progress sequentially through these stages.
/// </summary>
public enum DealStage
{
    /// <summary>
    /// No stage defined (default/uninitialized).
    /// </summary>
    None = 0,

    /// <summary>
    /// New opportunity - initial contact made.
    /// </summary>
    New = 1,

    /// <summary>
    /// Qualified opportunity - budget, authority, need, timeline confirmed.
    /// </summary>
    Qualified = 2,

    /// <summary>
    /// Proposal sent to prospect.
    /// </summary>
    Proposal = 3,

    /// <summary>
    /// Negotiating terms and conditions.
    /// </summary>
    Negotiation = 4,

    /// <summary>
    /// Deal closed-won (successful sale).
    /// </summary>
    Won = 5,

    /// <summary>
    /// Deal closed-lost (unsuccessful sale).
    /// </summary>
    Lost = 6
}
