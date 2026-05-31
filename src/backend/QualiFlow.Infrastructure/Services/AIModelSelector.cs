// -----------------------------------------------------------------------
// <copyright file="AIModelSelector.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for selecting the optimal AI model based on task type and cost optimization.
/// </summary>
public sealed partial class AIModelSelector : IAIModelSelector
{
    private static readonly AIModelConfiguration DefaultConfig = new();

    // Approximate costs per 1K tokens (as of 2026)
    // See: https://platform.openai.com/docs/models
    private static readonly Dictionary<string, ModelCost> ModelCosts = new()
    {
        // GPT-5 family (latest flagship models - 2026)
        ["gpt-5.2"] = new(0.005m, 0.015m),        // Flagship - best for coding/agentic tasks
        ["gpt-5-mini"] = new(0.0003m, 0.0012m),   // Balanced cost/performance
        ["gpt-5-nano"] = new(0.0001m, 0.0004m),   // Fastest, most cost-effective

        // Audio/Speech models (per minute for Whisper, per 1M chars for TTS)
        ["whisper-1"] = new(0.006m, 0m),          // $0.006/minute
        ["tts-1"] = new(0.015m, 0m),              // $15/1M characters
        ["tts-1-hd"] = new(0.030m, 0m),           // $30/1M characters (HD quality)

        // Embedding models
        ["text-embedding-3-small"] = new(0.00002m, 0m),
        ["text-embedding-3-large"] = new(0.00013m, 0m),
    };

    private readonly ILogger<AIModelSelector> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIModelSelector"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    public AIModelSelector(ILogger<AIModelSelector> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public AIModelSelection SelectModel(AITaskType taskType, Guid? businessId = null)
    {
        var config = GetConfiguration(businessId);

        return taskType switch
        {
            // Complex tasks use GPT-5.2 (flagship)
            AITaskType.ComplexAnalysis => CreateSelection(
                config.ComplexAnalysisModel,
                config.ComplexMaxTokens,
                config.AnalyticalTemperature),

            AITaskType.InformationExtraction => CreateSelection(
                config.ComplexAnalysisModel,
                config.ComplexMaxTokens,
                config.AnalyticalTemperature),

            AITaskType.CodingAndAgentic => CreateSelection(
                config.FlagshipModel,
                config.FlagshipMaxTokens,
                config.AnalyticalTemperature),

            // Simple/fast tasks use GPT-5 nano
            AITaskType.SimpleTask => CreateSelection(
                config.SimpleTaskModel,
                config.SimpleMaxTokens,
                config.AnalyticalTemperature),

            AITaskType.IntentDetection => CreateSelection(
                config.FastModel,
                config.SimpleMaxTokens,
                config.AnalyticalTemperature),

            // Conversational tasks use GPT-5 mini
            AITaskType.AutoResponse => CreateSelection(
                config.DefaultModel,
                config.DefaultMaxTokens,
                config.ConversationalTemperature),

            // Audio/Speech models
            AITaskType.VoiceTranscription => CreateSelection(
                config.TranscriptionModel,
                0, // Whisper doesn't use token limits
                0f),

            AITaskType.TextToSpeech => CreateSelection(
                config.TextToSpeechModel,
                0,
                0f),

            AITaskType.TextToSpeechHd => CreateSelection(
                config.TextToSpeechHdModel,
                0,
                0f),

            // Embeddings
            AITaskType.Embedding => CreateSelection(
                config.EmbeddingsModel,
                0,
                0f),

            // ========================================
            // AI Enhancement Features (Sprint 38+)
            // ========================================

            // Complex generation tasks use GPT-5.2 (flagship)
            AITaskType.FormGeneration => CreateSelection(
                config.ComplexAnalysisModel,
                config.ComplexMaxTokens,
                config.AnalyticalTemperature),

            AITaskType.WorkflowGeneration => CreateSelection(
                config.ComplexAnalysisModel,
                config.ComplexMaxTokens,
                config.AnalyticalTemperature),

            AITaskType.InsightsGeneration => CreateSelection(
                config.ComplexAnalysisModel,
                config.ComplexMaxTokens,
                config.AnalyticalTemperature),

            AITaskType.ReportGeneration => CreateSelection(
                config.ComplexAnalysisModel,
                config.ComplexMaxTokens,
                config.AnalyticalTemperature),

            // Balanced tasks use GPT-5 mini
            AITaskType.SmsTemplateGeneration => CreateSelection(
                config.DefaultModel,
                config.DefaultMaxTokens,
                config.ConversationalTemperature),

            AITaskType.KnowledgeGeneration => CreateSelection(
                config.DefaultModel,
                config.DefaultMaxTokens,
                config.ConversationalTemperature),

            AITaskType.CrmEnrichment => CreateSelection(
                config.DefaultModel,
                config.DefaultMaxTokens,
                config.AnalyticalTemperature),

            // Fast/simple tasks use GPT-5 nano
            AITaskType.QuickReplyGeneration => CreateSelection(
                config.FastModel,
                config.SimpleMaxTokens,
                config.ConversationalTemperature),

            AITaskType.OnboardingRecommendation => CreateSelection(
                config.FastModel,
                config.SimpleMaxTokens,
                config.AnalyticalTemperature),

            // Default to GPT-5 mini
            _ => CreateSelection(
                config.DefaultModel,
                config.DefaultMaxTokens,
                config.ConversationalTemperature),
        };
    }

    /// <inheritdoc />
    public AIModelConfiguration GetConfiguration(Guid? businessId = null)
    {
        // Business-specific configuration can be loaded from BusinessScoringConfiguration
        // For now, return the default configuration
        return DefaultConfig;
    }

    /// <inheritdoc />
    public decimal EstimateCost(string prompt, AITaskType taskType, int estimatedOutputTokens = 500)
    {
        var selection = SelectModel(taskType);

        // Approximate token count (rough estimate: 4 chars per token)
        var inputTokens = prompt.Length / 4;

        if (!ModelCosts.TryGetValue(selection.Model, out var costs))
        {
            costs = ModelCosts["gpt-5-mini"]; // Fallback to default model costs
        }

        var inputCost = (inputTokens / 1000m) * costs.InputPer1K;
        var outputCost = (estimatedOutputTokens / 1000m) * costs.OutputPer1K;

        var totalCost = inputCost + outputCost;

        LogCostEstimate(selection.Model, inputTokens, estimatedOutputTokens, totalCost);

        return totalCost;
    }

    private static AIModelSelection CreateSelection(string model, int maxTokens, float temperature)
    {
        var costs = ModelCosts.TryGetValue(model, out var c) ? c : new ModelCost(0.001m, 0.002m);

        return new AIModelSelection
        {
            Model = model,
            MaxTokens = maxTokens,
            Temperature = temperature,
            EstimatedInputCostPer1K = costs.InputPer1K,
            EstimatedOutputCostPer1K = costs.OutputPer1K,
        };
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "Cost estimate for model {Model}: {InputTokens} input tokens, {OutputTokens} output tokens = ${TotalCost:F6}")]
    private partial void LogCostEstimate(string model, int inputTokens, int outputTokens, decimal totalCost);

    private sealed record ModelCost(decimal InputPer1K, decimal OutputPer1K);
}
