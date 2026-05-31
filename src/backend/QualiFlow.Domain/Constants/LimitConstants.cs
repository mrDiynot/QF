// -----------------------------------------------------------------------
// <copyright file="LimitConstants.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Constants;

/// <summary>
/// Constants for plan limit keys used in the plan_limits table.
/// These keys are seeded during database migration and used for subscription enforcement.
/// IMPORTANT: These values MUST match the database seed data exactly.
/// </summary>
public static class LimitConstants
{
    // ========================================================================
    // AI Interaction Limits
    // ========================================================================

    /// <summary>
    /// Maximum number of AI interactions per month.
    /// </summary>
    public const string MaxAiInteractions = "max_ai_interactions";

    /// <summary>
    /// Maximum number of AI voice agents.
    /// </summary>
    public const string MaxAiVoiceAgents = "max_ai_voice_agents";

    /// <summary>
    /// Maximum AI voice minutes per month.
    /// </summary>
    public const string MaxAiVoiceMinutes = "max_ai_voice_minutes";

    /// <summary>
    /// Maximum AI SMS messages per month.
    /// </summary>
    public const string MaxAiSms = "max_ai_sms";

    // ========================================================================
    // Team & Seat Limits
    // ========================================================================

    /// <summary>
    /// Maximum number of team seats (users).
    /// </summary>
    public const string MaxSeats = "max_seats";

    // ========================================================================
    // Resource Limits
    // ========================================================================

    /// <summary>
    /// Maximum number of leads.
    /// </summary>
    public const string MaxLeads = "max_leads";

    /// <summary>
    /// Maximum number of messages per month.
    /// </summary>
    public const string MaxMessages = "max_messages";

    /// <summary>
    /// Maximum number of channels.
    /// </summary>
    public const string MaxChannels = "max_channels";

    /// <summary>
    /// Maximum number of CRM contacts.
    /// </summary>
    public const string MaxCrmContacts = "max_crm_contacts";

    /// <summary>
    /// Maximum number of phone numbers.
    /// </summary>
    public const string MaxPhoneNumbers = "max_phone_numbers";

    /// <summary>
    /// Maximum number of workflows.
    /// </summary>
    public const string MaxWorkflows = "max_workflows";

    /// <summary>
    /// Maximum storage in GB.
    /// </summary>
    public const string MaxStorageGb = "max_storage_gb";

    // ========================================================================
    // Special Values
    // ========================================================================

    /// <summary>
    /// Value indicating unlimited usage.
    /// </summary>
    public const string Unlimited = "unlimited";

    // ========================================================================
    // All Limit Keys (for validation)
    // ========================================================================

    /// <summary>
    /// Gets all defined limit keys for validation purposes.
    /// </summary>
    public static readonly string[] AllLimitKeys =
    [
        MaxAiInteractions,
        MaxAiVoiceAgents,
        MaxAiVoiceMinutes,
        MaxAiSms,
        MaxSeats,
        MaxLeads,
        MaxMessages,
        MaxChannels,
        MaxCrmContacts,
        MaxPhoneNumbers,
        MaxWorkflows,
        MaxStorageGb,
    ];
}

