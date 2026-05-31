// -----------------------------------------------------------------------
// <copyright file="KnowledgeEntryType.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Types of knowledge base entries for AI context.
/// </summary>
public enum KnowledgeEntryType
{
    /// <summary>Frequently asked question and answer.</summary>
    FAQ = 0,

    /// <summary>Product information and features.</summary>
    Product = 1,

    /// <summary>Service description and details.</summary>
    Service = 2,

    /// <summary>Pricing information and tiers.</summary>
    Pricing = 3,

    /// <summary>Company policy or terms.</summary>
    Policy = 4,

    /// <summary>Competitor information for differentiation.</summary>
    Competitor = 5,

    /// <summary>Industry-specific information.</summary>
    Industry = 6,

    /// <summary>Objection handling responses.</summary>
    ObjectionHandling = 7,

    /// <summary>Unique selling propositions.</summary>
    USP = 8,

    /// <summary>Case study or success story.</summary>
    CaseStudy = 9,

    /// <summary>General company information.</summary>
    CompanyInfo = 10,

    /// <summary>Uploaded document (PDF, DOC, TXT, etc.).</summary>
    Document = 11,

    /// <summary>External URL for web scraping.</summary>
    URL = 12,
}
