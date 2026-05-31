'use client';

/**
 * Initiate Call Dialog Component
 * Allows users to start outbound AI voice calls
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, Loader2, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { voiceCallsService, type VoiceInitiateCallRequest } from '@/services/api/voice-calls.service';
import { voiceAgentsService, type VoiceAgent } from '@/services/api/voice-agents.service';

interface InitiateCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCallInitiated?: (callId: string) => void;
  preselectedAgentId?: string;
  preselectedPhoneNumber?: string;
  preselectedContactName?: string;
}

export function InitiateCallDialog({
  open,
  onOpenChange,
  onCallInitiated,
  preselectedAgentId,
  preselectedPhoneNumber,
  preselectedContactName,
}: InitiateCallDialogProps) {
  const [formData, setFormData] = useState<VoiceInitiateCallRequest>({
    voiceAgentId: preselectedAgentId || '',
    phoneNumber: preselectedPhoneNumber || '',
    contactName: preselectedContactName || '',
  });

  // Fetch available voice agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['voice-agents'],
    queryFn: () => voiceAgentsService.getAgents(),
    enabled: open,
  });

  // Active agents only
  const activeAgents = agents.filter((a: VoiceAgent) => a.isActive);

  // Initiate call mutation
  const initiateMutation = useMutation({
    mutationFn: (request: VoiceInitiateCallRequest) => voiceCallsService.initiateCall(request),
    onSuccess: (data) => {
      toast.success(`Call initiated to ${formData.phoneNumber}`);
      onCallInitiated?.(data.id);
      onOpenChange(false);
      // Reset form
      setFormData({
        voiceAgentId: '',
        phoneNumber: '',
        contactName: '',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || error.message || 'Failed to initiate call';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.voiceAgentId) {
      toast.error('Please select a voice agent');
      return;
    }
    
    if (!formData.phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    initiateMutation.mutate({
      ...formData,
      phoneNumber: cleanPhone,
    });
  };

  const selectedAgent = agents.find((a: VoiceAgent) => a.id === formData.voiceAgentId);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Phone className="size-5 text-primary" />
            Initiate AI Voice Call
          </ModalTitle>
          <ModalDescription>
            Start an outbound call using your AI voice agent
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Voice Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent">Voice Agent *</Label>
            <Select
              value={formData.voiceAgentId}
              onValueChange={(value) => setFormData({ ...formData, voiceAgentId: value })}
              disabled={agentsLoading}
            >
              <SelectTrigger id="agent">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {activeAgents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No active agents available</div>
                ) : (
                  activeAgents.map((agent: VoiceAgent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="size-4 text-primary" />
                        <span>{agent.name}</span>
                        <span className="text-xs text-muted-foreground/60">({agent.voiceType})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedAgent && (
              <p className="text-xs text-muted-foreground">
                {selectedAgent.role} • {selectedAgent.language}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Name (Optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input
                id="contact"
                className="pl-9"
                placeholder="John Doe"
                value={formData.contactName || ''}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>
          </div>

          {/* Call Preview */}
          {selectedAgent && formData.phoneNumber && (
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
              <p className="text-sm font-medium text-foreground mb-2">Call Preview</p>
              <div className="space-y-1 text-sm text-primary">
                <p><span className="font-medium">Agent:</span> {selectedAgent.name}</p>
                <p><span className="font-medium">Calling:</span> {formData.phoneNumber}</p>
                {formData.contactName && (
                  <p><span className="font-medium">Contact:</span> {formData.contactName}</p>
                )}
              </div>
            </div>
          )}
        </form>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={initiateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={initiateMutation.isPending || !formData.voiceAgentId || !formData.phoneNumber}
            className="gap-2 bg-primary hover:bg-purple-700"
          >
            {initiateMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initiating...
              </>
            ) : (
              <>
                <Phone className="size-4" />
                Start Call
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
