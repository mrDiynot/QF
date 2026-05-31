using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Channels.Services;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Application.Features.ChatWidgets.Interfaces;
using QualiFlow.Application.Features.ChatWidgets.Services;
using QualiFlow.Application.Features.Meta.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for orchestrating AI auto-responses to inbound messages.
/// </summary>
public sealed partial class AIAutoResponseService : IAIAutoResponseService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IOpenAIService _openAIService;
    private readonly IAIPersonaService _personaService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly IExternalUsageTrackingService _usageTrackingService;
    private readonly ITwilioService _twilioService;
    private readonly IMetaMessagingService _metaMessagingService;
    private readonly IAIModelSelector _modelSelector;
    private readonly IAIGenerationAuditService _auditService;
    private readonly IChatSessionRepository _chatSessionRepository;
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly IChatHubNotifier _chatHubNotifier;
    private readonly IKnowledgeBaseService _knowledgeBaseService;
    private readonly ILogger<AIAutoResponseService> _logger;

    public AIAutoResponseService(
        IMessageRepository messageRepository,
        IConversationRepository conversationRepository,
        IChannelRepository channelRepository,
        ILeadRepository leadRepository,
        IOpenAIService openAIService,
        IAIPersonaService personaService,
        IUsageLimitService usageLimitService,
        IExternalUsageTrackingService usageTrackingService,
        ITwilioService twilioService,
        IMetaMessagingService metaMessagingService,
        IAIModelSelector modelSelector,
        IAIGenerationAuditService auditService,
        IChatSessionRepository chatSessionRepository,
        IChatMessageRepository chatMessageRepository,
        IChatHubNotifier chatHubNotifier,
        IKnowledgeBaseService knowledgeBaseService,
        ILogger<AIAutoResponseService> logger)
    {
        _messageRepository = messageRepository;
        _conversationRepository = conversationRepository;
        _channelRepository = channelRepository;
        _leadRepository = leadRepository;
        _openAIService = openAIService;
        _personaService = personaService;
        _usageLimitService = usageLimitService;
        _usageTrackingService = usageTrackingService;
        _twilioService = twilioService;
        _metaMessagingService = metaMessagingService;
        _modelSelector = modelSelector;
        _auditService = auditService;
        _chatSessionRepository = chatSessionRepository;
        _chatMessageRepository = chatMessageRepository;
        _chatHubNotifier = chatHubNotifier;
        _knowledgeBaseService = knowledgeBaseService;
        _logger = logger;
    }

    private async Task<string> BuildWebChatSystemPromptAsync(
        Guid businessId,
        string userQuery,
        CapturedUserData? capturedData,
        CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow;
        var timeOfDay = utcNow.Hour switch
        {
            >= 5 and < 12 => "morning",
            >= 12 and < 17 => "afternoon",
            >= 17 and < 21 => "evening",
            _ => "night"
        };

        // Retrieve relevant context from knowledge base using RAG
        var knowledgeContext = string.Empty;
        try
        {
            knowledgeContext = await _knowledgeBaseService.RetrieveRelevantContextAsync(
                businessId,
                userQuery,
                maxChunks: 3,
                cancellationToken);
            _logger.LogDebug(
                "RAG context retrieved for business {BusinessId}, length={Length}",
                businessId,
                knowledgeContext.Length);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve knowledge base context for business {BusinessId}", businessId);
        }

        var promptBuilder = new System.Text.StringBuilder();

        // IDENTITY (from ai_prompt_qualiflow)
        promptBuilder.AppendLine("IDENTITY:");
        promptBuilder.AppendLine("You are Alex, a professional, confident, and friendly AI chat assistant for QualiFlow AI.");
        promptBuilder.AppendLine("QualiFlow AI is an AI-powered Automated Customer Journey Platform that ensures:");
        promptBuilder.AppendLine("- Every lead is captured");
        promptBuilder.AppendLine("- Every inquiry gets an instant response");
        promptBuilder.AppendLine("- Every conversation is qualified");
        promptBuilder.AppendLine("- Every opportunity is followed up");
        promptBuilder.AppendLine("- Every booking is handled automatically");
        promptBuilder.AppendLine("- Every interaction is logged and synced to a CRM");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("QualiFlow manages: Inbound & outbound phone calls, SMS conversations, emails, social media DMs (Instagram, Facebook, WhatsApp), website chat & forms, and lead capture with customer routing.");
        promptBuilder.AppendLine();

        // LAUNCH PHASE CONTEXT
        promptBuilder.AppendLine("IMPORTANT - LAUNCH PHASE:");
        promptBuilder.AppendLine("QualiFlow AI is currently in its launch phase. The platform is not fully live yet.");
        promptBuilder.AppendLine("We are NOT booking demos or sales calls at this time.");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("PRE-LAUNCH TONE (CRITICAL — ALWAYS follow this):");
        promptBuilder.AppendLine("QualiFlow AI has NOT launched yet — it is in pre-launch phase.");
        promptBuilder.AppendLine("When describing features, capabilities, and integrations, ALWAYS use future or conditional tense:");
        promptBuilder.AppendLine("  ✅ USE: \"will integrate with\", \"is designed to support\", \"will offer\", \"will include\", \"will handle\"");
        promptBuilder.AppendLine("  ✅ USE: \"will sync\", \"will manage\", \"will support\", \"will enable\", \"will automate\"");
        promptBuilder.AppendLine("  ❌ NEVER USE: \"integrates with\", \"supports\", \"offers\", \"includes\", \"handles\", \"syncs\"");
        promptBuilder.AppendLine("  ❌ NEVER USE present-tense affirmative for any feature as if it's currently live.");
        promptBuilder.AppendLine("This applies to ALL responses about features, channels, integrations, and capabilities.");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("CRITICAL RESTRICTION - PRICING:");
        promptBuilder.AppendLine("DO NOT share any pricing details, plan names with dollar amounts, or subscription costs.");
        promptBuilder.AppendLine("Pricing is being finalized for launch and must not be disclosed yet.");
        promptBuilder.AppendLine("If asked about pricing, respond with: \"We're finalizing our pricing structure for launch. Join our waitlist to be the first to know when we announce pricing and launch details!\"");

        // Conditionally include capture goal based on whether data is already captured
        var hasEmail = !string.IsNullOrEmpty(capturedData?.Email);
        if (hasEmail)
        {
            promptBuilder.AppendLine("This user has ALREADY joined our waitlist. Focus on answering their questions helpfully.");
            promptBuilder.AppendLine("DO NOT ask for name, email, or waitlist signup - they are already on the list.");
        }
        else
        {
            promptBuilder.AppendLine("⚠️ MANDATORY REQUIREMENT: You MUST collect the visitor's full name AND email address during this conversation.");
            promptBuilder.AppendLine("This is NOT optional — every conversation must result in name + email capture for the waitlist.");
            promptBuilder.AppendLine("You may answer up to 2 questions before asking for their name. After 2 questions, you MUST ask for their name before answering any more questions.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("HANDLING 'I ALREADY SIGNED UP' CLAIMS:");
            promptBuilder.AppendLine("- If a visitor says they already signed up, subscribed, or joined the waitlist, DO NOT blindly trust the claim.");
            promptBuilder.AppendLine("- Instead, ask them to verify: \"That's great to hear! Could you share the email you used to sign up? I'd like to confirm you're all set on our list.\"");
            promptBuilder.AppendLine("- If they provide a valid email address → acknowledge warmly: \"Perfect, I can see you're on our list! How can I help you today?\" and stop asking for details.");
            promptBuilder.AppendLine("- If they refuse, deflect, or cannot provide an email → gently persist: \"No worries! To make sure you don't miss any updates, could I just get your name and email? It only takes a moment.\"");
            promptBuilder.AppendLine("- NEVER skip collection without receiving a valid email address as verification.");
        }

        promptBuilder.AppendLine("Let users know they'll receive a welcome email and be notified when QualiFlow AI officially launches.");
        promptBuilder.AppendLine();

        // YOUR ROLE
        promptBuilder.AppendLine("YOUR ROLE:");
        promptBuilder.AppendLine("- Greet users professionally");
        promptBuilder.AppendLine("- Answer high-level questions about QualiFlow AI");
        promptBuilder.AppendLine("- Provide short but detailed responses — concise, clear, and informative");
        promptBuilder.AppendLine("- Clearly communicate that we are in launch phase");
        if (!hasEmail)
        {
            promptBuilder.AppendLine("- MUST capture the user's full name and email for the launch waitlist (mandatory, not optional)");
        }

        promptBuilder.AppendLine("- Sound human, transparent, and trustworthy — never salesy");
        promptBuilder.AppendLine();

        // TONE & STYLE
        promptBuilder.AppendLine("TONE & STYLE:");
        promptBuilder.AppendLine("- Friendly and conversational");
        promptBuilder.AppendLine("- Calm, confident, and modern");
        promptBuilder.AppendLine("- Transparent and honest - no pressure");
        promptBuilder.AppendLine("- Short, natural, but informative responses");
        promptBuilder.AppendLine("- Avoid long explanations unless the user asks for more detail");
        promptBuilder.AppendLine();

        // Adjust response format based on whether we have knowledge base context
        if (!string.IsNullOrWhiteSpace(knowledgeContext))
        {
            promptBuilder.AppendLine("RESPONSE FORMAT (with knowledge base):");
            promptBuilder.AppendLine("- Provide the specific details from the knowledge base that answer the question");
            promptBuilder.AppendLine("- Keep it conversational and natural (2-4 sentences)");
            promptBuilder.AppendLine("- End with a brief follow-up question");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("RULES:");
            promptBuilder.AppendLine("1. BE CONVERSATIONAL - Use natural language, contractions, casual tone");
            promptBuilder.AppendLine("2. BE COMPLETE - Include relevant details from the knowledge base");
            promptBuilder.AppendLine("3. BE HELPFUL - Answer the question fully and accurately");
            promptBuilder.AppendLine("4. NEVER reveal pricing, plan costs, or dollar amounts — pricing is not finalized yet");
            promptBuilder.AppendLine("5. NEVER reveal internal tech stack, infrastructure, databases, frameworks, or implementation details");
            promptBuilder.AppendLine("   (e.g. do NOT mention PostgreSQL, pgvector, .NET, SignalR, EF Core, Hangfire, Azure Container Apps, or any backend technology)");
            promptBuilder.AppendLine("   If asked about tech stack, say: \"QualiFlow AI is built on enterprise-grade cloud infrastructure designed for reliability and scale. We'd love to share more details closer to launch!\"");
        }
        else
        {
            promptBuilder.AppendLine("RESPONSE FORMAT:");
            promptBuilder.AppendLine("- EXACTLY 2 sentences: one answer, one question");
            promptBuilder.AppendLine("- Be conversational and engaging");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("RULES:");
            promptBuilder.AppendLine("1. NO LISTS - Never use bullet points, dashes, asterisks, or numbered lists");
            promptBuilder.AppendLine("2. BE CONVERSATIONAL - Use contractions, casual language");
            promptBuilder.AppendLine("3. BE HELPFUL - Answer questions directly");
            promptBuilder.AppendLine("4. NEVER reveal internal tech stack, infrastructure, databases, frameworks, or implementation details");
        }

        promptBuilder.AppendLine();

        // Add RAG context if available - MUST be used for accurate answers
        if (!string.IsNullOrWhiteSpace(knowledgeContext))
        {
            promptBuilder.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            promptBuilder.AppendLine("📚 KNOWLEDGE BASE - USE THIS INFORMATION TO ANSWER QUESTIONS:");
            promptBuilder.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            promptBuilder.AppendLine(knowledgeContext);
            promptBuilder.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("⚠️ CRITICAL: When answering questions about integrations, features, or technology,");
            promptBuilder.AppendLine("use the specific details from the KNOWLEDGE BASE above (tier names, integration names, methodology details).");
            promptBuilder.AppendLine("However, you MUST convert ALL present-tense statements from the knowledge base into future/conditional tense.");
            promptBuilder.AppendLine("The knowledge base describes the PLANNED platform — it is NOT live yet.");
            promptBuilder.AppendLine("Examples of required conversion:");
            promptBuilder.AppendLine("  KB says: \"QualiFlow includes a built-in CRM\" → You say: \"QualiFlow AI will include a built-in CRM\"");
            promptBuilder.AppendLine("  KB says: \"QualiFlow syncs in real time with Salesforce\" → You say: \"QualiFlow AI will sync in real time with Salesforce\"");
            promptBuilder.AppendLine("  KB says: \"supports integration\" → You say: \"will support integration\"");
            promptBuilder.AppendLine("  KB says: \"handles inbound calls\" → You say: \"will handle inbound calls\"");
            promptBuilder.AppendLine("NEVER use present tense for features as if they are currently available. ALWAYS future/conditional.");
            promptBuilder.AppendLine();
        }

        // Conditionally show different examples based on whether user is on waitlist
        if (hasEmail)
        {
            // REPLACEMENT examples for waitlist users - conversational but no waitlist asks
            promptBuilder.AppendLine("CONVERSATION EXAMPLES (USER ON WAITLIST - copy this style exactly):");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"Do you handle phone calls?\"");
            promptBuilder.AppendLine("You: \"Yes! QualiFlow AI will handle both inbound and outbound calls, so you'll never miss a lead. We'll also be able to send follow-up texts after calls automatically. Is there anything specific about our call handling you'd like to know?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"What about pricing?\"");
            promptBuilder.AppendLine("You: \"We're finalizing our pricing tiers as we approach launch. Since you're already on the waitlist, you'll be among the first to know when details are ready. Any other questions about the platform's capabilities?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"How does it integrate with my CRM?\"");
            promptBuilder.AppendLine("You: \"QualiFlow AI will integrate with popular CRMs like Salesforce, HubSpot, and Pipedrive. All conversations and lead data will sync automatically once we launch. What CRM are you currently using?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"Can I schedule a demo?\"");
            promptBuilder.AppendLine("You: \"We're not scheduling demos just yet since we're still finalizing the platform. You're already on our early access list, so you'll be first to know when we launch! Is there anything else about QualiFlow AI I can help you with?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"What channels do you support?\"");
            promptBuilder.AppendLine("You: \"QualiFlow AI will support phone calls, SMS, email, website chat, and social media DMs including Instagram, Facebook, and WhatsApp — all managed from one platform. Which channels are most important for your business?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"How do I make ice cream?\"");
            promptBuilder.AppendLine("You: \"I can only help with questions related to QualiFlow AI at the moment. Is there anything about our platform I can help you with?\"");
            promptBuilder.AppendLine();
        }
        else
        {
            // Original examples for new users - includes waitlist capture flow
            promptBuilder.AppendLine("CONVERSATION EXAMPLES (copy this style exactly):");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"What is QualiFlow AI?\"");
            promptBuilder.AppendLine("You: \"QualiFlow AI is an automated customer journey platform that helps businesses manage calls, texts, emails, social media messages, website chat, and lead follow-ups — all in one connected system. We're currently in our launch phase, so we're not fully live just yet — but we are collecting early interest. Would you like to join our waitlist?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"Does it integrate with my CRM?\"");
            promptBuilder.AppendLine("You: \"QualiFlow AI is designed to work alongside popular CRMs like Pipedrive, Salesforce, HubSpot, and similar platforms, so conversations and leads stay connected. Those integrations are part of the platform we're finalizing as we prepare for launch. What CRM are you currently using?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"I'm interested\"");
            promptBuilder.AppendLine("You: \"That's great to hear! Since we're still in launch mode, what we're doing right now is adding interested businesses to our early access list. That way, you'll be the first to know when we officially launch. By the way — what's your name?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"My name is John\"");
            promptBuilder.AppendLine("You: \"Nice to meet you, John! What's the best email to reach you? We'll send a quick welcome message and notify you as soon as QualiFlow AI officially launches.\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"john@example.com\"");
            promptBuilder.AppendLine("You: \"Great, I've noted your email! A form will pop up to collect a few more details so we can add you to our priority list. Thanks for your interest — we really appreciate you reaching out!\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"Can I schedule a demo?\"");
            promptBuilder.AppendLine("You: \"We're not scheduling demos just yet since we're still finalizing the platform — but everyone on the email list will be the first to get access when we launch. Would you like to join the waitlist?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"Just curious about the platform\"");
            promptBuilder.AppendLine("You: \"Totally understandable — feel free to ask any questions, and I'll do my best to help! What would you like to know about QualiFlow AI?\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("User: \"How do I make ice cream?\"");
            promptBuilder.AppendLine("You: \"I can only help with questions related to QualiFlow AI at the moment. Is there anything about our platform I can help you with?\"");
            promptBuilder.AppendLine();
        }

        // Only include capture flow if user hasn't already provided email
        if (!hasEmail)
        {
            promptBuilder.AppendLine("CONVERSATION FLOW (MANDATORY — follow this strictly):");
            promptBuilder.AppendLine("1. Greet the user and answer their FIRST question");
            promptBuilder.AppendLine("2. After answering, naturally ask for their name: \"By the way — what's your name?\"");
            promptBuilder.AppendLine("3. Acknowledge their name warmly: \"Nice to meet you, {Name}!\"");
            promptBuilder.AppendLine("4. Ask for email: \"What's the best email to reach you? We'll send a quick welcome message and notify you as soon as QualiFlow AI officially launches.\"");
            promptBuilder.AppendLine("5. If they hesitate or deflect: \"No pressure at all — it's just so we can keep you in the loop when things go live. What email should I use?\"");
            promptBuilder.AppendLine("6. Confirm: \"Just to confirm — that's {Name}, and your email is {Email}. Did I get that right?\"");
            promptBuilder.AppendLine("7. After capture: \"Great, I've noted your email! A form will pop up to collect a few more details so we can add you to our priority list. Thanks for your interest!\"");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("ENFORCEMENT RULES:");
            promptBuilder.AppendLine("- You MUST ask for the visitor's name by your SECOND response at the latest");
            promptBuilder.AppendLine("- After getting the name, you MUST ask for email in your very next response");
            promptBuilder.AppendLine("- If the visitor ignores your name/email request and asks another question, answer BRIEFLY and then ask again");
            promptBuilder.AppendLine("- Do NOT answer more than 2 questions without collecting the name first");
            promptBuilder.AppendLine("- Do NOT answer more than 1 additional question after getting the name without asking for email");
            promptBuilder.AppendLine("- If the visitor says they already signed up or joined, ask for their email to verify (see 'HANDLING I ALREADY SIGNED UP CLAIMS' above). NEVER skip collection without a valid email.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("EMAIL CAPTURE BEHAVIOR:");
            promptBuilder.AppendLine("- When a user shares their email address in chat, acknowledge it warmly");
            promptBuilder.AppendLine("- Say: \"Great, I've noted your email! A form will pop up to collect a few more details so we can add you to our priority list.\"");
            promptBuilder.AppendLine("- If no email is shared after multiple prompts, encourage them to use the 'Get Early Access' button");
            promptBuilder.AppendLine();
        }
        else
        {
            promptBuilder.AppendLine("CONVERSATION FLOW (USER ALREADY ON WAITLIST):");
            promptBuilder.AppendLine("1. Answer their question directly and helpfully");
            promptBuilder.AppendLine("2. Ask follow-up questions about their needs/use case if relevant");
            promptBuilder.AppendLine("3. End with \"Is there anything else you'd like to know?\" or similar");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("IMPORTANT - DO NOT:");
            promptBuilder.AppendLine("- Ask for name or email (already captured)");
            promptBuilder.AppendLine("- Ask if they want to join the waitlist (already joined)");
            promptBuilder.AppendLine("- Suggest signing up for anything");
            promptBuilder.AppendLine();
        }

        promptBuilder.AppendLine("DEMO/SALES CALL REQUESTS:");
        if (hasEmail)
        {
            promptBuilder.AppendLine("- Politely redirect: \"We're not scheduling demos just yet since we're still finalizing the platform. You're already on our early access list, so you'll be first to know when we launch! Is there anything else about QualiFlow AI I can help you with?\"");
        }
        else
        {
            promptBuilder.AppendLine("- Politely redirect: \"We're not scheduling demos just yet since we're still finalizing the platform — but everyone on the email list will be the first to get access when we launch. Would you like to join the waitlist?\"");
        }

        promptBuilder.AppendLine();
        promptBuilder.AppendLine("CONVERSATION CLOSURE:");
        promptBuilder.AppendLine("- If the user says goodbye, bye, end chat, close chat, I'm done, that's all, thanks bye, gotta go, take care, see you, or similar closure phrases:");
        promptBuilder.AppendLine("  * Respond with a warm, professional farewell");
        promptBuilder.AppendLine("  * Thank them for their time and interest in QualiFlow AI");
        promptBuilder.AppendLine("  * DO NOT ask any follow-up questions after the farewell");
        promptBuilder.AppendLine("  * DO NOT try to continue the conversation or suggest new topics");
        promptBuilder.AppendLine("  * DO NOT ask for their email or name during a farewell");
        promptBuilder.AppendLine("  * Keep the farewell SHORT (1-2 sentences max)");
        promptBuilder.AppendLine("  * Example: \"Thanks for chatting with me! Feel free to come back anytime you have more questions about QualiFlow AI. Have a great day! 👋\"");
        promptBuilder.AppendLine("  * Example: \"It was great talking with you! We'll keep you posted on our launch. Take care! 👋\"");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("ABSOLUTE PROHIBITIONS (NEVER DO ANY OF THESE):");
        promptBuilder.AppendLine("- NEVER mention creating a password or setting up a password");
        promptBuilder.AppendLine("- NEVER suggest creating an account, signing up for an account, or registering for an account");
        promptBuilder.AppendLine("- NEVER mention a login page, dashboard access, or user portal");
        promptBuilder.AppendLine("- NEVER describe any onboarding steps that involve account creation, passwords, or credentials");
        promptBuilder.AppendLine("- The ONLY action visitors can take right now is joining the EMAIL WAITLIST — nothing else");
        promptBuilder.AppendLine("- There is NO product to sign into, NO account to create, and NO password to set");
        promptBuilder.AppendLine("- If a user asks how to get started, the answer is ALWAYS: \"Join our waitlist by sharing your email, and we'll notify you when we launch!\"");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("SCOPE LIMITATION:");
        promptBuilder.AppendLine("- Only speak about QualiFlow AI and what it does");
        promptBuilder.AppendLine("- If asked about unrelated topics: \"I can only help with questions related to QualiFlow AI at the moment.\"");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("CONVERSATION MEMORY (CRITICAL):");
        promptBuilder.AppendLine("- ALWAYS check the CONVERSATION HISTORY below before asking for information");
        promptBuilder.AppendLine("- If the user has ALREADY provided their name, use it and DO NOT ask again");
        promptBuilder.AppendLine("- If the user has ALREADY provided their email, acknowledge it and DO NOT ask again");
        promptBuilder.AppendLine("- Remember ALL information shared by the user throughout the conversation");
        promptBuilder.AppendLine("- When the user shares their name, remember it for the entire conversation");
        promptBuilder.AppendLine("- When the user shares their email, remember it for the entire conversation");
        promptBuilder.AppendLine("- NEVER ask for information the user has already provided - this is frustrating");
        promptBuilder.AppendLine("- Use the user's name naturally in responses after they've shared it");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("GOLDEN RULES:");
        promptBuilder.AppendLine("- Be transparent about launch status");
        promptBuilder.AppendLine("- Never promise demos or calls");
        if (!hasEmail)
        {
            promptBuilder.AppendLine("- You MUST capture name + email for the waitlist — this is mandatory, not optional");
        }
        else
        {
            promptBuilder.AppendLine("- User is already on waitlist - just be helpful, DO NOT ask for signup");
        }

        promptBuilder.AppendLine("- Make the user feel early, not excluded");
        promptBuilder.AppendLine("- Sound calm, honest, and credible");
        promptBuilder.AppendLine();
        promptBuilder.Append(System.Globalization.CultureInfo.InvariantCulture, $"Current time: {utcNow:HH:mm} UTC ({timeOfDay})");

        return promptBuilder.ToString();
    }

    /// <inheritdoc/>
    public async Task<AIAutoResponseResult> ProcessAndRespondAsync(
        Guid businessId,
        Guid conversationId,
        Guid messageId,
        string channel,
        CancellationToken cancellationToken = default)
    {
        LogProcessingStarted(businessId, conversationId, messageId, channel);

        // Handle WebChat channel separately (uses ChatSession/ChatMessage entities)
        if (channel.Equals("WebChat", StringComparison.OrdinalIgnoreCase))
        {
            return await ProcessWebChatResponseAsync(businessId, conversationId, messageId, cancellationToken);
        }

        try
        {
            // Step 1: Check usage limits
            var canUseAI = await _usageLimitService.CanUseAiInteractionAsync(businessId, cancellationToken);
            if (!canUseAI)
            {
                LogLimitExceeded(businessId, "AI interaction");
                return AIAutoResponseResult.LimitExceededFailure("AI interaction");
            }

            // Step 2: Get the inbound message
            var inboundMessage = await _messageRepository.GetByIdAsync(businessId, messageId, cancellationToken);
            if (inboundMessage == null)
            {
                LogMessageNotFound(businessId, messageId);
                return AIAutoResponseResult.Failed("Inbound message not found");
            }

            // Step 3: Get conversation and lead context
            var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
            if (conversation == null)
            {
                LogConversationNotFound(businessId, conversationId);
                return AIAutoResponseResult.Failed("Conversation not found");
            }

            // Step 4: Check if conversation is closed (skip AI response)
            if (conversation.Status == ConversationStatus.Closed)
            {
                LogHumanHandoff(businessId, conversationId);
                return AIAutoResponseResult.HumanHandled();
            }

            // Step 4b: Check if assigned to a human agent (skip AI response)
            if (conversation.AssignedToUserId.HasValue)
            {
                LogHumanHandoff(businessId, conversationId);
                return AIAutoResponseResult.HumanHandled();
            }

            // Step 5: Get conversation history for context
            var conversationHistory = await GetConversationContextAsync(businessId, conversationId, cancellationToken);

            // Step 6: Detect intent
            var intentResult = await _openAIService.DetectIntentAsync(
                inboundMessage.Content,
                conversationHistory,
                cancellationToken);

            // Step 6b: Get lead's BANT scores for progressive questioning
            var lead = await _leadRepository.GetByIdForBusinessAsync(businessId, conversation.LeadId, cancellationToken);
            var missingBantContext = BuildMissingBantContext(lead);

            // Step 7: Build system prompt with persona and progressive questioning
            var baseSystemPrompt = await _personaService.BuildSystemPromptAsync(
                businessId,
                intentResult.PrimaryIntent,
                string.Join("\n", conversationHistory),
                cancellationToken);

            var systemPrompt = EnhancePromptWithProgressiveQuestioning(baseSystemPrompt, missingBantContext);

            // Step 8: Generate AI response
            var aiResponse = await _openAIService.GenerateCompletionAsync(
                inboundMessage.Content,
                systemPrompt,
                maxTokens: 500,
                temperature: 1.0f, // Use default temperature for model compatibility
                cancellationToken);

            // Estimate token usage (rough estimate: 4 chars per token)
            var inputTokens = (systemPrompt.Length + inboundMessage.Content.Length) / 4;
            var outputTokens = aiResponse.Length / 4;
            var estimatedCost = CalculateOpenAICost(inputTokens, outputTokens);

            // Step 9: Track OpenAI usage using centralized model selector
            var modelSelection = _modelSelector.SelectModel(AITaskType.AutoResponse, businessId);
            await _usageTrackingService.TrackOpenAIUsageAsync(
                businessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "auto_response",
                conversationId,
                messageId,
                null, // Duration will be tracked when OpenAI service returns it
                cancellationToken);

            // Step 9b: Log to AI generation audit for detailed tracking
            await _auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = businessId,
                    TaskType = AITaskType.AutoResponse,
                    InputPrompt = $"{systemPrompt}\n\n{inboundMessage.Content}",
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = 0, // Not tracked at this level
                    EstimatedCostUsd = estimatedCost,
                    IsSuccess = true,
                    Metadata = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        conversationId,
                        messageId,
                        intent = intentResult.PrimaryIntent,
                    }),
                },
                cancellationToken);

            // Step 10: Send response via appropriate channel
            var sendResult = await SendResponseAsync(
                conversation,
                aiResponse,
                channel,
                cancellationToken);

            if (!sendResult.Success)
            {
                LogSendFailed(businessId, conversationId, sendResult.ErrorMessage ?? "Unknown error");
                return AIAutoResponseResult.Failed($"Failed to send response: {sendResult.ErrorMessage}");
            }

            // Step 11: Store the AI response message
            var responseMessage = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                Content = aiResponse,
                Direction = MessageDirection.Outbound,
                SentAt = DateTime.UtcNow,
            };

            await _messageRepository.AddAsync(responseMessage, cancellationToken);

            // Step 12: Increment usage counters
            await _usageLimitService.IncrementAiInteractionsAsync(businessId, cancellationToken);

            if (channel.Equals("SMS", StringComparison.OrdinalIgnoreCase))
            {
                await _usageLimitService.IncrementAiSmsAsync(businessId, cancellationToken);

                // Track Twilio SMS usage
                await _usageTrackingService.TrackTwilioSmsAsync(
                    businessId,
                    "outbound",
                    sendResult.Price ?? 0.0079m,
                    conversationId,
                    responseMessage.Id,
                    cancellationToken);
            }

            LogProcessingCompleted(businessId, conversationId, responseMessage.Id);

            return AIAutoResponseResult.Succeeded(
                aiResponse,
                responseMessage.Id,
                inputTokens + outputTokens,
                estimatedCost,
                intentResult.PrimaryIntent,
                null);
        }
        catch (Exception ex)
        {
            LogProcessingError(businessId, conversationId, ex.Message, ex);
            return AIAutoResponseResult.Failed($"Error processing auto-response: {ex.Message}");
        }
    }

    /// <summary>
    /// Processes AI auto-response for WebChat channel using ChatSession/ChatMessage entities.
    /// </summary>
    private async Task<AIAutoResponseResult> ProcessWebChatResponseAsync(
        Guid businessId,
        Guid chatSessionId,
        Guid chatMessageId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("ProcessWebChatResponseAsync called for business {BusinessId}, session {SessionId}", businessId, chatSessionId);
        try
        {
            // Step 1: Check usage limits
            var canUseAI = await _usageLimitService.CanUseAiInteractionAsync(businessId, cancellationToken);
            if (!canUseAI)
            {
                LogLimitExceeded(businessId, "AI interaction");
                return AIAutoResponseResult.LimitExceededFailure("AI interaction");
            }

            // Step 2: Get the chat session
            var chatSession = await _chatSessionRepository.GetByIdAsync(businessId, chatSessionId, cancellationToken);
            if (chatSession == null)
            {
                LogWebChatSessionNotFound(businessId, chatSessionId);
                return AIAutoResponseResult.Failed("Chat session not found");
            }

            // Step 3: Get the inbound chat message
            var inboundMessage = await _chatMessageRepository.GetByIdAsync(businessId, chatMessageId, cancellationToken);
            if (inboundMessage == null)
            {
                LogWebChatMessageNotFound(businessId, chatMessageId);
                return AIAutoResponseResult.Failed("Chat message not found");
            }

            // Step 3b: Get FULL conversation history for memory extraction (name, email, waitlist)
            // This ensures we never "forget" user data even in long conversations
            var fullConversationHistory = await _chatMessageRepository.GetBySessionIdAsync(
                businessId,
                chatSessionId,
                skip: 0,
                take: 100, // Get up to 100 messages for memory extraction
                cancellationToken);

            // === EXTRACT CAPTURED DATA FROM FULL HISTORY (ensures persistent memory) ===
            var capturedData = ExtractCapturedUserData(fullConversationHistory);

            // Step 3c: Get LIMITED conversation history for AI context (last 12 messages)
            // This prevents context overflow while maintaining recent conversation flow
            var recentHistory = fullConversationHistory
                .OrderByDescending(m => m.SentAt)
                .Take(12)
                .OrderBy(m => m.SentAt)
                .ToList();

            // Build conversation context string with message truncation to prevent context overflow
            // Truncate individual messages to 400 chars max, total history to 4000 chars
            const int MaxMessageLength = 400;
            const int MaxTotalHistoryLength = 4000;

            var truncatedMessages = recentHistory
                .Select(m =>
                {
                    var content = m.Content.Length > MaxMessageLength
                        ? string.Concat(m.Content.AsSpan(0, MaxMessageLength), "...")
                        : m.Content;
                    return $"[{(m.Type == ChatMessageType.Visitor ? "User" : "You")}]: {content}";
                });

            var conversationContext = string.Join("\n", truncatedMessages);
            if (conversationContext.Length > MaxTotalHistoryLength)
            {
                // Keep the most recent messages by taking the end of the string
                var startIndex = conversationContext.Length - MaxTotalHistoryLength;
                conversationContext = conversationContext[startIndex..];

                // Find the first complete message marker to avoid cutting mid-message
                var firstMarker = conversationContext.IndexOf("\n[", StringComparison.Ordinal);
                if (firstMarker > 0)
                {
                    conversationContext = conversationContext[(firstMarker + 1)..];
                }
            }

            var memoryOverrideInstructions = BuildMemoryOverrideInstructions(capturedData);

            // Step 4: Build system prompt with RAG context from knowledge base
            // Pass capturedData so the prompt can conditionally skip capture instructions
            var baseSystemPrompt = await BuildWebChatSystemPromptAsync(
                businessId,
                inboundMessage.Content,
                capturedData,
                cancellationToken);

            // CRITICAL: PREPEND memory override instructions to ensure they take precedence
            var systemPrompt = memoryOverrideInstructions + baseSystemPrompt;

            // Add conversation history at the end for context
            if (!string.IsNullOrWhiteSpace(conversationContext))
            {
                systemPrompt += $"\n\nCONVERSATION HISTORY:\n{conversationContext}";
            }

            // Step 5: Create message ID upfront for streaming
            var messageId = Guid.NewGuid();

            // Step 6: Generate AI response with STREAMING for faster perceived response
            // PERFORMANCE: Streaming shows first token in ~200ms vs 1-2s for full response
            var responseBuilder = new System.Text.StringBuilder();
            var tokenCount = 0;

            await foreach (var token in _openAIService.GenerateCompletionStreamAsync(
                inboundMessage.Content,
                systemPrompt,
                maxTokens: 300,
                temperature: 0.7f,
                cancellationToken))
            {
                responseBuilder.Append(token);
                tokenCount++;

                // Stream token to client via SignalR (every token for smooth display)
                await _chatHubNotifier.BroadcastAIStreamTokenAsync(
                    chatSessionId,
                    messageId,
                    token,
                    isComplete: false,
                    cancellationToken);
            }

            var aiResponse = responseBuilder.ToString();

            // Signal streaming complete
            await _chatHubNotifier.BroadcastAIStreamTokenAsync(
                chatSessionId,
                messageId,
                string.Empty,
                isComplete: true,
                cancellationToken);

            // Estimate token usage
            var inputTokens = (systemPrompt.Length + inboundMessage.Content.Length) / 4;
            var outputTokens = aiResponse.Length / 4;
            var estimatedCost = (inputTokens / 1000m * 0.0003m) + (outputTokens / 1000m * 0.0012m);

            // Step 8: Track OpenAI usage (pass null for conversationId since WebChat uses ChatSession, not Conversation)
            var modelSelection = _modelSelector.SelectModel(AITaskType.AutoResponse, businessId);
            await _usageTrackingService.TrackOpenAIUsageAsync(
                businessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "webchat_response",
                null, // No Conversation entity for WebChat - uses ChatSession instead
                null, // MessageId also nullable for WebChat
                null,
                cancellationToken);

            // Step 9: Store the AI response as a ChatMessage
            var aiChatMessage = new ChatMessage
            {
                Id = messageId,
                BusinessId = businessId,
                ChatSessionId = chatSessionId,
                Content = aiResponse,
                Type = ChatMessageType.AI,
                SenderId = "ai",
                SenderName = "QualiflowAI",
                SentAt = DateTime.UtcNow,
            };

            await _chatMessageRepository.AddAsync(aiChatMessage, cancellationToken);

            // Step 10: Broadcast final AI response via SignalR (for clients that missed streaming)
            var messageDto = new ChatMessageDto
            {
                Id = aiChatMessage.Id,
                ChatSessionId = chatSessionId,
                Content = aiChatMessage.Content,
                Type = aiChatMessage.Type.ToString(),
                SenderId = aiChatMessage.SenderId,
                SenderName = aiChatMessage.SenderName,
                SentAt = aiChatMessage.SentAt,
                IsRead = aiChatMessage.IsRead,
                ReadAt = aiChatMessage.ReadAt,
            };

            await _chatHubNotifier.BroadcastAIResponseAsync(chatSessionId, messageDto, cancellationToken);

            // Step 11: Increment usage counters
            await _usageLimitService.IncrementAiInteractionsAsync(businessId, cancellationToken);

            LogWebChatResponseGenerated(businessId, chatSessionId, aiChatMessage.Id);

            return AIAutoResponseResult.Succeeded(
                aiResponse,
                aiChatMessage.Id,
                inputTokens + outputTokens,
                estimatedCost,
                null,
                null);
        }
        catch (Exception ex)
        {
            LogWebChatProcessingError(businessId, chatSessionId, ex.Message, ex);
            return AIAutoResponseResult.Failed($"Error processing WebChat response: {ex.Message}");
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "WebChat session not found for business {BusinessId}, session {SessionId}")]
    private partial void LogWebChatSessionNotFound(Guid businessId, Guid sessionId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "WebChat message not found for business {BusinessId}, message {MessageId}")]
    private partial void LogWebChatMessageNotFound(Guid businessId, Guid messageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "WebChat AI response generated for business {BusinessId}, session {SessionId}, response {ResponseId}")]
    private partial void LogWebChatResponseGenerated(Guid businessId, Guid sessionId, Guid responseId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error processing WebChat response for business {BusinessId}, session {SessionId}: {Error}")]
    private partial void LogWebChatProcessingError(Guid businessId, Guid sessionId, string error, Exception ex);

    private async Task<IEnumerable<string>> GetConversationContextAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var messages = await _messageRepository.GetAllAsync(
            businessId,
            conversationId,
            skip: 0,
            take: 10, // Last 10 messages for context
            cancellationToken);

        return messages
            .OrderBy(m => m.SentAt)
            .Select(m => $"[{(m.Direction == MessageDirection.Inbound ? "Customer" : "Agent")}]: {m.Content}");
    }

    [GeneratedRegex(@"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 100)]
    private static partial Regex EmailRegex();

    [GeneratedRegex(@"(?:my name is|i'm|i am|it's|this is|call me)\s+(?<name>[A-Za-z]+(?:\s+[A-Za-z]+)?)", RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 100)]
    private static partial Regex NamePhraseRegex();

    [GeneratedRegex(@"^(?<name>[A-Z][a-z]+)$", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 100)]
    private static partial Regex SingleNameRegex();

    [GeneratedRegex(@"^(?<name>[A-Z][a-z]+\s+[A-Z][a-z]+)$", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 100)]
    private static partial Regex FullNameRegex();

    [GeneratedRegex(@"^[A-Za-z\s]+$", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 100)]
    private static partial Regex NameValidationRegex();

    private static string? TryExtractName(string content)
    {
        var trimmedContent = content.Trim();

        // Try phrase patterns first: "My name is X", "I'm X", etc.
        var phraseMatch = NamePhraseRegex().Match(trimmedContent);
        if (phraseMatch.Success && phraseMatch.Groups["name"].Success)
        {
            var name = phraseMatch.Groups["name"].Value.Trim();
            if (IsValidName(name))
            {
                return name;
            }
        }

        // Try single capitalized name
        var singleMatch = SingleNameRegex().Match(trimmedContent);
        if (singleMatch.Success && singleMatch.Groups["name"].Success)
        {
            var name = singleMatch.Groups["name"].Value.Trim();
            if (IsValidName(name))
            {
                return name;
            }
        }

        // Try first and last name
        var fullMatch = FullNameRegex().Match(trimmedContent);
        if (fullMatch.Success && fullMatch.Groups["name"].Success)
        {
            var name = fullMatch.Groups["name"].Value.Trim();
            if (IsValidName(name))
            {
                return name;
            }
        }

        return null;
    }

    private static bool IsValidName(string potentialName)
    {
        return potentialName.Length >= 2 &&
               potentialName.Length <= 30 &&
               NameValidationRegex().IsMatch(potentialName);
    }

    /// <summary>
    /// Extracts captured user data from conversation history for memory override.
    /// </summary>
    private static CapturedUserData ExtractCapturedUserData(IReadOnlyList<ChatMessage> conversationHistory)
    {
        var data = new CapturedUserData();
        var visitorMessages = conversationHistory
            .Where(m => m.Type == ChatMessageType.Visitor)
            .Select(m => m.Content)
            .ToList();

        foreach (var content in visitorMessages)
        {
            // Extract email
            if (string.IsNullOrEmpty(data.Email))
            {
                var emailMatch = EmailRegex().Match(content);
                if (emailMatch.Success)
                {
                    data.Email = emailMatch.Value;
                }
            }

            // Extract name
            if (string.IsNullOrEmpty(data.Name))
            {
                data.Name = TryExtractName(content);
            }

            // Check for waitlist agreement
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
                    lowerContent == "sounds good" ||
                    lowerContent == "go ahead" ||
                    lowerContent == "let's do it" ||
                    lowerContent == "i'm in" ||
                    lowerContent == "im in" ||
                    lowerContent == "for sure" ||
                    lowerContent == "why not" ||
                    lowerContent == "of course" ||
                    lowerContent.StartsWith("yes,", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("yes!", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("yes ", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("sure,", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("sure!", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("sounds good", StringComparison.Ordinal) ||
                    lowerContent.StartsWith("go ahead", StringComparison.Ordinal) ||
                    lowerContent.Contains("sign me up", StringComparison.Ordinal) ||
                    lowerContent.Contains("add me", StringComparison.Ordinal) ||
                    lowerContent.Contains("i'd like to join", StringComparison.Ordinal) ||
                    lowerContent.Contains("i would like to join", StringComparison.Ordinal) ||
                    lowerContent.Contains("please add me", StringComparison.Ordinal) ||
                    lowerContent.Contains("put me on", StringComparison.Ordinal) ||
                    lowerContent.Contains("count me in", StringComparison.Ordinal) ||
                    lowerContent.Contains("i'm interested", StringComparison.Ordinal) ||
                    lowerContent.Contains("im interested", StringComparison.Ordinal) ||
                    lowerContent.Contains("let's do it", StringComparison.Ordinal) ||
                    lowerContent.Contains("sounds great", StringComparison.Ordinal))
                {
                    data.AgreedToWaitlist = true;
                }
            }

            // Email provision implies waitlist agreement
            if (!data.AgreedToWaitlist && !string.IsNullOrEmpty(data.Email))
            {
                data.AgreedToWaitlist = true;
            }
        }

        return data;
    }

    /// <summary>
    /// Builds memory override instructions to PREPEND to system prompt.
    /// </summary>
    private static string BuildMemoryOverrideInstructions(CapturedUserData data)
    {
        // Only add override if we have captured data
        if (string.IsNullOrEmpty(data.Name) && string.IsNullOrEmpty(data.Email) && !data.AgreedToWaitlist)
        {
            return string.Empty;
        }

        var sb = new System.Text.StringBuilder();
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

    private async Task<TwilioSmsResultDto> SendResponseAsync(
        Conversation conversation,
        string response,
        string channel,
        CancellationToken cancellationToken)
    {
        // Get the channel configuration
        if (!conversation.ChannelId.HasValue)
        {
            return new TwilioSmsResultDto
            {
                MessageSid = string.Empty,
                Status = "failed",
                ToPhoneNumber = string.Empty,
                FromPhoneNumber = string.Empty,
                Body = response,
                Success = false,
                ErrorMessage = "Conversation has no channel configured",
            };
        }

        var channelConfig = await _channelRepository.GetByIdAsync(conversation.ChannelId.Value, cancellationToken);
        if (channelConfig == null)
        {
            return new TwilioSmsResultDto
            {
                MessageSid = string.Empty,
                Status = "failed",
                ToPhoneNumber = string.Empty,
                FromPhoneNumber = string.Empty,
                Body = response,
                Success = false,
                ErrorMessage = "Channel configuration not found",
            };
        }

        // Handle Meta channels (Facebook/Instagram)
        var upperChannel = channel.ToUpperInvariant();
        if (upperChannel is "FACEBOOK" or "INSTAGRAM")
        {
            return await SendMetaResponseAsync(channelConfig, conversation, response, cancellationToken);
        }

        // Handle Twilio channels (SMS/WhatsApp)
        var lead = await _leadRepository.GetByIdForBusinessAsync(conversation.BusinessId, conversation.LeadId, cancellationToken);
        if (lead == null)
        {
            return new TwilioSmsResultDto
            {
                MessageSid = string.Empty,
                Status = "failed",
                ToPhoneNumber = string.Empty,
                FromPhoneNumber = string.Empty,
                Body = response,
                Success = false,
                ErrorMessage = "Lead not found",
            };
        }

        var request = new TwilioSendSmsRequest
        {
            ToPhoneNumber = lead.Phone ?? string.Empty,
            FromPhoneNumber = channelConfig.PhoneNumber ?? string.Empty,
            Body = response,
            SubAccountSid = channelConfig.ExternalAccountId,
        };

        return upperChannel switch
        {
            "WHATSAPP" => await _twilioService.SendWhatsAppAsync(request, cancellationToken),
            _ => await _twilioService.SendSmsAsync(request, cancellationToken),
        };
    }

    /// <summary>
    /// Sends a response via Meta (Facebook/Instagram) messaging.
    /// </summary>
    private async Task<TwilioSmsResultDto> SendMetaResponseAsync(
        Channel channelConfig,
        Conversation conversation,
        string response,
        CancellationToken cancellationToken)
    {
        // Get the page ID from channel config
        var pageId = channelConfig.ExternalId;
        if (string.IsNullOrEmpty(pageId))
        {
            return new TwilioSmsResultDto
            {
                MessageSid = string.Empty,
                Status = "failed",
                ToPhoneNumber = string.Empty,
                FromPhoneNumber = string.Empty,
                Body = response,
                Success = false,
                ErrorMessage = "Channel has no Page ID configured",
            };
        }

        // Get the recipient ID from the conversation
        // This should be stored in conversation metadata when the inbound message was received
        var recipientId = GetRecipientIdFromConversation(conversation);
        if (string.IsNullOrEmpty(recipientId))
        {
            return new TwilioSmsResultDto
            {
                MessageSid = string.Empty,
                Status = "failed",
                ToPhoneNumber = string.Empty,
                FromPhoneNumber = string.Empty,
                Body = response,
                Success = false,
                ErrorMessage = "Could not determine recipient ID for Meta message",
            };
        }

        // Send via Meta messaging service
        var result = await _metaMessagingService.SendTextMessageAsync(
            pageId,
            recipientId,
            response,
            MetaMessagingType.Response,
            cancellationToken);

        if (result.Success)
        {
            LogMetaMessageSent(conversation.BusinessId, conversation.Id, result.MessageId ?? "unknown");
            return new TwilioSmsResultDto
            {
                MessageSid = result.MessageId ?? string.Empty,
                Status = "sent",
                ToPhoneNumber = recipientId,
                FromPhoneNumber = pageId,
                Body = response,
                Success = true,
            };
        }

        return new TwilioSmsResultDto
        {
            MessageSid = string.Empty,
            Status = "failed",
            ToPhoneNumber = recipientId,
            FromPhoneNumber = pageId,
            Body = response,
            Success = false,
            ErrorMessage = result.ErrorMessage,
        };
    }

    /// <summary>
    /// Extracts the recipient ID (PSID/IGSID) from the conversation.
    /// </summary>
    private static string? GetRecipientIdFromConversation(Conversation conversation)
    {
        // The recipient ID should be stored in the conversation's ExternalParticipantId
        // This is set when the inbound message is received from Meta
        return conversation.ExternalParticipantId;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Meta message sent for business {BusinessId}, conversation {ConversationId}, message {MessageId}")]
    private partial void LogMetaMessageSent(Guid businessId, Guid conversationId, string messageId);

    private static decimal CalculateOpenAICost(int inputTokens, int outputTokens)
    {
        // GPT-5-mini pricing (default model) - costs are centralized in AIModelSelector
        return (inputTokens / 1000m * 0.0003m) + (outputTokens / 1000m * 0.0012m);
    }

    /// <summary>
    /// Builds context about missing BANT data for progressive questioning.
    /// </summary>
    private static MissingBantContext BuildMissingBantContext(Lead? lead)
    {
        if (lead == null)
        {
            return new MissingBantContext
            {
                MissingCategories = ["Budget", "Authority", "Need", "Timeline"],
                PriorityCategory = "Need",
                SuggestedQuestions = [
                    "What specific challenges are you looking to solve?",
                    "What budget range are you considering for this solution?",
                    "Who else is involved in the decision-making process?",
                    "When are you looking to implement a solution?",
                ],
            };
        }

        const int lowScoreThreshold = 30;
        var missingCategories = new List<string>();
        var suggestedQuestions = new List<string>();

        if (!lead.BudgetScore.HasValue || lead.BudgetScore < lowScoreThreshold)
        {
            missingCategories.Add("Budget");
            suggestedQuestions.Add("What budget range are you considering for this solution?");
        }

        if (!lead.AuthorityScore.HasValue || lead.AuthorityScore < lowScoreThreshold)
        {
            missingCategories.Add("Authority");
            suggestedQuestions.Add("Who else is involved in the decision-making process?");
        }

        if (!lead.NeedScore.HasValue || lead.NeedScore < lowScoreThreshold)
        {
            missingCategories.Add("Need");
            suggestedQuestions.Add("What specific challenges are you looking to solve?");
        }

        if (!lead.TimelineScore.HasValue || lead.TimelineScore < lowScoreThreshold)
        {
            missingCategories.Add("Timeline");
            suggestedQuestions.Add("When are you looking to implement a solution?");
        }

        // Prioritize based on what's most important for qualification
        var priorityCategory = DeterminePriorityCategory(missingCategories);

        return new MissingBantContext
        {
            MissingCategories = missingCategories,
            PriorityCategory = priorityCategory,
            SuggestedQuestions = suggestedQuestions,
        };
    }

    /// <summary>
    /// Determines the priority BANT category to focus on for progressive questioning.
    /// </summary>
    private static string? DeterminePriorityCategory(List<string> missingCategories)
    {
        if (missingCategories.Count == 0)
        {
            return null;
        }

        // Priority order: Need > Timeline > Budget > Authority
        if (missingCategories.Contains("Need"))
        {
            return "Need";
        }

        if (missingCategories.Contains("Timeline"))
        {
            return "Timeline";
        }

        if (missingCategories.Contains("Budget"))
        {
            return "Budget";
        }

        if (missingCategories.Contains("Authority"))
        {
            return "Authority";
        }

        return null;
    }

    /// <summary>
    /// Enhances the system prompt with progressive questioning instructions.
    /// </summary>
    private static string EnhancePromptWithProgressiveQuestioning(string basePrompt, MissingBantContext context)
    {
        if (context.MissingCategories.Count == 0)
        {
            return basePrompt;
        }

        var progressiveInstructions = $"""

            PROGRESSIVE QUALIFICATION INSTRUCTIONS:
            The lead is missing information in these BANT categories: {string.Join(", ", context.MissingCategories)}.
            Priority category to gather: {context.PriorityCategory ?? "None"}.

            When responding, naturally weave in ONE qualifying question to gather missing information.
            Do not ask multiple qualifying questions at once - focus on the priority category.
            Make the question feel conversational, not like a survey.

            Suggested questions (adapt to conversation context):
            {string.Join("\n", context.SuggestedQuestions.Select(q => $"- {q}"))}

            Remember: Be helpful first, qualify second. Don't make the lead feel interrogated.
            """;

        return basePrompt + progressiveInstructions;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Processing AI auto-response for business {BusinessId}, conversation {ConversationId}, message {MessageId}, channel {Channel}")]
    private partial void LogProcessingStarted(Guid businessId, Guid conversationId, Guid messageId, string channel);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usage limit exceeded for business {BusinessId}: {LimitType}")]
    private partial void LogLimitExceeded(Guid businessId, string limitType);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Inbound message not found for business {BusinessId}, message {MessageId}")]
    private partial void LogMessageNotFound(Guid businessId, Guid messageId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Conversation not found for business {BusinessId}, conversation {ConversationId}")]
    private partial void LogConversationNotFound(Guid businessId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Human handoff active for business {BusinessId}, conversation {ConversationId} - skipping AI response")]
    private partial void LogHumanHandoff(Guid businessId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to send response for business {BusinessId}, conversation {ConversationId}: {Error}")]
    private partial void LogSendFailed(Guid businessId, Guid conversationId, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "AI auto-response completed for business {BusinessId}, conversation {ConversationId}, response message {ResponseMessageId}")]
    private partial void LogProcessingCompleted(Guid businessId, Guid conversationId, Guid responseMessageId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error processing AI auto-response for business {BusinessId}, conversation {ConversationId}: {Error}")]
    private partial void LogProcessingError(Guid businessId, Guid conversationId, string error, Exception ex);

    /// <summary>
    /// Context about missing BANT data for progressive questioning.
    /// </summary>
    private sealed record MissingBantContext
    {
        public required IReadOnlyList<string> MissingCategories { get; init; }
        public string? PriorityCategory { get; init; }
        public required IReadOnlyList<string> SuggestedQuestions { get; init; }
    }

    /// <summary>
    /// Captured user data for memory override instructions.
    /// </summary>
    private sealed class CapturedUserData
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public bool AgreedToWaitlist { get; set; }
    }
}
