'use client';

import { SMSTemplates } from '@/components/channels/SMSTemplates';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SMSTemplatesPage() {
  return (
    <div className="animate-fade-in pt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/channels/sms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              Back to SMS
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="size-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-navy">SMS Templates</h1>
              <p className="text-sm text-text-secondary mt-1">
                Create and manage reusable SMS message templates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Templates Component */}
      <SMSTemplates />
    </div>
  );
}
