// -----------------------------------------------------------------------
// <copyright file="FeatureConstants.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Constants;

/// <summary>
/// Constants for feature keys used in the features table.
/// These keys are seeded during database migration and used for feature gating.
/// IMPORTANT: These values MUST match the database seed data exactly.
/// </summary>
public static class FeatureConstants
{
    // ========================================================================
    // Channel Features
    // ========================================================================

    /// <summary>
    /// AI-powered email conversations.
    /// </summary>
    public const string AiEmail = "ai_email";

    /// <summary>
    /// AI-powered voice conversations.
    /// </summary>
    public const string AiVoice = "ai_voice";

    /// <summary>
    /// AI-powered SMS conversations.
    /// </summary>
    public const string AiSms = "ai_sms";

    /// <summary>
    /// Website chat widget.
    /// </summary>
    public const string Webchat = "webchat";

    /// <summary>
    /// Instagram DM integration.
    /// </summary>
    public const string Instagram = "instagram";

    /// <summary>
    /// Facebook Messenger integration.
    /// </summary>
    public const string Facebook = "facebook";

    /// <summary>
    /// WhatsApp Business integration.
    /// </summary>
    public const string WhatsApp = "whatsapp";

    // ========================================================================
    // Premium Features
    // ========================================================================

    /// <summary>
    /// Custom branding and white-labeling.
    /// </summary>
    public const string CustomBranding = "custom_branding";

    /// <summary>
    /// API access for integrations.
    /// </summary>
    public const string ApiAccess = "api_access";

    /// <summary>
    /// Dedicated customer support.
    /// </summary>
    public const string DedicatedSupport = "dedicated_support";

    // ========================================================================
    // All Feature Keys (for validation)
    // ========================================================================

    /// <summary>
    /// Gets all defined feature keys for validation purposes.
    /// </summary>
    public static readonly string[] AllFeatureKeys =
    [
        AiEmail,
        AiVoice,
        AiSms,
        Webchat,
        Instagram,
        Facebook,
        WhatsApp,
        CustomBranding,
        ApiAccess,
        DedicatedSupport
    ];
}

