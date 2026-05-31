'use client';

import { PersonalizationSettings, ContextualGreeting, BehaviorTrigger } from '@/types/widget-personalization';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Sparkles, Zap } from 'lucide-react';

interface PersonalizationSettingsProps {
  settings: PersonalizationSettings;
  onUpdate: (settings: PersonalizationSettings) => void;
}

export function PersonalizationSettingsPanel({ settings, onUpdate }: PersonalizationSettingsProps) {
  const addGreeting = () => {
    const newGreeting: ContextualGreeting = {
      id: `greeting-${Date.now()}`,
      condition: 'new_visitor',
      greeting: '',
      enabled: true,
    };
    onUpdate({
      ...settings,
      greetings: [...settings.greetings, newGreeting],
    });
  };

  const updateGreeting = (id: string, updates: Partial<ContextualGreeting>) => {
    onUpdate({
      ...settings,
      greetings: settings.greetings.map(g => (g.id === id ? { ...g, ...updates } : g)),
    });
  };

  const deleteGreeting = (id: string) => {
    onUpdate({
      ...settings,
      greetings: settings.greetings.filter(g => g.id !== id),
    });
  };

  const addTrigger = () => {
    const newTrigger: BehaviorTrigger = {
      id: `trigger-${Date.now()}`,
      type: 'time_on_page',
      value: 30,
      action: 'show_widget',
      enabled: true,
    };
    onUpdate({
      ...settings,
      behaviorTriggers: [...settings.behaviorTriggers, newTrigger],
    });
  };

  const updateTrigger = (id: string, updates: Partial<BehaviorTrigger>) => {
    onUpdate({
      ...settings,
      behaviorTriggers: settings.behaviorTriggers.map(t => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const deleteTrigger = (id: string) => {
    onUpdate({
      ...settings,
      behaviorTriggers: settings.behaviorTriggers.filter(t => t.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable Personalization */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-lg font-semibold">AI Personalization</Label>
          <p className="text-sm text-text-secondary mt-1">
            Customize greetings and behavior based on visitor context
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(enabled) => onUpdate({ ...settings, enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Contextual Greetings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-brand-purple" />
                <h3 className="text-lg font-semibold text-text-navy">Contextual Greetings</h3>
              </div>
              <Button variant="outline" size="sm" onClick={addGreeting} className="gap-2">
                <Plus className="size-4" />
                Add Greeting
              </Button>
            </div>

            <div className="space-y-3">
              {settings.greetings.map((greeting) => (
                <Card key={greeting.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Switch
                        checked={greeting.enabled}
                        onCheckedChange={(enabled) => updateGreeting(greeting.id, { enabled })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGreeting(greeting.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select
                        value={greeting.condition}
                        onValueChange={(value: ContextualGreeting['condition']) =>
                          updateGreeting(greeting.id, { condition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_visitor">New Visitor</SelectItem>
                          <SelectItem value="returning_visitor">Returning Visitor</SelectItem>
                          <SelectItem value="high_value_lead">High Value Lead</SelectItem>
                          <SelectItem value="specific_page">Specific Page</SelectItem>
                          <SelectItem value="utm_campaign">UTM Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {['specific_page', 'utm_campaign'].includes(greeting.condition) && (
                      <div className="space-y-2">
                        <Label>
                          {greeting.condition === 'specific_page' ? 'Page URL Contains' : 'Campaign Name'}
                        </Label>
                        <Input
                          value={greeting.value || ''}
                          onChange={(e) => updateGreeting(greeting.id, { value: e.target.value })}
                          placeholder={greeting.condition === 'specific_page' ? '/pricing' : 'summer-sale'}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Greeting Message</Label>
                      <Textarea
                        value={greeting.greeting}
                        onChange={(e) => updateGreeting(greeting.id, { greeting: e.target.value })}
                        placeholder="Hi! Welcome to our site..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Behavior Triggers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-brand-purple" />
                <h3 className="text-lg font-semibold text-text-navy">Behavior Triggers</h3>
              </div>
              <Button variant="outline" size="sm" onClick={addTrigger} className="gap-2">
                <Plus className="size-4" />
                Add Trigger
              </Button>
            </div>

            <div className="space-y-3">
              {settings.behaviorTriggers.map((trigger) => (
                <Card key={trigger.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Switch
                        checked={trigger.enabled}
                        onCheckedChange={(enabled) => updateTrigger(trigger.id, { enabled })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTrigger(trigger.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trigger Type</Label>
                        <Select
                          value={trigger.type}
                          onValueChange={(value: BehaviorTrigger['type']) =>
                            updateTrigger(trigger.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time_on_page">Time on Page</SelectItem>
                            <SelectItem value="scroll_depth">Scroll Depth</SelectItem>
                            <SelectItem value="exit_intent">Exit Intent</SelectItem>
                            <SelectItem value="inactivity">Inactivity</SelectItem>
                            <SelectItem value="page_views">Page Views</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {trigger.type !== 'exit_intent' && (
                        <div className="space-y-2">
                          <Label>
                            Value{' '}
                            {['time_on_page', 'inactivity'].includes(trigger.type) && '(seconds)'}
                            {trigger.type === 'scroll_depth' && '(%)'}
                            {trigger.type === 'page_views' && '(count)'}
                          </Label>
                          <Input
                            type="number"
                            value={trigger.value}
                            onChange={(e) => updateTrigger(trigger.id, { value: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select
                        value={trigger.action}
                        onValueChange={(value: BehaviorTrigger['action']) =>
                          updateTrigger(trigger.id, { action: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show_widget">Show Widget</SelectItem>
                          <SelectItem value="show_message">Show Message</SelectItem>
                          <SelectItem value="play_sound">Play Sound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {trigger.action === 'show_message' && (
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Input
                          value={trigger.message || ''}
                          onChange={(e) => updateTrigger(trigger.id, { message: e.target.value })}
                          placeholder="Need help finding something?"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tracking Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-text-navy mb-4">Tracking & Enrichment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Track Referrer</Label>
                <Switch
                  checked={settings.trackingEnabled.referrer}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      ...settings,
                      trackingEnabled: { ...settings.trackingEnabled, referrer: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Track UTM Parameters</Label>
                <Switch
                  checked={settings.trackingEnabled.utmParams}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      ...settings,
                      trackingEnabled: { ...settings.trackingEnabled, utmParams: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Track Previous Conversations</Label>
                <Switch
                  checked={settings.trackingEnabled.previousConversations}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      ...settings,
                      trackingEnabled: { ...settings.trackingEnabled, previousConversations: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Track Page History</Label>
                <Switch
                  checked={settings.trackingEnabled.pageHistory}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      ...settings,
                      trackingEnabled: { ...settings.trackingEnabled, pageHistory: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Track Device Info</Label>
                <Switch
                  checked={settings.trackingEnabled.deviceInfo}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      ...settings,
                      trackingEnabled: { ...settings.trackingEnabled, deviceInfo: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lead Enrichment</Label>
                  <p className="text-xs text-text-secondary">Automatically enrich lead data</p>
                </div>
                <Switch
                  checked={settings.enrichmentEnabled}
                  onCheckedChange={(enrichmentEnabled) => onUpdate({ ...settings, enrichmentEnabled })}
                />
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
