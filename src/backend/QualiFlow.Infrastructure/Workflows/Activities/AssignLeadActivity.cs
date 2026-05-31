// <copyright file="AssignLeadActivity.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Leads.DTOs;
using QualiFlow.Application.Features.Leads.Services;
using QualiFlow.Domain.Enums;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows.Activities;

/// <summary>
/// Workflow activity for assigning a qualified lead to sales team.
/// Updates lead status to Qualified.
/// </summary>
public class AssignLeadActivity : StepBodyAsync
{
    private readonly ILeadService _leadService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AssignLeadActivity"/> class.
    /// </summary>
    /// <param name="leadService">The lead service.</param>
    public AssignLeadActivity(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>
    /// Gets or sets the lead ID to assign.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the assignment was successful (output).
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the user ID to assign the lead to.
    /// </summary>
    public Guid? AssignToUserId { get; set; }

    /// <summary>
    /// Executes the activity to assign the lead to sales.
    /// </summary>
    /// <param name="context">The step execution context.</param>
    /// <returns>The execution result.</returns>
    public override async Task<ExecutionResult> RunAsync(IStepExecutionContext context)
    {
        var updateRequest = new UpdateLeadRequest
        {
            Status = LeadStatus.Qualified,
        };

        var result = await _leadService.UpdateLeadAsync(BusinessId, LeadId, updateRequest, CancellationToken.None);

        Success = result != null;

        return ExecutionResult.Next();
    }
}

