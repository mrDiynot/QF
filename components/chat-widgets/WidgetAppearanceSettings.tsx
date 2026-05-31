'use client';

import { WidgetAppearance } from '@/types/widget-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { MessageSquare, MessageCircle, HelpCircle, Headphones } from 'lucide-react';

interface WidgetAppearanceSettingsProps {
  appearance: WidgetAppearance;
  onUpdate: (appearance: WidgetAppearance) => void;
}

export function WidgetAppearanceSettings({ appearance, onUpdate }: WidgetAppearanceSettingsProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const iconOptions = [
    { value: 'chat', label: 'Chat Bubble', icon: MessageSquare },
    { value: 'message', label: 'Message', icon: MessageCircle },
    { value: 'help', label: 'Help', icon: HelpCircle },
    { value: 'support', label: 'Support', icon: Headphones },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-navy">Widget Appearance</h3>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label>Primary Color</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="size-10 rounded-lg border-2 border-border"
            style={{ backgroundColor: appearance.primaryColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          <Input
            value={appearance.primaryColor}
            onChange={(e) => onUpdate({ ...appearance, primaryColor: e.target.value })}
            placeholder="#FF6B35"
            className="flex-1"
          />
        </div>
        {showColorPicker && (
          <div className="mt-2">
            <HexColorPicker
              color={appearance.primaryColor}
              onChange={(color) => onUpdate({ ...appearance, primaryColor: color })}
            />
          </div>
        )}
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label>Widget Position</Label>
        <Select
          value={appearance.position}
          onValueChange={(value: WidgetAppearance['position']) => 
            onUpdate({ ...appearance, position: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bottom-right">Bottom Right</SelectItem>
            <SelectItem value="bottom-left">Bottom Left</SelectItem>
            <SelectItem value="top-right">Top Right</SelectItem>
            <SelectItem value="top-left">Top Left</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label>Widget Size</Label>
        <Select
          value={appearance.size}
          onValueChange={(value: WidgetAppearance['size']) => 
            onUpdate({ ...appearance, size: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Icon Type */}
      <div className="space-y-2">
        <Label>Icon Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {iconOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate({ ...appearance, iconType: option.value as WidgetAppearance['iconType'] })}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  appearance.iconType === option.value
                    ? 'border-brand-purple bg-primary/5'
                    : 'border-border hover:border-brand-purple'
                }`}
              >
                <Icon className="size-5" />
                <span className="text-sm">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <Label>Border Radius: {appearance.borderRadius}px</Label>
        <input
          type="range"
          min="0"
          max="24"
          value={appearance.borderRadius}
          onChange={(e) => onUpdate({ ...appearance, borderRadius: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Button Text */}
      <div className="space-y-2">
        <Label>Button Text (Optional)</Label>
        <Input
          value={appearance.buttonText || ''}
          onChange={(e) => onUpdate({ ...appearance, buttonText: e.target.value })}
          placeholder="Chat with us"
        />
      </div>

      {/* Show Branding */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Show QualiFlow AI Branding</Label>
          <p className="text-xs text-text-secondary mt-1">
            Display &quot;Powered by QualiFlow AI&quot; badge
          </p>
        </div>
        <Switch
          checked={appearance.showBranding}
          onCheckedChange={(checked) => onUpdate({ ...appearance, showBranding: checked })}
        />
      </div>
    </div>
  );
}
