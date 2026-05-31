#pragma warning disable SA1615 // Element return value should be documented
#pragma warning disable SA1503 // Braces should not be omitted

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing bookings/appointments.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<BookingsController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all bookings for the current business.
    /// </summary>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _context.Bookings
            .Include(b => b.Lead)
            .Where(b => b.BusinessId == businessId && b.DeletedAt == null);

        if (startDate.HasValue)
            query = query.Where(b => b.ScheduledAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(b => b.ScheduledAt <= endDate.Value);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<BookingStatus>(status, true, out var bookingStatus))
            query = query.Where(b => b.Status == bookingStatus);

        var bookings = await query
            .OrderBy(b => b.ScheduledAt)
            .Select(b => MapToDto(b))
            .ToListAsync(cancellationToken);

        return Ok(bookings);
    }

    /// <summary>
    /// Gets booking statistics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<BookingStats>> GetStats(CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(7);

        var bookings = await _context.Bookings
            .Where(b => b.BusinessId == businessId && b.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var stats = new BookingStats
        {
            TotalBookings = bookings.Count,
            TodayCount = bookings.Count(b => b.ScheduledAt.Date == now.Date),
            ThisWeekCount = bookings.Count(b => b.ScheduledAt >= startOfWeek && b.ScheduledAt < endOfWeek),
            UpcomingCount = bookings.Count(b => b.ScheduledAt > now && b.Status == BookingStatus.Scheduled),
            CompletedCount = bookings.Count(b => b.Status == BookingStatus.Completed),
            CancelledCount = bookings.Count(b => b.Status == BookingStatus.Cancelled),
            NoShowCount = bookings.Count(b => b.Status == BookingStatus.NoShow),
        };

        return Ok(stats);
    }

    /// <summary>
    /// Gets a booking by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookingDto>> GetBooking(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var booking = await _context.Bookings
            .Include(b => b.Lead)
            .FirstOrDefaultAsync(b => b.Id == id && b.BusinessId == businessId && b.DeletedAt == null, cancellationToken);

        if (booking == null)
            return NotFound();

        return Ok(MapToDto(booking));
    }

    /// <summary>
    /// Creates a new booking.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking(
        [FromBody] CreateBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            LeadId = request.LeadId,
            ConversationId = request.ConversationId,
            AssignedToUserId = request.AssignedToUserId ?? userId,
            Title = request.Title,
            Description = request.Description,
            ScheduledAt = request.ScheduledAt,
            Duration = request.Duration,
            Status = BookingStatus.Scheduled,
            MeetingUrl = request.MeetingUrl,
            Timezone = request.Timezone ?? "UTC",
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with Lead info
        await _context.Entry(booking).Reference(b => b.Lead).LoadAsync(cancellationToken);

        _logger.LogInformation("Created booking {BookingId} for business {BusinessId}", booking.Id, businessId);

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToDto(booking));
    }

    /// <summary>
    /// Updates a booking.
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<BookingDto>> UpdateBooking(
        Guid id,
        [FromBody] UpdateBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var booking = await _context.Bookings
            .Include(b => b.Lead)
            .FirstOrDefaultAsync(b => b.Id == id && b.BusinessId == businessId && b.DeletedAt == null, cancellationToken);

        if (booking == null)
            return NotFound();

        if (request.Title != null) booking.Title = request.Title;
        if (request.Description != null) booking.Description = request.Description;
        if (request.ScheduledAt.HasValue) booking.ScheduledAt = request.ScheduledAt.Value;
        if (request.Duration.HasValue) booking.Duration = request.Duration.Value;
        if (request.Status != null && Enum.TryParse<BookingStatus>(request.Status, true, out var status))
            booking.Status = status;
        if (request.MeetingUrl != null) booking.MeetingUrl = request.MeetingUrl;
        if (request.Notes != null) booking.Notes = request.Notes;
        if (request.AssignedToUserId.HasValue) booking.AssignedToUserId = request.AssignedToUserId;

        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(booking));
    }

    /// <summary>
    /// Cancels a booking.
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<BookingDto>> CancelBooking(
        Guid id,
        [FromBody] CancelBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var booking = await _context.Bookings
            .Include(b => b.Lead)
            .FirstOrDefaultAsync(b => b.Id == id && b.BusinessId == businessId && b.DeletedAt == null, cancellationToken);

        if (booking == null)
            return NotFound();

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = request.Reason;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Cancelled booking {BookingId}", id);

        return Ok(MapToDto(booking));
    }

    /// <summary>
    /// Marks a booking as completed.
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<BookingDto>> CompleteBooking(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var booking = await _context.Bookings
            .Include(b => b.Lead)
            .FirstOrDefaultAsync(b => b.Id == id && b.BusinessId == businessId && b.DeletedAt == null, cancellationToken);

        if (booking == null)
            return NotFound();

        booking.Status = BookingStatus.Completed;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(booking));
    }

    /// <summary>
    /// Deletes a booking (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBooking(Guid id, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == id && b.BusinessId == businessId && b.DeletedAt == null, cancellationToken);

        if (booking == null)
            return NotFound();

        booking.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static BookingDto MapToDto(Booking b)
    {
        return new BookingDto
        {
            Id = b.Id,
            LeadId = b.LeadId,
            LeadName = b.Lead?.Name,
            LeadEmail = b.Lead?.Email,
            ConversationId = b.ConversationId,
            AssignedToUserId = b.AssignedToUserId,
            Title = b.Title,
            Description = b.Description,
            ScheduledAt = b.ScheduledAt,
            Duration = b.Duration,
            Status = b.Status.ToString().ToLowerInvariant(),
            MeetingUrl = b.MeetingUrl,
            Timezone = b.Timezone,
            ConfirmationSentAt = b.ConfirmationSentAt,
            ReminderSentAt = b.ReminderSentAt,
            CancelledAt = b.CancelledAt,
            CancellationReason = b.CancellationReason,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
        };
    }
}

// DTOs
public record BookingDto
{
    public Guid Id { get; init; }
    public Guid LeadId { get; init; }
    public string? LeadName { get; init; }
    public string? LeadEmail { get; init; }
    public Guid? ConversationId { get; init; }
    public Guid? AssignedToUserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime ScheduledAt { get; init; }
    public int Duration { get; init; }
    public string Status { get; init; } = "scheduled";
#pragma warning disable CA1056
    public string? MeetingUrl { get; init; }
#pragma warning restore CA1056
    public string Timezone { get; init; } = "UTC";
    public DateTime? ConfirmationSentAt { get; init; }
    public DateTime? ReminderSentAt { get; init; }
    public DateTime? CancelledAt { get; init; }
    public string? CancellationReason { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record CreateBookingRequest
{
    public Guid LeadId { get; init; }
    public Guid? ConversationId { get; init; }
    public Guid? AssignedToUserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime ScheduledAt { get; init; }
    public int Duration { get; init; } = 30;
#pragma warning disable CA1056
    public string? MeetingUrl { get; init; }
#pragma warning restore CA1056
    public string? Timezone { get; init; }
    public string? Notes { get; init; }
}

public record UpdateBookingRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public DateTime? ScheduledAt { get; init; }
    public int? Duration { get; init; }
    public string? Status { get; init; }
    public Guid? AssignedToUserId { get; init; }
#pragma warning disable CA1056
    public string? MeetingUrl { get; init; }
#pragma warning restore CA1056
    public string? Notes { get; init; }
}

public record CancelBookingRequest
{
    public string? Reason { get; init; }
}

public record BookingStats
{
    public int TotalBookings { get; init; }
    public int TodayCount { get; init; }
    public int ThisWeekCount { get; init; }
    public int UpcomingCount { get; init; }
    public int CompletedCount { get; init; }
    public int CancelledCount { get; init; }
    public int NoShowCount { get; init; }
}

#pragma warning restore SA1503
#pragma warning restore SA1615
