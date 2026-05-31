namespace QualiFlow.Domain.Enums;

/// <summary>
/// Enum representing the available channel types for omnichannel communication.
/// </summary>
public enum ChannelType
{
    /// <summary>
    /// None or undefined channel type.
    /// </summary>
    None = 0,

    /// <summary>
    /// SMS text messaging channel (via Twilio).
    /// </summary>
    SMS = 1,

    /// <summary>
    /// Voice call channel (via Twilio).
    /// </summary>
    Voice = 2,

    /// <summary>
    /// WhatsApp messaging channel (via Twilio/Meta).
    /// </summary>
    WhatsApp = 3,

    /// <summary>
    /// Instagram Direct messaging channel (via Meta).
    /// </summary>
    Instagram = 4,

    /// <summary>
    /// Facebook Messenger channel (via Meta).
    /// </summary>
    Facebook = 5,

    /// <summary>
    /// Chat widget for website integration.
    /// </summary>
    ChatWidget = 6,

    /// <summary>
    /// Web form for lead capture (includes QR code feature for offline-to-online capture).
    /// </summary>
    WebForm = 7,

    /// <summary>
    /// Email communication channel.
    /// </summary>
    Email = 8,

    /// <summary>
    /// Social messaging (Instagram + Facebook Messenger combined).
    /// </summary>
    SocialMessaging = 9
}
