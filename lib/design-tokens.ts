/**
 * Qualiflow AI Design Tokens
 * 
 * Centralized design system for consistent styling across the platform.
 * These tokens should be used instead of hardcoded color values.
 * 
 * Usage:
 * ```tsx
 * import { colors, gradients, shadows } from '@/lib/design-tokens';
 * 
 * <div className={gradients.primary}>...</div>
 * <div className={colors.text.primary}>...</div>
 * ```
 */

// ============================================================================
// BRAND COLORS
// ============================================================================

export const brandColors = {
  // Primary brand color - Indigo
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  
  // Secondary brand color - Violet
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Main secondary
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },
  
  // Accent color - Cyan (for highlights)
  accent: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Main accent
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

export const semanticColors = {
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#047857',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#B45309',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#B91C1C',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1D4ED8',
  },
} as const;

// ============================================================================
// GRADIENTS - Limited to 3 primary gradients for consistency
// ============================================================================

export const gradients = {
  // Primary gradient - Used for main CTAs, hero sections
  primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600',
  primaryHover: 'hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700',
  
  // Secondary gradient - Used for secondary actions, cards
  secondary: 'bg-gradient-to-r from-violet-500 to-purple-600',
  secondaryHover: 'hover:from-violet-600 hover:to-purple-700',
  
  // Accent gradient - Used for highlights, badges
  accent: 'bg-gradient-to-r from-cyan-500 to-blue-600',
  accentHover: 'hover:from-cyan-600 hover:to-blue-700',
  
  // CTA gradient - Orange/Pink for high-visibility CTAs
  cta: 'bg-gradient-to-r from-orange-500 to-pink-500',
  ctaHover: 'hover:from-orange-600 hover:to-pink-600',
  
  // Subtle gradients for backgrounds
  subtlePrimary: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50',
  subtleSecondary: 'bg-gradient-to-br from-violet-50 via-white to-indigo-50',
  
  // Dark gradients for sidebar/dark sections
  dark: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  darkPrimary: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900',
  
  // Text gradients
  textPrimary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent',
  textSecondary: 'bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  // Colored shadows for depth
  primary: 'shadow-lg shadow-indigo-500/25',
  primaryHover: 'hover:shadow-xl hover:shadow-indigo-500/30',
  
  secondary: 'shadow-lg shadow-purple-500/25',
  secondaryHover: 'hover:shadow-xl hover:shadow-purple-500/30',
  
  accent: 'shadow-lg shadow-cyan-500/25',
  accentHover: 'hover:shadow-xl hover:shadow-cyan-500/30',
  
  cta: 'shadow-lg shadow-orange-500/25',
  ctaHover: 'hover:shadow-xl hover:shadow-orange-500/30',
  
  // Neutral shadows
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
} as const;

// ============================================================================
// COMPONENT STYLES - Pre-composed styles for common components
// ============================================================================

export const componentStyles = {
  // Buttons
  button: {
    primary: `${gradients.primary} ${shadows.primary} ${shadows.primaryHover} text-white font-semibold`,
    secondary: `${gradients.secondary} ${shadows.secondary} ${shadows.secondaryHover} text-white font-semibold`,
    cta: `${gradients.cta} ${shadows.cta} ${shadows.ctaHover} text-white font-semibold`,
    outline: 'border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold',
    ghost: 'text-slate-600 hover:bg-slate-100 font-medium',
  },
  
  // Cards
  card: {
    default: 'rounded-xl border border-slate-200 bg-white shadow-sm',
    elevated: 'rounded-xl border border-slate-200 bg-white shadow-lg',
    gradient: `rounded-xl ${gradients.subtlePrimary} border border-indigo-100`,
    dark: `rounded-xl ${gradients.dark} border border-slate-700 text-white`,
  },
  
  // Badges
  badge: {
    primary: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    secondary: 'bg-purple-100 text-purple-700 border border-purple-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  
  // Input fields
  input: {
    default: 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500',
  },
} as const;

// ============================================================================
// SIDEBAR THEME
// ============================================================================

export const sidebarTheme = {
  background: 'bg-gradient-to-br from-[#0f1729] via-[#1a2642] to-[#0d1b2a]',
  overlay: 'bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5',
  border: 'border-indigo-500/10',
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    accent: 'text-cyan-300',
  },
  nav: {
    active: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-400/30',
    hover: 'hover:bg-white/5 hover:text-white',
    icon: {
      active: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      default: 'bg-white/5',
    },
  },
} as const;

// ============================================================================
// ADMIN THEME - Aligned with globals.css admin theme CSS variables
// ============================================================================

export const adminTheme = {
  // Surfaces
  background: 'bg-admin-background',
  card: 'bg-admin-card border-admin-border',
  sidebar: 'bg-admin-sidebar',
  muted: 'bg-admin-muted',
  
  // Brand Colors  
  primary: 'bg-admin-primary',      // Orange #FF6900
  accent: 'bg-admin-accent',        // Purple #4F39F6
  
  // Text Colors
  text: {
    primary: 'text-admin-foreground',
    secondary: 'text-admin-card-foreground',
    muted: 'text-admin-muted-foreground',
    sidebar: 'text-admin-sidebar-foreground',
  },
  
  // Semantic Status Colors (for system states only)
  status: {
    success: 'text-admin-success',   // Green #10B981
    warning: 'text-admin-warning',   // Amber #F59E0B
    error: 'text-admin-error',       // Red #EF4444
    info: 'text-admin-info',         // Blue #3B82F6
  },
  
  // Borders & Inputs
  border: 'border-admin-border',
  ring: 'ring-admin-ring',           // Orange focus ring
} as const;

// ============================================================================
// ANIMATION CLASSES
// ============================================================================

export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in slide-in-from-top-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
} as const;

// ============================================================================
// LOADING SPINNER STYLES
// ============================================================================

export const spinnerStyles = {
  // Primary spinner color (indigo) - use for main loading states
  primary: 'text-indigo-500',
  // Secondary spinner color (purple) - alternative
  secondary: 'text-purple-600',
  // Muted spinner for subtle loading states
  muted: 'text-slate-400',
  // Border-based spinner (for circular spinners)
  borderPrimary: 'border-indigo-500',
  borderSecondary: 'border-purple-600',
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  page: {
    x: 'px-4 sm:px-6 lg:px-8',
    y: 'py-6 sm:py-8 lg:py-12',
  },
  section: {
    x: 'px-4 sm:px-6',
    y: 'py-8 sm:py-12 lg:py-16',
  },
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  heading: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
  },
  body: {
    lg: 'text-lg leading-relaxed',
    md: 'text-base leading-relaxed',
    sm: 'text-sm leading-relaxed',
    xs: 'text-xs leading-relaxed',
  },
  label: 'text-sm font-medium text-slate-700',
  caption: 'text-xs text-slate-500',
} as const;

// ============================================================================
// BREAKPOINTS (for reference, matches Tailwind defaults)
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modal: 'z-40',
  popover: 'z-50',
  tooltip: 'z-60',
  toast: 'z-70',
} as const;

// Default export for convenience
const designTokens = {
  brandColors,
  semanticColors,
  gradients,
  shadows,
  componentStyles,
  sidebarTheme,
  adminTheme,
  animations,
  spacing,
  typography,
  breakpoints,
  zIndex,
};

export default designTokens;
