'use client';

/**
 * Quick Actions Widget Component
 * Provides quick access to common actions from the dashboard
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  UserPlus,
  MessageSquare,
  Phone,
  FileText,
  Mail,
  Calendar,
  Zap,
  Send,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

// All actions use neutral color - action identified by icon and text, not color
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-lead',
    name: 'Add Lead',
    description: 'Create a new lead',
    icon: <UserPlus className="size-5" />,
    color: 'bg-muted/50',
  },
  {
    id: 'send-message',
    name: 'Send Message',
    description: 'Message a contact',
    icon: <MessageSquare className="size-5" />,
    color: 'bg-muted/50',
  },
  {
    id: 'make-call',
    name: 'Make Call',
    description: 'Start a phone call',
    icon: <Phone className="size-5" />,
    color: 'bg-muted/50',
  },
  {
    id: 'create-proposal',
    name: 'New Proposal',
    description: 'Create a proposal',
    icon: <FileText className="size-5" />,
    color: 'bg-muted/50',
  },
  {
    id: 'send-email',
    name: 'Send Email',
    description: 'Compose an email',
    icon: <Mail className="size-5" />,
    color: 'bg-muted/50',
  },
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'Book an appointment',
    icon: <Calendar className="size-5" />,
    color: 'bg-muted/50',
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);

  // Handle action clicks
  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'new-lead':
        setAddLeadOpen(true);
        break;
      case 'send-message':
        setSendMessageOpen(true);
        break;
      case 'make-call':
        toast.info('Opening dialer...');
        break;
      case 'create-proposal':
        window.location.href = '/proposals/new';
        break;
      case 'send-email':
        toast.info('Opening email composer...');
        break;
      case 'schedule':
        toast.info('Opening scheduler...');
        break;
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="size-3" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="group p-4 rounded-xl border bg-white hover:shadow-md transition-all text-left"
          >
            <div className={cn(
              "size-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-3",
              action.color
            )}>
              {action.icon}
            </div>
            <p className="font-medium text-foreground text-sm">{action.name}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Add Lead Dialog */}
      <Modal open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Add New Lead</ModalTitle>
            <ModalDescription>
              Quickly add a new lead to your pipeline
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select defaultValue="manual">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="website">Website Form</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddLeadOpen(false);
                toast.success('Lead added successfully');
              }}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add Lead
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Send Message Dialog */}
      <Modal open={sendMessageOpen} onOpenChange={setSendMessageOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Send Quick Message</ModalTitle>
            <ModalDescription>
              Send a message to a contact
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input placeholder="Search contacts..." />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select defaultValue="sms">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Type your message..." rows={4} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSendMessageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSendMessageOpen(false);
                toast.success('Message sent');
              }}
              className="gap-2"
            >
              <Send className="size-4" />
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
