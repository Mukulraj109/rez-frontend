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
  // Primary Green Palette (ReZ Green: #00C06A)
  primary: {
    50: '#E6F9F0',
    100: '#C0F0D9',
    200: '#99E6C2',
    300: '#73DCAB',
    400: '#4DD294',
    500: '#26C97D',
    600: '#00C06A', // PRIMARY - ReZ Green
    700: '#00A159',
    800: '#008248',
    900: '#006337',
  },

  // Secondary Teal Palette (Deep Teal: #00796B)
  secondary: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688',
    600: '#00897B',
    700: '#00796B', // ACCENT - Deep Teal
    800: '#00695C',
    900: '#004D40',
  },

  // Neutral Grays (Midnight Navy based)
  gray: {
    50: '#F7FAFC', // Surface
    100: '#F0F4F8',
    200: '#D9E2EC',
    300: '#BCCCDC',
    400: '#9AA7B2', // Cool Gray 1
    500: '#829AB1',
    600: '#627D98',
    700: '#486581',
    800: '#334E68',
    900: '#1F2D3D', // Slate 1
  },

  // Brand Neutrals
  midnightNavy: '#0B2240', // Brand Dark

  // Semantic Colors
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#FF9F1C',
  info: '#00796B',
  gold: '#FFC857', // Sun Gold

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F7FAFC', // App background
    tertiary: '#F0F4F8',
    green: '#E6F9F0',
    greenLight: '#F0FDF4',
  },

  // Text Colors
  text: {
    primary: '#0B2240', // Midnight Navy
    secondary: '#1F2D3D', // Slate 1
    tertiary: '#9AA7B2', // Cool Gray 1
    white: '#FFFFFF',
    green: '#00C06A',
    teal: '#00796B',
    gold: '#FFC857',
  },

  // Border Colors
  border: {
    light: '#F0F4F8',
    medium: '#D9E2EC',
    dark: '#BCCCDC',
    green: '#C0F0D9',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(11, 34, 64, 0.1)',
    medium: 'rgba(11, 34, 64, 0.3)',
    dark: 'rgba(11, 34, 64, 0.5)',
    darker: 'rgba(11, 34, 64, 0.7)',
  },
} as const;

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

export const Gradients = {
  // Green Gradients (Primary)
  primary: ['#00C06A', '#00A16B'], // ReZ Green Gradient
  primaryVertical: ['#E6F9F0', '#FFFFFF'],

  // Gold Gradients (Rewards)
  gold: ['#FFC857', '#FFB300'],

  // Brand Gradient (Hero)
  brand: ['#00C06A', '#00A16B', '#FFC857'], // Green to Gold

  // Legacy mappings for backward compatibility (mapped to new colors)
  purplePrimary: ['#00C06A', '#00A16B'],
  purpleDeep: ['#00796B', '#004D40'],
  purpleLight: ['#4DD294', '#26C97D'],
  purpleVertical: ['#E6F9F0', '#FFFFFF'],

  // Overlay Gradients
  overlayBottom: ['transparent', 'rgba(11, 34, 64, 0.7)'],
  overlayTop: ['rgba(11, 34, 64, 0.7)', 'transparent'],
  overlayFull: ['rgba(11, 34, 64, 0.3)', 'rgba(11, 34, 64, 0.7)'],

  // Shimmer Gradient (for skeleton loaders)
  shimmer: ['#F0F4F8', '#F7FAFC', '#E6F9F0', '#F7FAFC', '#F0F4F8'],
  shimmerDark: ['#1F2D3D', '#334E68', '#1F2D3D'],
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
    shadowColor: Colors.midnightNavy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Medium - For cards, buttons
  medium: {
    shadowColor: Colors.midnightNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Slightly softer
    shadowRadius: 12, // More spread
    elevation: 4,
  },

  // Strong - For modals, important elements
  strong: {
    shadowColor: Colors.midnightNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  // Green-tinted shadows for primary elements (mapped from purple)
  purpleSubtle: {
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  purpleMedium: {
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  purpleStrong: {
    shadowColor: Colors.primary[600],
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
    // fontFamily: 'Poppins-Bold', // Assuming fonts are loaded
  },

  // Headings
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    // fontFamily: 'Poppins-Bold',
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    // fontFamily: 'Poppins-SemiBold',
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    // fontFamily: 'Poppins-SemiBold',
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    // fontFamily: 'Poppins-SemiBold',
  },

  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    // fontFamily: 'Inter-Regular',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
    // fontFamily: 'Inter-Regular',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    // fontFamily: 'Inter-Regular',
  },

  // Labels & Buttons
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    // fontFamily: 'Inter-SemiBold',
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    // fontFamily: 'Inter-SemiBold',
  },
  button: {
    fontSize: 14, // Updated from 16 to 14 per TASK.md
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    // fontFamily: 'Inter-SemiBold',
  },
  buttonSmall: {
    fontSize: 12,
    lineHeight: 16,
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
    backgroundColor: 'rgba(11, 34, 64, 0.3)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  purple: { // Mapped to Green
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
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
export const getTextColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'white' | 'green' | 'teal' | 'gold' = 'primary') => {
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
