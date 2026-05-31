// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Application.Features.InboundMessages.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.ChatWidgets.Services;

/// <summary>
/// Service for chat session operations.
/// </summary>
public partial class ChatSessionService : IChatSessionService
{
    private readonly IChatSessionRepository _sessionRepository;
    private readonly IChatMessageRepository _messageRepository;
    private readonly IChatWidgetRepository _widgetRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly Microsoft.Extensions.DependencyInjection.IServiceScopeFactory _serviceScopeFactory;
    private readonly IOpenAIService _openAIService;
    private readonly IFaqSearchService _faqSearchService;
    private readonly IConversationMemoryService _conversationMemoryService;
    private readonly IKnowledgeBaseService _knowledgeBaseService;
    private readonly IContentModerationService _contentModerationService;
    private readonly IPiiProtectionService _piiProtectionService;
    private readonly ILogger<ChatSessionService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ChatSessionService"/> class.
    /// </summary>
    public ChatSessionService(
        IChatSessionRepository sessionRepository,
        IChatMessageRepository messageRepository,
        IChatWidgetRepository widgetRepository,
        ILeadRepository leadRepository,
        IBackgroundJobService backgroundJobService,
        Microsoft.Extensions.DependencyInjection.IServiceScopeFactory serviceScopeFactory,
        IOpenAIService openAIService,
        IFaqSearchService faqSearchService,
        IConversationMemoryService conversationMemoryService,
        IKnowledgeBaseService knowledgeBaseService,
        IContentModerationService contentModerationService,
        IPiiProtectionService piiProtectionService,
        ILogger<ChatSessionService> logger)
    {
        _sessionRepository = sessionRepository;
        _messageRepository = messageRepository;
        _widgetRepository = widgetRepository;
        _leadRepository = leadRepository;
        _backgroundJobService = backgroundJobService;
        _serviceScopeFactory = serviceScopeFactory;
        _openAIService = openAIService;
        _faqSearchService = faqSearchService;
        _conversationMemoryService = conversationMemoryService;
        _knowledgeBaseService = knowledgeBaseService;
        _contentModerationService = contentModerationService;
        _piiProtectionService = piiProtectionService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<StartChatSessionResponse?> StartSessionAsync(
        StartChatSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        var widget = await _widgetRepository.GetByWidgetKeyAsync(request.WidgetKey, cancellationToken);
        if (widget == null || !widget.IsActive)
        {
            LogWidgetNotFound(_logger, request.WidgetKey);
            return null;
        }

        var sessionToken = GenerateSessionToken();

        // Create or find lead from visitor information
        var lead = await FindOrCreateLeadFromVisitorAsync(
            widget.BusinessId,
            request.VisitorName,
            request.VisitorEmail,
            request.VisitorPhone,
            request.PageUrl,
            cancellationToken);

        var session = new ChatSession
        {
            BusinessId = widget.BusinessId,
            ChatWidgetId = widget.Id,
            SessionToken = sessionToken,
            VisitorName = request.VisitorName,
            VisitorEmail = request.VisitorEmail,
            VisitorPhone = request.VisitorPhone,
            PageUrl = request.PageUrl,
            ReferrerUrl = request.ReferrerUrl,
            Status = ChatSessionStatus.Active,
            StartedAt = DateTime.UtcNow,
            LastActivityAt = DateTime.UtcNow,
            LeadId = lead?.Id, // Link session to lead
        };

        await _sessionRepository.AddAsync(session, cancellationToken);
        LogSessionStarted(_logger, session.Id, widget.Id);

        if (lead != null)
        {
            LogLeadLinkedToSession(_logger, lead.Id, session.Id);
        }

        return new StartChatSessionResponse
        {
            SessionId = session.Id,
            SessionToken = sessionToken,
            GreetingMessage = widget.GreetingMessage,
            EnableAIResponses = widget.EnableAIResponse,
        };
    }

    /// <inheritdoc />
    public async Task<ChatMessageDto?> SendMessageAsync(
        SendChatMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetBySessionTokenAsync(request.SessionToken, cancellationToken);
        if (session == null || session.Status == ChatSessionStatus.ClosedByVisitor || session.Status == ChatSessionStatus.ClosedByAgent)
        {
            return null;
        }

        var message = new ChatMessage
        {
            BusinessId = session.BusinessId,
            ChatSessionId = session.Id,
            Content = request.Content,
            Type = ChatMessageType.Visitor,
            SenderId = session.SessionToken,
            SenderName = session.VisitorName ?? "Visitor",
            SentAt = DateTime.UtcNow,
            AttachmentsJson = request.AttachmentUrls != null
                ? JsonSerializer.Serialize(request.AttachmentUrls)
                : null,
        };

        await _messageRepository.AddAsync(message, cancellationToken);

        // Update session activity
        session.LastActivityAt = DateTime.UtcNow;
        await _sessionRepository.UpdateAsync(session, cancellationToken);

        LogMessageSent(_logger, message.Id, session.Id);

        // Enqueue AI qualification job if session has a linked lead
        if (session.LeadId.HasValue)
        {
            _backgroundJobService.Enqueue<IAiQualificationJobService>(
                service => service.ProcessAiQualificationAsync(
                    session.BusinessId, session.LeadId.Value, message.Id));
            LogAiQualificationEnqueued(_logger, session.LeadId.Value, message.Id);
        }
        else
        {
            LogNoLeadForQualification(_logger, session.Id);
        }

        // Process AI auto-response synchronously for web chat (for real-time UX)
        // Background jobs are used for SMS/WhatsApp where delays are acceptable
        var widget = await _widgetRepository.GetByIdAsync(session.BusinessId, session.ChatWidgetId, cancellationToken);
        if (widget?.EnableAIResponse == true)
        {
            // Fire and forget - process in background without blocking the response
            // Create new scope to avoid DbContext disposal issues
            _ = Task.Run(
                async () =>
                {
                    try
                    {
                        using var scope = _serviceScopeFactory.CreateScope();
                        var aiAutoResponseService = scope.ServiceProvider.GetRequiredService<QualiFlow.Application.Features.AI.Interfaces.IAIAutoResponseJobService>();

                        _logger.LogInformation("Starting AI auto-response processing for session {SessionId}, message {MessageId}", session.Id, message.Id);
                        await aiAutoResponseService.ProcessAiAutoResponseAsync(
                            session.BusinessId, session.Id, message.Id, "WebChat");
                        _logger.LogInformation("Completed AI auto-response processing for session {SessionId}", session.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process AI auto-response for session {SessionId}", session.Id);
                    }
                },
                CancellationToken.None);
            LogAiAutoResponseEnqueued(_logger, session.Id, message.Id);
        }

        return MapToMessageDto(message);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatMessageDto>?> GetMessagesAsync(
        string sessionToken,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetBySessionTokenAsync(sessionToken, cancellationToken);
        if (session == null)
        {
            return null;
        }

        var messages = await _messageRepository.GetBySessionIdAsync(session.BusinessId, session.Id, skip, take, cancellationToken);
        return messages.Select(MapToMessageDto).ToList();
    }

    /// <inheritdoc />
    public async Task<bool> EndSessionAsync(
        EndChatSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetBySessionTokenAsync(request.SessionToken, cancellationToken);
        if (session == null)
        {
            return false;
        }

        session.Status = ChatSessionStatus.ClosedByVisitor;
        session.EndedAt = DateTime.UtcNow;
        await _sessionRepository.UpdateAsync(session, cancellationToken);
        LogSessionEnded(_logger, session.Id, request.Reason);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> TransferToAgentAsync(
        Guid businessId,
        TransferToAgentRequest request,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetByIdAsync(businessId, request.SessionId, cancellationToken);
        if (session == null)
        {
            return false;
        }

        session.Status = ChatSessionStatus.WaitingForAgent;
        session.AssignedAgentId = request.AgentId?.ToString();
        session.LastActivityAt = DateTime.UtcNow;
        await _sessionRepository.UpdateAsync(session, cancellationToken);

        // Add system message
        var systemMessage = new ChatMessage
        {
            BusinessId = session.BusinessId,
            ChatSessionId = session.Id,
            Content = request.Reason ?? "Chat transferred to agent",
            Type = ChatMessageType.System,
            SenderId = "system",
            SenderName = "System",
            SentAt = DateTime.UtcNow,
        };
        await _messageRepository.AddAsync(systemMessage, cancellationToken);

        LogSessionTransferred(_logger, session.Id, request.AgentId);
        return true;
    }

    /// <inheritdoc />
    public async Task<ChatSessionDto?> GetSessionByIdAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetWithMessagesAsync(businessId, sessionId, 100, cancellationToken);
        return session != null ? MapToSessionDto(session) : null;
    }

    /// <inheritdoc />
    public async Task<ChatSessionDto?> GetBySessionTokenAsync(
        string sessionToken,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetBySessionTokenAsync(sessionToken, cancellationToken);
        return session != null ? MapToSessionDto(session) : null;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSessionSummaryDto>> GetSessionsAsync(
        Guid businessId,
        Guid? widgetId = null,
        string? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        ChatSessionStatus? statusEnum = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ChatSessionStatus>(status, true, out var parsed))
        {
            statusEnum = parsed;
        }

        // PERFORMANCE: Use single query with projection to avoid N+1 queries
        var projections = await _sessionRepository.GetSessionSummariesAsync(
            businessId, widgetId, statusEnum, skip, take, cancellationToken);

        return projections.Select(p => new ChatSessionSummaryDto
        {
            Id = p.Id,
            VisitorName = p.VisitorName,
            VisitorEmail = p.VisitorEmail,
            Status = p.Status,
            LastMessage = p.LastMessage,
            LastActivityAt = p.LastActivityAt,
            UnreadCount = p.UnreadCount,
            AIQualificationScore = p.AIQualificationScore,
        }).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSessionSummaryDto>> GetWaitingForAgentAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var sessions = await _sessionRepository.GetWaitingForAgentAsync(businessId, cancellationToken);
        return sessions.Select(s => new ChatSessionSummaryDto
        {
            Id = s.Id,
            VisitorName = s.VisitorName,
            VisitorEmail = s.VisitorEmail,
            Status = s.Status,
            LastActivityAt = s.LastActivityAt,
            AIQualificationScore = s.AIQualificationScore,
        }).ToList();
    }

    /// <inheritdoc />
    public async Task MarkMessagesAsReadAsync(
        Guid businessId,
        Guid sessionId,
        string readerId,
        CancellationToken cancellationToken = default)
    {
        await _messageRepository.MarkAsReadAsync(businessId, sessionId, readerId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ChatMessageDto?> ProcessAIResponseAsync(
        Guid sessionId,
        string userMessage,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetByIdAsync(Guid.Empty, sessionId, cancellationToken);
        if (session == null)
        {
            return null;
        }

        var widget = await _widgetRepository.GetByIdAsync(session.BusinessId, session.ChatWidgetId, cancellationToken);
        if (widget == null || !widget.EnableAIResponse)
        {
            return null;
        }

        // === SAFETY CHECK 1: Content Moderation ===
        if (widget.EnableContentModeration)
        {
            var moderationResult = await _contentModerationService.CheckContentAsync(userMessage, cancellationToken);
            if (!moderationResult.IsSafe)
            {
                LogUnsafeContentDetected(sessionId, moderationResult.Reason ?? "Unknown");
                var safetyMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    BusinessId = session.BusinessId,
                    ChatSessionId = sessionId,
                    Content = "I'm sorry, but I can't respond to that type of message. Please keep our conversation respectful and appropriate.",
                    Type = ChatMessageType.AI,
                    SenderId = "ai",
                    SenderName = "AI Assistant",
                    SentAt = DateTime.UtcNow,
                };
                await _messageRepository.AddAsync(safetyMessage, cancellationToken);
                return MapToMessageDto(safetyMessage);
            }
        }

        // === SAFETY CHECK 2: PII Protection ===
        var piiRedactionResult = widget.EnablePiiProtection
            ? _piiProtectionService.RedactPii(userMessage)
            : new PiiRedactionResult { RedactedContent = userMessage, ContainsPii = false };

        var processedMessage = piiRedactionResult.RedactedContent;

        // Get conversation history (last 20 messages for context)
        var messages = await _messageRepository.GetBySessionIdAsync(session.BusinessId, sessionId, 0, 20, cancellationToken);
        var conversationHistory = messages
            .OrderBy(m => m.SentAt)
            .Select(m => new { Role = m.Type == ChatMessageType.AI ? "assistant" : "user", m.Content })
            .ToList();

        // === EXTRACT CAPTURED DATA FROM CONVERSATION ===
        var capturedData = ExtractCapturedDataFromHistory(messages);

        // === DYNAMIC BUSINESS CONTEXT ===
        var businessName = widget.BusinessName ?? session.Business?.Name ?? "our team";
        var baseSystemPrompt = !string.IsNullOrWhiteSpace(widget.CustomSystemPrompt)
            ? widget.CustomSystemPrompt
            : QualiFlow.Application.Common.Services.PromptTemplateService.BuildSystemPrompt(
                businessName,
                widget.IndustryType,
                widget.AiPersonality);

        // === ADD COMING SOON / PRE-LAUNCH CONTEXT ===
        // CRITICAL: The widget is used on a "Coming Soon" page — there is NO product to sign into yet.
        var comingSoonContext = BuildComingSoonRestrictions(capturedData);

        // === ADD CONVERSATION MEMORY INSTRUCTIONS ===
        // CRITICAL: Memory instructions MUST be prepended to override base prompt's waitlist capture instructions
        var memoryInstructions = BuildConversationMemoryInstructions(capturedData);
        var systemPrompt = memoryInstructions + comingSoonContext + baseSystemPrompt;

        // Check if this is a greeting or simple conversation starter
        var isGreeting = IsGreeting(processedMessage);

        // === AI ENHANCEMENTS: FAQ, Memory, and RAG ===
        string? enhancedContext = null;

        if (!isGreeting)
        {
            // 1. Check FAQ for direct answers (use processed message without PII)
            var faqResult = await _faqSearchService.FindBestMatchAsync(
                session.BusinessId,
                processedMessage,
                cancellationToken: cancellationToken);

            if (faqResult != null)
            {
                enhancedContext = $"[FAQ Match - Confidence: {faqResult.Confidence:P0}]\nQ: {faqResult.Question}\nA: {faqResult.Answer}\n\n";
            }

            // 2. Recall relevant context from past conversations
            var memoryContext = await _conversationMemoryService.RecallRelevantContextAsync(
                session.BusinessId,
                session.LeadId,
                processedMessage,
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(memoryContext))
            {
                enhancedContext += memoryContext + "\n\n";
            }

            // 3. Retrieve knowledge base context (RAG)
            var kbContext = await _knowledgeBaseService.RetrieveRelevantContextAsync(
                session.BusinessId,
                processedMessage,
                maxChunks: 2,
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(kbContext))
            {
                enhancedContext += kbContext;
            }
        }

        // Build chat messages for OpenAI Chat Completions API
        var chatMessages = new List<dynamic>
        {
            new { role = "system", content = systemPrompt }
        };

        // Add conversation history first (closer to current message)
        foreach (var msg in conversationHistory)
        {
            chatMessages.Add(new { role = msg.Role, content = msg.Content });
        }

        // Add enhanced context if available (after history for better relevance)
        if (!string.IsNullOrWhiteSpace(enhancedContext))
        {
            chatMessages.Add(new { role = "system", content = $"Additional context to help answer the user:\n{enhancedContext}" });
        }

        // Add current user message (use processed message without PII)
        chatMessages.Add(new { role = "user", content = processedMessage });

        // Generate AI response using chat completions
        var aiResponse = await _openAIService.GenerateChatCompletionAsync(
            JsonSerializer.Serialize(chatMessages),
            maxTokens: isGreeting ? 150 : 500,
            temperature: 0.8f, // Higher temperature for more natural, varied responses
            cancellationToken);

        // Restore PII in response if it was redacted
        var finalResponse = piiRedactionResult.ContainsPii
            ? _piiProtectionService.RestorePii(aiResponse, piiRedactionResult.PiiMap)
            : aiResponse;

        var aiMessage = new ChatMessage
        {
            BusinessId = session.BusinessId,
            ChatSessionId = sessionId,
            Content = finalResponse,
            Type = ChatMessageType.AI,
            SenderId = "ai",
            SenderName = "AI Assistant",
            SentAt = DateTime.UtcNow,
        };

        await _messageRepository.AddAsync(aiMessage, cancellationToken);
        LogAIResponseGenerated(sessionId);
        return MapToMessageDto(aiMessage);
    }

    private static bool IsGreeting(string message)
    {
        var normalizedMessage = message.Trim().ToLowerInvariant();
        var greetings = new[]
        {
            "hi", "hello", "hey", "hola", "greetings", "good morning",
            "good afternoon", "good evening", "howdy", "what's up",
            "whats up", "sup", "yo", "hiya"
        };

        return Array.Exists(greetings, g => normalizedMessage == g || normalizedMessage.StartsWith(g + " ", StringComparison.Ordinal) || normalizedMessage.StartsWith(g + "!", StringComparison.Ordinal));
    }

    /// <summary>
    /// Extracts captured user data (name, email, phone) from conversation history.
    /// </summary>
    private static CapturedUserData ExtractCapturedDataFromHistory(IReadOnlyList<ChatMessage> messages)
    {
        var data = new CapturedUserData();
        var visitorMessages = messages
            .Where(m => m.Type == ChatMessageType.Visitor)
            .Select(m => m.Content)
            .ToList();

        foreach (var content in visitorMessages)
        {
            // Extract email
            if (string.IsNullOrEmpty(data.Email))
            {
                var emailMatch = Regex.Match(
                    content,
                    @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
                    RegexOptions.IgnoreCase,
                    TimeSpan.FromMilliseconds(100));
                if (emailMatch.Success)
                {
                    data.Email = emailMatch.Value;
                }
            }

            // Extract name from common patterns
            if (string.IsNullOrEmpty(data.Name))
            {
                data.Name = TryExtractName(content);
            }

            // Check if user agreed to waitlist/subscription
            if (!data.AgreedToWaitlist)
            {
                var lowerContent = content.ToLowerInvariant();

                // Direct affirmative responses
                if (lowerContent == "yes" ||
                    lowerContent == "sure" ||
                    lowerContent == "ok" ||
                    lowerContent == "okay" ||
                    lowerContent == "yep" ||
                    lowerContent == "yeah" ||
                    lowerContent == "yup" ||
                    lowerContent == "absolutely" ||
                    lowerContent == "definitely" ||
                    lowerContent.StartsWith("yes,", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("yes!", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("yes ", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("sure,", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("sure!", StringComparison.Ordinal) ||
                    lowerContent.Contains("sign me up", StringComparison.Ordinal) ||
                    lowerContent.Contains("add me", StringComparison.Ordinal) ||
                    lowerContent.Contains("i'd like to join", StringComparison.Ordinal) ||
                    lowerContent.Contains("i would like to join", StringComparison.Ordinal) ||
                    lowerContent.Contains("please add me", StringComparison.Ordinal) ||
                    lowerContent.Contains("put me on", StringComparison.Ordinal) ||
                    lowerContent.Contains("count me in", StringComparison.Ordinal))
                {
                    data.AgreedToWaitlist = true;
                }
            }

            // Also check if user provided email (implies agreement to waitlist)
            if (!data.AgreedToWaitlist && !string.IsNullOrEmpty(data.Email))
            {
                data.AgreedToWaitlist = true;
            }
        }

        return data;
    }

    private static string? TryExtractName(string content)
    {
        var trimmed = content.Trim();

        // Pattern: "My name is X", "I'm X", "I am X", "It's X", "This is X", "Call me X"
        var phraseMatch = Regex.Match(
            trimmed,
            @"(?:my name is|i'm|i am|it's|this is|call me)\s+(?<name>[A-Za-z]+(?:\s+[A-Za-z]+)?)",
            RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture,
            TimeSpan.FromMilliseconds(100));
        if (phraseMatch.Success && phraseMatch.Groups["name"].Success)
        {
            var name = phraseMatch.Groups["name"].Value.Trim();
            if (IsValidName(name))
            {
                return name;
            }
        }

        // Pattern: Just a single capitalized name (response to "what's your name?")
        var singleNameMatch = Regex.Match(trimmed, @"^(?<name>[A-Z][a-z]+)$", RegexOptions.ExplicitCapture, TimeSpan.FromMilliseconds(100));
        if (singleNameMatch.Success && singleNameMatch.Groups["name"].Success)
        {
            return singleNameMatch.Groups["name"].Value;
        }

        // Pattern: First and last name alone
        var fullNameMatch = Regex.Match(trimmed, @"^(?<name>[A-Z][a-z]+\s+[A-Z][a-z]+)$", RegexOptions.ExplicitCapture, TimeSpan.FromMilliseconds(100));
        if (fullNameMatch.Success && fullNameMatch.Groups["name"].Success)
        {
            return fullNameMatch.Groups["name"].Value;
        }

        return null;
    }

    private static bool IsValidName(string name)
    {
        return name.Length >= 2 &&
               name.Length <= 30 &&
               Regex.IsMatch(name, @"^[A-Za-z\s]+$", RegexOptions.None, TimeSpan.FromMilliseconds(100));
    }

    /// <summary>
    /// Builds conversation memory instructions based on captured data.
    /// </summary>
    private static string BuildConversationMemoryInstructions(CapturedUserData data)
    {
        var sb = new System.Text.StringBuilder();

        // Only add memory section if we have captured data
        if (string.IsNullOrEmpty(data.Name) && string.IsNullOrEmpty(data.Email) && !data.AgreedToWaitlist)
        {
            return string.Empty;
        }

        sb.AppendLine("╔══════════════════════════════════════════════════════════════════════════╗");
        sb.AppendLine("║  🚨 OVERRIDE INSTRUCTION - READ THIS FIRST BEFORE ANY OTHER INSTRUCTIONS  ║");
        sb.AppendLine("╚══════════════════════════════════════════════════════════════════════════╝");
        sb.AppendLine();
        sb.AppendLine("THIS USER HAS ALREADY PROVIDED THEIR INFORMATION:");
        sb.AppendLine();

        if (!string.IsNullOrEmpty(data.Name))
        {
            sb.AppendLine($"  ✅ NAME CAPTURED: {data.Name}");
        }

        if (!string.IsNullOrEmpty(data.Email))
        {
            sb.AppendLine($"  ✅ EMAIL CAPTURED: {data.Email}");
            sb.AppendLine("  ✅ USER IS ON THE WAITLIST (email = waitlist confirmation)");
        }

        if (data.AgreedToWaitlist)
        {
            sb.AppendLine("  ✅ WAITLIST CONFIRMED: User explicitly agreed to join");
        }

        sb.AppendLine();
        sb.AppendLine("═══════════════════════════════════════════════════════════════════════════");
        sb.AppendLine("ABSOLUTE PROHIBITIONS - NEVER DO THESE:");
        sb.AppendLine("═══════════════════════════════════════════════════════════════════════════");
        sb.AppendLine("❌ NEVER ask \"Would you like to join our waitlist?\"");
        sb.AppendLine("❌ NEVER ask \"What's your name?\" or \"What's your email?\"");
        sb.AppendLine("❌ NEVER say \"Would you like to be notified when we launch?\"");
        sb.AppendLine("❌ NEVER suggest signing up or joining anything - they already did");
        sb.AppendLine("❌ NEVER end responses with waitlist invitations");
        sb.AppendLine();
        sb.AppendLine("CORRECT BEHAVIOR:");
        sb.AppendLine("✓ Just answer their question directly and helpfully");
        sb.AppendLine("✓ Ask follow-up questions about their needs/use case if relevant");
        sb.AppendLine("✓ End with \"Is there anything else you'd like to know?\" or similar");
        sb.AppendLine();
        sb.AppendLine("EXAMPLE - User asks about pricing:");
        sb.AppendLine("WRONG: \"We haven't finalized pricing yet. Would you like to join our waitlist?\"");
        sb.AppendLine("RIGHT: \"We haven't finalized pricing yet since we're in launch phase. We'll notify you when details are available. Is there anything else about the platform you'd like to know?\"");
        sb.AppendLine();
        sb.AppendLine("═══════════════════════════════════════════════════════════════════════════");
        sb.AppendLine();

        return sb.ToString();
    }

    /// <summary>
    /// Builds pre-launch restrictions to prevent the AI from hallucinating account creation steps.
    /// </summary>
    private static string BuildComingSoonRestrictions(CapturedUserData data)
    {
        var sb = new System.Text.StringBuilder();
        var hasEmail = !string.IsNullOrEmpty(data.Email);
        var hasName = !string.IsNullOrEmpty(data.Name);

        sb.AppendLine();
        sb.AppendLine("PRE-LAUNCH STATUS (CRITICAL — READ BEFORE RESPONDING):");
        sb.AppendLine("QualiFlow AI is NOT yet launched. This is a COMING SOON page.");
        sb.AppendLine("There is NO product to sign into, NO account to create, and NO password to set.");
        sb.AppendLine();
        sb.AppendLine("ABSOLUTE PROHIBITIONS — NEVER DO ANY OF THESE:");
        sb.AppendLine("- NEVER mention creating a password or setting up a password");
        sb.AppendLine("- NEVER suggest creating an account, signing up for an account, or registering");
        sb.AppendLine("- NEVER mention a login page, dashboard access, or user portal");
        sb.AppendLine("- NEVER describe onboarding steps involving account creation or credentials");
        sb.AppendLine("- The ONLY action visitors can take is joining the EMAIL WAITLIST");
        sb.AppendLine("- If asked how to get started: \"Join our waitlist by sharing your email, and we'll notify you when we launch!\"");
        sb.AppendLine();

        if (hasEmail && hasName)
        {
            sb.AppendLine($"THIS VISITOR IS ALREADY ON THE WAITLIST (Name: {data.Name}, Email: {data.Email}).");
            sb.AppendLine("DO NOT ask for their name or email again. Just answer their questions helpfully.");
        }
        else if (hasEmail)
        {
            sb.AppendLine($"THIS VISITOR'S EMAIL IS ALREADY CAPTURED ({data.Email}). They are on the waitlist.");
            sb.AppendLine("DO NOT ask for their email again. Just answer their questions helpfully.");
        }
        else
        {
            sb.AppendLine("GOAL: Capture the visitor's name and email for the waitlist.");
            sb.AppendLine("You may answer up to 2 questions before asking for their name, then ask for email.");
        }

        sb.AppendLine();
        return sb.ToString();
    }

    private static string GenerateSessionToken()
    {
        return $"cs_{Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant()}";
    }

    /// <summary>
    /// Finds an existing lead or creates a new one from chat visitor information.
    /// </summary>
    private async Task<Lead?> FindOrCreateLeadFromVisitorAsync(
        Guid businessId,
        string? visitorName,
        string? visitorEmail,
        string? visitorPhone,
        string? pageUrl,
        CancellationToken cancellationToken)
    {
        // Need at least email or phone to create/find a lead
        if (string.IsNullOrWhiteSpace(visitorEmail) && string.IsNullOrWhiteSpace(visitorPhone))
        {
            LogNoContactInfoForLead(_logger, businessId);
            return null;
        }

        // Try to find existing lead by email first
        Lead? existingLead = null;
        if (!string.IsNullOrWhiteSpace(visitorEmail))
        {
            existingLead = await _leadRepository.GetByEmailForBusinessAsync(
                businessId, visitorEmail, cancellationToken);
        }

        // If not found by email, try by phone
        if (existingLead == null && !string.IsNullOrWhiteSpace(visitorPhone))
        {
            existingLead = await _leadRepository.GetByPhoneNumberAsync(
                businessId, visitorPhone, cancellationToken);
        }

        if (existingLead != null)
        {
            LogExistingLeadFound(_logger, existingLead.Id, businessId);
            return existingLead;
        }

        // Create new lead
        var newLead = new Lead
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Name = visitorName ?? "Chat Visitor",
            Email = visitorEmail ?? string.Empty,
            Phone = visitorPhone ?? string.Empty,
            Status = LeadStatus.New,
            Score = 0,
            SourceChannel = "ChatWidget",
            Metadata = BuildLeadMetadata(pageUrl),
            CreatedAt = DateTime.UtcNow,
        };

        var createdLead = await _leadRepository.AddForBusinessAsync(newLead, cancellationToken);

        // At this point, at least one of visitorEmail or visitorPhone is non-null
        var contactInfo = !string.IsNullOrWhiteSpace(visitorEmail) ? visitorEmail : visitorPhone!;
        LogLeadCreated(_logger, createdLead.Id, businessId, contactInfo);

        return createdLead;
    }

    /// <summary>
    /// Builds JSON metadata for a lead from chat widget context.
    /// </summary>
    private static string? BuildLeadMetadata(string? pageUrl)
    {
        var metadata = new Dictionary<string, object>
        {
            ["source"] = "chat_widget",
            ["created_at"] = DateTime.UtcNow.ToString("O"),
        };

        if (!string.IsNullOrWhiteSpace(pageUrl))
        {
            metadata["landing_page"] = pageUrl;
        }

        return JsonSerializer.Serialize(metadata);
    }

    private static ChatSessionDto MapToSessionDto(ChatSession session)
    {
        return new ChatSessionDto
        {
            Id = session.Id,
            ChatWidgetId = session.ChatWidgetId,
            SessionToken = session.SessionToken,
            VisitorName = session.VisitorName,
            VisitorEmail = session.VisitorEmail,
            VisitorPhone = session.VisitorPhone,
            Status = session.Status,
            PageUrl = session.PageUrl,
            AssignedAgentId = session.AssignedAgentId != null ? Guid.Parse(session.AssignedAgentId) : null,
            AIQualificationScore = session.AIQualificationScore,
            LeadId = session.LeadId,
            ConversationId = session.ConversationId,
            StartedAt = session.StartedAt,
            LastActivityAt = session.LastActivityAt,
            EndedAt = session.EndedAt,
            MessageCount = session.Messages?.Count ?? 0,
        };
    }

    private static ChatMessageDto MapToMessageDto(ChatMessage message)
    {
        var attachments = !string.IsNullOrEmpty(message.AttachmentsJson)
            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(message.AttachmentsJson)
            : null;

        return new ChatMessageDto
        {
            Id = message.Id,
            ChatSessionId = message.ChatSessionId,
            Content = message.Content,
            Type = message.Type.ToString(),
            SenderId = message.SenderId,
            SenderName = message.SenderName,
            SentAt = message.SentAt,
            IsRead = message.IsRead,
            ReadAt = message.ReadAt,
            Attachments = attachments,
            DetectedIntent = message.DetectedIntent,
            SentimentScore = message.SentimentScore,
        };
    }

    [LoggerMessage(EventId = 24101, Level = LogLevel.Warning, Message = "Widget not found or inactive: {WidgetKey}")]
    private static partial void LogWidgetNotFound(ILogger logger, string widgetKey);

    [LoggerMessage(EventId = 24102, Level = LogLevel.Information, Message = "Chat session {SessionId} started for widget {WidgetId}")]
    private static partial void LogSessionStarted(ILogger logger, Guid sessionId, Guid widgetId);

    [LoggerMessage(EventId = 24103, Level = LogLevel.Information, Message = "Message {MessageId} sent in session {SessionId}")]
    private static partial void LogMessageSent(ILogger logger, Guid messageId, Guid sessionId);

    [LoggerMessage(EventId = 24104, Level = LogLevel.Information, Message = "Chat session {SessionId} ended: {Reason}")]
    private static partial void LogSessionEnded(ILogger logger, Guid sessionId, string? reason);

    [LoggerMessage(EventId = 24105, Level = LogLevel.Information, Message = "Chat session {SessionId} transferred to agent {AgentId}")]
    private static partial void LogSessionTransferred(ILogger logger, Guid sessionId, Guid? agentId);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI response generated for session {SessionId}")]
    private partial void LogAIResponseGenerated(Guid sessionId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Unsafe content detected for session {SessionId}: {Reason}")]
    private partial void LogUnsafeContentDetected(Guid sessionId, string reason);

    [LoggerMessage(EventId = 24107, Level = LogLevel.Information, Message = "Lead {LeadId} linked to chat session {SessionId}")]
    private static partial void LogLeadLinkedToSession(ILogger logger, Guid leadId, Guid sessionId);

    [LoggerMessage(EventId = 24108, Level = LogLevel.Debug, Message = "No contact info (email/phone) found for chat visitor in business {BusinessId}, skipping lead creation")]
    private static partial void LogNoContactInfoForLead(ILogger logger, Guid businessId);

    [LoggerMessage(EventId = 24109, Level = LogLevel.Debug, Message = "Existing lead {LeadId} found for business {BusinessId}")]
    private static partial void LogExistingLeadFound(ILogger logger, Guid leadId, Guid businessId);

    [LoggerMessage(EventId = 24110, Level = LogLevel.Information, Message = "Lead {LeadId} created for business {BusinessId} from chat visitor {ContactInfo}")]
    private static partial void LogLeadCreated(ILogger logger, Guid leadId, Guid businessId, string contactInfo);

    [LoggerMessage(EventId = 24111, Level = LogLevel.Information, Message = "AI qualification job enqueued for lead {LeadId} triggered by message {MessageId}")]
    private static partial void LogAiQualificationEnqueued(ILogger logger, Guid leadId, Guid messageId);

    [LoggerMessage(EventId = 24112, Level = LogLevel.Debug, Message = "No lead linked to session {SessionId}, skipping AI qualification")]
    private static partial void LogNoLeadForQualification(ILogger logger, Guid sessionId);

    [LoggerMessage(EventId = 24113, Level = LogLevel.Information, Message = "AI auto-response job enqueued for session {SessionId} triggered by message {MessageId}")]
    private static partial void LogAiAutoResponseEnqueued(ILogger logger, Guid sessionId, Guid messageId);

    /// <summary>
    /// Holds captured user data extracted from conversation.
    /// </summary>
    private sealed class CapturedUserData
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public bool AgreedToWaitlist { get; set; }
    }
}

