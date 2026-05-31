// -----------------------------------------------------------------------
// <copyright file="SimulatorController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Features.InboundMessages.DTOs;
using QualiFlow.Application.Features.InboundMessages.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for simulator endpoints that trigger real AI orchestration pipelines.
/// Allows the simulator portal to test real-world functionality end-to-end.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class SimulatorController : ControllerBase
{
    private readonly IInboundMessageService _inboundMessageService;
    private readonly IAIConversationService _aiConversationService;
    private readonly IOpenAIService _openAIService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<SimulatorController> _logger;

    public SimulatorController(
        IInboundMessageService inboundMessageService,
        IAIConversationService aiConversationService,
        IOpenAIService openAIService,
        ICurrentUserService currentUserService,
        IBackgroundJobService backgroundJobService,
        ILogger<SimulatorController> logger)
    {
        _inboundMessageService = inboundMessageService;
        _aiConversationService = aiConversationService;
        _openAIService = openAIService;
        _currentUserService = currentUserService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    /// <summary>
    /// Simulates an inbound SMS message, triggering the full AI orchestration pipeline.
    /// </summary>
    /// <param name="request">The simulated SMS message details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of processing the simulated message.</returns>
    [HttpPost("simulate-sms")]
    [ProducesResponseType(typeof(SimulationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SimulationResult>> SimulateSms(
        [FromBody] SimulateSmsRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Simulating SMS from {From} to {To}: {Message}",
            request.FromPhone,
            request.ToPhone,
            request.Message);

        var payload = new TwilioSmsWebhookPayload
        {
            From = request.FromPhone,
            To = request.ToPhone,
            Body = request.Message,
            MessageSid = $"SIM{Guid.NewGuid():N}",
            AccountSid = "SIMULATOR",
            NumMedia = 0,
        };

        var result = await _inboundMessageService.ProcessInboundSmsAsync(payload, cancellationToken);

        return Ok(new SimulationResult
        {
            Success = result.Success,
            Channel = "SMS",
            LeadId = result.LeadId,
            ConversationId = result.ConversationId,
            MessageId = result.MessageId,
            IsNewLead = result.IsNewLead,
            IsNewConversation = result.IsNewConversation,
            AiJobsEnqueued = new[] { "AI Qualification", "AI Auto-Response" },
            Message = result.Success
                ? "SMS processed successfully. AI jobs enqueued for background processing."
                : result.ErrorMessage,
        });
    }

    /// <summary>
    /// Simulates an inbound WhatsApp message, triggering the full AI orchestration pipeline.
    /// </summary>
    /// <param name="request">The simulated WhatsApp message details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of processing the simulated message.</returns>
    [HttpPost("simulate-whatsapp")]
    [ProducesResponseType(typeof(SimulationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SimulationResult>> SimulateWhatsApp(
        [FromBody] SimulateWhatsAppRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Simulating WhatsApp from {From} to {To}: {Message}",
            request.FromPhone,
            request.ToPhone,
            request.Message);

        var payload = new TwilioWhatsAppWebhookPayload
        {
            From = $"whatsapp:{request.FromPhone}",
            To = $"whatsapp:{request.ToPhone}",
            Body = request.Message,
            MessageSid = $"WA{Guid.NewGuid():N}",
            AccountSid = "SIMULATOR",
            ProfileName = request.ProfileName ?? "Simulated User",
            NumMedia = 0,
        };

        var result = await _inboundMessageService.ProcessInboundWhatsAppAsync(payload, cancellationToken);

        return Ok(new SimulationResult
        {
            Success = result.Success,
            Channel = "WhatsApp",
            LeadId = result.LeadId,
            ConversationId = result.ConversationId,
            MessageId = result.MessageId,
            IsNewLead = result.IsNewLead,
            IsNewConversation = result.IsNewConversation,
            AiJobsEnqueued = new[] { "AI Qualification", "AI Auto-Response" },
            Message = result.Success
                ? "WhatsApp message processed successfully. AI jobs enqueued."
                : result.ErrorMessage,
        });
    }

    /// <summary>
    /// Triggers AI analysis on a message without going through channel webhooks.
    /// Useful for testing AI capabilities directly.
    /// </summary>
    /// <param name="request">The message to analyze.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The AI analysis result.</returns>
    [HttpPost("analyze-message")]
    [ProducesResponseType(typeof(AIAnalysisResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AIAnalysisResult>> AnalyzeMessage(
        [FromBody] AnalyzeMessageRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Analyzing message via simulator: {Message}", request.Message);

        var startTime = DateTime.UtcNow;

        // Run all AI analyses in parallel
        var intentTask = _openAIService.DetectIntentAsync(request.Message, null, cancellationToken);
        var sentimentTask = _openAIService.AnalyzeSentimentAsync(request.Message, cancellationToken);

        await Task.WhenAll(intentTask, sentimentTask);

        var intent = await intentTask;
        var sentiment = await sentimentTask;

        var processingTime = DateTime.UtcNow - startTime;

        return Ok(new AIAnalysisResult
        {
            Message = request.Message,
            Intent = new IntentResult
            {
                PrimaryIntent = intent.PrimaryIntent,
                Confidence = intent.Confidence,
            },
            Sentiment = new SentimentResult
            {
                Sentiment = sentiment.Sentiment.ToString(),
                Score = sentiment.Score,
                Confidence = sentiment.Confidence,
            },
            ProcessingTimeMs = (int)processingTime.TotalMilliseconds,
            AnalyzedAt = DateTime.UtcNow,
            Model = "gpt-4o-mini",
        });
    }

    /// <summary>
    /// Simulates an inbound voice call with transcription, triggering the full AI orchestration pipeline.
    /// </summary>
    /// <param name="request">The simulated voice call details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of processing the simulated call.</returns>
    [HttpPost("simulate-voice")]
    [ProducesResponseType(typeof(SimulationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SimulationResult>> SimulateVoice(
        [FromBody] SimulateVoiceRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Simulating Voice call from {From} to {To} with transcription: {Transcription}",
            request.FromPhone,
            request.ToPhone,
            request.Transcription.Substring(0, Math.Min(50, request.Transcription.Length)));

        // Create a simulated SMS-like payload since voice calls create similar leads
        var payload = new TwilioSmsWebhookPayload
        {
            From = request.FromPhone,
            To = request.ToPhone,
            Body = $"[Voice Call Transcription] {request.Transcription}",
            MessageSid = $"VOICE{Guid.NewGuid():N}",
            AccountSid = "SIMULATOR",
            NumMedia = 0,
        };

        var result = await _inboundMessageService.ProcessInboundSmsAsync(payload, cancellationToken);

        return Ok(new SimulationResult
        {
            Success = result.Success,
            Channel = "Voice",
            LeadId = result.LeadId,
            ConversationId = result.ConversationId,
            MessageId = result.MessageId,
            IsNewLead = result.IsNewLead,
            IsNewConversation = result.IsNewConversation,
            AiJobsEnqueued = new[] { "AI Qualification", "AI Auto-Response", "Voice Transcription Analysis" },
            Message = result.Success
                ? "Voice call simulated successfully. AI jobs enqueued for processing."
                : result.ErrorMessage,
        });
    }

    /// <summary>
    /// Simulates a form submission, triggering the full AI orchestration pipeline.
    /// </summary>
    /// <param name="request">The simulated form submission details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of processing the simulated form.</returns>
    [HttpPost("simulate-form")]
    [ProducesResponseType(typeof(SimulationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SimulationResult>> SimulateForm(
        [FromBody] SimulateFormRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Simulating form submission from {Name} ({Email})",
            request.Name,
            request.Email);

        var businessId = _currentUserService.TryGetBusinessId()
            ?? throw new UnauthorizedAccessException("Business ID not found");

        // Create a simulated lead for the form submission
        var leadId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();

        // Enqueue AI jobs directly (simulating form submission flow)
        _backgroundJobService.Enqueue<IAiQualificationJobService>(
            service => service.ProcessAiQualificationAsync(businessId, leadId, submissionId));

        _backgroundJobService.Enqueue<Application.Features.AI.Interfaces.IAIAutoResponseJobService>(
            service => service.ProcessAiAutoResponseAsync(businessId, leadId, submissionId, "Form"));

        return Ok(new SimulationResult
        {
            Success = true,
            Channel = "Form",
            LeadId = leadId,
            MessageId = submissionId,
            IsNewLead = true,
            AiJobsEnqueued = new[] { "AI Qualification", "AI Auto-Response (Form Follow-up)" },
            Message = "Form submission simulated. AI jobs enqueued for qualification and follow-up.",
        });
    }

    /// <summary>
    /// Gets the current AI orchestration status and configuration.
    /// </summary>
    /// <returns>The AI orchestration status.</returns>
    [HttpGet("ai-status")]
    [ProducesResponseType(typeof(AIOrchestrationStatus), StatusCodes.Status200OK)]
    public ActionResult<AIOrchestrationStatus> GetAIStatus()
    {
        return Ok(new AIOrchestrationStatus
        {
            IsActive = true,
            DefaultModel = "gpt-4o-mini",
            FlagshipModel = "gpt-4o",
            FastModel = "gpt-4o-mini",
            SupportedChannels = new[] { "SMS", "WhatsApp", "Voice", "WebChat", "Instagram", "Facebook", "Email" },
            AiCapabilities = new[]
            {
                "Lead Qualification (BANT)",
                "Intent Detection",
                "Sentiment Analysis",
                "Auto-Response Generation",
                "Information Extraction",
                "Conversation Stage Classification",
                "Buying Signal Detection",
            },
            OrchestrationFlow = new[]
            {
                "1. Inbound message received via webhook",
                "2. Lead created/updated",
                "3. Conversation created/updated",
                "4. Message stored",
                "5. AI Qualification job enqueued (Hangfire)",
                "6. AI Auto-Response job enqueued (Hangfire critical queue)",
                "7. SignalR broadcast to business users",
            },
        });
    }
}

// ============================================================================
// DTOs
// ============================================================================

/// <summary>Request to simulate an SMS message.</summary>
public record SimulateSmsRequest
{
    /// <summary>Gets the sender phone number (e.g., +1234567890).</summary>
    public required string FromPhone { get; init; }

    /// <summary>Gets the recipient phone number (must match a configured channel).</summary>
    public required string ToPhone { get; init; }

    /// <summary>Gets the message content.</summary>
    public required string Message { get; init; }
}

/// <summary>Request to simulate a WhatsApp message.</summary>
public record SimulateWhatsAppRequest
{
    /// <summary>Gets the sender phone number.</summary>
    public required string FromPhone { get; init; }

    /// <summary>Gets the recipient phone number.</summary>
    public required string ToPhone { get; init; }

    /// <summary>Gets the message content.</summary>
    public required string Message { get; init; }

    /// <summary>Gets the optional profile name.</summary>
    public string? ProfileName { get; init; }
}

/// <summary>Request to simulate a voice call with transcription.</summary>
public record SimulateVoiceRequest
{
    /// <summary>Gets the caller phone number.</summary>
    public required string FromPhone { get; init; }

    /// <summary>Gets the recipient phone number.</summary>
    public required string ToPhone { get; init; }

    /// <summary>Gets the voice call transcription.</summary>
    public required string Transcription { get; init; }

    /// <summary>Gets the optional call duration in seconds.</summary>
    public int? DurationSeconds { get; init; }
}

/// <summary>Request to analyze a message with AI.</summary>
public record AnalyzeMessageRequest
{
    /// <summary>Gets the message to analyze.</summary>
    public required string Message { get; init; }
}

/// <summary>Request to simulate a form submission.</summary>
public record SimulateFormRequest
{
    /// <summary>Gets the submitter name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the submitter email.</summary>
    public required string Email { get; init; }

    /// <summary>Gets the optional phone number.</summary>
    public string? Phone { get; init; }

    /// <summary>Gets the optional message/inquiry.</summary>
    public string? Message { get; init; }

    /// <summary>Gets optional custom form data.</summary>
    public IDictionary<string, string>? CustomFields { get; init; }
}

/// <summary>Result of a simulation.</summary>
public record SimulationResult
{
    /// <summary>Gets a value indicating whether the simulation succeeded.</summary>
    public bool Success { get; init; }

    /// <summary>Gets the channel used.</summary>
    public required string Channel { get; init; }

    /// <summary>Gets the lead ID.</summary>
    public Guid? LeadId { get; init; }

    /// <summary>Gets the conversation ID.</summary>
    public Guid? ConversationId { get; init; }

    /// <summary>Gets the message ID.</summary>
    public Guid? MessageId { get; init; }

    /// <summary>Gets a value indicating whether a new lead was created.</summary>
    public bool IsNewLead { get; init; }

    /// <summary>Gets a value indicating whether a new conversation was created.</summary>
    public bool IsNewConversation { get; init; }

    /// <summary>Gets the AI jobs that were enqueued.</summary>
    public IReadOnlyList<string>? AiJobsEnqueued { get; init; }

    /// <summary>Gets the result message.</summary>
    public string? Message { get; init; }
}

/// <summary>Result of AI analysis.</summary>
public record AIAnalysisResult
{
    /// <summary>Gets the analyzed message.</summary>
    public required string Message { get; init; }

    /// <summary>Gets the intent detection result.</summary>
    public required IntentResult Intent { get; init; }

    /// <summary>Gets the sentiment analysis result.</summary>
    public required SentimentResult Sentiment { get; init; }

    /// <summary>Gets the processing time in milliseconds.</summary>
    public int ProcessingTimeMs { get; init; }

    /// <summary>Gets when the analysis was performed.</summary>
    public DateTime AnalyzedAt { get; init; }

    /// <summary>Gets the model used.</summary>
    public required string Model { get; init; }
}

/// <summary>Intent detection result.</summary>
public record IntentResult
{
    /// <summary>Gets the primary intent.</summary>
    public required string PrimaryIntent { get; init; }

    /// <summary>Gets the confidence score.</summary>
    public double Confidence { get; init; }
}

/// <summary>Sentiment analysis result.</summary>
public record SentimentResult
{
    /// <summary>Gets the sentiment.</summary>
    public required string Sentiment { get; init; }

    /// <summary>Gets the sentiment score.</summary>
    public double Score { get; init; }

    /// <summary>Gets the confidence.</summary>
    public double Confidence { get; init; }
}

/// <summary>AI orchestration status.</summary>
public record AIOrchestrationStatus
{
    /// <summary>Gets a value indicating whether AI is active.</summary>
    public bool IsActive { get; init; }

    /// <summary>Gets the default model.</summary>
    public required string DefaultModel { get; init; }

    /// <summary>Gets the flagship model.</summary>
    public required string FlagshipModel { get; init; }

    /// <summary>Gets the fast model.</summary>
    public required string FastModel { get; init; }

    /// <summary>Gets the supported channels.</summary>
    public IReadOnlyList<string>? SupportedChannels { get; init; }

    /// <summary>Gets the AI capabilities.</summary>
    public IReadOnlyList<string>? AiCapabilities { get; init; }

    /// <summary>Gets the orchestration flow steps.</summary>
    public IReadOnlyList<string>? OrchestrationFlow { get; init; }
}
