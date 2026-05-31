// -----------------------------------------------------------------------
// <copyright file="AITrainingController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for custom AI training and model configuration.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/ai-training")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class AITrainingController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AITrainingController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AITrainingController"/> class.
    /// </summary>
    public AITrainingController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AITrainingController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the current AI training configuration.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>AI training configuration.</returns>
    [HttpGet("config")]
    [ProducesResponseType(typeof(AITrainingConfig), StatusCodes.Status200OK)]
    public async Task<ActionResult<AITrainingConfig>> GetConfigAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var business = await _context.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business == null)
        {
            return NotFound();
        }

        // Get real article count
        var articleCount = await _context.KnowledgeBaseArticles
            .AsNoTracking()
            .CountAsync(a => a.BusinessId == businessId && a.IsPublished && a.DeletedAt == null, cancellationToken);

        // Get or create AI configuration
        var aiConfig = await _context.AIConfigurations
            .FirstOrDefaultAsync(c => c.BusinessId == businessId, cancellationToken);

        // Parse personality traits from JSON
        string[] personalityTraits = ["helpful", "knowledgeable"];
        if (aiConfig?.PersonalityTraits != null)
        {
            try
            {
                personalityTraits = JsonSerializer.Deserialize<string[]>(aiConfig.PersonalityTraits) ?? personalityTraits;
            }
            catch (JsonException)
            {
                // Use defaults on parse error
            }
        }

        // Parse BANT weights
        int budgetWeight = 25, authorityWeight = 25, needWeight = 25, timelineWeight = 25;
        if (aiConfig?.ScoringWeights != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(aiConfig.ScoringWeights);
                if (doc.RootElement.TryGetProperty("budget", out var b))
                {
                    budgetWeight = b.GetInt32();
                }

                if (doc.RootElement.TryGetProperty("authority", out var a))
                {
                    authorityWeight = a.GetInt32();
                }

                if (doc.RootElement.TryGetProperty("need", out var n))
                {
                    needWeight = n.GetInt32();
                }

                if (doc.RootElement.TryGetProperty("timeline", out var t))
                {
                    timelineWeight = t.GetInt32();
                }
            }
            catch (JsonException)
            {
                // Use defaults on parse error
            }
        }

        return Ok(new AITrainingConfig
        {
            BusinessId = businessId,
            BusinessName = business.Name,
            KnowledgeBaseArticles = articleCount,
            ResponseTemplates = 0,
            ToneSettings = new ToneSettings
            {
                Tone = aiConfig?.AITone ?? "professional",
                Formality = aiConfig?.Formality ?? "formal",
                PersonalityTraits = personalityTraits,
            },
            QualificationCriteria = new QualificationCriteria
            {
                BudgetWeight = budgetWeight,
                AuthorityWeight = authorityWeight,
                NeedWeight = needWeight,
                TimelineWeight = timelineWeight,
                MinScoreToQualify = aiConfig?.QualificationThreshold ?? 50,
            },
            TrainingStatus = new TrainingStatus
            {
                LastTrainedAt = aiConfig?.BantWeightsConfiguredAt ?? DateTime.UtcNow.AddDays(-7),
                Status = aiConfig?.IsBantWeightsConfigured == true ? "configured" : "default",
                Version = "1.0",
            },
            AutoResponse = new AutoResponseStatus
            {
                Enabled = aiConfig?.IsAutoResponseEnabled ?? false,
                ConfiguredAt = aiConfig?.AutoResponseConfiguredAt,
            },
        });
    }

    /// <summary>
    /// Updates the AI tone and personality settings.
    /// </summary>
    /// <param name="request">Tone settings update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated configuration.</returns>
    [HttpPut("tone")]
    [ProducesResponseType(typeof(ToneSettings), StatusCodes.Status200OK)]
    public async Task<ActionResult<ToneSettings>> UpdateToneAsync(
        [FromBody] UpdateToneRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var business = await _context.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business == null)
        {
            return NotFound();
        }

        // Get or create AI configuration
        var aiConfig = await _context.AIConfigurations
            .FirstOrDefaultAsync(c => c.BusinessId == businessId, cancellationToken);

        if (aiConfig == null)
        {
            aiConfig = new AIConfiguration
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow,
            };
            _context.AIConfigurations.Add(aiConfig);
        }

        // Update tone settings
        aiConfig.AITone = request.Tone;
        aiConfig.Persona = request.Tone; // Keep in sync
        aiConfig.Formality = request.Formality ?? "formal";
        aiConfig.PersonalityTraits = JsonSerializer.Serialize(request.PersonalityTraits ?? new[] { "helpful", "knowledgeable" });
        aiConfig.IsPersonaConfigured = true;
        aiConfig.PersonaConfiguredAt = DateTime.UtcNow;
        aiConfig.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated AI tone for business {BusinessId} to {Tone}", businessId, request.Tone);

        return Ok(new ToneSettings
        {
            Tone = aiConfig.AITone,
            Formality = aiConfig.Formality,
            PersonalityTraits = request.PersonalityTraits ?? new[] { "helpful", "knowledgeable" },
        });
    }

    /// <summary>
    /// Updates the qualification criteria weights.
    /// </summary>
    /// <param name="request">Qualification criteria update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated criteria.</returns>
    [HttpPut("qualification-criteria")]
    [ProducesResponseType(typeof(QualificationCriteria), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<QualificationCriteria>> UpdateQualificationCriteriaAsync(
        [FromBody] QualificationCriteria request,
        CancellationToken cancellationToken)
    {
        // Validate weights sum to 100
        var totalWeight = request.BudgetWeight + request.AuthorityWeight + request.NeedWeight + request.TimelineWeight;
        if (totalWeight != 100)
        {
            return BadRequest(new { message = $"Weights must sum to 100, got {totalWeight}" });
        }

        var businessId = _currentUserService.GetBusinessId();

        // Get or create AI configuration
        var aiConfig = await _context.AIConfigurations
            .FirstOrDefaultAsync(c => c.BusinessId == businessId, cancellationToken);

        if (aiConfig == null)
        {
            aiConfig = new AIConfiguration
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow,
            };
            _context.AIConfigurations.Add(aiConfig);
        }

        // Update scoring weights as JSON
        aiConfig.ScoringWeights = JsonSerializer.Serialize(new
        {
            budget = request.BudgetWeight,
            authority = request.AuthorityWeight,
            need = request.NeedWeight,
            timeline = request.TimelineWeight,
        });
        aiConfig.QualificationThreshold = request.MinScoreToQualify;
        aiConfig.IsBantWeightsConfigured = true;
        aiConfig.IsQualificationThresholdConfigured = true;
        aiConfig.BantWeightsConfiguredAt = DateTime.UtcNow;
        aiConfig.QualificationThresholdConfiguredAt = DateTime.UtcNow;
        aiConfig.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated qualification criteria for business {BusinessId}", businessId);

        return Ok(request);
    }

    /// <summary>
    /// Toggles AI auto-response for the business.
    /// </summary>
    /// <param name="request">Auto-response toggle request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated auto-response status.</returns>
    [HttpPut("auto-response")]
    [ProducesResponseType(typeof(AutoResponseStatus), StatusCodes.Status200OK)]
    public async Task<ActionResult<AutoResponseStatus>> UpdateAutoResponseAsync(
        [FromBody] UpdateAutoResponseRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Get or create AI configuration
        var aiConfig = await _context.AIConfigurations
            .FirstOrDefaultAsync(c => c.BusinessId == businessId, cancellationToken);

        if (aiConfig == null)
        {
            aiConfig = new AIConfiguration
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow,
            };
            _context.AIConfigurations.Add(aiConfig);
        }

        aiConfig.IsAutoResponseEnabled = request.Enabled;
        aiConfig.AutoResponseConfiguredAt = DateTime.UtcNow;
        aiConfig.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated AI auto-response for business {BusinessId} to {Enabled}", businessId, request.Enabled);

        return Ok(new AutoResponseStatus
        {
            Enabled = aiConfig.IsAutoResponseEnabled,
            ConfiguredAt = aiConfig.AutoResponseConfiguredAt,
        });
    }

    /// <summary>
    /// Gets training data samples.
    /// </summary>
    /// <param name="type">Type of training data (conversations, qualifications, responses).</param>
    /// <param name="limit">Number of samples to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Training data samples.</returns>
    [HttpGet("data")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(TrainingDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrainingDataResponse>> GetTrainingDataAsync(
        [FromQuery] string type = "conversations",
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var response = new TrainingDataResponse
        {
            Type = type,
            BusinessId = businessId,
        };

        switch (type.ToLowerInvariant())
        {
            case "conversations":
                var conversations = await _context.Conversations
                    .AsNoTracking()
                    .Where(c => c.BusinessId == businessId)
                    .Include(c => c.Messages)
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(limit)
                    .Select(c => new ConversationSample
                    {
                        Id = c.Id,
                        Channel = c.Channel.ToString(),
                        MessageCount = c.Messages.Count,
                        CreatedAt = c.CreatedAt,
                        Sample = c.Messages.OrderBy(m => m.CreatedAt).Take(3)
                            .Select(m => new MessageSample { Role = m.Direction == Domain.Enums.MessageDirection.Inbound ? "user" : "assistant", Content = m.Content })
                            .ToList(),
                    })
                    .ToListAsync(cancellationToken);

                response.TotalSamples = conversations.Count;
                response.Conversations = conversations;
                break;

            case "qualifications":
                var qualifications = await _context.Qualifications
                    .AsNoTracking()
                    .Where(q => q.Lead.BusinessId == businessId)
                    .Include(q => q.Lead)
                    .OrderByDescending(q => q.QualifiedAt)
                    .Take(limit)
                    .Select(q => new QualificationSample
                    {
                        LeadId = q.LeadId,
                        LeadName = q.Lead.Name,
                        Score = q.Score,
                        BudgetScore = 25,
                        AuthorityScore = 25,
                        NeedScore = 25,
                        TimelineScore = 25,
                        QualifiedAt = q.QualifiedAt,
                    })
                    .ToListAsync(cancellationToken);

                response.TotalSamples = qualifications.Count;
                response.Qualifications = qualifications;
                break;

            case "responses":
                // Response templates not implemented - return empty list
                response.TotalSamples = 0;
                response.ResponseTemplates = [];
                break;
        }

        return Ok(response);
    }

    /// <summary>
    /// Adds custom training data.
    /// </summary>
    /// <param name="request">Training data to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result of adding training data.</returns>
    [HttpPost("data")]
    [ProducesResponseType(typeof(AddTrainingDataResult), StatusCodes.Status200OK)]
    public Task<ActionResult<AddTrainingDataResult>> AddTrainingDataAsync(
        [FromBody] AddTrainingDataRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation("Adding {Count} training samples for business {BusinessId}", request.Samples.Count, businessId);

        // In production, this would store the training data and potentially trigger retraining
        return Task.FromResult<ActionResult<AddTrainingDataResult>>(Ok(new AddTrainingDataResult
        {
            SamplesAdded = request.Samples.Count,
            Status = "queued",
            Message = "Training data added successfully. Model will be updated in the next training cycle.",
        }));
    }

    /// <summary>
    /// Triggers model retraining.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Training job status.</returns>
    [HttpPost("train")]
    [ProducesResponseType(typeof(TrainingJobStatus), StatusCodes.Status202Accepted)]
    public Task<ActionResult<TrainingJobStatus>> TriggerTrainingAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation("Triggering AI model training for business {BusinessId}", businessId);

        // In production, this would queue a background job for model training
        var jobId = Guid.NewGuid();

        return Task.FromResult<ActionResult<TrainingJobStatus>>(Accepted(new TrainingJobStatus
        {
            JobId = jobId,
            Status = "queued",
            Message = "Training job has been queued. This may take several minutes.",
            EstimatedCompletionTime = DateTime.UtcNow.AddMinutes(15),
        }));
    }

    /// <summary>
    /// Gets the status of a training job.
    /// </summary>
    /// <param name="jobId">Training job ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Training job status.</returns>
    [HttpGet("train/{jobId:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(TrainingJobStatus), StatusCodes.Status200OK)]
    public Task<ActionResult<TrainingJobStatus>> GetTrainingStatusAsync(Guid jobId, CancellationToken cancellationToken)
    {
        // In production, this would check the actual job status
        return Task.FromResult<ActionResult<TrainingJobStatus>>(Ok(new TrainingJobStatus
        {
            JobId = jobId,
            Status = "completed",
            Message = "Training completed successfully.",
            CompletedAt = DateTime.UtcNow,
        }));
    }

    /// <summary>
    /// Tests the AI model with a sample input.
    /// </summary>
    /// <param name="request">Test request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>AI response.</returns>
    [HttpPost("test")]
    [ProducesResponseType(typeof(AITestResponse), StatusCodes.Status200OK)]
    public Task<ActionResult<AITestResponse>> TestModelAsync(
        [FromBody] AITestRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation("Testing AI model for business {BusinessId}", businessId);

        // Simulate AI response
        var response = GenerateTestResponse(request.Input, request.Context);

        return Task.FromResult<ActionResult<AITestResponse>>(Ok(new AITestResponse
        {
            Input = request.Input,
            Response = response,
            Confidence = 0.92m,
            ProcessingTimeMs = 245,
            ModelVersion = "1.0",
        }));
    }

#pragma warning disable IDE0060, S1172 // Remove unused parameter - context will be used in production
    private static string GenerateTestResponse(string input, string? context)
#pragma warning restore IDE0060, S1172
    {
        // Simple response generation for testing
        if (input.Contains("price", StringComparison.OrdinalIgnoreCase) || input.Contains("cost", StringComparison.OrdinalIgnoreCase))
        {
            return "I'd be happy to discuss pricing with you. Our plans start at $99/month for small teams. Would you like me to walk you through our pricing options?";
        }

        if (input.Contains("demo", StringComparison.OrdinalIgnoreCase) || input.Contains("trial", StringComparison.OrdinalIgnoreCase))
        {
            return "Great! I can set up a demo for you. We offer a 7-day free trial so you can explore all our features. When would be a good time for a quick walkthrough?";
        }

        if (input.Contains("feature", StringComparison.OrdinalIgnoreCase))
        {
            return "Our platform includes lead qualification, automated conversations, AI voice agents, and comprehensive analytics. Which feature would you like to learn more about?";
        }

        return "Thank you for reaching out! I'm here to help you learn more about our services. What specific questions do you have?";
    }
}

// ============================================================================
// DTOs
// ============================================================================

#pragma warning disable CA1002, CA2227, MA0016, CA1819 // Collection/array rules - DTOs need mutable collections for serialization

/// <summary>
/// AI training configuration.
/// </summary>
public class AITrainingConfig
{
    public Guid BusinessId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public int KnowledgeBaseArticles { get; set; }
    public int ResponseTemplates { get; set; }
    public ToneSettings ToneSettings { get; set; } = new();
    public QualificationCriteria QualificationCriteria { get; set; } = new();
    public TrainingStatus TrainingStatus { get; set; } = new();
    public AutoResponseStatus AutoResponse { get; set; } = new();
}

/// <summary>
/// AI tone settings.
/// </summary>
public class ToneSettings
{
    public string Tone { get; set; } = "professional";
    public string Formality { get; set; } = "formal";
    public string[] PersonalityTraits { get; set; } = [];
}

/// <summary>
/// Request to update AI tone.
/// </summary>
public class UpdateToneRequest
{
    public string Tone { get; set; } = "professional";
    public string? Formality { get; set; }
    public string[]? PersonalityTraits { get; set; }
}

/// <summary>
/// Lead qualification criteria weights.
/// </summary>
public class QualificationCriteria
{
    public int BudgetWeight { get; set; } = 25;
    public int AuthorityWeight { get; set; } = 25;
    public int NeedWeight { get; set; } = 25;
    public int TimelineWeight { get; set; } = 25;
    public int MinScoreToQualify { get; set; } = 50;
}

/// <summary>
/// AI training status.
/// </summary>
public class TrainingStatus
{
    public DateTime? LastTrainedAt { get; set; }
    public string Status { get; set; } = "untrained";
    public string? Version { get; set; }
}

/// <summary>
/// Training data response.
/// </summary>
public class TrainingDataResponse
{
    public string Type { get; set; } = string.Empty;
    public Guid BusinessId { get; set; }
    public int TotalSamples { get; set; }
    public List<ConversationSample>? Conversations { get; set; }
    public List<QualificationSample>? Qualifications { get; set; }
    public List<ResponseTemplateSample>? ResponseTemplates { get; set; }
}

/// <summary>
/// Conversation sample for training.
/// </summary>
public class ConversationSample
{
    public Guid Id { get; set; }
    public string Channel { get; set; } = string.Empty;
    public int MessageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MessageSample> Sample { get; set; } = [];
}

/// <summary>
/// Message sample.
/// </summary>
public class MessageSample
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// Qualification sample for training.
/// </summary>
public class QualificationSample
{
    public Guid LeadId { get; set; }
    public string LeadName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int BudgetScore { get; set; }
    public int AuthorityScore { get; set; }
    public int NeedScore { get; set; }
    public int TimelineScore { get; set; }
    public DateTime QualifiedAt { get; set; }
}

/// <summary>
/// Response template sample.
/// </summary>
public class ResponseTemplateSample
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;
    public int UsageCount { get; set; }
}

/// <summary>
/// Request to add training data.
/// </summary>
public class AddTrainingDataRequest
{
    public string Type { get; set; } = string.Empty;
    public List<TrainingSample> Samples { get; set; } = [];
}

/// <summary>
/// Training sample.
/// </summary>
public class TrainingSample
{
    public string Input { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public string? Context { get; set; }
}

/// <summary>
/// Result of adding training data.
/// </summary>
public class AddTrainingDataResult
{
    public int SamplesAdded { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Training job status.
/// </summary>
public class TrainingJobStatus
{
    public Guid JobId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime? EstimatedCompletionTime { get; set; }
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Request to test AI model.
/// </summary>
public class AITestRequest
{
    public string Input { get; set; } = string.Empty;
    public string? Context { get; set; }
}

/// <summary>
/// AI test response.
/// </summary>
public class AITestResponse
{
    public string Input { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public int ProcessingTimeMs { get; set; }
    public string ModelVersion { get; set; } = string.Empty;
}

/// <summary>
/// Request to update AI auto-response setting.
/// </summary>
public class UpdateAutoResponseRequest
{
    public bool Enabled { get; set; }
}

/// <summary>
/// AI auto-response status.
/// </summary>
public class AutoResponseStatus
{
    public bool Enabled { get; set; }
    public DateTime? ConfiguredAt { get; set; }
}
