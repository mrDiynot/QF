/**
 * Advanced Widget Customization Type Definitions
 * Theme system and CSS customization
 */

export interface WidgetTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    userMessage: string;
    botMessage: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
  };
  spacing: {
    padding: number;
    borderRadius: number;
    messagePadding: number;
  };
  shadows: {
    widget: string;
    message: string;
  };
}

export interface CustomCSS {
  enabled: boolean;
  css: string;
}

export interface WidgetCustomization {
  theme: WidgetTheme;
  customCSS: CustomCSS;
  animations: {
    enabled: boolean;
    messageAnimation: 'fade' | 'slide' | 'bounce' | 'none';
    widgetEntrance: 'fade' | 'slide-up' | 'scale' | 'none';
  };
  sounds: {
    enabled: boolean;
    newMessage: boolean;
    messageSent: boolean;
  };
}

export const PRESET_THEMES: WidgetTheme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      background: '#FFFFFF',
      text: '#1F2937',
      userMessage: '#8B5CF6',
      botMessage: '#F3F4F6',
      border: '#E5E7EB',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      fontWeight: 400,
    },
    spacing: {
      padding: 16,
      borderRadius: 12,
      messagePadding: 12,
    },
    shadows: {
      widget: '0 10px 40px rgba(0, 0, 0, 0.1)',
      message: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
  },
  {
    id: 'modern',
    name: 'Modern Dark',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      background: '#1F2937',
      text: '#F9FAFB',
      userMessage: '#3B82F6',
      botMessage: '#374151',
      border: '#4B5563',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: 15,
      fontWeight: 500,
    },
    spacing: {
      padding: 20,
      borderRadius: 16,
      messagePadding: 14,
    },
    shadows: {
      widget: '0 20px 60px rgba(0, 0, 0, 0.3)',
      message: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      background: '#FFFFFF',
      text: '#111827',
      userMessage: '#000000',
      botMessage: '#F9FAFB',
      border: '#D1D5DB',
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 14,
      fontWeight: 400,
    },
    spacing: {
      padding: 12,
      borderRadius: 8,
      messagePadding: 10,
    },
    shadows: {
      widget: '0 4px 12px rgba(0, 0, 0, 0.08)',
      message: 'none',
    },
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      background: '#FFFBEB',
      text: '#78350F',
      userMessage: '#F59E0B',
      botMessage: '#FEF3C7',
      border: '#FCD34D',
    },
    typography: {
      fontFamily: 'Nunito, sans-serif',
      fontSize: 15,
      fontWeight: 600,
    },
    spacing: {
      padding: 18,
      borderRadius: 20,
      messagePadding: 16,
    },
    shadows: {
      widget: '0 15px 50px rgba(245, 158, 11, 0.2)',
      message: '0 2px 8px rgba(245, 158, 11, 0.1)',
    },
  },
];

export const DEFAULT_CUSTOMIZATION: WidgetCustomization = {
  theme: PRESET_THEMES[0],
  customCSS: {
    enabled: false,
    css: '',
  },
  animations: {
    enabled: true,
    messageAnimation: 'slide',
    widgetEntrance: 'slide-up',
  },
  sounds: {
    enabled: true,
    newMessage: true,
    messageSent: false,
  },
};

// Generate CSS from theme
export const generateThemeCSS = (theme: WidgetTheme): string => {
  return `
.chat-widget {
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize}px;
  font-weight: ${theme.typography.fontWeight};
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  border-radius: ${theme.spacing.borderRadius}px;
  padding: ${theme.spacing.padding}px;
  box-shadow: ${theme.shadows.widget};
  border: 1px solid ${theme.colors.border};
}

.chat-message-user {
  background: ${theme.colors.userMessage};
  color: white;
  padding: ${theme.spacing.messagePadding}px;
  border-radius: ${theme.spacing.borderRadius}px;
  box-shadow: ${theme.shadows.message};
}

.chat-message-bot {
  background: ${theme.colors.botMessage};
  color: ${theme.colors.text};
  padding: ${theme.spacing.messagePadding}px;
  border-radius: ${theme.spacing.borderRadius}px;
  box-shadow: ${theme.shadows.message};
}

.chat-button-primary {
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.spacing.borderRadius / 2}px;
}

.chat-button-secondary {
  background: ${theme.colors.secondary};
  color: white;
  border-radius: ${theme.spacing.borderRadius / 2}px;
}
`.trim();
};
