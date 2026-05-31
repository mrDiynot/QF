'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function CannedResponsesPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/support">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-medium text-admin-foreground">Canned Responses</h1>
            <p className="text-admin-muted-foreground mt-1">
              Quick response templates for support tickets
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-400" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-6 bg-admin-muted/50 rounded-lg border border-admin-border">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-admin-foreground mb-2">
                Canned Responses Feature In Development
              </h3>
              <p className="text-admin-muted-foreground mb-4">
                We&apos;re building a comprehensive canned responses system to help you respond to support tickets faster. This feature will include:
              </p>
              <ul className="space-y-2 text-admin-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Pre-built response templates for common inquiries
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Custom template creation with variables
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Category organization and search
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Usage analytics and optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Team sharing and collaboration
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-admin-background rounded-lg border border-admin-border">
            <div>
              <p className="text-sm font-medium text-admin-foreground">Need this feature sooner?</p>
              <p className="text-sm text-admin-muted-foreground mt-1">
                Contact our team to discuss priority implementation
              </p>
            </div>
            <Link href="/admin/support">
              <Button className="bg-[#FF6900] hover:bg-orange-600">
                Back to Support Tickets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
