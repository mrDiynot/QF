'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Server,
  Database,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Zap,
  DollarSign,
} from 'lucide-react';
import { useAdminSystemHealth, useAdminBackgroundJobs, useAdminExternalUsage } from '@/hooks/admin';
import { useQueryClient } from '@tanstack/react-query';

export default function SystemHealthPage() {
  const queryClient = useQueryClient();
  
  // Use React Query hooks for real-time data
  const { data: health, isLoading: healthLoading, isRefetching: healthRefetching } = useAdminSystemHealth();
  const { data: jobs, isLoading: jobsLoading } = useAdminBackgroundJobs();
  const { data: usageData, isLoading: usageLoading } = useAdminExternalUsage();

  // Safe extraction with defaults to prevent undefined errors
  const usage = {
    twilio: {
      smsCount: usageData?.twilio?.smsCount ?? 0,
      voiceMinutes: usageData?.twilio?.voiceMinutes ?? 0,
      estimatedCost: usageData?.twilio?.estimatedCost ?? 0,
    },
    openai: {
      totalRequests: usageData?.openai?.totalRequests ?? 0,
      totalTokens: usageData?.openai?.totalTokens ?? 0,
      estimatedCost: usageData?.openai?.estimatedCost ?? 0,
    },
    stripe: {
      transactionCount: usageData?.stripe?.transactionCount ?? 0,
      totalVolume: usageData?.stripe?.totalVolume ?? 0,
    },
  };

  const loading = healthLoading || jobsLoading || usageLoading;
  const refreshing = healthRefetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'system'] });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 bg-admin-muted" />
          <Skeleton className="h-10 w-24 bg-admin-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-admin-muted" />
          ))}
        </div>
        <Skeleton className="h-64 bg-admin-muted" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-admin-foreground">System Health</h1>
          <p className="text-admin-muted-foreground mt-1">Monitor system status and performance</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          disabled={refreshing}
          className="border-admin-border text-admin-foreground hover:bg-admin-muted"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      {health && (
        <Card className={`border ${
          health.status === 'healthy' 
            ? 'bg-green-500/10 border-green-500/30' 
            : health.status === 'degraded'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(health.status)}
                <div>
                  <h2 className="text-lg font-semibold text-admin-foreground">Overall System Status</h2>
                  <p className="text-admin-muted-foreground">Uptime: {health.uptime} | Version: {health.version}</p>
                </div>
              </div>
              {getStatusBadge(health.status)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status Grid */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health.services.map((service: { name: string; status: string; latency?: number }) => (
            <Card key={service.name} className="bg-admin-card border-admin-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-admin-foreground flex items-center gap-2">
                    {service.name.includes('Database') && <Database className="h-4 w-4 text-blue-400" />}
                    {service.name.includes('API') && <Server className="h-4 w-4 text-purple-400" />}
                    {service.name.includes('Queue') && <Cpu className="h-4 w-4 text-orange-400" />}
                    {service.name.includes('Cache') && <Zap className="h-4 w-4 text-yellow-400" />}
                    {!service.name.match(/Database|API|Queue|Cache/) && <Activity className="h-4 w-4 text-admin-muted-foreground" />}
                    {service.name}
                  </CardTitle>
                  {getStatusIcon(service.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.latency !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-admin-muted-foreground">Latency</span>
                      <span className={`font-medium ${
                        service.latency < 100 ? 'text-green-400' : 
                        service.latency < 500 ? 'text-amber-400' : 'text-red-400'
                      }`}>{service.latency}ms</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Background Jobs */}
      {jobs && jobs.length > 0 && (
        <Card className="bg-admin-card border-admin-border">
          <CardHeader>
            <CardTitle className="text-admin-foreground flex items-center gap-2">
              <Cpu className="h-5 w-5 text-orange-400" />
              Background Jobs
            </CardTitle>
            <CardDescription className="text-admin-muted-foreground">
              Recent background job status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job: { id: string; name: string; status: string; lastRun?: string; nextRun?: string }) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-admin-muted/50 rounded-lg border border-admin-border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status === 'completed' ? 'healthy' : job.status === 'failed' ? 'down' : 'degraded')}
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">{job.name}</p>
                      {job.lastRun && (
                        <p className="text-xs text-admin-muted-foreground">Last run: {new Date(job.lastRun).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* External Service Usage */}
      {usage && (
        <Card className="bg-admin-card border-admin-border">
          <CardHeader>
            <CardTitle className="text-admin-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              External Service Usage (This Month)
            </CardTitle>
            <CardDescription className="text-admin-muted-foreground">
              Estimated costs based on usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Twilio */}
              <div className="p-4 bg-admin-muted/50 rounded-lg border border-admin-border space-y-3">
                <h3 className="font-semibold text-admin-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  Twilio
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-admin-muted-foreground">SMS Sent</span>
                    <span className="text-admin-foreground">{usage.twilio.smsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted-foreground">Voice Minutes</span>
                    <span className="text-admin-foreground">{usage.twilio.voiceMinutes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-admin-border">
                    <span className="text-admin-muted-foreground">Est. Cost</span>
                    <span className="text-green-400 font-medium">${usage.twilio.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* OpenAI */}
              <div className="p-4 bg-admin-muted/50 rounded-lg border border-admin-border space-y-3">
                <h3 className="font-semibold text-admin-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  OpenAI
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-admin-muted-foreground">Requests</span>
                    <span className="text-admin-foreground">{usage.openai.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted-foreground">Tokens Used</span>
                    <span className="text-admin-foreground">{usage.openai.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-admin-border">
                    <span className="text-admin-muted-foreground">Est. Cost</span>
                    <span className="text-green-400 font-medium">${usage.openai.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Stripe */}
              <div className="p-4 bg-admin-muted/50 rounded-lg border border-admin-border space-y-3">
                <h3 className="font-semibold text-admin-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  Stripe
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-admin-muted-foreground">Transactions</span>
                    <span className="text-admin-foreground">{usage.stripe.transactionCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted-foreground">Volume</span>
                    <span className="text-admin-foreground">${usage.stripe.totalVolume.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
