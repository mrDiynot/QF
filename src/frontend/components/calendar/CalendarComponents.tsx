'use client';

/**
 * Calendar & Scheduling Components
 * Mini calendars, time slot pickers, event cards
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';

// Mini Calendar
interface MiniCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  highlightedDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function MiniCalendar({
  selected,
  onSelect,
  highlightedDates = [],
  minDate,
  maxDate,
  className,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isHighlighted = (date: Date) => highlightedDates.some(d => isSameDay(d, date));
  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <Card className={cn("p-4 w-72", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <h3 className="font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selected && isSameDay(day, selected);
          const highlighted = isHighlighted(day);
          const disabled = isDisabled(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => !disabled && onSelect?.(day)}
              disabled={disabled}
              className={cn(
                "size-8 rounded-full text-sm font-medium transition-colors relative",
                !isCurrentMonth && "text-muted-foreground/30",
                isCurrentMonth && !isSelected && "text-foreground hover:bg-muted/50",
                isToday(day) && !isSelected && "text-primary font-bold",
                isSelected && "bg-primary text-white",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {format(day, 'd')}
              {highlighted && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// Time Slot Picker
interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected?: string;
  onSelect?: (time: string) => void;
  className?: string;
}

export function TimeSlotPicker({ slots, selected, onSelect, className }: TimeSlotPickerProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {slots.map((slot) => (
        <Button
          key={slot.time}
          variant={selected === slot.time ? 'default' : 'outline'}
          size="sm"
          disabled={!slot.available}
          onClick={() => slot.available && onSelect?.(slot.time)}
          className={cn(
            !slot.available && "opacity-50"
          )}
        >
          {slot.time}
        </Button>
      ))}
    </div>
  );
}

// Generate default time slots
export function generateTimeSlots(
  startHour = 9,
  endHour = 17,
  intervalMinutes = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push({ time, available: true });
    }
  }
  return slots;
}

// Event Card
interface EventCardProps {
  title: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  type?: 'meeting' | 'call' | 'video' | 'task';
  attendees?: Array<{ name: string; avatar?: string }>;
  color?: string;
  onClick?: () => void;
  className?: string;
}

const EVENT_ICONS = {
  meeting: <Users className="size-4" />,
  call: <Phone className="size-4" />,
  video: <Video className="size-4" />,
  task: <CalendarIcon className="size-4" />,
};

export function ScheduleEventCard({
  title,
  startTime,
  endTime,
  location,
  type = 'meeting',
  attendees,
  color = '#8b5cf6',
  onClick,
  className,
}: EventCardProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4",
        className
      )}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{title}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Clock className="size-3" />
            <span>
              {format(startTime, 'h:mm a')}
              {endTime && ` - ${format(endTime, 'h:mm a')}`}
            </span>
          </div>
          {location && (
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="size-3" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
          {EVENT_ICONS[type]}
        </div>
      </div>

      {attendees && attendees.length > 0 && (
        <div className="flex items-center mt-3 pt-3 border-t">
          <div className="flex -space-x-2">
            {attendees.slice(0, 4).map((attendee, index) => (
              <Avatar key={index} className="size-6 border-2 border-white">
                <AvatarImage src={attendee.avatar} />
                <AvatarFallback className="text-[10px]">
                  {attendee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {attendees.length > 4 && (
            <span className="text-xs text-muted-foreground/60 ml-2">+{attendees.length - 4}</span>
          )}
        </div>
      )}
    </Card>
  );
}

// Day Schedule
interface ScheduleEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  type?: 'meeting' | 'call' | 'video' | 'task';
}

interface DayScheduleProps {
  date: Date;
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
  onAddEvent?: (time: Date) => void;
  startHour?: number;
  endHour?: number;
  className?: string;
}

export function DaySchedule({
  date,
  events,
  onEventClick,
  onAddEvent,
  startHour = 8,
  endHour = 18,
  className,
}: DayScheduleProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{format(date, 'EEEE, MMMM d')}</h3>
        {onAddEvent && (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => onAddEvent(date)}>
            <Plus className="size-4" /> Add Event
          </Button>
        )}
      </div>

      <div className="space-y-0">
        {hours.map((hour) => {
          const hourEvents = events.filter((e) => {
            const eventHour = e.startTime.getHours();
            return eventHour === hour;
          });

          return (
            <div key={hour} className="flex border-t py-2 min-h-[60px]">
              <div className="w-16 text-sm text-muted-foreground/60 flex-shrink-0">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
              <div className="flex-1 space-y-1">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 rounded text-sm cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: `${event.color || '#8b5cf6'}20`, borderLeft: `3px solid ${event.color || '#8b5cf6'}` }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Week View Header
interface WeekViewHeaderProps {
  startDate: Date;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  className?: string;
}

export function WeekViewHeader({
  startDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  className,
}: WeekViewHeaderProps) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <div className="flex">
          <Button variant="ghost" size="icon" className="size-8" onClick={onPrevWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={onNextWeek}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <h2 className="font-semibold text-foreground">
        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
      </h2>
    </div>
  );
}

// Availability Indicator
interface AvailabilityIndicatorProps {
  status: 'available' | 'busy' | 'tentative' | 'away';
  label?: string;
  className?: string;
}

const AVAILABILITY_CONFIG = {
  available: { color: 'bg-green-500', label: 'Available' },
  busy: { color: 'bg-red-500', label: 'Busy' },
  tentative: { color: 'bg-amber-500', label: 'Tentative' },
  away: { color: 'bg-gray-400', label: 'Away' },
};

export function AvailabilityIndicator({ status, label, className }: AvailabilityIndicatorProps) {
  const config = AVAILABILITY_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("size-2.5 rounded-full", config.color)} />
      <span className="text-sm text-muted-foreground">{label || config.label}</span>
    </div>
  );
}

// Upcoming Events List
interface UpcomingEventsProps {
  events: ScheduleEvent[];
  maxEvents?: number;
  onEventClick?: (event: ScheduleEvent) => void;
  onViewAll?: () => void;
  className?: string;
}

export function UpcomingEvents({
  events,
  maxEvents = 5,
  onEventClick,
  onViewAll,
  className,
}: UpcomingEventsProps) {
  const displayedEvents = events.slice(0, maxEvents);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
        {onViewAll && events.length > maxEvents && (
          <Button variant="link" size="sm" onClick={onViewAll} className="text-primary">
            View All
          </Button>
        )}
      </div>

      {displayedEvents.length > 0 ? (
        <div className="space-y-3">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer"
              onClick={() => onEventClick?.(event)}
            >
              <div
                className="size-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: event.color || '#8b5cf6' }}
              >
                {format(event.startTime, 'd')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(event.startTime, 'EEE, MMM d • h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="size-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming events</p>
        </div>
      )}
    </Card>
  );
}

// Date Picker Button
interface DatePickerButtonProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePickerButton({
  value,
  onChange,
  placeholder = 'Select date',
  className,
}: DatePickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className="gap-2 justify-start"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="size-4" />
        {value ? format(value, 'PPP') : placeholder}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <MiniCalendar
            selected={value}
            onSelect={(date) => {
              onChange?.(date);
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
