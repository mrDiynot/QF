// -----------------------------------------------------------------------
// <copyright file="AIModelConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Configuration for multi-model AI usage with cost optimization.
/// Uses latest OpenAI models: GPT-4o (flagship), GPT-4o-mini (default/fast).
/// All model names must match OpenAI's actual model identifiers.
/// See: https://platform.openai.com/docs/models.
/// </summary>
public sealed record AIModelConfiguration
{
    // ========================================
    // Text Generation Models (GPT-5 Family - Latest 2026)
    // ========================================

    /// <summary>Gets the flagship model for coding and agentic tasks (GPT-5.2).</summary>
    public string FlagshipModel { get; init; } = "gpt-5.2";

    /// <summary>Gets the default model for general tasks (GPT-5-mini for cost efficiency).</summary>
    public string DefaultModel { get; init; } = "gpt-5-mini";

    /// <summary>Gets the model for complex analysis tasks like BANT, qualification (GPT-5.2 for accuracy).</summary>
    public string ComplexAnalysisModel { get; init; } = "gpt-5.2";

    /// <summary>Gets the model for simple tasks like sentiment, quick responses (GPT-5-nano for speed/cost).</summary>
    public string SimpleTaskModel { get; init; } = "gpt-5-nano";

    /// <summary>Gets the fastest, most cost-effective model (GPT-5-nano).</summary>
    public string FastModel { get; init; } = "gpt-5-nano";

    // ========================================
    // Audio/Speech Models (Whisper + TTS)
    // ========================================

    /// <summary>Gets the model for speech-to-text transcription (Whisper).</summary>
    public string TranscriptionModel { get; init; } = "whisper-1";

    /// <summary>Gets the model for text-to-speech generation.</summary>
    public string TextToSpeechModel { get; init; } = "tts-1";

    /// <summary>Gets the high-quality TTS model for premium voice output.</summary>
    public string TextToSpeechHdModel { get; init; } = "tts-1-hd";

    // ========================================
    // Embedding Models
    // ========================================

    /// <summary>Gets the model for embeddings (text-embedding-3-large for best quality).</summary>
    public string EmbeddingsModel { get; init; } = "text-embedding-3-large";

    /// <summary>Gets the small embeddings model for cost-effective vector search.</summary>
    public string EmbeddingsSmallModel { get; init; } = "text-embedding-3-small";

    // ========================================
    // Token Limits
    // ========================================

    /// <summary>Gets the maximum tokens for default model.</summary>
    public int DefaultMaxTokens { get; init; } = 16384;

    /// <summary>Gets the maximum tokens for complex analysis.</summary>
    public int ComplexMaxTokens { get; init; } = 32768;

    /// <summary>Gets the maximum tokens for simple tasks.</summary>
    public int SimpleMaxTokens { get; init; } = 4096;

    /// <summary>Gets the maximum tokens for flagship model.</summary>
    public int FlagshipMaxTokens { get; init; } = 32768;

    // ========================================
    // Temperature Settings
    // ========================================

    /// <summary>Gets the temperature for analytical tasks (lower = more deterministic).</summary>
    public float AnalyticalTemperature { get; init; } = 0.2f;

    /// <summary>Gets the temperature for creative tasks (higher = more creative).</summary>
    public float CreativeTemperature { get; init; } = 0.7f;

    /// <summary>Gets the temperature for conversational tasks.</summary>
    public float ConversationalTemperature { get; init; } = 0.5f;

    // ========================================
    // Feature Flags
    // ========================================

    /// <summary>Gets a value indicating whether to use flagship model for complex tasks.</summary>
    public bool UseFlagshipForComplexTasks { get; init; } = true;

    /// <summary>Gets a value indicating whether voice transcription is enabled.</summary>
    public bool VoiceTranscriptionEnabled { get; init; } = true;

    /// <summary>Gets a value indicating whether text-to-speech is enabled.</summary>
    public bool TextToSpeechEnabled { get; init; } = true;
}
