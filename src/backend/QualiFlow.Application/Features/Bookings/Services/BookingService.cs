using AutoMapper;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Bookings.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Bookings.Services;

/// <summary>
/// Service for booking operations.
/// </summary>
public partial class BookingService : IBookingService
{
    private readonly IBookingRepository _repository;
    private readonly ICalComService _calComService;
    private readonly ILeadRepository _leadRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ILogger<BookingService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingService"/> class.
    /// </summary>
    /// <param name="repository">The booking repository.</param>
    /// <param name="calComService">The Cal.com service.</param>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="logger">The logger instance.</param>
    public BookingService(
        IBookingRepository repository,
        ICalComService calComService,
        ILeadRepository leadRepository,
        ICurrentUserService currentUserService,
        IMapper mapper,
        ILogger<BookingService> logger)
    {
        _repository = repository;
        _calComService = calComService;
        _leadRepository = leadRepository;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<BookingResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var booking = await _repository.GetByIdAsync(id, cancellationToken);
        return booking == null ? null : _mapper.Map<BookingResponse>(booking);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<BookingResponse>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        var bookings = await _repository.GetByLeadIdAsync(leadId, cancellationToken);
        return _mapper.Map<IReadOnlyList<BookingResponse>>(bookings);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<BookingResponse>> GetMyBookingsAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var bookings = await _repository.GetByUserIdAsync(userId, from, to, cancellationToken);
        return _mapper.Map<IReadOnlyList<BookingResponse>>(bookings);
    }

    /// <inheritdoc/>
    public Task<IReadOnlyList<TimeSlotResponse>> GetAvailableSlotsAsync(
        string eventTypeId,
        DateTime startDate,
        DateTime endDate,
        string timezone = "UTC",
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        return _calComService.GetAvailableSlotsAsync(businessId, eventTypeId, startDate, endDate, timezone, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<BookingResponse> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Get lead info for Cal.com booking
        var lead = await _leadRepository.GetByIdAsync(request.LeadId, cancellationToken)
            ?? throw new InvalidOperationException($"Lead {request.LeadId} not found.");

        string? calComBookingUid = null;

        // Create booking in Cal.com if event type is specified
        if (!string.IsNullOrEmpty(request.CalComEventTypeId))
        {
            calComBookingUid = await _calComService.CreateBookingAsync(
                businessId,
                request.CalComEventTypeId,
                request.ScheduledAt,
                lead.Name,
                lead.Email,
                request.Description,
                request.Timezone,
                cancellationToken);
        }

        var booking = new Booking
        {
            BusinessId = businessId,
            LeadId = request.LeadId,
            ConversationId = request.ConversationId,
            AssignedToUserId = request.AssignedToUserId ?? _currentUserService.GetUserId(),
            Title = request.Title,
            Description = request.Description,
            ScheduledAt = request.ScheduledAt,
            Duration = request.DurationMinutes,
            Timezone = request.Timezone,
            Status = BookingStatus.Pending,
            CalComEventTypeId = request.CalComEventTypeId,
            CalComBookingUid = calComBookingUid,
        };

        await _repository.AddAsync(booking, cancellationToken);
        LogBookingCreated(booking.Id, request.LeadId);

        return _mapper.Map<BookingResponse>(booking);
    }

    /// <inheritdoc/>
    public async Task<BookingResponse?> ConfirmAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var booking = await _repository.GetByIdAsync(id, cancellationToken);
        if (booking == null)
        {
            return null;
        }

        booking.Status = BookingStatus.Confirmed;
        booking.ConfirmationSentAt = DateTime.UtcNow;

        await _repository.UpdateAsync(booking, cancellationToken);
        LogBookingConfirmed(id);

        return _mapper.Map<BookingResponse>(booking);
    }

    /// <inheritdoc/>
    public async Task<BookingResponse?> RescheduleAsync(Guid id, RescheduleBookingRequest request, CancellationToken cancellationToken = default)
    {
        var booking = await _repository.GetByIdAsync(id, cancellationToken);
        if (booking == null)
        {
            return null;
        }

        // Reschedule in Cal.com if applicable
        if (!string.IsNullOrEmpty(booking.CalComBookingUid))
        {
            await _calComService.RescheduleBookingAsync(booking.BusinessId, booking.CalComBookingUid, request.ScheduledAt, request.Reason, cancellationToken);
        }

        booking.ScheduledAt = request.ScheduledAt;
        if (request.DurationMinutes.HasValue)
        {
            booking.Duration = request.DurationMinutes.Value;
        }

        booking.Status = BookingStatus.Rescheduled;

        await _repository.UpdateAsync(booking, cancellationToken);
        LogBookingRescheduled(id, request.ScheduledAt);

        return _mapper.Map<BookingResponse>(booking);
    }

    /// <inheritdoc/>
    public async Task<BookingResponse?> CancelAsync(Guid id, CancelBookingRequest request, CancellationToken cancellationToken = default)
    {
        var booking = await _repository.GetByIdAsync(id, cancellationToken);
        if (booking == null)
        {
            return null;
        }

        // Cancel in Cal.com if applicable
        if (!string.IsNullOrEmpty(booking.CalComBookingUid))
        {
            await _calComService.CancelBookingAsync(booking.BusinessId, booking.CalComBookingUid, request.Reason, cancellationToken);
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancellationReason = request.Reason;
        booking.CancelledAt = DateTime.UtcNow;

        await _repository.UpdateAsync(booking, cancellationToken);
        LogBookingCancelled(id);

        return _mapper.Map<BookingResponse>(booking);
    }

    /// <inheritdoc/>
    public async Task<BookingResponse?> CompleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var booking = await _repository.GetByIdAsync(id, cancellationToken);
        if (booking == null)
        {
            return null;
        }

        booking.Status = BookingStatus.Completed;

        await _repository.UpdateAsync(booking, cancellationToken);
        LogBookingCompleted(id);

        return _mapper.Map<BookingResponse>(booking);
    }

    /// <inheritdoc/>
    public async Task<BookingResponse?> MarkNoShowAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var booking = await _repository.GetByIdAsync(id, cancellationToken);
        if (booking == null)
        {
            return null;
        }

        booking.Status = BookingStatus.NoShow;

        await _repository.UpdateAsync(booking, cancellationToken);
        LogBookingNoShow(id);

        return _mapper.Map<BookingResponse>(booking);
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Created booking {BookingId} for lead {LeadId}")]
    private partial void LogBookingCreated(Guid bookingId, Guid leadId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Confirmed booking {BookingId}")]
    private partial void LogBookingConfirmed(Guid bookingId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Rescheduled booking {BookingId} to {ScheduledAt}")]
    private partial void LogBookingRescheduled(Guid bookingId, DateTime scheduledAt);

    [LoggerMessage(Level = LogLevel.Information, Message = "Cancelled booking {BookingId}")]
    private partial void LogBookingCancelled(Guid bookingId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Completed booking {BookingId}")]
    private partial void LogBookingCompleted(Guid bookingId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Marked booking {BookingId} as no-show")]
    private partial void LogBookingNoShow(Guid bookingId);
}

