// <copyright file="JourneyTriggerService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Journeys.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Workflows;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for triggering journeys based on events.
/// Handles automatic workflow execution when specific events occur.
/// </summary>
public class JourneyTriggerService : IJourneyTriggerService
{
    private readonly QualiFlowDbContext _context;
    private readonly IWorkflowHost _workflowHost;
    private readonly ILogger<JourneyTriggerService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="JourneyTriggerService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="workflowHost">The Workflow Core host.</param>
    /// <param name="logger">The logger.</param>
    public JourneyTriggerService(
        QualiFlowDbContext context,
        IWorkflowHost workflowHost,
        ILogger<JourneyTriggerService> logger)
    {
        _context = context;
        _workflowHost = workflowHost;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task OnLeadCreatedAsync(
        Guid businessId,
        Guid leadId,
        string leadEmail,
        string? source,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Lead created trigger fired for lead {LeadId} in business {BusinessId}",
            leadId,
            businessId);

        try
        {
            // Find active workflow definitions with "Event" trigger type that contain "LeadCreated" in config
            var activeWorkflows = await _context.WorkflowDefinitions
                .Where(w => w.BusinessId == businessId
                    && w.IsActive
                    && w.TriggerType == WorkflowTriggerType.Event
                    && w.TriggerConfig != null
                    && w.TriggerConfig.Contains("LeadCreated", StringComparison.OrdinalIgnoreCase)
                    && w.DeletedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var workflow in activeWorkflows)
            {
                // Check if workflow has source filter
                if (!string.IsNullOrEmpty(workflow.TriggerConfig))
                {
                    // Simple source filter check (could be enhanced with JSON parsing)
                    if (!string.IsNullOrEmpty(source) && workflow.TriggerConfig.Contains(source, StringComparison.OrdinalIgnoreCase))
                    {
                        await StartWorkflowForLeadAsync(workflow, businessId, leadId, leadEmail, cancellationToken);
                    }
                    else if (string.IsNullOrEmpty(source) || !workflow.TriggerConfig.Contains("sourceFilter", StringComparison.OrdinalIgnoreCase))
                    {
                        // No source filter, start the workflow
                        await StartWorkflowForLeadAsync(workflow, businessId, leadId, leadEmail, cancellationToken);
                    }
                }
                else
                {
                    // No trigger config, start for all new leads
                    await StartWorkflowForLeadAsync(workflow, businessId, leadId, leadEmail, cancellationToken);
                }
            }

            // Also start the default lead qualification workflow
            var workflowData = new LeadQualificationWorkflowData
            {
                LeadId = leadId,
                BusinessId = businessId,
                LeadEmail = leadEmail,
            };

            var workflowId = await _workflowHost.StartWorkflow(
                "lead-qualification-workflow",
                1,
                workflowData);

            _logger.LogInformation(
                "Started lead qualification workflow {WorkflowId} for lead {LeadId}",
                workflowId,
                leadId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering journeys for lead {LeadId}", leadId);
        }
    }

    /// <inheritdoc/>
    public async Task OnFormSubmittedAsync(
        Guid businessId,
        Guid formId,
        Guid submissionId,
        Guid? leadId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Form submitted trigger fired for form {FormId}, submission {SubmissionId} in business {BusinessId}",
            formId,
            submissionId,
            businessId);

        try
        {
            // Find active workflows with "FormSubmitted" event trigger
            var activeWorkflows = await _context.WorkflowDefinitions
                .Where(w => w.BusinessId == businessId
                    && w.IsActive
                    && w.TriggerType == WorkflowTriggerType.Event
                    && w.TriggerConfig != null
                    && w.TriggerConfig.Contains("FormSubmitted", StringComparison.OrdinalIgnoreCase)
                    && w.DeletedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var workflow in activeWorkflows)
            {
                // Check if workflow is configured for this specific form
                if (!string.IsNullOrEmpty(workflow.TriggerConfig))
                {
                    if (workflow.TriggerConfig.Contains(formId.ToString(), StringComparison.OrdinalIgnoreCase))
                    {
                        await StartFormWorkflowAsync(workflow, businessId, formId, submissionId, leadId, cancellationToken);
                    }
                    else if (!workflow.TriggerConfig.Contains("formFilter", StringComparison.OrdinalIgnoreCase))
                    {
                        // No form filter, start for all form submissions
                        await StartFormWorkflowAsync(workflow, businessId, formId, submissionId, leadId, cancellationToken);
                    }
                }
                else
                {
                    // No trigger config, start for all form submissions
                    await StartFormWorkflowAsync(workflow, businessId, formId, submissionId, leadId, cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering journeys for form submission {SubmissionId}", submissionId);
        }
    }

    /// <inheritdoc/>
    public async Task OnConversationStartedAsync(
        Guid businessId,
        Guid conversationId,
        Guid leadId,
        string channel,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Conversation started trigger fired for conversation {ConversationId} in business {BusinessId}",
            conversationId,
            businessId);

        try
        {
            // Find active workflows with "ConversationStarted" event trigger
            var activeWorkflows = await _context.WorkflowDefinitions
                .Where(w => w.BusinessId == businessId
                    && w.IsActive
                    && w.TriggerType == WorkflowTriggerType.Event
                    && w.TriggerConfig != null
                    && w.TriggerConfig.Contains("ConversationStarted")
                    && w.DeletedAt == null)
                .ToListAsync(cancellationToken);

            // Get lead email for workflow data
            var lead = await _context.Leads
                .Where(l => l.Id == leadId && l.BusinessId == businessId)
                .FirstOrDefaultAsync(cancellationToken);

            if (lead == null)
            {
                _logger.LogWarning("Lead {LeadId} not found for conversation trigger", leadId);
                return;
            }

            foreach (var workflow in activeWorkflows)
            {
                // Check channel filter
                if (!string.IsNullOrEmpty(workflow.TriggerConfig))
                {
                    if (workflow.TriggerConfig.Contains(channel, StringComparison.OrdinalIgnoreCase))
                    {
                        await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
                    }
                    else if (!workflow.TriggerConfig.Contains("channelFilter", StringComparison.OrdinalIgnoreCase))
                    {
                        await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
                    }
                }
                else
                {
                    await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering journeys for conversation {ConversationId}", conversationId);
        }
    }

    /// <inheritdoc/>
    public async Task OnLeadStatusChangedAsync(
        Guid businessId,
        Guid leadId,
        string oldStatus,
        string newStatus,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Lead status changed trigger fired for lead {LeadId}: {OldStatus} -> {NewStatus}",
            leadId,
            oldStatus,
            newStatus);

        try
        {
            // Find active workflows with "LeadStatusChanged" event trigger
            var activeWorkflows = await _context.WorkflowDefinitions
                .Where(w => w.BusinessId == businessId
                    && w.IsActive
                    && w.TriggerType == WorkflowTriggerType.Event
                    && w.TriggerConfig != null
                    && w.TriggerConfig.Contains("LeadStatusChanged")
                    && w.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var lead = await _context.Leads
                .Where(l => l.Id == leadId && l.BusinessId == businessId)
                .FirstOrDefaultAsync(cancellationToken);

            if (lead == null)
            {
                _logger.LogWarning("Lead {LeadId} not found for status change trigger", leadId);
                return;
            }

            foreach (var workflow in activeWorkflows)
            {
                // Check if configured for specific status transition
                if (!string.IsNullOrEmpty(workflow.TriggerConfig))
                {
                    if (workflow.TriggerConfig.Contains(newStatus, StringComparison.OrdinalIgnoreCase))
                    {
                        await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
                    }
                    else if (!workflow.TriggerConfig.Contains("statusFilter", StringComparison.OrdinalIgnoreCase))
                    {
                        await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
                    }
                }
                else
                {
                    await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
                }
            }

            // Start follow-up sequence for qualified leads
            if (newStatus.Equals("Qualified", StringComparison.OrdinalIgnoreCase))
            {
                var workflowData = new FollowUpSequenceWorkflowData
                {
                    LeadId = leadId,
                    BusinessId = businessId,
                    LeadEmail = lead.Email,
                    LeadScore = lead.Score,
                };

                var workflowId = await _workflowHost.StartWorkflow(
                    "follow-up-sequence-workflow",
                    1,
                    workflowData);

                _logger.LogInformation(
                    "Started follow-up sequence workflow {WorkflowId} for qualified lead {LeadId}",
                    workflowId,
                    leadId);
            }

            // Start nurture campaign for unqualified leads
            if (newStatus.Equals("Unqualified", StringComparison.OrdinalIgnoreCase))
            {
                var workflowData = new EmailNurtureCampaignWorkflowData
                {
                    LeadId = leadId,
                    BusinessId = businessId,
                    LeadEmail = lead.Email,
                    DelayDays = 3,
                };

                var workflowId = await _workflowHost.StartWorkflow(
                    "email-nurture-campaign-workflow",
                    1,
                    workflowData);

                _logger.LogInformation(
                    "Started nurture campaign workflow {WorkflowId} for unqualified lead {LeadId}",
                    workflowId,
                    leadId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering journeys for lead status change {LeadId}", leadId);
        }
    }

    /// <inheritdoc/>
    public async Task OnBookingCreatedAsync(
        Guid businessId,
        Guid bookingId,
        Guid leadId,
        DateTime scheduledAt,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Booking created trigger fired for booking {BookingId} in business {BusinessId}",
            bookingId,
            businessId);

        try
        {
            // Find active workflows with "BookingCreated" event trigger
            var activeWorkflows = await _context.WorkflowDefinitions
                .Where(w => w.BusinessId == businessId
                    && w.IsActive
                    && w.TriggerType == WorkflowTriggerType.Event
                    && w.TriggerConfig != null
                    && w.TriggerConfig.Contains("BookingCreated")
                    && w.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var lead = await _context.Leads
                .Where(l => l.Id == leadId && l.BusinessId == businessId)
                .FirstOrDefaultAsync(cancellationToken);

            if (lead == null)
            {
                _logger.LogWarning("Lead {LeadId} not found for booking trigger", leadId);
                return;
            }

            foreach (var workflow in activeWorkflows)
            {
                await StartWorkflowForLeadAsync(workflow, businessId, leadId, lead.Email, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering journeys for booking {BookingId}", bookingId);
        }
    }

    private async Task StartWorkflowForLeadAsync(
        WorkflowDefinition workflowDef,
        Guid businessId,
        Guid leadId,
        string leadEmail,
        CancellationToken cancellationToken)
    {
        try
        {
            var workflowData = new LeadQualificationWorkflowData
            {
                LeadId = leadId,
                BusinessId = businessId,
                LeadEmail = leadEmail,
            };

            // Use the workflow's own ID or fall back to default
            var workflowIdToStart = !string.IsNullOrEmpty(workflowDef.DefinitionJson)
                ? workflowDef.Id.ToString()
                : "lead-qualification-workflow";

            var workflowInstanceId = await _workflowHost.StartWorkflow(
                workflowIdToStart,
                workflowDef.Version,
                workflowData);

            // Record the workflow instance
            var workflowInstance = new WorkflowInstance
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                WorkflowDefinitionId = workflowDef.Id,
                WorkflowCoreId = workflowInstanceId,
                Status = WorkflowStatus.Running,
                DataJson = System.Text.Json.JsonSerializer.Serialize(workflowData),
                StartedAt = DateTime.UtcNow,
                LeadId = leadId,
                CreatedAt = DateTime.UtcNow,
            };

            _context.WorkflowInstances.Add(workflowInstance);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Started workflow {WorkflowId} instance {InstanceId} for lead {LeadId}",
                workflowDef.Name,
                workflowInstanceId,
                leadId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting workflow {WorkflowId} for lead {LeadId}", workflowDef.Id, leadId);
        }
    }

    private async Task StartFormWorkflowAsync(
        WorkflowDefinition workflowDef,
        Guid businessId,
        Guid formId,
        Guid submissionId,
        Guid? leadId,
        CancellationToken cancellationToken)
    {
        _ = formId; // Used for logging context

        try
        {
            if (!leadId.HasValue)
            {
                _logger.LogWarning("No lead associated with form submission {SubmissionId}", submissionId);
                return;
            }

            var lead = await _context.Leads
                .Where(l => l.Id == leadId.Value && l.BusinessId == businessId)
                .FirstOrDefaultAsync(cancellationToken);

            if (lead == null)
            {
                _logger.LogWarning("Lead {LeadId} not found for form workflow", leadId);
                return;
            }

            await StartWorkflowForLeadAsync(workflowDef, businessId, leadId.Value, lead.Email, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting form workflow for submission {SubmissionId}", submissionId);
        }
    }

    /// <inheritdoc/>
    public async Task OnAppointmentCompletedAsync(
        Guid businessId,
        Guid appointmentId,
        Guid leadId,
        string leadEmail,
        string leadName,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Appointment completed trigger fired for appointment {AppointmentId} in business {BusinessId}",
            appointmentId,
            businessId);

        try
        {
            var workflowData = new ReviewSurveyWorkflowData
            {
                LeadId = leadId,
                BusinessId = businessId,
                LeadEmail = leadEmail,
                LeadName = leadName,
                AppointmentId = appointmentId,
            };

            var workflowId = await _workflowHost.StartWorkflow(
                "review-survey-workflow",
                1,
                workflowData);

            _logger.LogInformation(
                "Started review survey workflow {WorkflowId} for appointment {AppointmentId}",
                workflowId,
                appointmentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering review survey workflow for appointment {AppointmentId}", appointmentId);
        }
    }

    /// <inheritdoc/>
    public async Task OnCallMissedAsync(
        Guid businessId,
        Guid leadId,
        string leadEmail,
        string leadName,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Call missed trigger fired for lead {LeadId} in business {BusinessId}",
            leadId,
            businessId);

        try
        {
            var workflowData = new MissedCallRecoveryWorkflowData
            {
                LeadId = leadId,
                BusinessId = businessId,
                LeadEmail = leadEmail,
                LeadName = leadName,
                MissedCallAt = DateTime.UtcNow,
            };

            var workflowId = await _workflowHost.StartWorkflow(
                "missed-call-recovery-workflow",
                1,
                workflowData);

            _logger.LogInformation(
                "Started missed call recovery workflow {WorkflowId} for lead {LeadId}",
                workflowId,
                leadId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering missed call recovery workflow for lead {LeadId}", leadId);
        }
    }

    /// <inheritdoc/>
    public async Task OnAppointmentNoShowAsync(
        Guid businessId,
        Guid appointmentId,
        Guid leadId,
        string leadEmail,
        string leadName,
        DateTime scheduledAt,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "No-show trigger fired for appointment {AppointmentId} in business {BusinessId}",
            appointmentId,
            businessId);

        try
        {
            var workflowData = new NoShowRecoveryWorkflowData
            {
                LeadId = leadId,
                BusinessId = businessId,
                LeadEmail = leadEmail,
                LeadName = leadName,
                AppointmentId = appointmentId,
                ScheduledAt = scheduledAt,
            };

            var workflowId = await _workflowHost.StartWorkflow(
                "no-show-recovery-workflow",
                1,
                workflowData);

            _logger.LogInformation(
                "Started no-show recovery workflow {WorkflowId} for appointment {AppointmentId}",
                workflowId,
                appointmentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering no-show recovery workflow for appointment {AppointmentId}", appointmentId);
        }
    }

    /// <inheritdoc/>
    public async Task OnFormAbandonedAsync(
        Guid businessId,
        Guid formId,
        Guid sessionId,
        string partialEmail,
        string formName,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Form abandoned trigger fired for form {FormId} session {SessionId} in business {BusinessId}",
            formId,
            sessionId,
            businessId);

        try
        {
            var workflowData = new AbandonedFormRecoveryWorkflowData
            {
                SessionId = sessionId,
                BusinessId = businessId,
                FormId = formId,
                FormName = formName,
                PartialEmail = partialEmail,
            };

            var workflowId = await _workflowHost.StartWorkflow(
                "abandoned-form-recovery-workflow",
                1,
                workflowData);

            _logger.LogInformation(
                "Started abandoned form recovery workflow {WorkflowId} for session {SessionId}",
                workflowId,
                sessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering abandoned form recovery workflow for session {SessionId}", sessionId);
        }
    }

    /// <inheritdoc/>
    public async Task OnProposalCreatedAsync(
        Guid businessId,
        Guid proposalId,
        Guid leadId,
        string leadEmail,
        string leadName,
        decimal proposalAmount,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Proposal created trigger fired for proposal {ProposalId} in business {BusinessId}",
            proposalId,
            businessId);

        try
        {
            // Get business name for the proposal email
            var business = await _context.Businesses
                .Where(b => b.Id == businessId)
                .FirstOrDefaultAsync(cancellationToken);

            var workflowData = new ProposalWorkflowData
            {
                LeadId = leadId,
                BusinessId = businessId,
                ProposalId = proposalId,
                LeadEmail = leadEmail,
                LeadName = leadName,
                BusinessName = business?.Name ?? "Our Team",
                ProposalAmount = proposalAmount,
                ExpirationDate = DateTime.UtcNow.AddDays(30),
            };

            var workflowId = await _workflowHost.StartWorkflow(
                "proposal-workflow",
                1,
                workflowData);

            _logger.LogInformation(
                "Started proposal workflow {WorkflowId} for proposal {ProposalId}",
                workflowId,
                proposalId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering proposal workflow for proposal {ProposalId}", proposalId);
        }
    }
}
