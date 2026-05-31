'use client';

/**
 * Booking Calendar Component
 * Display and manage appointments in a calendar view
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { useBookings, type Booking } from '@/hooks/api/useBookings';

interface Appointment {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'call' | 'video' | 'in-person';
  status: 'confirmed' | 'pending' | 'cancelled';
  attendee: {
    name: string;
    email: string;
    avatar?: string;
  };
  notes?: string;
}

// Transform API Booking to Appointment display format
function transformBookingToAppointment(booking: Booking): Appointment {
  const startTime = new Date(booking.scheduledAt);
  const endTime = new Date(startTime.getTime() + booking.duration * 60000);

  // Map booking type to appointment type
  let type: Appointment['type'] = 'video';
  if (booking.meetingType === 'phone') type = 'call';
  else if (booking.meetingType === 'in_person') type = 'in-person';

  // Map status
  let status: Appointment['status'] = 'confirmed';
  if (booking.status === 'scheduled') status = 'pending';
  else if (booking.status === 'cancelled') status = 'cancelled';

  return {
    id: booking.id,
    title: booking.title,
    startTime,
    endTime,
    type,
    status,
    attendee: {
      name: booking.leadName || 'Unknown',
      email: booking.leadEmail || '',
    },
    notes: booking.notes,
  };
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  call: { icon: <Phone className="size-3" />, color: 'bg-green-100 text-green-700' },
  video: { icon: <Video className="size-3" />, color: 'bg-muted/50 text-info' },
  'in-person': { icon: <MapPin className="size-3" />, color: 'bg-primary/10 text-primary' },
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  confirmed: { icon: <CheckCircle className="size-3" />, color: 'text-green-600' },
  pending: { icon: <AlertCircle className="size-3" />, color: 'text-amber-600' },
  cancelled: { icon: <XCircle className="size-3" />, color: 'text-red-600' },
};

interface BookingCalendarProps {
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  className?: string;
}

export function BookingCalendar({
  onDateSelect,
  onAppointmentClick,
  className
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch bookings for the current month
  const { data: bookingsData, isLoading, error } = useBookings({
    startDate: startOfMonth(currentMonth),
    endDate: endOfMonth(currentMonth),
  });

  // Transform API bookings to appointments
  const appointments = useMemo(() => {
    return (bookingsData || []).map(transformBookingToAppointment);
  }, [bookingsData]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.startTime, date));
  };

  // Get today's appointments
  const todayAppointments = useMemo(() => {
    return selectedDate ? getAppointmentsForDate(selectedDate) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, appointments]);

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // Handle appointment click
  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setDetailDialogOpen(true);
    onAppointmentClick?.(apt);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("grid lg:grid-cols-3 gap-6", className)}>
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <AlertCircle className="size-12 mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load bookings</h3>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("grid lg:grid-cols-3 gap-6", className)}>
      {/* Calendar */}
      <Card className="lg:col-span-2 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
            >
              Today
            </Button>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "min-h-24 p-1 border rounded-lg text-left transition-colors",
                  isCurrentMonth ? "bg-white" : "bg-muted/20",
                  isSelected && "ring-2 ring-purple-500",
                  isDayToday && "border-primary",
                  "hover:bg-muted/20"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  !isCurrentMonth && "text-muted-foreground/60",
                  isDayToday && "text-primary"
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => {
                    const typeConfig = TYPE_CONFIG[apt.type];
                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(apt);
                        }}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          typeConfig.color
                        )}
                      >
                        {format(apt.startTime, 'HH:mm')} {apt.title}
                      </div>
                    );
                  })}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Sidebar - Selected Day */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">
              {selectedDate ? format(selectedDate, 'EEEE') : 'Select a date'}
            </h3>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM d, yyyy')}</p>
            )}
          </div>
          <Button size="sm" className="gap-1 bg-primary hover:bg-purple-700">
            <Plus className="size-4" />
            New
          </Button>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((apt) => {
              const typeConfig = TYPE_CONFIG[apt.type];
              const statusConfig = STATUS_CONFIG[apt.status];

              return (
                <div
                  key={apt.id}
                  onClick={() => handleAppointmentClick(apt)}
                  className="p-3 border rounded-lg hover:border-border cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{apt.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="size-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground">
                          {format(apt.startTime, 'h:mm a')} - {format(apt.endTime, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("gap-1", typeConfig.color)}>
                      {typeConfig.icon}
                      {apt.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="size-6">
                      <AvatarImage src={apt.attendee.avatar} />
                      <AvatarFallback className="text-xs">
                        {apt.attendee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{apt.attendee.name}</span>
                    <div className={cn("flex items-center gap-1 ml-auto", statusConfig.color)}>
                      {statusConfig.icon}
                      <span className="text-xs">{apt.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="size-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No appointments</p>
            <Button variant="link" className="text-primary mt-2">
              Schedule one
            </Button>
          </div>
        )}
      </Card>

      {/* Appointment Detail Dialog */}
      <Modal open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <ModalContent size="md">
          {selectedAppointment && (
            <>
              <ModalHeader>
                <ModalTitle>{selectedAppointment.title}</ModalTitle>
                <ModalDescription>
                  {format(selectedAppointment.startTime, 'EEEE, MMMM d, yyyy')}
                </ModalDescription>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-muted-foreground/60" />
                  <span>
                    {format(selectedAppointment.startTime, 'h:mm a')} - {format(selectedAppointment.endTime, 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {TYPE_CONFIG[selectedAppointment.type].icon}
                  <span className="capitalize">{selectedAppointment.type} meeting</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground/60" />
                  <div>
                    <p className="font-medium">{selectedAppointment.attendee.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.attendee.email}</p>
                  </div>
                </div>
              </ModalBody>
              <div className="flex gap-2 px-6 pb-6">
                <Button variant="outline" className="flex-1">Reschedule</Button>
                <Button variant="outline" className="flex-1 text-red-600">Cancel</Button>
                <Button className="flex-1 bg-primary hover:bg-purple-700">Join</Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
