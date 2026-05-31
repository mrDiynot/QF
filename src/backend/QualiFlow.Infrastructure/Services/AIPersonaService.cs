using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing AI persona configuration and building system prompts.
/// </summary>
public sealed partial class AIPersonaService : IAIPersonaService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AIPersonaService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private static readonly Dictionary<string, string> PersonaDescriptions = new()
    {
        ["professional"] = "You are a professional business assistant. Maintain a formal, courteous tone. Be concise and efficient in your responses. Focus on providing accurate information and helping the customer achieve their goals.",
        ["friendly"] = "You are a warm and friendly assistant. Use a conversational, approachable tone. Show genuine interest in helping the customer. Use casual language but remain respectful and helpful.",
        ["casual"] = "You are a relaxed, easy-going assistant. Keep things light and informal. Use everyday language and don't be afraid to add a touch of personality. Still be helpful and informative.",
        ["formal"] = "You are a highly formal business representative. Use polished, professional language. Maintain decorum and precision in all communications. Address the customer with utmost respect.",
    };

    public AIPersonaService(
        QualiFlowDbContext context,
        ILogger<AIPersonaService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<AIPersonaConfiguration> GetConfigurationAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var config = await _context.Set<AIConfiguration>()
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.BusinessId == businessId, cancellationToken);

        if (config == null)
        {
            LogConfigurationNotFound(businessId);
            return GetDefaultConfiguration();
        }

        var scoringWeights = ParseScoringWeights(config.ScoringWeights);

        return new AIPersonaConfiguration
        {
            Persona = config.Persona,
            GreetingMessage = config.GreetingMessage,
            BusinessHours = config.BusinessHours,
            FollowUpPreference = config.FollowUpPreference,
            QualificationThreshold = config.QualificationThreshold,
            ScoringWeights = scoringWeights,
            UseIndustryQuestions = config.UseIndustryQuestions,
        };
    }

    /// <inheritdoc/>
    public async Task<string> BuildSystemPromptAsync(
        Guid businessId,
        string intent,
        string? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        var config = await GetConfigurationAsync(businessId, cancellationToken);
        var business = await _context.Set<Business>()
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        var businessName = business?.Name ?? "our company";
        var industry = business?.Industry ?? "general business";

        var personaDescription = PersonaDescriptions.GetValueOrDefault(config.Persona.ToLowerInvariant(), PersonaDescriptions["professional"]);

        // Fetch knowledge base entries for context
        var knowledgeBase = await GetKnowledgeBaseContextAsync(businessId, cancellationToken);

        var systemPrompt = $"""
            {personaDescription}

            You are representing {businessName}, a {industry} business.

            IMPORTANT GUIDELINES:
            1. Never reveal that you are an AI unless directly asked.
            2. Stay on topic and guide the conversation toward understanding the customer's needs.
            3. Use the KNOWLEDGE BASE below to answer questions accurately about the product/service.
            4. If you don't know something specific, acknowledge it politely and encourage them to join the waitlist or contact us.
            5. Be helpful but also try to qualify the lead by understanding their budget, authority, need, and timeline (BANT).
            6. Keep responses concise but informative. Aim for 2-3 sentences unless more detail is needed.
            7. Always encourage visitors to join the early access waitlist!
            8. PRE-LAUNCH TONE: QualiFlowAI has NOT launched yet — it is in pre-launch phase. When describing features, capabilities, and integrations, ALWAYS use future or conditional tense ("will integrate with", "is designed to support", "will offer", "will include") instead of present affirmative tense ("integrates with", "supports", "offers", "includes"). Never imply the product is live or currently operational.
            
            CURRENT CONTEXT:
            - Customer Intent: {intent}
            - Follow-up Preference: {config.FollowUpPreference}
            - Business Hours: {config.BusinessHours}
            """;

        // Add knowledge base if available
        if (!string.IsNullOrWhiteSpace(knowledgeBase))
        {
            systemPrompt += $"\n\nKNOWLEDGE BASE (use this to answer questions):\n{knowledgeBase}";
        }

        if (!string.IsNullOrWhiteSpace(conversationContext))
        {
            systemPrompt += $"\n\nCONVERSATION HISTORY:\n{conversationContext}";
        }

        LogSystemPromptBuilt(businessId, config.Persona, intent);
        return systemPrompt;
    }

    /// <summary>
    /// Gets knowledge base content for the system prompt.
    /// </summary>
    private async Task<string> GetKnowledgeBaseContextAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        var entries = await _context.Set<BusinessKnowledgeBase>()
            .AsNoTracking()
            .Where(k => k.BusinessId == businessId && k.IsActive)
            .OrderByDescending(k => k.Priority)
            .Take(15) // Limit to top 15 entries to avoid token limits
            .ToListAsync(cancellationToken);

        if (entries.Count == 0)
        {
            return string.Empty;
        }

        var sb = new System.Text.StringBuilder();
        foreach (var entry in entries)
        {
            sb.AppendLine($"Q: {entry.Title}");
            sb.AppendLine($"A: {entry.Content}");
            sb.AppendLine();
        }

        return sb.ToString();
    }

    /// <inheritdoc/>
    public async Task<string> GetGreetingMessageAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var config = await GetConfigurationAsync(businessId, cancellationToken);
        return config.GreetingMessage;
    }

    /// <inheritdoc/>
    public async Task<bool> IsWithinBusinessHoursAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var config = await GetConfigurationAsync(businessId, cancellationToken);

        if (config.BusinessHours == "24-7")
        {
            return true;
        }

        var now = DateTime.UtcNow;
        var hour = now.Hour;

        return config.BusinessHours switch
        {
            "9-5" => hour >= 9 && hour < 17,
            "8-6" => hour >= 8 && hour < 18,
            "8-8" => hour >= 8 && hour < 20,
            _ => true, // Default to always available
        };
    }

    private static AIPersonaConfiguration GetDefaultConfiguration() => new()
    {
        Persona = "professional",
        GreetingMessage = "Hi! How can we help you today?",
        BusinessHours = "9-5",
        FollowUpPreference = "sms-first",
        QualificationThreshold = 70,
        ScoringWeights = new ScoringWeights(),
        UseIndustryQuestions = true,
    };

    private static ScoringWeights ParseScoringWeights(string json)
    {
        try
        {
            var weights = JsonSerializer.Deserialize<ScoringWeights>(json, JsonOptions);
            return weights ?? new ScoringWeights();
        }
        catch
        {
            return new ScoringWeights();
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI configuration not found for business {BusinessId}, using defaults")]
    private partial void LogConfigurationNotFound(Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Built system prompt for business {BusinessId}: persona={Persona}, intent={Intent}")]
    private partial void LogSystemPromptBuilt(Guid businessId, string persona, string intent);
}
