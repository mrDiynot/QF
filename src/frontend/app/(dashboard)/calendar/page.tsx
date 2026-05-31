'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, X, Check } from 'lucide-react';
import { bookingsService, type Booking } from '@/services/api/bookings.service';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  confirmed: 'bg-green-500',
  completed: 'bg-gray-400',
  cancelled: 'bg-red-500',
  noshow: 'bg-orange-500',
};

export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setSelectedDate] = useState<Date | null>(null);
  const [, setShowCreateDialog] = useState(false);
  void setSelectedDate; // Reserved for date selection
  void setShowCreateDialog; // Reserved for create dialog
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: () => bookingsService.getBookings({
      startDate: format(monthStart, 'yyyy-MM-dd'),
      endDate: format(monthEnd, 'yyyy-MM-dd'),
    }),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: () => bookingsService.getStats(),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => bookingsService.completeBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking completed', {
        description: 'The appointment has been marked as done.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to complete booking', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled', {
        description: 'The appointment has been removed from the calendar.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to cancel booking', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const isLoading = bookingsLoading || statsLoading;

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    // Start padding reserved for week alignment
    void monthStart.getDay();
    
    return days.map(day => {
      const dayBookings = bookings?.filter(b => 
        isSameDay(new Date(b.scheduledAt), day)
      ) || [];
      
      return {
        date: day,
        day: day.getDate(),
        isToday: isToday(day),
        bookings: dayBookings,
      };
    });
  }, [monthStart, monthEnd, bookings]);

  // Get today's bookings
  const todayBookings = useMemo(() => {
    return bookings?.filter(b => isToday(new Date(b.scheduledAt))) || [];
  }, [bookings]);

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Calendar & Appointments</h1>
            <p className="body-text text-text-secondary">
              Manage your schedule and upcoming events
            </p>
          </div>
          <Button 
            className="gap-2 rounded-[10px] gradient-primary text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="size-4" />
            New Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 rounded-xl" />
            ))
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-600">
                    <CalendarIcon className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Today</p>
                    <p className="text-2xl font-semibold text-text-navy">{stats?.todayCount ?? 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-text-secondary">This Week</p>
                <p className="text-2xl font-semibold text-text-navy">{stats?.thisWeekCount ?? 0}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-text-secondary">Completed</p>
                <p className="text-2xl font-semibold text-success-green">{stats?.completedCount ?? 0}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-text-secondary">Upcoming</p>
                <p className="text-2xl font-semibold text-brand-purple">{stats?.upcomingCount ?? 0}</p>
              </Card>
            </>
          )}
        </div>

        {/* Calendar and Events */}
        <div className="grid grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="heading-2 text-text-navy">{format(currentDate, 'MMMM yyyy')}</h2>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-2 hover:bg-gray-100" onClick={goToPrevMonth}>
                      <ChevronLeft className="size-5" />
                    </button>
                    <button className="rounded-lg p-2 hover:bg-gray-100" onClick={goToNextMonth}>
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-[10px] border-border"
                    onClick={goToToday}
                  >
                    Today
                  </Button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('month')}
                    className={`rounded-[10px] px-4 py-2 text-sm ${
                      view === 'month'
                        ? 'bg-brand-purple text-white'
                        : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`rounded-[10px] px-4 py-2 text-sm ${
                      view === 'week'
                        ? 'bg-brand-purple text-white'
                        : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('day')}
                    className={`rounded-[10px] px-4 py-2 text-sm ${
                      view === 'day'
                        ? 'bg-brand-purple text-white'
                        : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    Day
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-2">
                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-normal text-text-secondary"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((item, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square rounded-lg p-2 text-center cursor-pointer ${
                        item.isToday
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDate(item.date)}
                    >
                      <div className="text-sm font-normal text-text-navy">
                        {item.day}
                      </div>
                      {item.bookings.length > 0 && (
                        <div className="mt-1 flex justify-center gap-1">
                          {item.bookings.slice(0, 3).map((booking: Booking, i: number) => (
                            <div
                              key={i}
                              className={`size-1.5 rounded-full ${STATUS_COLORS[booking.status] || 'bg-blue-500'}`}
                            />
                          ))}
                          {item.bookings.length > 3 && (
                            <span className="text-[8px] text-gray-400">+{item.bookings.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Events */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="heading-3 text-text-navy">Today&apos;s Events</h2>
                <span className="tiny-text text-text-muted">{todayBookings.length} events</span>
              </div>

              {todayBookings.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {todayBookings.map((booking: Booking) => (
                    <div key={booking.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-text-navy">{booking.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                            <Clock className="size-3" />
                            {format(new Date(booking.scheduledAt), 'h:mm a')}
                            <span>({booking.duration} min)</span>
                          </div>
                          {booking.leadName && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                              <User className="size-3" />
                              {booking.leadName}
                            </div>
                          )}
                        </div>
                        <Badge variant={booking.status === 'scheduled' ? 'default' : 'secondary'} className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>
                      {booking.status === 'scheduled' && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs gap-1"
                            onClick={() => completeMutation.mutate(booking.id)}
                          >
                            <Check className="size-3" /> Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs gap-1 text-red-500"
                            onClick={() => cancelMutation.mutate(booking.id)}
                          >
                            <X className="size-3" /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-gray-100">
                    <CalendarIcon className="size-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">No events scheduled today</p>
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-4">
                <Button 
                  className="w-full gap-2 rounded-[10px] gradient-primary text-white"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="size-4" />
                  Add Appointment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}