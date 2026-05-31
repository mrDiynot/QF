// -----------------------------------------------------------------------
// <copyright file="OpenAIOptions.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Options;

/// <summary>
/// Centralized OpenAI configuration options bound from appsettings.
/// When new models emerge, update ONLY appsettings.json - no code changes needed.
/// </summary>
public sealed class OpenAIOptions
{
    /// <summary>
    /// Configuration section name in appsettings.json.
    /// </summary>
    public const string SectionName = "OpenAI";

    /// <summary>Gets or sets the OpenAI API key.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Gets or sets the model configuration.</summary>
    public OpenAIModelOptions Models { get; set; } = new();

    /// <summary>Gets or sets the token limits.</summary>
    public OpenAITokenLimits TokenLimits { get; set; } = new();

    /// <summary>Gets or sets the temperature settings.</summary>
    public OpenAITemperature Temperature { get; set; } = new();
}

/// <summary>
/// Model names configuration - change ONLY in appsettings.json when new models emerge.
/// </summary>
public sealed class OpenAIModelOptions
{
    /// <summary>Gets or sets the default model for general tasks.</summary>
    public string Default { get; set; } = "gpt-5-mini";

    /// <summary>Gets or sets the flagship model for complex/agentic tasks.</summary>
    public string Flagship { get; set; } = "gpt-5.2";

    /// <summary>Gets or sets the fast model for speed-critical tasks.</summary>
    public string Fast { get; set; } = "gpt-5-nano";

    /// <summary>Gets or sets the model for complex analysis.</summary>
    public string ComplexAnalysis { get; set; } = "gpt-5.2";

    /// <summary>Gets or sets the model for simple tasks.</summary>
    public string SimpleTask { get; set; } = "gpt-5-nano";

    /// <summary>Gets or sets the transcription model.</summary>
    public string Transcription { get; set; } = "whisper-1";

    /// <summary>Gets or sets the text-to-speech model.</summary>
    public string TextToSpeech { get; set; } = "tts-1";

    /// <summary>Gets or sets the HD text-to-speech model.</summary>
    public string TextToSpeechHd { get; set; } = "tts-1-hd";

    /// <summary>Gets or sets the embeddings model.</summary>
    public string Embeddings { get; set; } = "text-embedding-3-large";

    /// <summary>Gets or sets the small embeddings model.</summary>
    public string EmbeddingsSmall { get; set; } = "text-embedding-3-small";
}

/// <summary>
/// Token limit configuration.
/// </summary>
public sealed class OpenAITokenLimits
{
    /// <summary>Gets or sets the default token limit.</summary>
    public int Default { get; set; } = 16384;

    /// <summary>Gets or sets the complex task token limit.</summary>
    public int Complex { get; set; } = 128000;

    /// <summary>Gets or sets the simple task token limit.</summary>
    public int Simple { get; set; } = 4096;

    /// <summary>Gets or sets the flagship model token limit.</summary>
    public int Flagship { get; set; } = 128000;
}

/// <summary>
/// Temperature configuration for different task types.
/// </summary>
public sealed class OpenAITemperature
{
    /// <summary>Gets or sets the temperature for analytical tasks.</summary>
    public float Analytical { get; set; } = 0.2f;

    /// <summary>Gets or sets the temperature for creative tasks.</summary>
    public float Creative { get; set; } = 0.7f;

    /// <summary>Gets or sets the temperature for conversational tasks.</summary>
    public float Conversational { get; set; } = 0.5f;
}
