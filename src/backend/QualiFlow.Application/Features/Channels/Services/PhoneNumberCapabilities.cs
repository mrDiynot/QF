namespace QualiFlow.Application.Features.Channels.Services;

/// <summary>
/// Phone number capabilities flags.
/// </summary>
[Flags]
public enum PhoneNumberCapabilities
{
    /// <summary>
    /// No capabilities.
    /// </summary>
    None = 0,

    /// <summary>
    /// Voice calling capability.
    /// </summary>
    Voice = 1,

    /// <summary>
    /// SMS messaging capability.
    /// </summary>
    SMS = 2,

    /// <summary>
    /// MMS messaging capability.
    /// </summary>
    MMS = 4,

    /// <summary>
    /// All capabilities (Voice + SMS + MMS).
    /// </summary>
    All = Voice | SMS | MMS,
}
