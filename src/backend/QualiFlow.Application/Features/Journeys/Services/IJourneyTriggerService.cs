// <copyright file="IJourneyTriggerService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Journeys.Services;

/// <summary>
/// Service interface for triggering journeys based on events.
/// Handles automatic workflow execution when specific events occur.
/// </summary>
public interface IJourneyTriggerService
{
    /// <summary>
    /// Triggers journeys when a new lead is created.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadEmail">The lead's email address.</param>
    /// <param name="source">The lead source.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnLeadCreatedAsync(
        Guid businessId,
        Guid leadId,
        string leadEmail,
        string? source,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers journeys when a form is submitted.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="submissionId">The submission ID.</param>
    /// <param name="leadId">The associated lead ID (if any).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnFormSubmittedAsync(
        Guid businessId,
        Guid formId,
        Guid submissionId,
        Guid? leadId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers journeys when a new conversation starts.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="leadId">The associated lead ID.</param>
    /// <param name="channel">The conversation channel.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnConversationStartedAsync(
        Guid businessId,
        Guid conversationId,
        Guid leadId,
        string channel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers journeys when a lead status changes.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="oldStatus">The previous status.</param>
    /// <param name="newStatus">The new status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnLeadStatusChangedAsync(
        Guid businessId,
        Guid leadId,
        string oldStatus,
        string newStatus,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers journeys when a booking is created.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="bookingId">The booking ID.</param>
    /// <param name="leadId">The associated lead ID.</param>
    /// <param name="scheduledAt">The booking time.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnBookingCreatedAsync(
        Guid businessId,
        Guid bookingId,
        Guid leadId,
        DateTime scheduledAt,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers the review/survey workflow when an appointment is completed.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="appointmentId">The appointment ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadEmail">The lead's email address.</param>
    /// <param name="leadName">The lead's name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnAppointmentCompletedAsync(
        Guid businessId,
        Guid appointmentId,
        Guid leadId,
        string leadEmail,
        string leadName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers the missed call recovery workflow when a call is missed.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadEmail">The lead's email address.</param>
    /// <param name="leadName">The lead's name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnCallMissedAsync(
        Guid businessId,
        Guid leadId,
        string leadEmail,
        string leadName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers the no-show recovery workflow when a customer misses their appointment.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="appointmentId">The appointment ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadEmail">The lead's email address.</param>
    /// <param name="leadName">The lead's name.</param>
    /// <param name="scheduledAt">The original appointment time.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnAppointmentNoShowAsync(
        Guid businessId,
        Guid appointmentId,
        Guid leadId,
        string leadEmail,
        string leadName,
        DateTime scheduledAt,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers the abandoned form recovery workflow when a form is partially filled.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="sessionId">The session tracking ID.</param>
    /// <param name="partialEmail">The partial email captured.</param>
    /// <param name="formName">The form name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnFormAbandonedAsync(
        Guid businessId,
        Guid formId,
        Guid sessionId,
        string partialEmail,
        string formName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Triggers the proposal workflow when a lead requests a proposal.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="proposalId">The proposal ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadEmail">The lead's email address.</param>
    /// <param name="leadName">The lead's name.</param>
    /// <param name="proposalAmount">The proposal amount.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task OnProposalCreatedAsync(
        Guid businessId,
        Guid proposalId,
        Guid leadId,
        string leadEmail,
        string leadName,
        decimal proposalAmount,
        CancellationToken cancellationToken = default);
}
