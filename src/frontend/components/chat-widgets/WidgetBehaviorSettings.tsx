'use client';

import { WidgetBehavior } from '@/types/widget-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WidgetBehaviorSettingsProps {
  behavior: WidgetBehavior;
  onUpdate: (behavior: WidgetBehavior) => void;
}

export function WidgetBehaviorSettings({ behavior, onUpdate }: WidgetBehaviorSettingsProps) {
  const addPagePattern = (type: 'show' | 'hide') => {
    const key = type === 'show' ? 'showOnPages' : 'hideOnPages';
    onUpdate({
      ...behavior,
      [key]: [...behavior[key], ''],
    });
  };

  const updatePagePattern = (type: 'show' | 'hide', index: number, value: string) => {
    const key = type === 'show' ? 'showOnPages' : 'hideOnPages';
    const patterns = [...behavior[key]];
    patterns[index] = value;
    onUpdate({ ...behavior, [key]: patterns });
  };

  const removePagePattern = (type: 'show' | 'hide', index: number) => {
    const key = type === 'show' ? 'showOnPages' : 'hideOnPages';
    const patterns = behavior[key].filter((_, i) => i !== index);
    onUpdate({ ...behavior, [key]: patterns });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-navy">Widget Behavior</h3>

      {/* Welcome Message */}
      <div className="space-y-2">
        <Label>Welcome Message</Label>
        <Textarea
          value={behavior.welcomeMessage}
          onChange={(e) => onUpdate({ ...behavior, welcomeMessage: e.target.value })}
          placeholder="Hi! How can we help you today?"
          rows={3}
        />
      </div>

      {/* Auto Open */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto Open Widget</Label>
            <p className="text-xs text-text-secondary mt-1">
              Automatically open the chat widget after a delay
            </p>
          </div>
          <Switch
            checked={behavior.autoOpen}
            onCheckedChange={(checked) => onUpdate({ ...behavior, autoOpen: checked })}
          />
        </div>
        {behavior.autoOpen && (
          <div className="space-y-2 pl-4 border-l-2 border-brand-purple">
            <Label>Delay (seconds)</Label>
            <Input
              type="number"
              min="0"
              max="60"
              value={behavior.autoOpenDelay}
              onChange={(e) => onUpdate({ ...behavior, autoOpenDelay: parseInt(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>

      {/* Trigger on Scroll */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Trigger on Scroll</Label>
            <p className="text-xs text-text-secondary mt-1">
              Show widget when user scrolls down the page
            </p>
          </div>
          <Switch
            checked={behavior.triggerOnScroll}
            onCheckedChange={(checked) => onUpdate({ ...behavior, triggerOnScroll: checked })}
          />
        </div>
        {behavior.triggerOnScroll && (
          <div className="space-y-2 pl-4 border-l-2 border-brand-purple">
            <Label>Scroll Percentage: {behavior.scrollPercentage || 50}%</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={behavior.scrollPercentage || 50}
              onChange={(e) => onUpdate({ ...behavior, scrollPercentage: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Trigger on Exit Intent */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Trigger on Exit Intent</Label>
          <p className="text-xs text-text-secondary mt-1">
            Show widget when user is about to leave the page
          </p>
        </div>
        <Switch
          checked={behavior.triggerOnExit}
          onCheckedChange={(checked) => onUpdate({ ...behavior, triggerOnExit: checked })}
        />
      </div>

      {/* Show on Pages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Show on Pages</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPagePattern('show')}
            className="gap-2"
          >
            <Plus className="size-3" />
            Add Pattern
          </Button>
        </div>
        <div className="space-y-2">
          {behavior.showOnPages.map((pattern, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={pattern}
                onChange={(e) => updatePagePattern('show', index, e.target.value)}
                placeholder="e.g., /products/* or *"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePagePattern('show', index)}
                className="size-8 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-secondary">
          Use * for all pages, /path/* for specific sections
        </p>
      </div>

      {/* Hide on Pages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Hide on Pages</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPagePattern('hide')}
            className="gap-2"
          >
            <Plus className="size-3" />
            Add Pattern
          </Button>
        </div>
        <div className="space-y-2">
          {behavior.hideOnPages.map((pattern, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={pattern}
                onChange={(e) => updatePagePattern('hide', index, e.target.value)}
                placeholder="e.g., /checkout/* or /admin/*"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePagePattern('hide', index)}
                className="size-8 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Message */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Offline Message</Label>
            <p className="text-xs text-text-secondary mt-1">
              Display a message when outside business hours
            </p>
          </div>
          <Switch
            checked={behavior.showOfflineMessage}
            onCheckedChange={(checked) => onUpdate({ ...behavior, showOfflineMessage: checked })}
          />
        </div>
        {behavior.showOfflineMessage && (
          <div className="space-y-2 pl-4 border-l-2 border-brand-purple">
            <Label>Offline Message</Label>
            <Textarea
              value={behavior.offlineMessage || ''}
              onChange={(e) => onUpdate({ ...behavior, offlineMessage: e.target.value })}
              placeholder="We're currently offline..."
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
}
