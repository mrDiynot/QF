'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalBody } from '@/components/modals';
import { Sparkles } from 'lucide-react';
import { AIQualificationPanel } from './AIQualificationPanel';

interface LeadQualificationButtonProps {
  leadId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function LeadQualificationButton({
  leadId,
  conversationHistory = [],
  variant = 'default',
  size = 'default',
  className,
}: LeadQualificationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Sparkles className="size-4 mr-2" />
        AI Qualify
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent size="xl">
          <ModalBody>
            <AIQualificationPanel
              leadId={leadId}
              conversationHistory={conversationHistory}
              onQualificationComplete={() => setOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
