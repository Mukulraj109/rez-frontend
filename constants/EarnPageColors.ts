import { CategoryColors } from '@/types/earnPage.types';

// Category Color Palette - Based on Screenshots
export const CATEGORY_COLORS: CategoryColors = {
  purple: {
    background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
  teal: {
    background: 'linear-gradient(135deg, #10B981, #06B6D4)',
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
  pink: {
    background: 'linear-gradient(135deg, #EC4899, #F472B6)',
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
  blue: {
    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
  green: {
    background: 'linear-gradient(135deg, #059669, #10B981)',
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
  orange: {
    background: 'linear-gradient(135deg, #F59E0B, #F97316)',
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
};

// Solid colors for React Native (gradients handled separately)
export const CATEGORY_SOLID_COLORS = {
  purple: '#8B5CF6',
  teal: '#10B981',
  pink: '#EC4899',
  blue: '#3B82F6',
  green: '#059669',
  orange: '#F59E0B',
} as const;

// Earn Page Color Palette
export const EARN_COLORS = {
  // Primary Colors
  primary: '#8B5CF6',
  primaryLight: '#A855F7',
  primaryDark: '#7C3AED',
  
  // Secondary Colors
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Accent Colors
  accent: '#EC4899',
  accentLight: '#F472B6',
  accentDark: '#DB2777',
  
  // Background Colors
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Shadow Colors
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
} as const;

// Category Color Mapping for specific categories
export const CATEGORY_COLOR_MAP = {
  'graphics-design': 'pink',
  'meme-marketing': 'purple', 
  'brand-storyteller': 'teal',
  'review': 'purple',
  'social-share': 'teal',
  'ugc-content': 'pink',
  'research': 'pink',
  'games': 'purple',
  'sales': 'teal',
  'video-creation': 'purple',
  'website-design': 'teal',
  'social-media-marketing': 'pink',
  'mobile-app-development': 'pink',
  'voice-over': 'teal',
  'influencer': 'pink',
} as const;

// Gradient definitions for React Native LinearGradient
export const CATEGORY_GRADIENTS = {
  purple: ['#8B5CF6', '#A855F7'],
  teal: ['#10B981', '#06B6D4'], 
  pink: ['#EC4899', '#F472B6'],
  blue: ['#3B82F6', '#6366F1'],
  green: ['#059669', '#10B981'],
  orange: ['#F59E0B', '#F97316'],
} as const;

// Notification Colors
export const NOTIFICATION_COLORS = {
  info: {
    background: '#EFF6FF',
    border: '#DBEAFE',
    text: '#1E40AF',
    icon: '#3B82F6',
  },
  success: {
    background: '#F0FDF4',
    border: '#DCFCE7',
    text: '#166534',
    icon: '#10B981',
  },
  warning: {
    background: '#FFFBEB',
    border: '#FEF3C7',
    text: '#92400E',
    icon: '#F59E0B',
  },
  error: {
    background: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
    icon: '#EF4444',
  },
} as const;

// Project Status Colors
export const PROJECT_STATUS_COLORS = {
  'complete-now': {
    background: '#8B5CF6',
    text: '#FFFFFF',
    count: '#FFFFFF',
  },
  'in-review': {
    background: '#F59E0B',
    text: '#FFFFFF', 
    count: '#FFFFFF',
  },
  'completed': {
    background: '#10B981',
    text: '#FFFFFF',
    count: '#FFFFFF',
  },
} as const;

export type CategoryColorKey = keyof typeof CATEGORY_SOLID_COLORS;
export type EarnColorKey = keyof typeof EARN_COLORS;