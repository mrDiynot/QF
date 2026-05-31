// -----------------------------------------------------------------------
// <copyright file="BusinessSettingsResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Business.DTOs;

/// <summary>
/// Response DTO for business settings.
/// </summary>
public sealed record BusinessSettingsResponse
{
    /// <summary>Gets the business unique identifier.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the business name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the business email.</summary>
    public required string Email { get; init; }

    /// <summary>Gets the business phone number.</summary>
    public string? Phone { get; init; }

    /// <summary>Gets the business website URL.</summary>
    public string? Website { get; init; }

    /// <summary>Gets the business industry.</summary>
    public string? Industry { get; init; }

    /// <summary>Gets the team size.</summary>
    public string? TeamSize { get; init; }

    /// <summary>Gets the business timezone.</summary>
    public string? Timezone { get; init; }

    /// <summary>Gets the business logo URL.</summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "API contract uses string")]
    public string? LogoUrl { get; init; }

    /// <summary>Gets the primary brand color.</summary>
    public string? PrimaryColor { get; init; }

    /// <summary>Gets the business description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the business street address.</summary>
    public string? Address { get; init; }

    /// <summary>Gets the business city.</summary>
    public string? City { get; init; }

    /// <summary>Gets the business state/province.</summary>
    public string? State { get; init; }

    /// <summary>Gets the business country.</summary>
    public string? Country { get; init; }

    /// <summary>Gets the business zip/postal code.</summary>
    public string? ZipCode { get; init; }

    /// <summary>Gets a value indicating whether the business is active.</summary>
    public required bool IsActive { get; init; }

    /// <summary>Gets the date and time when the business was created.</summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>Gets the date and time when the business was last updated.</summary>
    public DateTime? UpdatedAt { get; init; }

    /// <summary>Gets the allowed email domain for team invitations.</summary>
    public string? AllowedEmailDomain { get; init; }

    /// <summary>Gets a value indicating whether email domain restriction is enforced.</summary>
    public bool EnforceEmailDomainRestriction { get; init; }

    /// <summary>Gets the AI persona/tone setting.</summary>
    public string? AiPersona { get; init; }

    /// <summary>Gets the business hours start time.</summary>
    public string? BusinessHoursStart { get; init; }

    /// <summary>Gets the business hours end time.</summary>
    public string? BusinessHoursEnd { get; init; }

    /// <summary>Gets the business days (comma-separated).</summary>
    public string? BusinessDays { get; init; }

    /// <summary>Gets the qualification threshold (0-100).</summary>
    public int? QualificationThreshold { get; init; }

    /// <summary>Gets the greeting message for new leads.</summary>
    public string? GreetingMessage { get; init; }

    /// <summary>Gets the out-of-hours auto-response message.</summary>
    public string? OutOfHoursMessage { get; init; }

    /// <summary>Gets the preferred follow-up channel (sms, email, call).</summary>
    public string? FollowUpPreference { get; init; }

    /// <summary>Gets the chat widget position.</summary>
    public string? WidgetPosition { get; init; }

    /// <summary>Gets the chat widget welcome message.</summary>
    public string? WidgetWelcomeMessage { get; init; }

    /// <summary>Gets the chat widget offline message.</summary>
    public string? WidgetOfflineMessage { get; init; }
}

