/**
 * Event Colors - Shared color constants for Events & Experiences section
 * Use these colors across all event-related pages and components for consistency
 */

export const EVENT_COLORS = {
  // Primary brand colors
  primary: '#00C06A',
  primaryDark: '#00A05A',
  primaryLight: '#E6F9F0',
  primaryGradient: ['#00C06A', '#00A05A'] as const,

  // Accent color (use sparingly - for featured badges, special highlights)
  accent: '#8B5CF6',
  accentLight: '#EDE9FE',

  // Background colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceElevated: '#FFFFFF',

  // Text colors
  text: '#0B2240',
  textSecondary: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Special colors
  star: '#FFC857', // For ratings
  starEmpty: '#E5E7EB',
  cashback: '#22C55E', // Cashback badge
  verified: '#10B981', // Verified booking badge

  // Category-specific gradients
  categoryGradients: {
    movies: ['#EF4444', '#DC2626'] as const,
    concerts: ['#8B5CF6', '#7C3AED'] as const,
    parks: ['#22C55E', '#16A34A'] as const,
    workshops: ['#F59E0B', '#D97706'] as const,
    gaming: ['#3B82F6', '#2563EB'] as const,
    sports: ['#10B981', '#059669'] as const,
    entertainment: ['#EC4899', '#DB2777'] as const,
    arts: ['#8B5CF6', '#7C3AED'] as const,
    music: ['#F97316', '#EA580C'] as const,
  },

  // Category icons
  categoryIcons: {
    movies: '🎬',
    concerts: '🎵',
    parks: '🎢',
    workshops: '🎨',
    gaming: '🎮',
    sports: '⚽',
    entertainment: '🎭',
    arts: '🖼️',
    music: '🎤',
  } as Record<string, string>,
};

// Typography constants for events
export const EVENT_TYPOGRAPHY = {
  // Font sizes
  titleLarge: 24,
  titleMedium: 20,
  titleSmall: 18,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 13,
  caption: 12,
  tiny: 11,

  // Font weights
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

// Spacing constants
export const EVENT_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius constants
export const EVENT_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// Shadow presets
export const EVENT_SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

export default EVENT_COLORS;
