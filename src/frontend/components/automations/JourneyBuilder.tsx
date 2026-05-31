'use client';

/**
 * Journey Automation Visual Builder Component
 * Visual workflow builder for creating automation sequences
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Settings,
  Save,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  GitBranch,
  Target,
  Users,
  Calendar,
  CheckCircle,
  ArrowDown,
  Copy,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Node types
type NodeType = 'trigger' | 'action' | 'condition' | 'delay';

interface JourneyNode {
  id: string;
  type: NodeType;
  name: string;
  config: Record<string, unknown>;
  position: number;
}

interface Journey {
  id?: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused';
  trigger: JourneyNode | null;
  nodes: JourneyNode[];
}

// Node type configurations
const TRIGGER_TYPES = [
  { id: 'form_submit', name: 'Form Submitted', icon: <Target className="size-4" /> },
  { id: 'lead_created', name: 'New Lead', icon: <Users className="size-4" /> },
  { id: 'tag_added', name: 'Tag Added', icon: <Zap className="size-4" /> },
  { id: 'appointment_booked', name: 'Appointment Booked', icon: <Calendar className="size-4" /> },
];

const ACTION_TYPES = [
  { id: 'send_email', name: 'Send Email', icon: <Mail className="size-4" />, color: 'bg-muted/300' },
  { id: 'send_sms', name: 'Send SMS', icon: <MessageSquare className="size-4" />, color: 'bg-green-500' },
  { id: 'make_call', name: 'AI Call', icon: <Phone className="size-4" />, color: 'bg-primary/50' },
  { id: 'add_tag', name: 'Add Tag', icon: <Zap className="size-4" />, color: 'bg-orange-500' },
  { id: 'update_lead', name: 'Update Lead', icon: <Users className="size-4" />, color: 'bg-muted/300' },
];

const DELAY_UNITS = ['minutes', 'hours', 'days', 'weeks'];

const NODE_COLORS: Record<NodeType, string> = {
  trigger: 'from-purple-500 to-pink-500',
  action: 'from-blue-500 to-cyan-500',
  condition: 'from-orange-500 to-amber-500',
  delay: 'from-gray-500 to-gray-600',
};

interface JourneyBuilderProps {
  initialJourney?: Partial<Journey>;
  onSave?: (journey: Journey) => void;
  className?: string;
}

export function JourneyBuilder({ initialJourney, onSave, className }: JourneyBuilderProps) {
  const [journey, setJourney] = useState<Journey>({
    name: '',
    description: '',
    status: 'draft',
    trigger: null,
    nodes: [],
    ...initialJourney,
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodePicker, setShowNodePicker] = useState<number | null>(null);

  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const selectedNode = journey.trigger?.id === selectedNodeId 
    ? journey.trigger 
    : journey.nodes.find(n => n.id === selectedNodeId);

  // Set trigger
  const setTrigger = useCallback((triggerId: string) => {
    const triggerType = TRIGGER_TYPES.find(t => t.id === triggerId);
    if (triggerType) {
      setJourney(prev => ({
        ...prev,
        trigger: {
          id: generateId(),
          type: 'trigger',
          name: triggerType.name,
          config: { triggerId },
          position: 0,
        },
      }));
    }
  }, []);

  // Add node
  const addNode = useCallback((type: NodeType, position: number, actionId?: string) => {
    let name = 'New Node';
    const config: Record<string, unknown> = {};

    if (type === 'action' && actionId) {
      const actionType = ACTION_TYPES.find(a => a.id === actionId);
      name = actionType?.name || 'Action';
      config.actionId = actionId;
    } else if (type === 'delay') {
      name = 'Wait';
      config.duration = 1;
      config.unit = 'days';
    } else if (type === 'condition') {
      name = 'If/Else';
      config.field = '';
      config.operator = 'equals';
      config.value = '';
    }

    const newNode: JourneyNode = {
      id: generateId(),
      type,
      name,
      config,
      position,
    };

    setJourney(prev => {
      const nodes = [...prev.nodes];
      // Update positions for nodes after this one
      nodes.forEach(n => {
        if (n.position >= position) {
          n.position += 1;
        }
      });
      nodes.push(newNode);
      nodes.sort((a, b) => a.position - b.position);
      return { ...prev, nodes };
    });

    setShowNodePicker(null);
    setSelectedNodeId(newNode.id);
  }, []);

  // Update node
  const updateNode = useCallback((id: string, updates: Partial<JourneyNode>) => {
    if (journey.trigger?.id === id) {
      setJourney(prev => ({
        ...prev,
        trigger: prev.trigger ? { ...prev.trigger, ...updates } : null,
      }));
    } else {
      setJourney(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
      }));
    }
  }, [journey.trigger?.id]);

  // Delete node
  const deleteNode = useCallback((id: string) => {
    setJourney(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
    }));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  // Save journey
  const handleSave = () => {
    if (!journey.name) {
      toast.error('Please enter a journey name');
      return;
    }
    if (!journey.trigger) {
      toast.error('Please select a trigger');
      return;
    }
    onSave?.(journey);
    toast.success('Journey saved');
  };

  // Toggle status
  const toggleStatus = () => {
    setJourney(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active',
    }));
  };

  return (
    <div className={cn("grid lg:grid-cols-3 gap-6", className)}>
      {/* Canvas */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                value={journey.name}
                onChange={(e) => setJourney(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Journey Name"
                className="text-lg font-semibold border-0 px-0 focus-visible:ring-0"
              />
              <Badge variant={journey.status === 'active' ? 'default' : 'secondary'}>
                {journey.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={toggleStatus}
                className="gap-2"
                disabled={!journey.trigger}
              >
                {journey.status === 'active' ? (
                  <><Pause className="size-4" /> Pause</>
                ) : (
                  <><Play className="size-4" /> Activate</>
                )}
              </Button>
              <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-purple-700">
                <Save className="size-4" />
                Save
              </Button>
            </div>
          </div>
        </Card>

        {/* Flow Canvas */}
        <Card className="p-6 min-h-[500px]">
          <div className="flex flex-col items-center">
            {/* Trigger */}
            {journey.trigger ? (
              <NodeCard
                node={journey.trigger}
                isSelected={selectedNodeId === journey.trigger.id}
                onClick={() => setSelectedNodeId(journey.trigger!.id)}
                onDelete={() => setJourney(prev => ({ ...prev, trigger: null }))}
              />
            ) : (
              <div className="w-72">
                <p className="text-sm text-muted-foreground text-center mb-3">Select a trigger to start</p>
                <div className="grid grid-cols-2 gap-2">
                  {TRIGGER_TYPES.map((trigger) => (
                    <Button
                      key={trigger.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setTrigger(trigger.id)}
                      className="gap-2 justify-start"
                    >
                      {trigger.icon}
                      <span className="text-xs">{trigger.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Connector */}
            {journey.trigger && (
              <div className="flex flex-col items-center my-2">
                <div className="w-0.5 h-6 bg-muted" />
                <ArrowDown className="size-4 text-muted-foreground/60" />
              </div>
            )}

            {/* Nodes */}
            {journey.trigger && journey.nodes.map((node, index) => (
              <div key={node.id} className="flex flex-col items-center">
                {index > 0 && (
                  <div className="flex flex-col items-center my-2">
                    <div className="w-0.5 h-6 bg-muted" />
                    <ArrowDown className="size-4 text-muted-foreground/60" />
                  </div>
                )}
                
                <NodeCard
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onDelete={() => deleteNode(node.id)}
                />

                {/* Add button between nodes */}
                <div className="flex flex-col items-center my-2">
                  <div className="w-0.5 h-4 bg-muted" />
                  <AddNodeButton
                    isOpen={showNodePicker === index}
                    onClick={() => setShowNodePicker(showNodePicker === index ? null : index)}
                    onAddAction={(actionId) => addNode('action', node.position + 1, actionId)}
                    onAddDelay={() => addNode('delay', node.position + 1)}
                    onAddCondition={() => addNode('condition', node.position + 1)}
                  />
                  <div className="w-0.5 h-4 bg-muted" />
                </div>
              </div>
            ))}

            {/* Add first node */}
            {journey.trigger && journey.nodes.length === 0 && (
              <AddNodeButton
                isOpen={showNodePicker === -1}
                onClick={() => setShowNodePicker(showNodePicker === -1 ? null : -1)}
                onAddAction={(actionId) => addNode('action', 1, actionId)}
                onAddDelay={() => addNode('delay', 1)}
                onAddCondition={() => addNode('condition', 1)}
              />
            )}

            {/* End marker */}
            {journey.nodes.length > 0 && (
              <div className="flex flex-col items-center mt-4">
                <div className="w-0.5 h-6 bg-muted" />
                <div className="flex size-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                  <CheckCircle className="size-5" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">End</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Settings Panel */}
      <Card className="p-6 h-fit">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="size-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Node Settings</h3>
        </div>

        {selectedNode ? (
          <NodeSettings
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60">
            <Settings className="size-12 mb-4" />
            <p className="text-sm">Select a node to configure</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Node Card Component
function NodeCard({
  node,
  isSelected,
  onClick,
  onDelete,
}: {
  node: JourneyNode;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const getIcon = () => {
    if (node.type === 'trigger') {
      const trigger = TRIGGER_TYPES.find(t => t.id === node.config.triggerId);
      return trigger?.icon || <Zap className="size-5" />;
    }
    if (node.type === 'action') {
      const action = ACTION_TYPES.find(a => a.id === node.config.actionId);
      return action?.icon || <Zap className="size-5" />;
    }
    if (node.type === 'delay') return <Clock className="size-5" />;
    if (node.type === 'condition') return <GitBranch className="size-5" />;
    return <Zap className="size-5" />;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-72 p-4 rounded-xl border-2 cursor-pointer transition-all",
        isSelected 
          ? "border-primary shadow-lg" 
          : "border-border hover:border-border"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex size-10 items-center justify-center rounded-lg text-white bg-gradient-to-br",
          NODE_COLORS[node.type]
        )}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{node.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Copy className="size-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Add Node Button
function AddNodeButton({
  isOpen,
  onClick,
  onAddAction,
  onAddDelay,
  onAddCondition,
}: {
  isOpen: boolean;
  onClick: () => void;
  onAddAction: (actionId: string) => void;
  onAddDelay: () => void;
  onAddCondition: () => void;
}) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        className={cn(
          "size-8 rounded-full",
          isOpen && "bg-primary/10 border-purple-300"
        )}
      >
        <Plus className="size-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-white rounded-xl shadow-xl border z-10 w-64">
          <p className="text-xs text-muted-foreground mb-2">Add Step</p>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/80">Actions</p>
            <div className="grid grid-cols-2 gap-1">
              {ACTION_TYPES.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddAction(action.id)}
                  className="justify-start gap-2 h-8"
                >
                  {action.icon}
                  <span className="text-xs">{action.name}</span>
                </Button>
              ))}
            </div>

            <div className="border-t my-2" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddDelay}
                className="flex-1 gap-1"
              >
                <Clock className="size-3" />
                Delay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddCondition}
                className="flex-1 gap-1"
              >
                <GitBranch className="size-3" />
                Condition
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Node Settings Component
function NodeSettings({
  node,
  onUpdate,
}: {
  node: JourneyNode;
  onUpdate: (updates: Partial<JourneyNode>) => void;
}) {
  const updateConfig = (key: string, value: unknown) => {
    onUpdate({ config: { ...node.config, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={node.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>

      {node.type === 'delay' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Duration</Label>
            <Input
              type="number"
              min={1}
              value={node.config.duration as number || 1}
              onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select
              value={node.config.unit as string || 'days'}
              onValueChange={(v) => updateConfig('unit', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {node.type === 'action' && node.config.actionId === 'send_email' && (
        <div className="space-y-2">
          <Label>Email Template</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome Email</SelectItem>
              <SelectItem value="followup">Follow Up</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {node.type === 'action' && node.config.actionId === 'send_sms' && (
        <div className="space-y-2">
          <Label>SMS Template</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome SMS</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {node.type === 'condition' && (
        <>
          <div className="space-y-2">
            <Label>Field</Label>
            <Select
              value={node.config.field as string || ''}
              onValueChange={(v) => updateConfig('field', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Lead Score</SelectItem>
                <SelectItem value="status">Lead Status</SelectItem>
                <SelectItem value="source">Lead Source</SelectItem>
                <SelectItem value="tags">Has Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select
              value={node.config.operator as string || 'equals'}
              onValueChange={(v) => updateConfig('operator', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not Equals</SelectItem>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={node.config.value as string || ''}
              onChange={(e) => updateConfig('value', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
