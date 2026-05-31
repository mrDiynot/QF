'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle, ModalFooter } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, X } from 'lucide-react';
import { messagesService } from '@/services/api/messages.service';
import { toast } from 'sonner';

interface SMSComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPhoneNumber?: string;
  defaultLeadId?: string;
}

export function SMSComposer({
  open,
  onOpenChange,
  defaultPhoneNumber = '',
  defaultLeadId,
}: SMSComposerProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const sendSMSMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; message: string }) => {
      // Create conversation first if needed, then send message
      return messagesService.sendMessage({
        conversationId: '', // Will be created by backend
        content: data.message,
        channel: 'SMS',
        direction: 'Outbound',
        metadata: {
          phoneNumber: data.phoneNumber,
          leadId: defaultLeadId,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('SMS sent successfully');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send SMS');
    },
  });

  const handleSend = () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast.error('Please enter phone number and message');
      return;
    }

    sendSMSMutation.mutate({
      phoneNumber: phoneNumber.trim(),
      message: message.trim(),
    });
  };

  const handleClose = () => {
    setPhoneNumber(defaultPhoneNumber);
    setMessage('');
    onOpenChange(false);
  };

  const characterCount = message.length;
  const messageCount = Math.ceil(characterCount / 160);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Send SMS</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!!defaultPhoneNumber}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={1600}
            />
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>
                {characterCount} / 1600 characters
              </span>
              <span>
                {messageCount} SMS {messageCount > 1 ? 'messages' : 'message'}
              </span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!phoneNumber.trim() || !message.trim() || sendSMSMutation.isPending}
          >
            <Send className="size-4 mr-2" />
            {sendSMSMutation.isPending ? 'Sending...' : 'Send SMS'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
