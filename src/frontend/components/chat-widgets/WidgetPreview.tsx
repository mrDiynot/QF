'use client';

import { WidgetAppearance, WidgetBehavior } from '@/types/widget-builder';
import { MessageSquare, MessageCircle, HelpCircle, Headphones, X, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WidgetPreviewProps {
  appearance: WidgetAppearance;
  behavior: WidgetBehavior;
}

export function WidgetPreview({ appearance, behavior }: WidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    const iconProps = { className: 'size-6 text-white' };
    switch (appearance.iconType) {
      case 'message':
        return <MessageCircle {...iconProps} />;
      case 'help':
        return <HelpCircle {...iconProps} />;
      case 'support':
        return <Headphones {...iconProps} />;
      case 'chat':
      default:
        return <MessageSquare {...iconProps} />;
    }
  };

  const getSizeClass = () => {
    switch (appearance.size) {
      case 'small':
        return 'size-12';
      case 'large':
        return 'size-20';
      case 'medium':
      default:
        return 'size-16';
    }
  };

  const getPositionClass = () => {
    switch (appearance.position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const getChatPositionClass = () => {
    switch (appearance.position) {
      case 'bottom-left':
        return 'bottom-24 left-6';
      case 'top-right':
        return 'top-24 right-6';
      case 'top-left':
        return 'top-24 left-6';
      case 'bottom-right':
      default:
        return 'bottom-24 right-6';
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-muted/40 rounded-lg overflow-hidden">
      {/* Simulated Website Content */}
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-3/4 bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
        <div className="h-32 w-full bg-muted rounded mt-6"></div>
      </div>

      {/* Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute ${getPositionClass()} ${getSizeClass()} rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center gap-2`}
        style={{
          backgroundColor: appearance.primaryColor,
          borderRadius: `${appearance.borderRadius}px`,
        }}
      >
        {getIcon()}
        {appearance.buttonText && appearance.size === 'large' && (
          <span className="text-white font-medium pr-2">{appearance.buttonText}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`absolute ${getChatPositionClass()} w-80 h-[450px] bg-white rounded-lg shadow-2xl flex flex-col`}
          style={{ borderRadius: `${appearance.borderRadius}px` }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between"
            style={{ backgroundColor: appearance.primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                {getIcon()}
              </div>
              <div>
                <h3 className="text-white font-semibold">Chat with us</h3>
                <p className="text-white/80 text-xs">We typically reply instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex gap-2">
              <div className="size-8 rounded-full flex-shrink-0" style={{ backgroundColor: appearance.primaryColor }}>
                <div className="size-full rounded-full flex items-center justify-center text-white text-xs">
                  AI
                </div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-text-navy">{behavior.welcomeMessage}</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button
                size="sm"
                className="px-3"
                style={{ backgroundColor: appearance.primaryColor }}
              >
                <Send className="size-4" />
              </Button>
            </div>
            {appearance.showBranding && (
              <p className="text-xs text-text-muted text-center mt-2">
                Powered by <span className="font-semibold">QualiFlow AI</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
