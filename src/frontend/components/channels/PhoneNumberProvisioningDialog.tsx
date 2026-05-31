'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalBody, ModalTitle } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Phone, MapPin, DollarSign, Loader2, Check, X, Info, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { twilioService, PhoneNumberCapabilities, type TwilioAvailableNumber, type TwilioStatus } from '@/services/api/twilio.service';
import { toast } from 'sonner';



interface PhoneNumberProvisioningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProvision: (phoneNumber: string) => void;
  channelType: 'SMS' | 'Voice' | 'WhatsApp';
}

export function PhoneNumberProvisioningDialog({
  open,
  onOpenChange,
  onProvision,
  channelType,
}: PhoneNumberProvisioningDialogProps) {
  const [areaCode, setAreaCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<TwilioAvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [twilioStatus, setTwilioStatus] = useState<TwilioStatus | null>(null);

  // Check if we're in development mode with skip provisioning enabled
  const isDevelopmentMode = twilioStatus?.skipProvisioning && twilioStatus?.developmentPhoneNumber;

  // Fetch Twilio status on mount
  useEffect(() => {
    if (open) {
      twilioService.getStatus().then(setTwilioStatus).catch(console.error);
    }
  }, [open]);

  const getCapabilitiesForChannelType = (type: string): PhoneNumberCapabilities => {
    switch (type.toUpperCase()) {
      case 'SMS':
        // Most Twilio numbers support both SMS and Voice, so we request both
        // to ensure we get available numbers
        return PhoneNumberCapabilities.SMS | PhoneNumberCapabilities.Voice;
      case 'VOICE':
        return PhoneNumberCapabilities.Voice | PhoneNumberCapabilities.SMS;
      case 'WHATSAPP':
        return PhoneNumberCapabilities.SMS | PhoneNumberCapabilities.MMS;
      default:
        return PhoneNumberCapabilities.SMS | PhoneNumberCapabilities.Voice;
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      console.log('[PhoneNumberProvisioning] Searching for numbers with params:', {
        countryCode: 'US',
        areaCode: areaCode || undefined,
        capabilities: getCapabilitiesForChannelType(channelType),
        limit: 10,
      });

      const numbers = await twilioService.searchAvailableNumbers({
        countryCode: 'US',
        areaCode: areaCode || undefined,
        capabilities: getCapabilitiesForChannelType(channelType),
        limit: 10,
      });

      console.log('[PhoneNumberProvisioning] Search results:', numbers);
      setAvailableNumbers(numbers);

      if (numbers.length === 0) {
        toast.info('No available numbers found. Try a different area code.');
      } else {
        toast.success(`Found ${numbers.length} available numbers!`);
      }
    } catch (error: unknown) {
      console.error('[PhoneNumberProvisioning] Failed to search numbers:', error);
      const axiosError = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
      console.error('[PhoneNumberProvisioning] Error response:', axiosError.response?.data);

      const errorMessage = axiosError.response?.data?.detail
        || axiosError.response?.data?.message
        || axiosError.message
        || 'Failed to search phone numbers. Please try again.';

      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProvision = async () => {
    if (!selectedNumber) return;

    setIsProvisioning(true);
    try {
      // Call the onProvision callback with the selected number
      // The parent component will handle the actual provisioning via channel activation
      onProvision(selectedNumber);
      toast.success('Phone number selected successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to provision number:', error);
      toast.error('Failed to provision phone number. Please try again.');
    } finally {
      setIsProvisioning(false);
    }
  };

  // Development mode: Use shared development number directly
  const handleDevProvision = async () => {
    if (!twilioStatus?.developmentPhoneNumber) return;

    setIsProvisioning(true);
    try {
      onProvision(twilioStatus.developmentPhoneNumber);
      toast.success('Development number activated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to activate development number:', error);
      toast.error('Failed to activate phone number. Please try again.');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="max-h-[80vh] overflow-y-auto bg-white border border-border">
        <ModalHeader>
          <div className="flex items-center justify-between">
            <ModalTitle className="flex items-center gap-3 text-xl font-semibold text-text-navy">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <Phone className="size-5 text-brand-purple" />
              </div>
              Provision Phone Number
            </ModalTitle>
            {twilioStatus && (
              <Badge
                variant={twilioStatus.isTestMode ? "secondary" : "default"}
                className={cn(
                  "text-xs font-medium",
                  twilioStatus.isTestMode
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-green-100 text-green-800 border-green-300"
                )}
              >
                {twilioStatus.isTestMode ? "🧪 Testing Mode" : "🚀 Production Mode"}
              </Badge>
            )}
          </div>
          <ModalDescription className="text-sm text-text-secondary">
            Search for available {channelType} phone numbers and select one to provision.
            {twilioStatus?.isTestMode && (
              <span className="block mt-1 text-amber-600 font-medium">
                Test mode: Using simulated phone numbers. No real charges will be incurred.
              </span>
            )}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {isDevelopmentMode ? (
            /* ========================================
               DEVELOPMENT MODE: Simplified UI
               Shows shared number with one-click activation
               ======================================== */
            <>
              {/* Development Mode Banner */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full shrink-0">
                  <Zap className="size-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900">Development Mode</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All businesses share a single toll-free number in development to reduce costs and simplify testing.
                  </p>
                </div>
              </div>

              {/* Shared Number Card */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <CheckCircle2 className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">Ready to Activate</h3>
                    <p className="text-sm text-emerald-700">This shared number is pre-configured for testing</p>
                  </div>
                </div>

                <div className="p-4 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Shared Development Number</p>
                  <p className="text-2xl font-mono font-bold text-emerald-900">
                    {twilioStatus?.developmentPhoneNumber}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-xs text-emerald-700">
                      <Check className="size-3" /> Voice
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-700">
                      <Check className="size-3" /> SMS
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-700">
                      <Check className="size-3" /> MMS
                    </div>
                  </div>
                </div>

                <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1.5">
                  <Info className="size-3.5" />
                  No provisioning needed — click below to activate instantly
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProvisioning}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDevProvision}
                  disabled={isProvisioning}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isProvisioning ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Zap className="size-4" />
                      Use Shared Number
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* ========================================
               PRODUCTION MODE: Full Search/Select UI
               Allows searching and selecting numbers
               ======================================== */
            <>
              {/* Search Section */}
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="areaCode" className="text-sm font-medium text-text-navy">Area Code (Optional)</Label>
                    <Input
                      id="areaCode"
                      placeholder="e.g., 415, 212, 310"
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      maxLength={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="gap-2"
                    >
                      {isSearching ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Search className="size-4" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">
                  Leave area code empty to search all available numbers in the US.
                </p>
              </div>

              {/* Available Numbers List */}
              {availableNumbers.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-text-navy">Available Numbers ({availableNumbers.length})</Label>
                  <RadioGroup value={selectedNumber || ''} onValueChange={setSelectedNumber}>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {availableNumbers.map((number) => (
                        <div
                          key={number.phoneNumber}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer',
                            selectedNumber === number.phoneNumber
                              ? 'border-brand-purple bg-brand-purple/5'
                              : 'border-border bg-white hover:border-border'
                          )}
                          onClick={() => setSelectedNumber(number.phoneNumber)}
                        >
                          <RadioGroupItem value={number.phoneNumber} id={number.phoneNumber} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-navy">{number.friendlyName}</span>
                              {number.locality && number.region && (
                                <Badge variant="secondary" className="text-xs">
                                  <MapPin className="size-3 mr-1" />
                                  {number.locality}, {number.region}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <div className="flex items-center gap-1 text-xs">
                                {number.voiceEnabled ? (
                                  <Check className="size-3 text-green-600" />
                                ) : (
                                  <X className="size-3 text-muted-foreground/60" />
                                )}
                                <span className={number.voiceEnabled ? 'text-green-600' : 'text-muted-foreground/60'}>
                                  Voice
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {number.smsEnabled ? (
                                  <Check className="size-3 text-green-600" />
                                ) : (
                                  <X className="size-3 text-muted-foreground/60" />
                                )}
                                <span className={number.smsEnabled ? 'text-green-600' : 'text-muted-foreground/60'}>
                                  SMS
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {number.mmsEnabled ? (
                                  <Check className="size-3 text-green-600" />
                                ) : (
                                  <X className="size-3 text-muted-foreground/60" />
                                )}
                                <span className={number.mmsEnabled ? 'text-green-600' : 'text-muted-foreground/60'}>
                                  MMS
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-sm font-medium text-text-secondary">
                            <DollarSign className="size-3.5" />
                            1.00/mo
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Empty State */}
              {!isSearching && availableNumbers.length === 0 && (
                <div className="text-center py-10 px-6 bg-muted/20 rounded-lg border border-border">
                  <div className="p-3 bg-muted/40 rounded-full w-fit mx-auto mb-3">
                    <Phone className="size-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm text-text-secondary">Search for available phone numbers to get started</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProvisioning}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProvision}
                  disabled={!selectedNumber || isProvisioning}
                  className="gap-2"
                >
                  {isProvisioning ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Provision Number
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

