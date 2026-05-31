'use client';

import { WidgetCustomization, WidgetTheme, PRESET_THEMES, generateThemeCSS } from '@/types/widget-customization';
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
import { Palette, Code, Sparkles, Volume2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ThemeCustomizerProps {
  customization: WidgetCustomization;
  onUpdate: (customization: WidgetCustomization) => void;
}

export function ThemeCustomizer({ customization, onUpdate }: ThemeCustomizerProps) {

  const updateThemeColors = (updates: Partial<WidgetTheme['colors']>) => {
    onUpdate({
      ...customization,
      theme: {
        ...customization.theme,
        colors: { ...customization.theme.colors, ...updates },
      },
    });
  };

  const updateThemeTypography = (updates: Partial<WidgetTheme['typography']>) => {
    onUpdate({
      ...customization,
      theme: {
        ...customization.theme,
        typography: { ...customization.theme.typography, ...updates },
      },
    });
  };

  const updateThemeSpacing = (updates: Partial<WidgetTheme['spacing']>) => {
    onUpdate({
      ...customization,
      theme: {
        ...customization.theme,
        spacing: { ...customization.theme.spacing, ...updates },
      },
    });
  };

  const applyPresetTheme = (presetId: string) => {
    const preset = PRESET_THEMES.find(t => t.id === presetId);
    if (preset) {
      onUpdate({ ...customization, theme: preset });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Preset Themes */}
        <TabsContent value="presets" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="size-5 text-brand-purple" />
            <h3 className="text-lg font-semibold text-text-navy">Preset Themes</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PRESET_THEMES.map((preset) => (
              <Card
                key={preset.id}
                className={`p-4 cursor-pointer transition-all ${
                  customization.theme.id === preset.id
                    ? 'ring-2 ring-brand-purple'
                    : 'hover:border-brand-purple'
                }`}
                onClick={() => applyPresetTheme(preset.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-text-navy">{preset.name}</h4>
                  <div className="flex gap-2">
                    <div className="size-8 rounded" style={{ background: preset.colors.primary }} />
                    <div className="size-8 rounded" style={{ background: preset.colors.secondary }} />
                    <div className="size-8 rounded border" style={{ background: preset.colors.background }} />
                    <div className="size-8 rounded" style={{ background: preset.colors.userMessage }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customization.theme.colors.primary}
                  onChange={(e) => updateThemeColors({ primary: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.theme.colors.primary}
                  onChange={(e) => updateThemeColors({ primary: e.target.value })}
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customization.theme.colors.secondary}
                  onChange={(e) => updateThemeColors({ secondary: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.theme.colors.secondary}
                  onChange={(e) => updateThemeColors({ secondary: e.target.value })}
                  placeholder="#EC4899"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customization.theme.colors.background}
                  onChange={(e) => updateThemeColors({ background: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.theme.colors.background}
                  onChange={(e) => updateThemeColors({ background: e.target.value })}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customization.theme.colors.text}
                  onChange={(e) => updateThemeColors({ text: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.theme.colors.text}
                  onChange={(e) => updateThemeColors({ text: e.target.value })}
                  placeholder="#1F2937"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>User Message Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customization.theme.colors.userMessage}
                  onChange={(e) => updateThemeColors({ userMessage: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.theme.colors.userMessage}
                  onChange={(e) => updateThemeColors({ userMessage: e.target.value })}
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bot Message Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customization.theme.colors.botMessage}
                  onChange={(e) => updateThemeColors({ botMessage: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.theme.colors.botMessage}
                  onChange={(e) => updateThemeColors({ botMessage: e.target.value })}
                  placeholder="#F3F4F6"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Typography */}
        <TabsContent value="typography" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={customization.theme.typography.fontFamily}
                onValueChange={(value) => updateThemeTypography({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                  <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                  <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                  <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                  <SelectItem value="Nunito, sans-serif">Nunito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font Size (px)</Label>
                <Input
                  type="number"
                  value={customization.theme.typography.fontSize}
                  onChange={(e) => updateThemeTypography({ fontSize: parseInt(e.target.value) || 14 })}
                  min="12"
                  max="20"
                />
              </div>

              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select
                  value={customization.theme.typography.fontWeight.toString()}
                  onValueChange={(value) => updateThemeTypography({ fontWeight: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">Light (300)</SelectItem>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                    <SelectItem value="600">Semibold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Padding (px)</Label>
                <Input
                  type="number"
                  value={customization.theme.spacing.padding}
                  onChange={(e) => updateThemeSpacing({ padding: parseInt(e.target.value) || 16 })}
                  min="8"
                  max="32"
                />
              </div>

              <div className="space-y-2">
                <Label>Border Radius (px)</Label>
                <Input
                  type="number"
                  value={customization.theme.spacing.borderRadius}
                  onChange={(e) => updateThemeSpacing({ borderRadius: parseInt(e.target.value) || 12 })}
                  min="0"
                  max="24"
                />
              </div>

              <div className="space-y-2">
                <Label>Message Padding (px)</Label>
                <Input
                  type="number"
                  value={customization.theme.spacing.messagePadding}
                  onChange={(e) => updateThemeSpacing({ messagePadding: parseInt(e.target.value) || 12 })}
                  min="8"
                  max="20"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          {/* Animations */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-5 text-brand-purple" />
              <h3 className="text-lg font-semibold text-text-navy">Animations</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Animations</Label>
                <Switch
                  checked={customization.animations.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdate({
                      ...customization,
                      animations: { ...customization.animations, enabled },
                    })
                  }
                />
              </div>

              {customization.animations.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Message Animation</Label>
                    <Select
                      value={customization.animations.messageAnimation}
                      onValueChange={(value: typeof customization.animations.messageAnimation) =>
                        onUpdate({
                          ...customization,
                          animations: { ...customization.animations, messageAnimation: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Widget Entrance</Label>
                    <Select
                      value={customization.animations.widgetEntrance}
                      onValueChange={(value: typeof customization.animations.widgetEntrance) =>
                        onUpdate({
                          ...customization,
                          animations: { ...customization.animations, widgetEntrance: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Sounds */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="size-5 text-brand-purple" />
              <h3 className="text-lg font-semibold text-text-navy">Sound Effects</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Enable Sounds</Label>
                <Switch
                  checked={customization.sounds.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdate({
                      ...customization,
                      sounds: { ...customization.sounds, enabled },
                    })
                  }
                />
              </div>

              {customization.sounds.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>New Message Sound</Label>
                    <Switch
                      checked={customization.sounds.newMessage}
                      onCheckedChange={(newMessage) =>
                        onUpdate({
                          ...customization,
                          sounds: { ...customization.sounds, newMessage },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Message Sent Sound</Label>
                    <Switch
                      checked={customization.sounds.messageSent}
                      onCheckedChange={(messageSent) =>
                        onUpdate({
                          ...customization,
                          sounds: { ...customization.sounds, messageSent },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Custom CSS */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Code className="size-5 text-brand-purple" />
              <h3 className="text-lg font-semibold text-text-navy">Custom CSS</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Custom CSS</Label>
                <Switch
                  checked={customization.customCSS.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdate({
                      ...customization,
                      customCSS: { ...customization.customCSS, enabled },
                    })
                  }
                />
              </div>

              {customization.customCSS.enabled && (
                <div className="space-y-2">
                  <Label>CSS Code</Label>
                  <Textarea
                    value={customization.customCSS.css}
                    onChange={(e) =>
                      onUpdate({
                        ...customization,
                        customCSS: { ...customization.customCSS, css: e.target.value },
                      })
                    }
                    placeholder=".chat-widget { /* your custom styles */ }"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Generated CSS Preview */}
          <Card className="p-4 bg-muted/20">
            <h4 className="text-sm font-semibold text-text-navy mb-2">Generated CSS</h4>
            <pre className="text-xs overflow-x-auto p-3 bg-white rounded border">
              {generateThemeCSS(customization.theme)}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
