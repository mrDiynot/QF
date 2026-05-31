'use client';

/**
 * Simulator Dashboard
 * Central hub for all testing tools
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSimulatorTheme } from './SimulatorThemeContext';
import { cn } from '@/lib/utils';
import { simulatorService, SimulatorStats, RecentActivity } from '@/services/api/simulator.service';
import { SimulatorStatCard, SimulatorStatsGrid, SimulatorCard, SimulatorToolCard } from '@/components/simulator';
import {
  Monitor,
  MessageSquare,
  FileText,
  QrCode,
  Phone,
  Radio,
  Webhook,
  Brain,
  Sparkles,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const simulatorTools = [
  {
    title: 'Website Simulator',
    description: 'Simulate customer websites with embedded widgets and forms. Test how your tools appear on real sites.',
    href: '/simulator/website',
    icon: Monitor,
    status: 'active',
    features: ['Multiple page templates', 'Device preview', 'Network inspector'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Chat Widget Tester',
    description: 'Test your embeddable chat widget with live conversations and AI responses.',
    href: '/simulator/chat-widget',
    icon: MessageSquare,
    status: 'active',
    features: ['Live widget preview', 'Multi-session testing', 'AI monitoring'],
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Form Tester',
    description: 'Test public forms, field validation, and lead capture workflows.',
    href: '/simulator/forms',
    icon: FileText,
    status: 'active',
    features: ['Auto-fill test data', 'Validation testing', 'Submission tracking'],
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'QR Code Scanner',
    description: 'Generate and test QR codes that link to your forms and chat widgets.',
    href: '/simulator/qr-codes',
    icon: QrCode,
    status: 'active',
    features: ['QR generation', 'Mobile simulation', 'UTM tracking'],
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    title: 'SMS Simulator',
    description: 'Send test SMS messages and simulate inbound conversations.',
    href: '/simulator/channels/sms',
    icon: Phone,
    status: 'active',
    features: ['Send/receive SMS', 'Template testing', 'Delivery status'],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'WhatsApp Simulator',
    description: 'Test WhatsApp Business messaging flows and templates.',
    href: '/simulator/channels/whatsapp',
    icon: MessageSquare,
    status: 'active',
    features: ['Message templates', 'Media support', 'Webhook testing'],
    gradient: 'from-green-600 to-green-500',
  },
  {
    title: 'Voice Call Tester',
    description: 'Initiate test calls and verify call scripts and AI voice agents.',
    href: '/simulator/channels/voice',
    icon: Radio,
    status: 'active',
    features: ['Call initiation', 'Script testing', 'Recording playback'],
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    title: 'Webhook Inspector',
    description: 'Monitor and test inbound/outbound webhook payloads.',
    href: '/simulator/webhooks',
    icon: Webhook,
    status: 'active',
    features: ['Payload inspection', 'Request logging', 'Retry simulation'],
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    title: 'AI Qualification Monitor',
    description: 'Watch AI lead qualification in real-time with BANT scoring visualization.',
    href: '/simulator/ai-monitor',
    icon: Brain,
    status: 'active',
    features: ['Live BANT scores', 'Decision tree', 'Score breakdown'],
    gradient: 'from-purple-500 to-indigo-500',
  },
];

export default function SimulatorDashboard() {
  const { darkMode } = useSimulatorTheme();
  const [stats, setStats] = useState<SimulatorStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, activityData] = await Promise.all([
          simulatorService.getStats(),
          simulatorService.getRecentActivity(),
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
        setError(null);
      } catch (err) {
        console.error('Error fetching simulator data:', err);
        setError('Failed to load data');
        // Set default values on error
        setStats({
          activeSessions: 0,
          testLeadsCreated: 0,
          messagesSent: 0,
          avgResponseTime: '—',
        });
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-10 backdrop-blur-xl border-b",
        darkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200"
      )}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn("text-3xl font-bold tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Testing Simulator</h1>
              <p className={cn("text-base mt-2 font-medium", darkMode ? "text-slate-400" : "text-slate-500")}>
                Professional testing environment for your Qualiflow AI integrations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Quick Stats - Using SimulatorStatCard component (Dashcode v1.2.0 pattern) */}
        <SimulatorStatsGrid columns={4}>
          <SimulatorStatCard
            icon={<Activity className="w-5 h-5 text-violet-400" />}
            iconBgColor="bg-violet-500/20"
            value={stats?.activeSessions ?? 0}
            label="Active Sessions"
            loading={isLoading}
            darkMode={darkMode}
          />
          <SimulatorStatCard
            icon={<Users className="w-5 h-5 text-emerald-400" />}
            iconBgColor="bg-emerald-500/20"
            value={stats?.testLeadsCreated ?? 0}
            label="Test Leads Created"
            loading={isLoading}
            darkMode={darkMode}
          />
          <SimulatorStatCard
            icon={<MessageSquare className="w-5 h-5 text-blue-400" />}
            iconBgColor="bg-blue-500/20"
            value={stats?.messagesSent ?? 0}
            label="Messages Sent"
            loading={isLoading}
            darkMode={darkMode}
          />
          <SimulatorStatCard
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            iconBgColor="bg-amber-500/20"
            value={stats?.avgResponseTime ?? '—'}
            label="Avg Response Time"
            loading={isLoading}
            darkMode={darkMode}
          />
        </SimulatorStatsGrid>

        {/* Tools Grid - Using SimulatorToolCard component (Dashcode v1.2.0 pattern) */}
        <div>
          <h2 className={cn("text-xl font-bold mb-5 flex items-center gap-2.5", darkMode ? "text-white" : "text-slate-900")}>
            <Sparkles className="w-5 h-5 text-violet-400" />
            Testing Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulatorTools.map((tool) => (
              <SimulatorToolCard
                key={tool.href}
                href={tool.href}
                icon={tool.icon}
                gradient={tool.gradient}
                title={tool.title}
                description={tool.description}
                features={tool.features}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity - Using SimulatorCard component (Dashcode v1.2.0 pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimulatorCard
            darkMode={darkMode}
            title="Recent Activity"
            icon={<Activity className="w-5 h-5 text-violet-400" />}
          >
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : recentActivity.length === 0 ? (
                <p className={cn("text-sm py-8 text-center", darkMode ? "text-slate-500" : "text-slate-400")}>
                  No recent activity
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    {activity.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : activity.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn("truncate font-medium", darkMode ? "text-slate-300" : "text-slate-700")}>{activity.message}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SimulatorCard>

          <SimulatorCard
            darkMode={darkMode}
            title="Quick Actions"
            icon={<Brain className="w-5 h-5 text-purple-400" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className={cn("justify-start", darkMode ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-50 text-slate-700")} asChild>
                <Link href="/simulator/website">
                  <Monitor className="w-4 h-4 mr-2" />
                  New Website Test
                </Link>
              </Button>
              <Button variant="outline" className={cn("justify-start", darkMode ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-50 text-slate-700")} asChild>
                <Link href="/simulator/chat-widget">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Test Chat Widget
                </Link>
              </Button>
              <Button variant="outline" className={cn("justify-start", darkMode ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-50 text-slate-700")} asChild>
                <Link href="/simulator/forms">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Test Form
                </Link>
              </Button>
              <Button variant="outline" className={cn("justify-start", darkMode ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-50 text-slate-700")} asChild>
                <Link href="/simulator/channels/sms">
                  <Phone className="w-4 h-4 mr-2" />
                  Send Test SMS
                </Link>
              </Button>
            </div>
          </SimulatorCard>
        </div>
      </div>
    </div>
  );
}
