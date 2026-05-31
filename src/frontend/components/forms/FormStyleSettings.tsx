'use client';

import { FormStyling } from '@/types/form-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface FormStyleSettingsProps {
  styling: FormStyling;
  onUpdate: (styling: FormStyling) => void;
}

export function FormStyleSettings({ styling, onUpdate }: FormStyleSettingsProps) {
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-navy">Form Styling</h3>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label>Primary Color</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="size-10 rounded-lg border-2 border-border"
            style={{ backgroundColor: styling.primaryColor }}
            onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
          />
          <Input
            value={styling.primaryColor}
            onChange={(e) => onUpdate({ ...styling, primaryColor: e.target.value })}
            placeholder="#FF6B35"
            className="flex-1"
          />
        </div>
        {showPrimaryPicker && (
          <div className="mt-2">
            <HexColorPicker
              color={styling.primaryColor}
              onChange={(color) => onUpdate({ ...styling, primaryColor: color })}
            />
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="size-10 rounded-lg border-2 border-border"
            style={{ backgroundColor: styling.backgroundColor }}
            onClick={() => setShowBgPicker(!showBgPicker)}
          />
          <Input
            value={styling.backgroundColor}
            onChange={(e) => onUpdate({ ...styling, backgroundColor: e.target.value })}
            placeholder="#FFFFFF"
            className="flex-1"
          />
        </div>
        {showBgPicker && (
          <div className="mt-2">
            <HexColorPicker
              color={styling.backgroundColor}
              onChange={(color) => onUpdate({ ...styling, backgroundColor: color })}
            />
          </div>
        )}
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={styling.fontFamily}
          onValueChange={(value) => onUpdate({ ...styling, fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Button Style */}
      <div className="space-y-2">
        <Label>Button Style</Label>
        <Select
          value={styling.buttonStyle}
          onValueChange={(value: 'rounded' | 'square' | 'pill') => 
            onUpdate({ ...styling, buttonStyle: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rounded">Rounded</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="pill">Pill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select
          value={styling.layout}
          onValueChange={(value: 'single-column' | 'two-column') => 
            onUpdate({ ...styling, layout: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single-column">Single Column</SelectItem>
            <SelectItem value="two-column">Two Column</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <Label>Border Radius: {styling.borderRadius}px</Label>
        <input
          type="range"
          min="0"
          max="24"
          value={styling.borderRadius}
          onChange={(e) => onUpdate({ ...styling, borderRadius: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Button Text */}
      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input
          value={styling.buttonText}
          onChange={(e) => onUpdate({ ...styling, buttonText: e.target.value })}
          placeholder="Submit"
        />
      </div>
    </div>
  );
}
