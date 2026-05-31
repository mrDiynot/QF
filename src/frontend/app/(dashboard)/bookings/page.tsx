'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

interface Booking {
  id: string;
  title: string;
  leadName: string;
  leadEmail: string;
  startTime: Date;
  endTime: Date;
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

export default function BookingsPage() {
  const [selectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Subscription enforcement - Bookings requires ai_voice feature (SmartFlow+)
  const { hasFeatureAccess, getRequiredPlan, isLoading: featureLoading } = useFeatureAccess();
  const hasBookings = hasFeatureAccess('ai_voice');
  const requiredPlan = getRequiredPlan('ai_voice');

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', selectedDate, viewMode],
    queryFn: async () => {
      const { bookingsService } = await import('@/services/api/bookings.service');
      const startDate = format(selectedDate, 'yyyy-MM-dd');
      const endDate = format(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      return bookingsService.getBookings({ startDate, endDate });
    },
  });

  // Transform API data to display format
  const bookings: Booking[] = (bookingsData || []).map((b: { id: string; title?: string; leadName?: string; leadEmail?: string; scheduledAt: string; endAt?: string; type?: string; location?: string; status: string; notes?: string }) => ({
    id: b.id,
    title: b.title || 'Meeting',
    leadName: b.leadName || 'Unknown',
    leadEmail: b.leadEmail || '',
    startTime: new Date(b.scheduledAt),
    endTime: b.endAt ? new Date(b.endAt) : new Date(new Date(b.scheduledAt).getTime() + 30 * 60 * 1000),
    type: (b.type || 'video') as 'in-person' | 'video' | 'phone',
    location: b.location,
    status: b.status as 'confirmed' | 'pending' | 'cancelled' | 'completed',
    notes: b.notes,
  }));

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="size-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="size-4 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="size-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="size-4" />;
      case 'phone':
        return <Phone className="size-4" />;
      case 'in-person':
        return <MapPin className="size-4" />;
      default:
        return null;
    }
  };

  // Feature gate - show upgrade prompt if user doesn't have Bookings
  if (!featureLoading && !hasBookings) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="mx-auto max-w-[1440px]">
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="rounded-full bg-blue-100 p-6">
                <Lock className="size-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-navy mb-2">Smart Bookings</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  Smart Bookings is available on {requiredPlan || 'SmartFlow'} and higher plans. 
                  Upgrade to manage appointments and scheduling with AI-powered features.
                </p>
              </div>
              <Button 
                className="gap-2 rounded-[10px] gradient-primary text-white"
                onClick={() => setShowUpgradeDialog(true)}
              >
                Upgrade to Unlock
              </Button>
            </div>
          </Card>
        </div>
        <UpgradePrompt
          showDialog={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="Smart Bookings"
          reason="Manage appointments and scheduling with AI-powered reminders and no-show recovery."
          requiredPlan="Smart Flow"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-navy">Bookings & Scheduling</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage appointments and meetings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="size-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-text-secondary">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-text-secondary">Ready to go</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-text-secondary">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-text-secondary">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Calendar View */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week' | 'month')}>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                      <span className="text-2xl font-bold text-gray-900">
                        {format(booking.startTime, 'd')}
                      </span>
                      <span className="text-xs text-text-secondary uppercase">
                        {format(booking.startTime, 'MMM')}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{booking.title}</h3>
                        <Badge variant="outline" className="gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {format(booking.startTime, 'h:mm a')} - {format(booking.endTime, 'h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(booking.type)}
                          {booking.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {booking.leadName}
                        </span>
                      </div>

                      {booking.location && (
                        <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                          <MapPin className="size-3" />
                          {booking.location}
                        </p>
                      )}

                      {booking.notes && (
                        <p className="text-sm text-text-secondary mt-2">{booking.notes}</p>
                      )}
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}

                {bookingsLoading && (
                  <div className="text-center py-12">
                    <div className="animate-spin size-8 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                    <p className="text-text-secondary">Loading bookings...</p>
                  </div>
                )}
                {!bookingsLoading && bookings.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="size-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-text-secondary">No bookings scheduled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Upcoming */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{booking.title}</span>
                    {getStatusIcon(booking.status)}
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p>{format(booking.startTime, 'MMM d, h:mm a')}</p>
                    <p className="flex items-center gap-1">
                      <User className="size-3" />
                      {booking.leadName}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="size-4 mr-2" />
                Schedule New Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="size-4 mr-2" />
                Set Availability
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Video className="size-4 mr-2" />
                Meeting Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
