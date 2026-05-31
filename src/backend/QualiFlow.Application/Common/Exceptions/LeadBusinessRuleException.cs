namespace QualiFlow.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when a lead business rule is violated.
/// </summary>
public class LeadBusinessRuleException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="LeadBusinessRuleException"/> class.
    /// </summary>
    public LeadBusinessRuleException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadBusinessRuleException"/> class.
    /// </summary>
    /// <param name="message">The error message.</param>
    public LeadBusinessRuleException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadBusinessRuleException"/> class.
    /// </summary>
    /// <param name="message">The error message.</param>
    /// <param name="innerException">The inner exception.</param>
    public LeadBusinessRuleException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}

