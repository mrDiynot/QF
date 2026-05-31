// <copyright file="UpdateLeadActivity.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Enums;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows.Activities;

/// <summary>
/// Workflow activity for updating lead properties.
/// </summary>
public class UpdateLeadActivity : StepBodyAsync
{
    private readonly ILeadRepository _leadRepository;
    private readonly ILogger<UpdateLeadActivity> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="UpdateLeadActivity"/> class.
    /// </summary>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="logger">The logger.</param>
    public UpdateLeadActivity(ILeadRepository leadRepository, ILogger<UpdateLeadActivity> logger)
    {
        _leadRepository = leadRepository;
        _logger = logger;
    }

    /// <summary>
    /// Gets or sets the lead ID to update.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the new lead status (optional).
    /// </summary>
    public LeadStatus? NewStatus { get; set; }

    /// <summary>
    /// Gets or sets the new lead score (optional).
    /// </summary>
    public int? NewScore { get; set; }

    /// <summary>
    /// Gets or sets notes to add to the lead (optional).
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the update was successful (output).
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Executes the activity to update the lead.
    /// </summary>
    /// <param name="context">The step execution context.</param>
    /// <returns>The execution result.</returns>
    public override async Task<ExecutionResult> RunAsync(IStepExecutionContext context)
    {
        try
        {
            _logger.LogInformation(
                "Updating lead {LeadId} in business {BusinessId}",
                LeadId,
                BusinessId);

            var lead = await _leadRepository.GetByIdAsync(LeadId, CancellationToken.None);

            if (lead == null)
            {
                _logger.LogWarning("Lead {LeadId} not found in business {BusinessId}", LeadId, BusinessId);
                Success = false;
                return ExecutionResult.Next();
            }

            if (NewStatus.HasValue)
            {
                lead.Status = NewStatus.Value;
            }

            if (NewScore.HasValue)
            {
                lead.Score = NewScore.Value;
            }

            if (!string.IsNullOrEmpty(Notes))
            {
                // Store notes in metadata since Lead doesn't have a Notes property
                var existingMetadata = lead.Metadata ?? "{}";
                lead.Metadata = $"{{\"workflowNote\": \"{Notes}\", \"originalMetadata\": {existingMetadata}}}";
            }

            lead.UpdatedAt = DateTime.UtcNow;

            await _leadRepository.UpdateAsync(lead, CancellationToken.None);

            Success = true;

            _logger.LogInformation(
                "Lead {LeadId} updated successfully. Status: {Status}, Score: {Score}",
                LeadId,
                lead.Status,
                lead.Score);

            return ExecutionResult.Next();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update lead {LeadId}", LeadId);
            Success = false;
            return ExecutionResult.Next();
        }
    }
}
