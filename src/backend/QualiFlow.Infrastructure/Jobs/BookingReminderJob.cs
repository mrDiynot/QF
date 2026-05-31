using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Hangfire job for sending booking reminders.
/// Sends reminders 24 hours and 1 hour before scheduled bookings.
/// </summary>
public partial class BookingReminderJob
{
    private readonly IBookingRepository _bookingRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<BookingReminderJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingReminderJob"/> class.
    /// </summary>
    /// <param name="bookingRepository">The booking repository.</param>
    /// <param name="notificationService">The in-app notification service.</param>
    /// <param name="logger">The logger.</param>
    public BookingReminderJob(
        IBookingRepository bookingRepository,
        INotificationService notificationService,
        ILogger<BookingReminderJob> logger)
    {
        _bookingRepository = bookingRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the booking reminder job.
    /// Finds bookings scheduled within the next 24 hours and sends reminders.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        LogJobStarted();

        var now = DateTime.UtcNow;
        var in24Hours = now.AddHours(SubscriptionConstants.BookingReminderHours24);

        // Get confirmed bookings in the next 24 hours
        var upcomingBookings = await _bookingRepository.GetUpcomingBookingsAsync(
            now,
            in24Hours,
            CancellationToken.None);

        var remindersSent = 0;

        foreach (var booking in upcomingBookings)
        {
            if (booking.Status != BookingStatus.Confirmed)
            {
                continue;
            }

            var timeUntilBooking = booking.ScheduledAt - now;

            // Send 24-hour reminder (between 23-25 hours)
            if (timeUntilBooking.TotalHours >= SubscriptionConstants.BookingReminder24HoursMinRange &&
                timeUntilBooking.TotalHours <= SubscriptionConstants.BookingReminder24HoursMaxRange)
            {
                await SendReminderAsync(booking, "24 hours");
                remindersSent++;
            }

            // Send 1-hour reminder (between 55-65 minutes)
            else if (timeUntilBooking.TotalMinutes >= SubscriptionConstants.BookingReminder1HourMinMinutes &&
                     timeUntilBooking.TotalMinutes <= SubscriptionConstants.BookingReminder1HourMaxMinutes)
            {
                await SendReminderAsync(booking, "1 hour");
                remindersSent++;
            }
        }

        LogJobCompleted(remindersSent);
    }

    private async Task SendReminderAsync(Booking booking, string timeUntil)
    {
        try
        {
            // Get lead name for notification message
            var leadName = booking.Lead?.Name ?? booking.Lead?.Email ?? "Lead";

            // Send in-app notification to assigned agent (if any)
            if (booking.AssignedToUserId.HasValue)
            {
                await _notificationService.NotifyBookingReminderAsync(
                    booking.BusinessId,
                    booking.AssignedToUserId.Value,
                    booking.Id,
                    leadName,
                    timeUntil,
                    CancellationToken.None);
            }

            LogReminderSent(booking.Id, booking.LeadId, timeUntil);
        }
        catch (Exception ex)
        {
            LogReminderFailed(booking.Id, ex.Message);
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Booking reminder job started")]
    private partial void LogJobStarted();

    [LoggerMessage(Level = LogLevel.Information, Message = "Booking reminder job completed. Reminders sent: {RemindersSent}")]
    private partial void LogJobCompleted(int remindersSent);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reminder sent: BookingId={BookingId}, LeadId={LeadId}, TimeUntil={TimeUntil}")]
    private partial void LogReminderSent(Guid bookingId, Guid leadId, string timeUntil);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send reminder for BookingId={BookingId}: {ErrorMessage}")]
    private partial void LogReminderFailed(Guid bookingId, string errorMessage);
}

