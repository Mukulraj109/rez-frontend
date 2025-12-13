/**
 * Design System Tokens
 *
 * Central source of truth for all design values.
 * Based on 8px grid system for consistency.
 */

// ==================== SPACING ====================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ==================== TYPOGRAPHY ====================
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // UI text
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },

  // Interactive
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  link: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
} as const;

// ==================== COLORS ====================
export const COLORS = {
  // Primary brand colors - ReZ Green
  primary: {
    50: '#E8F5EE',
    100: '#C6E7D5',
    200: '#9DD9B9',
    300: '#6ECA99',
    400: '#3ABF7A',
    500: '#00C06A', // Main ReZ brand green
    600: '#00A05A',
    700: '#008048',
    800: '#006038',
    900: '#004028',
  },

  // Secondary/accent - Gold/Orange for rewards
  secondary: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC857', // ReZ Gold
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  // Neutral grays
  neutral: {
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

  // Semantic colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444', // Main error red
    700: '#B91C1C',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B', // Main warning orange
    700: '#B45309',
  },
  success: {
    50: '#E8F5EE',
    100: '#C6E7D5',
    400: '#3ABF7A',
    500: '#00C06A', // ReZ green (matches primary)
    600: '#00A05A',
    700: '#008048',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6', // Main info blue
    700: '#1D4ED8',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#111827',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },

  // Border colors
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

// ==================== BORDER RADIUS ====================
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999, // For pills/circles
} as const;

// ==================== SHADOWS ====================
export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

// ==================== LAYOUT ====================
export const LAYOUT = {
  // Container widths
  containerMaxWidth: 1280,
  contentMaxWidth: 1024,

  // Grid
  gridColumns: 12,
  gridGutter: 16,

  // Common dimensions
  headerHeight: 56,
  bottomNavHeight: 64,
  cardMinHeight: 120,

  // Breakpoints (for responsive design)
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  },
} as const;

// ==================== Z-INDEX ====================
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ==================== ANIMATION ====================
export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const;

// ==================== ICON SIZES ====================
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

// Helper type exports for TypeScript
export type SpacingKey = keyof typeof SPACING;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type ColorKey = keyof typeof COLORS;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type ShadowKey = keyof typeof SHADOWS;
