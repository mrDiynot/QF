'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone, Plus, Settings, Clock,
  TrendingUp, CheckCircle, PhoneCall, Trash2, Mic, Lock, PhoneOutgoing
} from 'lucide-react';
import { voiceAgentsService, type VoiceAgent, type VoiceCall, type CreateVoiceAgentRequest } from '@/services/api/voice-agents.service';
import { toast } from 'sonner';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { InitiateCallDialog } from '@/components/voice/InitiateCallDialog';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AIVoicePage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [newAgent, setNewAgent] = useState<CreateVoiceAgentRequest>({ 
    name: '', 
    role: '', 
    voiceType: 'Female - Professional',
    language: 'English (US)',
    personality: 'Friendly and Professional'
  });
  const queryClient = useQueryClient();

  // Subscription enforcement - AI Voice requires ai_voice feature
  const { hasFeatureAccess, getRequiredPlan, isLoading: featureLoading } = useFeatureAccess();
  const hasAIVoice = hasFeatureAccess('ai_voice');
  const requiredPlan = getRequiredPlan('ai_voice');

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['voice-agents'],
    queryFn: () => voiceAgentsService.getAgents(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['voice-agents', 'stats'],
    queryFn: () => voiceAgentsService.getStats(),
  });

  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ['voice-agents', 'calls'],
    queryFn: () => voiceAgentsService.getCalls(10),
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateVoiceAgentRequest) => voiceAgentsService.createAgent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agents'] });
      setShowCreateDialog(false);
      setNewAgent({ name: '', role: '', voiceType: 'Female - Professional', language: 'English (US)', personality: 'Friendly and Professional' });
      toast.success('Agent created successfully');
    },
    onError: (error: Error & { response?: { status?: number; data?: { detail?: string; message?: string } } }) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
      
      if (status === 403) {
        if (message?.includes('limit')) {
          toast.error('You have reached your AI voice agent limit. Upgrade your plan to create more agents.');
        } else {
          toast.error('AI Voice feature requires a higher subscription plan.');
          setShowUpgradeDialog(true);
        }
      } else {
        toast.error(message || 'Failed to create agent');
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      voiceAgentsService.updateAgent(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agents'] });
      toast.success('Agent updated');
    },
    onError: () => toast.error('Failed to update agent'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => voiceAgentsService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agents'] });
      toast.success('Agent deleted');
    },
    onError: () => toast.error('Failed to delete agent'),
  });

  const isLoading = agentsLoading || statsLoading || featureLoading;

  // Feature gate - show upgrade prompt if user doesn't have AI Voice
  if (!featureLoading && !hasAIVoice) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="mx-auto max-w-[1440px]">
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="rounded-full bg-purple-100 p-6">
                <Lock className="size-12 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-navy mb-2">AI Voice Agents</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  AI Voice agents are available on {requiredPlan || 'SmartFlow'} and higher plans. 
                  Upgrade to create intelligent voice agents that handle calls automatically.
                </p>
              </div>
              <Button 
                className="gap-2 rounded-[10px] gradient-primary text-white"
                onClick={() => setShowUpgradeDialog(true)}
              >
                Upgrade to Unlock
              </Button>
            </div>
          </Card>
        </div>
        <UpgradePrompt
          showDialog={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="AI Voice Agents"
          reason="Create AI-powered voice agents to handle inbound and outbound calls automatically."
          requiredPlan="Smart Flow"
        />
      </div>
    );
  }

  const statsDisplay = [
    { label: 'Total Calls', value: stats?.totalCalls ?? 0, icon: Phone, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Avg Duration', value: stats?.averageDuration ?? '0m 0s', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Success Rate', value: `${stats?.successRate ?? 0}%`, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Minutes Used', value: stats?.minutesUsed?.toLocaleString() ?? 0, icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">AI Voice Dashboard</h1>
            <p className="body-text mt-2 text-text-secondary">
              Manage AI voice agents and monitor call performance
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="gap-2 rounded-[10px]"
              onClick={() => setShowCallDialog(true)}
              disabled={!agents || agents.filter((a: VoiceAgent) => a.isActive).length === 0}
            >
              <PhoneOutgoing className="size-4" />
              Make Call
            </Button>
            <Button 
              className="gap-2 rounded-[10px] gradient-primary text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="size-4" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-xl" />
            ))
          ) : (
            statsDisplay.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="small-text text-text-secondary">{stat.label}</p>
                    <p className="text-3xl font-normal text-text-navy">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg ${stat.bgColor} p-3`}>
                    <stat.icon className={`size-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Agents List */}
          <Card className="p-6">
            <h2 className="heading-2 mb-6 text-text-navy">AI Voice Agents</h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : agents && agents.length > 0 ? (
              <div className="space-y-4">
                {agents.map((agent: VoiceAgent) => (
                  <div
                    key={agent.id}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedAgent === agent.id
                        ? 'border-brand-purple bg-purple-50'
                        : 'border-border bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg gradient-primary text-white">
                          <Phone className="size-6" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="heading-3 text-text-navy">{agent.name}</h3>
                            <span className={`tiny-text rounded-full px-2 py-1 ${
                              agent.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="small-text text-text-secondary">{agent.role}</p>
                          <div className="flex gap-4 text-xs text-text-muted">
                            <span>Voice: {agent.voiceType}</span>
                            <span>•</span>
                            <span>{agent.language}</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-text-secondary">
                              Calls Today: <span className="font-normal text-text-navy">{agent.callsToday}</span>
                            </span>
                            <span className="text-text-secondary">
                              Success: <span className="font-normal text-success-green">{agent.successRate}%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={agent.isActive} 
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: agent.id, isActive: checked })}
                        />
                        <Button variant="ghost" size="icon" className="size-8">
                          <Settings className="size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(agent.id);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <Mic className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Voice Agents Yet</h3>
                <p className="text-text-secondary mb-4">Create your first AI voice agent</p>
                <Button 
                  className="gap-2 rounded-[10px] gradient-primary text-white"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="size-4" />
                  New Agent
                </Button>
              </div>
            )}
          </Card>

          {/* Recent Calls */}
          <Card className="p-6">
            <Tabs defaultValue="calls" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="calls" className="flex-1">Recent Calls</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="calls" className="space-y-4">
                <h3 className="heading-3 text-text-navy">Call History</h3>
                {callsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-24 rounded-lg" />
                    ))}
                  </div>
                ) : calls && calls.length > 0 ? (
                  <div className="space-y-3">
                    {calls.map((call: VoiceCall) => (
                      <div key={call.id} className="rounded-lg border border-border bg-white p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-normal text-text-navy">{call.contactName}</p>
                            <p className="tiny-text text-text-muted">{call.phoneNumber}</p>
                          </div>
                          <span className={`tiny-text rounded-full px-2 py-1 ${
                            call.outcome === 'qualified' 
                              ? 'bg-green-50 text-green-600'
                              : call.outcome === 'appointment_booked'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {call.outcome || call.status}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center gap-4 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {call.duration}
                          </span>
                          <span>Agent: {call.agentName}</span>
                          <span>{call.timeAgo}</span>
                        </div>
                        {call.transcript && (
                          <div className="mt-3 rounded-lg bg-bg-page p-3">
                            <p className="tiny-text text-text-secondary line-clamp-2">{call.transcript}</p>
                            <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs text-brand-purple">
                              View Full Transcript
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <PhoneCall className="mb-4 size-12 text-gray-300" />
                    <p className="text-sm text-text-secondary">No calls yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {selectedAgent ? (
                  <div className="space-y-4">
                    <h3 className="heading-3 text-text-navy">Agent Configuration</h3>
                    <p className="text-sm text-text-secondary">
                      Selected agent: {agents?.find(a => a.id === selectedAgent)?.name}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="small-text text-text-secondary">Voice Type</label>
                        <select className="mt-1 w-full rounded-[10px] border border-border bg-white px-4 py-2">
                          <option>Female - Professional</option>
                          <option>Male - Warm</option>
                          <option>Female - Casual</option>
                          <option>Male - Authoritative</option>
                        </select>
                      </div>
                      <div>
                        <label className="small-text text-text-secondary">Personality</label>
                        <select className="mt-1 w-full rounded-[10px] border border-border bg-white px-4 py-2">
                          <option>Friendly and Professional</option>
                          <option>Enthusiastic and Helpful</option>
                          <option>Conversational and Engaging</option>
                          <option>Direct and Efficient</option>
                        </select>
                      </div>
                      <Button className="w-full rounded-[10px] bg-brand-purple text-white">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <PhoneCall className="mb-4 size-12 text-gray-300" />
                    <p className="text-sm text-text-secondary">
                      Select an agent to configure settings
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Create Agent Dialog */}
        <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Create New Voice Agent</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sarah"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., Lead Qualifier"
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voiceType">Voice Type</Label>
                <select
                  id="voiceType"
                  className="w-full rounded-[10px] border border-border bg-white px-4 py-2"
                  value={newAgent.voiceType}
                  onChange={(e) => setNewAgent({ ...newAgent, voiceType: e.target.value })}
                >
                  <option>Female - Professional</option>
                  <option>Male - Warm</option>
                  <option>Female - Casual</option>
                  <option>Male - Authoritative</option>
                </select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={() => createMutation.mutate(newAgent)}
                disabled={!newAgent.name || !newAgent.role || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Agent'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Initiate Call Dialog */}
        <InitiateCallDialog
          open={showCallDialog}
          onOpenChange={setShowCallDialog}
          preselectedAgentId={selectedAgent || undefined}
          onCallInitiated={(callId) => {
            queryClient.invalidateQueries({ queryKey: ['voice-agents', 'calls'] });
            toast.success(`Call started successfully (ID: ${callId.slice(0, 8)}...)`);
          }}
        />
      </div>
    </div>
  );
}
