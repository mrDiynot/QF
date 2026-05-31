using QualiFlow.Application.Features.Onboarding.DTOs;

namespace QualiFlow.Application.Features.Onboarding.Services;

/// <summary>
/// Service implementation for industry-specific default configurations.
/// </summary>
public class IndustryDefaultsService : IIndustryDefaultsService
{
    private static readonly Dictionary<string, ScoringWeightsDto> IndustryScoringWeights = new(StringComparer.OrdinalIgnoreCase)
    {
        ["TECHNOLOGY"] = new ScoringWeightsDto { Budget = 30, Timeline = 25, Authority = 25, Need = 20 },
        ["FINANCE"] = new ScoringWeightsDto { Budget = 35, Timeline = 20, Authority = 30, Need = 15 },
        ["HEALTHCARE"] = new ScoringWeightsDto { Budget = 20, Timeline = 25, Authority = 30, Need = 25 },
        ["LEGAL"] = new ScoringWeightsDto { Budget = 25, Timeline = 20, Authority = 35, Need = 20 },
        ["REAL ESTATE"] = new ScoringWeightsDto { Budget = 35, Timeline = 30, Authority = 20, Need = 15 },
        ["RETAIL"] = new ScoringWeightsDto { Budget = 30, Timeline = 30, Authority = 15, Need = 25 },
        ["EDUCATION"] = new ScoringWeightsDto { Budget = 20, Timeline = 25, Authority = 30, Need = 25 },
        ["CONSULTING"] = new ScoringWeightsDto { Budget = 25, Timeline = 25, Authority = 25, Need = 25 },
        ["MANUFACTURING"] = new ScoringWeightsDto { Budget = 30, Timeline = 25, Authority = 25, Need = 20 },
    };

    /// <inheritdoc />
    public ConfigureAIRequest GetAIDefaultsForIndustry(string? industry)
    {
        return new ConfigureAIRequest
        {
            Persona = GetDefaultPersona(industry),
            QualificationThreshold = GetQualificationThreshold(industry),
            ScoringWeights = GetScoringWeights(industry),
            GreetingMessage = GetDefaultGreeting(industry)
        };
    }

    /// <inheritdoc />
    public int GetQualificationThreshold(string? industry)
    {
        return industry?.ToUpperInvariant() switch
        {
            "TECHNOLOGY" => 75,
            "FINANCE" => 80,
            "HEALTHCARE" => 70,
            "LEGAL" => 80,
            "REAL ESTATE" => 65,
            "RETAIL" => 60,
            "EDUCATION" => 65,
            "CONSULTING" => 75,
            "MANUFACTURING" => 70,
            _ => 70
        };
    }

    /// <inheritdoc />
    public ScoringWeightsDto GetScoringWeights(string? industry)
    {
        var key = industry?.ToUpperInvariant() ?? string.Empty;

        return IndustryScoringWeights.TryGetValue(key, out var weights)
            ? weights
            : new ScoringWeightsDto { Budget = 25, Timeline = 25, Authority = 25, Need = 25 };
    }

    /// <inheritdoc />
    public string GetDefaultPersona(string? industry)
    {
        return industry?.ToUpperInvariant() switch
        {
            "TECHNOLOGY" => "professional",
            "FINANCE" => "formal",
            "HEALTHCARE" => "professional",
            "LEGAL" => "formal",
            "REAL ESTATE" => "friendly",
            "RETAIL" => "friendly",
            "EDUCATION" => "professional",
            "CONSULTING" => "professional",
            "MANUFACTURING" => "professional",
            _ => "professional"
        };
    }

    private static string GetDefaultGreeting(string? industry)
    {
        return industry?.ToUpperInvariant() switch
        {
            "TECHNOLOGY" => "Hi! How can we help you with your technology needs today?",
            "FINANCE" => "Welcome. How may we assist you with your financial requirements?",
            "HEALTHCARE" => "Hello! How can we help you improve your healthcare operations?",
            "LEGAL" => "Good day. How may we be of service to your legal practice?",
            "REAL ESTATE" => "Hi there! Looking for the perfect property solution?",
            "RETAIL" => "Hey! What can we help you find today?",
            "EDUCATION" => "Hello! How can we support your educational institution?",
            "CONSULTING" => "Hi! What business challenge can we help you solve?",
            "MANUFACTURING" => "Hello! How can we optimize your manufacturing operations?",
            _ => "Hi! How can we help you today?"
        };
    }
}
