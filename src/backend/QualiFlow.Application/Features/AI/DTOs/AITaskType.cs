// -----------------------------------------------------------------------
// <copyright file="AITaskType.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Enum representing the type of AI task for model selection.
/// </summary>
public enum AITaskType
{
    /// <summary>Default/general tasks (GPT-5 mini).</summary>
    Default,

    /// <summary>Complex analysis like BANT extraction, lead qualification (GPT-5.2).</summary>
    ComplexAnalysis,

    /// <summary>Simple tasks like sentiment detection, quick categorization (GPT-5 nano).</summary>
    SimpleTask,

    /// <summary>Auto-response generation (GPT-5 mini).</summary>
    AutoResponse,

    /// <summary>Intent detection (GPT-5 nano for speed).</summary>
    IntentDetection,

    /// <summary>Information extraction (GPT-5.2 for accuracy).</summary>
    InformationExtraction,

    /// <summary>Voice transcription using Whisper.</summary>
    VoiceTranscription,

    /// <summary>Text-to-speech generation.</summary>
    TextToSpeech,

    /// <summary>High-quality text-to-speech generation.</summary>
    TextToSpeechHd,

    /// <summary>Coding and agentic tasks (GPT-5.2 flagship).</summary>
    CodingAndAgentic,

    /// <summary>Embedding generation for vector search.</summary>
    Embedding,

    // ========================================
    // AI Enhancement Features (Sprint 38+)
    // ========================================

    /// <summary>AI Form generation from natural language (GPT-5.2 for complex structure).</summary>
    FormGeneration,

    /// <summary>SMS template generation (GPT-5 mini for balanced cost/quality).</summary>
    SmsTemplateGeneration,

    /// <summary>Business insights generation from analytics data (GPT-5.2 for complex analysis).</summary>
    InsightsGeneration,

    /// <summary>Knowledge base article generation (GPT-5 mini for content creation).</summary>
    KnowledgeGeneration,

    /// <summary>Workflow definition generation from natural language (GPT-5.2 for complex logic).</summary>
    WorkflowGeneration,

    /// <summary>Report generation from business data (GPT-5.2 for comprehensive analysis).</summary>
    ReportGeneration,

    /// <summary>CRM data enrichment from conversations (GPT-5 mini for entity extraction).</summary>
    CrmEnrichment,

    /// <summary>Quick reply suggestions during conversations (GPT-5 nano for speed).</summary>
    QuickReplyGeneration,

    /// <summary>Onboarding recommendations based on industry (GPT-5 nano for fast recommendations).</summary>
    OnboardingRecommendation,
}
