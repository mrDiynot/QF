'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Note: Calendar and Popover components need to be added to shadcn/ui
// For now, using simplified date input
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface Booking {
  id?: string;
  title: string;
  leadName: string;
  leadEmail: string;
  date?: Date;
  startTime: string;
  endTime?: string;
  duration: number;
  type: 'video' | 'phone' | 'in-person';
  location?: string;
  notes?: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking;
  onSave: (booking: Booking) => void;
}

export function BookingDialog({ open, onOpenChange, booking, onSave }: BookingDialogProps) {
  const [formData, setFormData] = useState({
    title: booking?.title || '',
    leadName: booking?.leadName || '',
    leadEmail: booking?.leadEmail || '',
    date: booking?.startTime ? new Date(booking.startTime) : new Date(),
    startTime: booking?.startTime ? format(new Date(booking.startTime), 'HH:mm') : '09:00',
    duration: booking?.duration || 60,
    type: booking?.type || 'video',
    location: booking?.location || '',
    notes: booking?.notes || '',
  });

  const handleSave = () => {
    const [hours, minutes] = formData.startTime.split(':');
    const startDate = new Date(formData.date);
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + formData.duration);

    onSave({
      ...booking,
      title: formData.title,
      leadName: formData.leadName,
      leadEmail: formData.leadEmail,
      duration: formData.duration,
      type: formData.type as 'video' | 'phone' | 'in-person',
      location: formData.location,
      notes: formData.notes,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>{booking ? 'Edit Booking' : 'New Booking'}</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Product Demo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadName">Lead Name</Label>
              <Input
                id="leadName"
                placeholder="John Smith"
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadEmail">Lead Email</Label>
              <Input
                id="leadEmail"
                type="email"
                placeholder="john@example.com"
                value={formData.leadEmail}
                onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={format(formData.date, 'yyyy-MM-dd')}
              onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Meeting Type</Label>
            <Select value={formData.type} onValueChange={(value: 'video' | 'phone' | 'in-person') => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'in-person' && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="123 Main St, Suite 400"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {booking ? 'Update' : 'Create'} Booking
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
