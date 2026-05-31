// <copyright file="ScoreLeadActivity.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Scoring.DTOs;
using QualiFlow.Application.Features.Scoring.Interfaces;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows.Activities;

/// <summary>
/// Workflow activity for scoring a lead using tenant-specific scoring criteria.
/// Integrates with LeadScoringService to calculate AI + rules-based score.
/// </summary>
public class ScoreLeadActivity : StepBodyAsync
{
    private readonly ILeadScoringService _leadScoringService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ScoreLeadActivity"/> class.
    /// </summary>
    /// <param name="leadScoringService">The lead scoring service.</param>
    public ScoreLeadActivity(ILeadScoringService leadScoringService)
    {
        _leadScoringService = leadScoringService;
    }

    /// <summary>
    /// Gets or sets the lead ID to score.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID (optional).
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the calculated lead score (output).
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the lead is qualified (output).
    /// </summary>
    public bool IsQualified { get; set; }

    /// <summary>
    /// Executes the activity to score the lead.
    /// </summary>
    /// <param name="context">The step execution context.</param>
    /// <returns>The execution result.</returns>
    public override async Task<ExecutionResult> RunAsync(IStepExecutionContext context)
    {
        var request = new CalculateScoreRequest
        {
            LeadId = LeadId,
            BusinessId = BusinessId,
            ConversationId = ConversationId,
            IncludeAIScoring = true,
            SaveToHistory = true,
            UpdateLeadScore = true,
        };

        var result = await _leadScoringService.CalculateScoreAsync(request, CancellationToken.None);

        Score = result.FinalScore;
        IsQualified = result.IsQualified;

        return ExecutionResult.Next();
    }
}

