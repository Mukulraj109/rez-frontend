/**
 * Design System - Modern UI Constants
 *
 * Standardized design tokens for consistent, modern UI across all components.
 * Based on 8px grid system with purple (#7C3AED) primary color.
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const Colors = {
  // Primary Purple Palette (Standardized to #7C3AED)
  primary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED', // PRIMARY - Use this everywhere
    800: '#6D28D9',
    900: '#581C87',
  },

  // Neutral Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    purple: '#FAF5FF',
    purpleLight: '#F6F3FB',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    white: '#FFFFFF',
    purple: '#7C3AED',
  },

  // Border Colors
  border: {
    light: '#F3F4F6',
    medium: '#E5E7EB',
    dark: '#D1D5DB',
    purple: '#E9D5FF',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.5)',
    darker: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

export const Gradients = {
  // Purple Gradients
  purplePrimary: ['#8B5CF6', '#7C3AED'],
  purpleDeep: ['#7C3AED', '#6D28D9'],
  purpleLight: ['#C084FC', '#A855F7'],
  purpleVertical: ['#FAF5FF', '#F3E8FF'],

  // Overlay Gradients
  overlayBottom: ['transparent', 'rgba(0, 0, 0, 0.7)'],
  overlayTop: ['rgba(0, 0, 0, 0.7)', 'transparent'],
  overlayFull: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)'],

  // Shimmer Gradient (for skeleton loaders)
  shimmer: ['#E5E7EB', '#F3F4F6', '#EDE9FE', '#F3F4F6', '#E5E7EB'],
  shimmerDark: ['#374151', '#4B5563', '#374151'],
} as const;

// ============================================================================
// SPACING SYSTEM (8px Grid)
// ============================================================================

export const Spacing = {
  xs: 4,    // 0.5 units
  sm: 8,    // 1 unit
  md: 12,   // 1.5 units
  base: 16, // 2 units - Default
  lg: 20,   // 2.5 units
  xl: 24,   // 3 units
  '2xl': 32,  // 4 units
  '3xl': 40,  // 5 units
  '4xl': 48,  // 6 units
  '5xl': 64,  // 8 units
} as const;

// ============================================================================
// BORDER RADIUS SCALE
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
  circular: (size: number) => size / 2,
} as const;

// ============================================================================
// SHADOW SYSTEM (3 Levels)
// ============================================================================

export const Shadows = {
  // Subtle - For small elements, badges
  subtle: {
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Medium - For cards, buttons
  medium: {
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Strong - For modals, important elements
  strong: {
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // Purple-tinted shadows for primary elements
  purpleSubtle: {
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  purpleMedium: {
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  purpleStrong: {
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },

  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const Typography = {
  // Display - For hero text
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },

  // Labels & Buttons
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },

  // Caption
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },

  // Price - Special formatting
  price: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
    letterSpacing: 0,
  },
  priceLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
} as const;

// ============================================================================
// ANIMATION TIMINGS (in milliseconds)
// ============================================================================

export const Timing = {
  // Standard timings
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,

  // Specific use cases
  ripple: 200,
  tooltip: 150,
  modal: 300,
  drawer: 350,
  toast: 250,
  skeleton: 1500,

  // Spring configs for react-native-reanimated
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  springBouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.8,
  },

  springSmooth: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ============================================================================
// OPACITY LEVELS
// ============================================================================

export const Opacity = {
  disabled: 0.5,
  muted: 0.6,
  subtle: 0.7,
  medium: 0.8,
  high: 0.9,
  full: 1,
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

// ============================================================================
// GLASSMORPHISM PRESETS
// ============================================================================

export const Glass = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  purple: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
} as const;

// ============================================================================
// BUTTON HEIGHTS (Standardized)
// ============================================================================

export const ButtonHeight = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

// ============================================================================
// HIT SLOP (for better touch targets)
// ============================================================================

export const HitSlop = {
  sm: { top: 8, bottom: 8, left: 8, right: 8 },
  md: { top: 12, bottom: 12, left: 12, right: 12 },
  lg: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get spacing value from grid multiplier
 * @example getSpacing(2) => 16 (2 * 8px)
 */
export const getSpacing = (multiplier: number): number => multiplier * 8;

/**
 * Get opacity for disabled state
 */
export const getDisabledOpacity = () => Opacity.disabled;

/**
 * Get shadow style by level
 */
export const getShadow = (level: 'subtle' | 'medium' | 'strong' | 'none' = 'medium') => {
  return Shadows[level];
};

/**
 * Get purple shadow by level
 */
export const getPurpleShadow = (level: 'subtle' | 'medium' | 'strong' = 'medium') => {
  const key = `purple${level.charAt(0).toUpperCase() + level.slice(1)}` as 'purpleSubtle' | 'purpleMedium' | 'purpleStrong';
  return Shadows[key];
};

/**
 * Get text color by variant
 */
export const getTextColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'white' | 'purple' = 'primary') => {
  return Colors.text[variant];
};

/**
 * Create gradient config for LinearGradient
 */
export const getGradient = (type: keyof typeof Gradients) => ({
  colors: Gradients[type],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
});

// Export default object with all design tokens
export default {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  Shadows,
  Typography,
  Timing,
  IconSize,
  Opacity,
  ZIndex,
  Glass,
  ButtonHeight,
  HitSlop,
  // Helper functions
  getSpacing,
  getDisabledOpacity,
  getShadow,
  getPurpleShadow,
  getTextColor,
  getGradient,
};
