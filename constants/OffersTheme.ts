/**
 * Offers Theme System
 *
 * Light theme for "Near U" page (/offers)
 * Dark theme for "Prive" page (/prive-offers)
 */

import { Colors, Shadows, BorderRadius, Spacing } from './DesignSystem';

// Theme mode type
export type OffersThemeMode = 'light' | 'dark';

// Theme interface
export interface OffersThemeColors {
  background: {
    primary: string;
    secondary: string;
    card: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    inverse: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
  };
  accent: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    cashback: string;
  };
  gradient: {
    primary: string[];
    secondary: string[];
    lightning: string[];
    cashback: string[];
    exclusive: string[];
  };
  badge: {
    new: string;
    trending: string;
    lightning: string;
    cashback: string;
    exclusive: string;
    freeDelivery: string;
  };
}

export interface OffersTheme {
  mode: OffersThemeMode;
  colors: OffersThemeColors;
}

// Light Theme (Near U)
export const LightTheme: OffersTheme = {
  mode: 'light',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F7FAFC',
      card: '#FFFFFF',
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#0B2240',      // Midnight Navy
      secondary: '#1F2D3D',    // Slate
      tertiary: '#627D98',     // Gray 600
      accent: '#00C06A',       // ReZ Green
      inverse: '#FFFFFF',
    },
    border: {
      light: '#F0F4F8',
      medium: '#D9E2EC',
      dark: '#BCCCDC',
    },
    accent: {
      primary: '#00C06A',      // ReZ Green
      secondary: '#00796B',    // Deep Teal
      success: '#2ECC71',
      warning: '#FF9F1C',
      error: '#E74C3C',
      cashback: '#F59E0B',     // Amber
    },
    gradient: {
      primary: ['#00C06A', '#00A16B'],
      secondary: ['#00796B', '#004D40'],
      lightning: ['#FEF3C7', '#FEE2E2'],     // Amber to red tint
      cashback: ['#FEF3C7', '#FCD34D'],      // Amber gradient
      exclusive: ['#EDE9FE', '#FCE7F3'],     // Purple to pink tint
    },
    badge: {
      new: '#10B981',          // Emerald
      trending: '#EF4444',     // Red
      lightning: '#F59E0B',    // Amber
      cashback: '#10B981',     // Emerald
      exclusive: '#8B5CF6',    // Purple
      freeDelivery: '#3B82F6', // Blue
    },
  },
};

// Dark Theme (Prive)
export const DarkTheme: OffersTheme = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      card: '#2C2C2E',
      elevated: '#3A3A3C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1A6',
      tertiary: '#636366',
      accent: '#00C06A',       // ReZ Green stays same
      inverse: '#000000',
    },
    border: {
      light: '#2C2C2E',
      medium: '#3A3A3C',
      dark: '#48484A',
    },
    accent: {
      primary: '#00C06A',      // ReZ Green
      secondary: '#00A16B',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      cashback: '#FBBF24',     // Brighter amber for dark theme
    },
    gradient: {
      primary: ['#00C06A', '#00A16B'],
      secondary: ['#1C1C1E', '#2C2C2E'],
      lightning: ['rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)'],
      cashback: ['rgba(245, 158, 11, 0.2)', 'rgba(252, 211, 77, 0.2)'],
      exclusive: ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)'],
    },
    badge: {
      new: '#34D399',          // Brighter emerald
      trending: '#F87171',     // Brighter red
      lightning: '#FBBF24',    // Brighter amber
      cashback: '#34D399',
      exclusive: '#A78BFA',    // Brighter purple
      freeDelivery: '#60A5FA', // Brighter blue
    },
  },
};

// Get theme by mode
export const getOffersTheme = (mode: OffersThemeMode): OffersTheme => {
  return mode === 'light' ? LightTheme : DarkTheme;
};

// Card styles for each theme
export const getCardStyles = (theme: OffersTheme) => ({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    overflow: 'hidden' as const,
  },
  shadow: theme.mode === 'light' ? Shadows.medium : Shadows.none,
});

// Section header styles
export const getSectionHeaderStyles = (theme: OffersTheme) => ({
  title: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  viewAll: {
    color: theme.colors.accent.primary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
});

// Tab styles
export const getTabStyles = (theme: OffersTheme) => ({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
  },
  tab: {
    inactive: {
      backgroundColor: 'transparent',
    },
    active: {
      backgroundColor: theme.colors.background.card,
    },
  },
  text: {
    inactive: {
      color: theme.colors.text.tertiary,
    },
    active: {
      color: theme.colors.text.primary,
    },
  },
});

// Discount bucket colors
export const DiscountBucketColors = {
  '25': { bg: '#D1FAE5', text: '#059669', icon: '#10B981' },    // Green
  '50': { bg: '#FEF3C7', text: '#D97706', icon: '#F59E0B' },    // Amber
  '80': { bg: '#FEE2E2', text: '#DC2626', icon: '#EF4444' },    // Red
  'freeDelivery': { bg: '#DBEAFE', text: '#2563EB', icon: '#3B82F6' }, // Blue
};

// Exclusive category colors
export const ExclusiveCategoryColors = {
  student: { bg: '#EEF2FF', icon: '#6366F1', text: '#4338CA' },    // Indigo
  corporate: { bg: '#E0F2FE', icon: '#0EA5E9', text: '#0369A1' }, // Sky
  women: { bg: '#FCE7F3', icon: '#EC4899', text: '#BE185D' },      // Pink
  birthday: { bg: '#FEF3C7', icon: '#F59E0B', text: '#D97706' },   // Amber
};

export default {
  LightTheme,
  DarkTheme,
  getOffersTheme,
  getCardStyles,
  getSectionHeaderStyles,
  getTabStyles,
  DiscountBucketColors,
  ExclusiveCategoryColors,
};
