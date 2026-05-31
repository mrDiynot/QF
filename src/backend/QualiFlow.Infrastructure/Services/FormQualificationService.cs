using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for qualifying leads from form submissions using BANT methodology.
/// Uses rule-based pattern matching for form fields with business-specific scoring weights.
/// </summary>
/// <param name="leadRepository">Repository for lead data access.</param>
/// <param name="configRepository">Repository for business scoring configuration.</param>
/// <param name="logger">The logger instance.</param>
public partial class FormQualificationService(
    ILeadRepository leadRepository,
    IBusinessScoringConfigurationRepository configRepository,
    ILogger<FormQualificationService> logger) : IFormQualificationService
{
    private const int DefaultQualificationThreshold = 70;

    /// <inheritdoc />
    public async Task<FormQualificationResult> QualifyFormSubmissionAsync(
        FormQualificationRequest request,
        CancellationToken cancellationToken = default)
    {
        LogQualifyingFormSubmission(request.SubmissionId, request.BusinessId);

        // Get business-specific scoring configuration
        var scoringConfig = await configRepository.GetByBusinessIdAsync(request.BusinessId, cancellationToken);
        var qualificationThreshold = scoringConfig?.QualificationThreshold ?? DefaultQualificationThreshold;

        // Calculate weights from business config (normalized to sum to 1.0)
        var (budgetWeight, authorityWeight, needWeight, timelineWeight) = GetBantWeights(scoringConfig);

        var extractions = ExtractBantFromFormFields(request.SubmittedDataJson, request.FormFieldsJson);

        var (budgetScore, budgetSignals) = AggregateCategory(extractions, "Budget");
        var (authorityScore, authoritySignals) = AggregateCategory(extractions, "Authority");
        var (needScore, needSignals) = AggregateCategory(extractions, "Need");
        var (timelineScore, timelineSignals) = AggregateCategory(extractions, "Timeline");

        var overallScore = (int)(
            (budgetScore * budgetWeight) +
            (authorityScore * authorityWeight) +
            (needScore * needWeight) +
            (timelineScore * timelineWeight));

        var missingCategories = new List<string>();
        if (budgetScore < 30)
        {
            missingCategories.Add("Budget");
        }

        if (authorityScore < 30)
        {
            missingCategories.Add("Authority");
        }

        if (needScore < 30)
        {
            missingCategories.Add("Need");
        }

        if (timelineScore < 30)
        {
            missingCategories.Add("Timeline");
        }

        var result = new FormQualificationResult
        {
            OverallScore = overallScore,
            BudgetScore = budgetScore,
            BudgetSignals = budgetSignals,
            AuthorityScore = authorityScore,
            AuthoritySignals = authoritySignals,
            NeedScore = needScore,
            NeedSignals = needSignals,
            TimelineScore = timelineScore,
            TimelineSignals = timelineSignals,
            Confidence = CalculateConfidence(extractions.Count, missingCategories.Count),
            IsQualified = overallScore >= qualificationThreshold,
            Reasoning = BuildReasoning(overallScore, missingCategories, qualificationThreshold),
            MissingBantCategories = missingCategories,
            SuggestedFollowUpQuestions = GenerateFollowUpQuestions(missingCategories),
        };

        // Update lead with BANT scores if we have valid scores
        if (request.LeadId != Guid.Empty)
        {
            await UpdateLeadBantScoresAsync(
                request.BusinessId,
                request.LeadId,
                result,
                cancellationToken);
        }

        LogQualificationComplete(request.SubmissionId, result.OverallScore, result.IsQualified);

        return result;
    }

    /// <inheritdoc />
    public Task<FormQualificationResult> QualifyFormSubmissionAsync(
        Guid businessId,
        FormSubmission submission,
        Form form,
        CancellationToken cancellationToken = default)
    {
        var request = new FormQualificationRequest
        {
            BusinessId = businessId,
            SubmissionId = submission.Id,
            LeadId = submission.LeadId ?? Guid.Empty,
            SubmittedDataJson = submission.SubmittedData,
            FormFieldsJson = form.Fields,
        };

        return QualifyFormSubmissionAsync(request, cancellationToken);
    }

    /// <inheritdoc />
    public Task<FormQualificationResult> QualifyFromSubmissionDataAsync(
        Guid businessId,
        Guid submissionId,
        Guid leadId,
        string submittedDataJson,
        string formFieldsJson,
        CancellationToken cancellationToken = default)
    {
        var request = new FormQualificationRequest
        {
            BusinessId = businessId,
            SubmissionId = submissionId,
            LeadId = leadId,
            SubmittedDataJson = submittedDataJson,
            FormFieldsJson = formFieldsJson,
        };

        return QualifyFormSubmissionAsync(request, cancellationToken);
    }

    /// <inheritdoc />
    public IReadOnlyList<FormFieldBantExtraction> ExtractBantFromFormFields(string submittedDataJson, string formFieldsJson)
    {
        var extractions = new List<FormFieldBantExtraction>();

        // Parse form field definitions to get explicit BANT mappings (from AI-generated forms)
        var fieldBantMappings = ParseFieldBantMappings(formFieldsJson);

        try
        {
            using var submittedData = JsonDocument.Parse(submittedDataJson);
            foreach (var property in submittedData.RootElement.EnumerateObject())
            {
                var fieldKey = property.Name;
                var value = property.Value.ToString();

                if (string.IsNullOrWhiteSpace(value))
                {
                    continue;
                }

                // First, check for explicit BANT mapping from AI-generated form fields
                if (fieldBantMappings.TryGetValue(fieldKey, out var explicitMapping) &&
                    !string.IsNullOrEmpty(explicitMapping))
                {
                    var score = ScoreFieldValue(explicitMapping, value);
                    extractions.Add(new FormFieldBantExtraction
                    {
                        FieldKey = fieldKey,
                        Value = value,
                        BantCategory = explicitMapping,
                        ScoreContribution = score,
                        MatchedPattern = "ai_explicit_mapping",
                    });
                    continue;
                }

                // Fall back to pattern-based classification
                var (category, patternScore, pattern) = ClassifyField(fieldKey, value);
                if (!string.IsNullOrEmpty(category))
                {
                    extractions.Add(new FormFieldBantExtraction
                    {
                        FieldKey = fieldKey,
                        Value = value,
                        BantCategory = category,
                        ScoreContribution = patternScore,
                        MatchedPattern = pattern,
                    });
                }
            }
        }
        catch (JsonException ex)
        {
            LogJsonParseError(ex.Message);
        }

        return extractions;
    }

    /// <summary>
    /// Parses form field definitions to extract explicit BANT mappings.
    /// AI-generated forms store bantMapping property on each field.
    /// </summary>
    private static Dictionary<string, string> ParseFieldBantMappings(string formFieldsJson)
    {
        var mappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(formFieldsJson))
        {
            return mappings;
        }

        try
        {
            using var doc = JsonDocument.Parse(formFieldsJson);

            // Handle both array format and object format
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var field in doc.RootElement.EnumerateArray())
                {
                    ExtractFieldMapping(field, mappings);
                }
            }
            else if (doc.RootElement.ValueKind == JsonValueKind.Object)
            {
                // Handle object format where keys are field IDs
                foreach (var property in doc.RootElement.EnumerateObject())
                {
                    if (property.Value.ValueKind == JsonValueKind.Object)
                    {
                        ExtractFieldMapping(property.Value, mappings, property.Name);
                    }
                }
            }
        }
        catch (JsonException)
        {
            // Ignore parse errors, fall back to pattern matching
        }

        return mappings;
    }

    /// <summary>
    /// Extracts BANT mapping from a single field element.
    /// </summary>
    private static void ExtractFieldMapping(JsonElement field, Dictionary<string, string> mappings, string? fallbackKey = null)
    {
        // Get field identifier (could be 'name', 'id', 'label', or the property key)
        var fieldKey = fallbackKey;
        if (field.TryGetProperty("name", out var nameProp) && nameProp.ValueKind == JsonValueKind.String)
        {
            fieldKey = nameProp.GetString();
        }
        else if (field.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String)
        {
            fieldKey = idProp.GetString();
        }
        else if (field.TryGetProperty("label", out var labelProp) && labelProp.ValueKind == JsonValueKind.String)
        {
            // Use label as fallback key for matching
            fieldKey = labelProp.GetString();
        }

        if (string.IsNullOrEmpty(fieldKey))
        {
            return;
        }

        // Check for bantMapping property (AI-generated forms)
        if (field.TryGetProperty("bantMapping", out var bantProp) && bantProp.ValueKind == JsonValueKind.String)
        {
            var bantCategory = bantProp.GetString();
            if (!string.IsNullOrEmpty(bantCategory) && IsValidBantCategory(bantCategory))
            {
                mappings[fieldKey] = bantCategory;
            }
        }
    }

    /// <summary>
    /// Validates that a string is a valid BANT category.
    /// </summary>
    private static bool IsValidBantCategory(string category)
    {
        return category.Equals("Budget", StringComparison.OrdinalIgnoreCase) ||
               category.Equals("Authority", StringComparison.OrdinalIgnoreCase) ||
               category.Equals("Need", StringComparison.OrdinalIgnoreCase) ||
               category.Equals("Timeline", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Scores a field value based on explicit BANT category.
    /// </summary>
    private static int ScoreFieldValue(string bantCategory, string value)
    {
        return bantCategory.ToUpperInvariant() switch
        {
            "BUDGET" => ScoreBudgetValue(value),
            "AUTHORITY" => ScoreAuthorityValue(value),
            "NEED" => ScoreNeedValue(value),
            "TIMELINE" => ScoreTimelineValue(value),
            _ => 50, // Default moderate score for explicit mapping
        };
    }

    /// <summary>
    /// Gets normalized BANT weights from business configuration.
    /// </summary>
    private static (double budget, double authority, double need, double timeline) GetBantWeights(
        BusinessScoringConfiguration? config)
    {
        if (config == null)
        {
            // Default weights if no config
            return (0.25, 0.25, 0.25, 0.25);
        }

        var total = config.BudgetWeight + config.AuthorityWeight + config.NeedWeight + config.TimelineWeight;
        if (total == 0)
        {
            return (0.25, 0.25, 0.25, 0.25);
        }

        return (
            config.BudgetWeight / (double)total,
            config.AuthorityWeight / (double)total,
            config.NeedWeight / (double)total,
            config.TimelineWeight / (double)total);
    }

    private static (string category, int score, string? pattern) ClassifyField(string fieldKey, string value)
    {
        var normalizedKey = fieldKey.ToLowerInvariant().Replace("-", "_", StringComparison.Ordinal).Replace(" ", "_", StringComparison.Ordinal);

        // Budget patterns
        if (normalizedKey.Contains("budget", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("spending", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("investment", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("price", StringComparison.OrdinalIgnoreCase))
        {
            return ("Budget", ScoreBudgetValue(value), "budget_pattern");
        }

        // Authority patterns
        if (normalizedKey.Contains("title", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("role", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("position", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("department", StringComparison.OrdinalIgnoreCase))
        {
            return ("Authority", ScoreAuthorityValue(value), "authority_pattern");
        }

        // Need patterns
        if (normalizedKey.Contains("need", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("challenge", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("problem", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("goal", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("interest", StringComparison.OrdinalIgnoreCase))
        {
            return ("Need", ScoreNeedValue(value), "need_pattern");
        }

        // Timeline patterns
        if (normalizedKey.Contains("timeline", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("when", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("timeframe", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("urgency", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.Contains("deadline", StringComparison.OrdinalIgnoreCase))
        {
            return ("Timeline", ScoreTimelineValue(value), "timeline_pattern");
        }

        return (category: string.Empty, score: 0, pattern: null);
    }

    private static (int score, IReadOnlyList<string> signals) AggregateCategory(
        IReadOnlyList<FormFieldBantExtraction> extractions,
        string category)
    {
        var categoryExtractions = extractions.Where(e => e.BantCategory == category).ToList();
        if (categoryExtractions.Count == 0)
        {
            return (0, []);
        }

        var maxScore = categoryExtractions.Max(e => e.ScoreContribution);
        var signals = categoryExtractions.Select(e => $"{e.FieldKey}: {e.Value}").ToList();

        return (maxScore, signals);
    }

    private static int ScoreBudgetValue(string value)
    {
        var lowerValue = value.ToLowerInvariant();

        // High budget indicators
        if (ContainsPattern(lowerValue, @"\$\d{5,}") ||
            lowerValue.Contains("enterprise", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("unlimited", StringComparison.OrdinalIgnoreCase))
        {
            return 90;
        }

        // Medium budget indicators
        if (ContainsPattern(lowerValue, @"\$\d{4}") ||
            lowerValue.Contains("professional", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("business", StringComparison.OrdinalIgnoreCase))
        {
            return 70;
        }

        // Low budget indicators
        if (ContainsPattern(lowerValue, @"\$\d{1,3}") ||
            lowerValue.Contains("starter", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("free", StringComparison.OrdinalIgnoreCase))
        {
            return 30;
        }

        // Has some budget info
        if (!string.IsNullOrWhiteSpace(value))
        {
            return 50;
        }

        return 0;
    }

    private static int ScoreAuthorityValue(string value)
    {
        var lowerValue = value.ToLowerInvariant();

        // C-level executives
        if (ContainsPattern(lowerValue, @"\b(ceo|cto|cfo|coo|cmo|cio)\b") ||
            lowerValue.Contains("chief", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("president", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("owner", StringComparison.OrdinalIgnoreCase))
        {
            return 95;
        }

        // VP/Director level
        if (ContainsPattern(lowerValue, @"\b(vp|vice president|director)\b") ||
            lowerValue.Contains("head of", StringComparison.OrdinalIgnoreCase))
        {
            return 85;
        }

        // Manager level
        if (lowerValue.Contains("manager", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("lead", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("supervisor", StringComparison.OrdinalIgnoreCase))
        {
            return 70;
        }

        // Individual contributor
        if (!string.IsNullOrWhiteSpace(value))
        {
            return 40;
        }

        return 0;
    }

    private static int ScoreNeedValue(string value)
    {
        var lowerValue = value.ToLowerInvariant();

        // Urgent/critical need
        if (lowerValue.Contains("urgent", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("critical", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("immediately", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("asap", StringComparison.OrdinalIgnoreCase))
        {
            return 95;
        }

        // Clear need expressed
        if (lowerValue.Contains("need", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("require", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("looking for", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("want", StringComparison.OrdinalIgnoreCase))
        {
            return 75;
        }

        // Interest expressed
        if (lowerValue.Contains("interested", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("curious", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("exploring", StringComparison.OrdinalIgnoreCase))
        {
            return 50;
        }

        // Has some content
        if (!string.IsNullOrWhiteSpace(value))
        {
            return 40;
        }

        return 0;
    }

    private static int ScoreTimelineValue(string value)
    {
        var lowerValue = value.ToLowerInvariant();

        // Immediate timeline
        if (lowerValue.Contains("immediately", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("asap", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("this week", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("urgent", StringComparison.OrdinalIgnoreCase))
        {
            return 95;
        }

        // Short-term timeline
        if (lowerValue.Contains("this month", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("next month", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("30 days", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("1 month", StringComparison.OrdinalIgnoreCase))
        {
            return 80;
        }

        // Medium-term timeline
        if (lowerValue.Contains("quarter", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("3 months", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("90 days", StringComparison.OrdinalIgnoreCase))
        {
            return 60;
        }

        // Long-term timeline
        if (lowerValue.Contains("year", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("6 months", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("next year", StringComparison.OrdinalIgnoreCase))
        {
            return 40;
        }

        // Just researching
        if (lowerValue.Contains("research", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("no timeline", StringComparison.OrdinalIgnoreCase) ||
            lowerValue.Contains("not sure", StringComparison.OrdinalIgnoreCase))
        {
            return 20;
        }

        if (!string.IsNullOrWhiteSpace(value))
        {
            return 30;
        }

        return 0;
    }

    private static bool ContainsPattern(string input, string pattern)
    {
        try
        {
            return Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase, TimeSpan.FromSeconds(1));
        }
        catch (RegexMatchTimeoutException)
        {
            return false;
        }
    }

    private static float CalculateConfidence(int extractionCount, int missingCategoryCount)
    {
        if (extractionCount == 0)
        {
            return 0.1f;
        }

        var baseConfidence = Math.Min(extractionCount * 0.15f, 0.6f);
        var categoryPenalty = missingCategoryCount * 0.1f;

        return Math.Max(0.1f, Math.Min(1.0f, baseConfidence + 0.4f - categoryPenalty));
    }

    private static string BuildReasoning(int overallScore, List<string> missingCategories, int qualificationThreshold)
    {
        var sb = new System.Text.StringBuilder();
        sb.Append(CultureInfo.InvariantCulture, $"Overall qualification score: {overallScore}/100 (threshold: {qualificationThreshold}). ");

        if (overallScore >= qualificationThreshold)
        {
            sb.Append("Lead meets qualification threshold. ");
        }
        else
        {
            sb.Append("Lead does not meet qualification threshold. ");
        }

        if (missingCategories.Count > 0)
        {
            sb.Append(CultureInfo.InvariantCulture, $"Missing BANT data for: {string.Join(", ", missingCategories)}.");
        }
        else
        {
            sb.Append("All BANT categories have data.");
        }

        return sb.ToString();
    }

    private static List<string> GenerateFollowUpQuestions(List<string> missingCategories)
    {
        var questions = new List<string>();

        foreach (var category in missingCategories)
        {
            var question = category switch
            {
                "Budget" => "What budget range are you considering for this solution?",
                "Authority" => "Who else is involved in the decision-making process?",
                "Need" => "What specific challenges are you looking to solve?",
                "Timeline" => "When are you looking to implement a solution?",
                _ => null,
            };

            if (question != null)
            {
                questions.Add(question);
            }
        }

        return questions;
    }

    /// <inheritdoc />
    public IReadOnlyList<string> GetSuggestedFollowUpQuestions(FormQualificationResult result)
    {
        return result.SuggestedFollowUpQuestions;
    }

    /// <summary>
    /// Updates the lead entity with BANT scores from form qualification.
    /// </summary>
    private async Task UpdateLeadBantScoresAsync(
        Guid businessId,
        Guid leadId,
        FormQualificationResult result,
        CancellationToken cancellationToken)
    {
        try
        {
            var lead = await leadRepository.GetByIdForBusinessAsync(businessId, leadId, cancellationToken);
            if (lead == null)
            {
                LogLeadNotFound(leadId, businessId);
                return;
            }

            // Update BANT scores
            lead.BudgetScore = result.BudgetScore;
            lead.AuthorityScore = result.AuthorityScore;
            lead.NeedScore = result.NeedScore;
            lead.TimelineScore = result.TimelineScore;

            // Update overall score if this is the first scoring (no prior score set)
            // or if the form score is higher than the current score
            if (lead.Score == 0 || result.OverallScore > lead.Score)
            {
                lead.Score = result.OverallScore;
            }

            // Update status based on qualification if still in New status
            if (lead.Status == LeadStatus.New)
            {
                lead.Status = result.IsQualified ? LeadStatus.Qualified : LeadStatus.Contacted;
            }

            lead.UpdatedAt = DateTime.UtcNow;

            await leadRepository.UpdateForBusinessAsync(businessId, lead, cancellationToken);
            LogLeadBantScoresUpdated(leadId, result.OverallScore);
        }
        catch (Exception ex)
        {
            // Don't fail the qualification if lead update fails
            LogLeadUpdateError(leadId, ex.Message);
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Qualifying form submission {SubmissionId} for business {BusinessId}")]
    private partial void LogQualifyingFormSubmission(Guid submissionId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Form qualification complete for {SubmissionId}: Score={Score}, IsQualified={IsQualified}")]
    private partial void LogQualificationComplete(Guid submissionId, int score, bool isQualified);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse form submission JSON: {Error}")]
    private partial void LogJsonParseError(string error);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Lead {LeadId} not found for business {BusinessId} during form qualification")]
    private partial void LogLeadNotFound(Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated lead {LeadId} BANT scores from form qualification: Score={Score}")]
    private partial void LogLeadBantScoresUpdated(Guid leadId, int score);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to update lead {LeadId} with BANT scores: {Error}")]
    private partial void LogLeadUpdateError(Guid leadId, string error);
}
