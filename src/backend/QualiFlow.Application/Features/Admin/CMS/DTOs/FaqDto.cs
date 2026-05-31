using System;

namespace QualiFlow.Application.Features.Admin.CMS.DTOs;

/// <summary>
/// DTO for FAQ.
/// </summary>
public class FaqDto
{
    /// <summary>Gets or sets the FAQ ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the question.</summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>Gets or sets the answer.</summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>Gets or sets the category.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the FAQ is active.</summary>
    public bool IsActive { get; set; }

    /// <summary>Gets or sets a value indicating whether to show on landing page.</summary>
    public bool ShowOnLandingPage { get; set; }

    /// <summary>Gets or sets a value indicating whether to show in help center.</summary>
    public bool ShowInHelpCenter { get; set; }

    /// <summary>Gets or sets the created date.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets the updated date.</summary>
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request to create or update a FAQ.
/// </summary>
public class FaqRequest
{
    /// <summary>Gets or sets the question.</summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>Gets or sets the answer.</summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>Gets or sets the category.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the FAQ is active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether to show on landing page.</summary>
    public bool ShowOnLandingPage { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether to show in help center.</summary>
    public bool ShowInHelpCenter { get; set; } = true;
}

