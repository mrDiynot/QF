'use client';

import { useState, useMemo } from 'react';
import { Phone, Calendar, CheckCircle2, Clock, Sparkles, Video, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboarding';
import { useAvailableSlots, useBookOnboardingCall } from '@/hooks/onboarding/useOnboardingCall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OnboardingCallPage() {
  const router = useRouter();
  const { data: onboardingStatus, isLoading: isLoadingStatus } = useOnboardingStatus();
  const { data: slotsData, isLoading: isLoadingSlots, error: slotsError } = useAvailableSlots();
  const bookCall = useBookOnboardingCall();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Get user timezone
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Format slots for display
  const formattedSlots = useMemo(() => {
    if (!slotsData?.slots) return [];
    return slotsData.slots
      .filter(slot => slot.isAvailable)
      .map(slot => {
        const date = new Date(slot.startTime);
        return {
          id: slot.startTime,
          datetime: slot.startTime,
          date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
        };
      });
  }, [slotsData]);

  const handleBookCall = async () => {
    if (!selectedSlot) return;
    const result = await bookCall.mutateAsync({
      scheduledAt: selectedSlot,
      timezone: userTimezone,
    });
    if (result.success) {
      router.refresh();
    }
  };

  const isLoading = isLoadingStatus || isLoadingSlots;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonLoader className="h-12 w-48" />
          <SkeletonLoader className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show already scheduled message
  if (onboardingStatus?.onboardingCallScheduled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 size-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="size-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Onboarding Call Scheduled!</CardTitle>
              <CardDescription className="text-emerald-700">
                Your 1-on-1 onboarding call has been confirmed
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {onboardingStatus.onboardingCallScheduledAt && (
                <div className="bg-white rounded-xl p-4 border border-emerald-200 inline-block">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-emerald-600" />
                    <span className="font-medium text-gray-900">
                      {new Date(onboardingStatus.onboardingCallScheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                You&apos;ll receive a calendar invite and reminder email. Our team will guide you through
                setting up your channels, AI configuration, and knowledge base.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show not eligible message
  if (!onboardingStatus?.hasOnboardingSupport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 size-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="size-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl text-amber-900">Onboarding Support</CardTitle>
              <CardDescription className="text-amber-700">
                Get personalized help setting up QualiFlow AI
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 max-w-md mx-auto">
                1-on-1 onboarding support is included with UltraFlow and Enterprise plans, 
                or available as a $700 add-on for SmartFlow customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/settings/billing">View Upgrade Options</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main booking interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 size-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <Video className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Onboarding Call</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Schedule a 30-minute 1-on-1 call with our team. We&apos;ll help you set up your channels,
            configure AI qualification, and answer any questions.
          </p>
        </div>

        {/* Time Slot Selection - Split Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr,320px] mb-6">
          {/* Left: Scrollable Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-emerald-600" />
                Select a Time Slot
              </CardTitle>
              <CardDescription>
                Choose a convenient time for your onboarding call (times shown in your local timezone)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slotsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Unable to load available time slots. Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {formattedSlots.length === 0 && !slotsError && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="size-12 mx-auto mb-3 text-gray-300" />
                  <p>No available time slots at the moment.</p>
                  <p className="text-sm mt-1">Please check back later or contact support.</p>
                </div>
              )}

              {formattedSlots.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 max-h-[400px] overflow-y-auto pr-2">
                  {formattedSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      disabled={bookCall.isPending}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSlot === slot.id
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      } ${bookCall.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-medium text-gray-900">{slot.date}</div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Clock className="size-3.5" />
                        {slot.time}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Sticky Booking Summary Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    Your Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSlot ? (
                    <>
                      <div className="bg-white rounded-xl p-4 border border-emerald-200">
                        <div className="font-medium text-gray-900">
                          {formattedSlots.find(s => s.id === selectedSlot)?.date}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-emerald-600">
                          <Clock className="size-3.5" />
                          {formattedSlots.find(s => s.id === selectedSlot)?.time}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Video className="size-3.5" />
                        30-minute video call
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="size-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Select a time slot to continue</p>
                    </div>
                  )}

                  <Button
                    onClick={handleBookCall}
                    disabled={!selectedSlot || bookCall.isPending}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
                  >
                    {bookCall.isPending ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Phone className="size-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile: Sticky Bottom Booking Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1 min-w-0">
              {selectedSlot ? (
                <div>
                  <div className="font-medium text-gray-900 truncate">
                    {formattedSlots.find(s => s.id === selectedSlot)?.date}
                  </div>
                  <div className="text-sm text-emerald-600 truncate">
                    {formattedSlots.find(s => s.id === selectedSlot)?.time}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Select a time slot above</div>
              )}
            </div>
            <Button
              onClick={handleBookCall}
              disabled={!selectedSlot || bookCall.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 flex-shrink-0"
            >
              {bookCall.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Phone className="size-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Spacer for mobile sticky bar */}
        <div className="h-20 lg:hidden" />

        {/* What to Expect */}
        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Channel Setup</h4>
                  <p className="text-sm text-gray-600">Configure SMS, Voice, or WhatsApp channels</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AI Configuration</h4>
                  <p className="text-sm text-gray-600">Customize BANT weights and qualification</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Knowledge Base</h4>
                  <p className="text-sm text-gray-600">Upload FAQs and product information</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

