/**
 * Category-based theme configuration for EventPage
 * Each category has its own color scheme for a personalized experience
 */

export interface CategoryTheme {
  primaryColor: string;
  secondaryColor: string;
  gradientColors: [string, string];
  icon: string;
  accentColor: string;
  darkText: string;
  lightText: string;
  badgeBackground: string;
  buttonGradient: [string, string];
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  // New lowercase categories
  movies: {
    primaryColor: '#EF4444',
    secondaryColor: '#DC2626',
    gradientColors: ['#EF4444', '#B91C1C'],
    icon: 'film-outline',
    accentColor: '#FEE2E2',
    darkText: '#7F1D1D',
    lightText: '#FECACA',
    badgeBackground: 'rgba(239, 68, 68, 0.9)',
    buttonGradient: ['#EF4444', '#DC2626'],
  },
  concerts: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    gradientColors: ['#8B5CF6', '#6D28D9'],
    icon: 'musical-notes-outline',
    accentColor: '#EDE9FE',
    darkText: '#5B21B6',
    lightText: '#DDD6FE',
    badgeBackground: 'rgba(139, 92, 246, 0.9)',
    buttonGradient: ['#8B5CF6', '#7C3AED'],
  },
  sports: {
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    gradientColors: ['#10B981', '#047857'],
    icon: 'football-outline',
    accentColor: '#D1FAE5',
    darkText: '#065F46',
    lightText: '#A7F3D0',
    badgeBackground: 'rgba(16, 185, 129, 0.9)',
    buttonGradient: ['#10B981', '#059669'],
  },
  parks: {
    primaryColor: '#22C55E',
    secondaryColor: '#16A34A',
    gradientColors: ['#22C55E', '#15803D'],
    icon: 'leaf-outline',
    accentColor: '#DCFCE7',
    darkText: '#166534',
    lightText: '#BBF7D0',
    badgeBackground: 'rgba(34, 197, 94, 0.9)',
    buttonGradient: ['#22C55E', '#16A34A'],
  },
  workshops: {
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    gradientColors: ['#F59E0B', '#B45309'],
    icon: 'brush-outline',
    accentColor: '#FEF3C7',
    darkText: '#92400E',
    lightText: '#FDE68A',
    badgeBackground: 'rgba(245, 158, 11, 0.9)',
    buttonGradient: ['#F59E0B', '#D97706'],
  },
  gaming: {
    primaryColor: '#3B82F6',
    secondaryColor: '#2563EB',
    gradientColors: ['#3B82F6', '#1D4ED8'],
    icon: 'game-controller-outline',
    accentColor: '#DBEAFE',
    darkText: '#1E40AF',
    lightText: '#BFDBFE',
    badgeBackground: 'rgba(59, 130, 246, 0.9)',
    buttonGradient: ['#3B82F6', '#2563EB'],
  },
  entertainment: {
    primaryColor: '#EC4899',
    secondaryColor: '#DB2777',
    gradientColors: ['#EC4899', '#BE185D'],
    icon: 'sparkles-outline',
    accentColor: '#FCE7F3',
    darkText: '#9D174D',
    lightText: '#FBCFE8',
    badgeBackground: 'rgba(236, 72, 153, 0.9)',
    buttonGradient: ['#EC4899', '#DB2777'],
  },

  // Legacy title case categories
  Music: {
    primaryColor: '#F97316',
    secondaryColor: '#EA580C',
    gradientColors: ['#F97316', '#C2410C'],
    icon: 'musical-note-outline',
    accentColor: '#FFEDD5',
    darkText: '#9A3412',
    lightText: '#FED7AA',
    badgeBackground: 'rgba(249, 115, 22, 0.9)',
    buttonGradient: ['#F97316', '#EA580C'],
  },
  Technology: {
    primaryColor: '#06B6D4',
    secondaryColor: '#0891B2',
    gradientColors: ['#06B6D4', '#0E7490'],
    icon: 'hardware-chip-outline',
    accentColor: '#CFFAFE',
    darkText: '#155E75',
    lightText: '#A5F3FC',
    badgeBackground: 'rgba(6, 182, 212, 0.9)',
    buttonGradient: ['#06B6D4', '#0891B2'],
  },
  Wellness: {
    primaryColor: '#14B8A6',
    secondaryColor: '#0D9488',
    gradientColors: ['#14B8A6', '#0F766E'],
    icon: 'fitness-outline',
    accentColor: '#CCFBF1',
    darkText: '#115E59',
    lightText: '#99F6E4',
    badgeBackground: 'rgba(20, 184, 166, 0.9)',
    buttonGradient: ['#14B8A6', '#0D9488'],
  },
  Sports: {
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    gradientColors: ['#10B981', '#047857'],
    icon: 'trophy-outline',
    accentColor: '#D1FAE5',
    darkText: '#065F46',
    lightText: '#A7F3D0',
    badgeBackground: 'rgba(16, 185, 129, 0.9)',
    buttonGradient: ['#10B981', '#059669'],
  },
  Education: {
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    gradientColors: ['#6366F1', '#4338CA'],
    icon: 'school-outline',
    accentColor: '#E0E7FF',
    darkText: '#3730A3',
    lightText: '#C7D2FE',
    badgeBackground: 'rgba(99, 102, 241, 0.9)',
    buttonGradient: ['#6366F1', '#4F46E5'],
  },
  Business: {
    primaryColor: '#64748B',
    secondaryColor: '#475569',
    gradientColors: ['#64748B', '#334155'],
    icon: 'briefcase-outline',
    accentColor: '#F1F5F9',
    darkText: '#1E293B',
    lightText: '#CBD5E1',
    badgeBackground: 'rgba(100, 116, 139, 0.9)',
    buttonGradient: ['#64748B', '#475569'],
  },
  Arts: {
    primaryColor: '#A855F7',
    secondaryColor: '#9333EA',
    gradientColors: ['#A855F7', '#7E22CE'],
    icon: 'color-palette-outline',
    accentColor: '#F3E8FF',
    darkText: '#6B21A8',
    lightText: '#E9D5FF',
    badgeBackground: 'rgba(168, 85, 247, 0.9)',
    buttonGradient: ['#A855F7', '#9333EA'],
  },
  Food: {
    primaryColor: '#F43F5E',
    secondaryColor: '#E11D48',
    gradientColors: ['#F43F5E', '#BE123C'],
    icon: 'restaurant-outline',
    accentColor: '#FFE4E6',
    darkText: '#9F1239',
    lightText: '#FECDD3',
    badgeBackground: 'rgba(244, 63, 94, 0.9)',
    buttonGradient: ['#F43F5E', '#E11D48'],
  },
  Entertainment: {
    primaryColor: '#EC4899',
    secondaryColor: '#DB2777',
    gradientColors: ['#EC4899', '#BE185D'],
    icon: 'sparkles-outline',
    accentColor: '#FCE7F3',
    darkText: '#9D174D',
    lightText: '#FBCFE8',
    badgeBackground: 'rgba(236, 72, 153, 0.9)',
    buttonGradient: ['#EC4899', '#DB2777'],
  },
  Other: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    gradientColors: ['#8B5CF6', '#6D28D9'],
    icon: 'ellipsis-horizontal-outline',
    accentColor: '#EDE9FE',
    darkText: '#5B21B6',
    lightText: '#DDD6FE',
    badgeBackground: 'rgba(139, 92, 246, 0.9)',
    buttonGradient: ['#8B5CF6', '#7C3AED'],
  },
};

// Default theme for unknown categories
export const DEFAULT_THEME: CategoryTheme = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#7C3AED',
  gradientColors: ['#8B5CF6', '#6D28D9'],
  icon: 'calendar-outline',
  accentColor: '#EDE9FE',
  darkText: '#5B21B6',
  lightText: '#DDD6FE',
  badgeBackground: 'rgba(139, 92, 246, 0.9)',
  buttonGradient: ['#8B5CF6', '#7C3AED'],
};

/**
 * Get theme for a category
 * @param category - The event category
 * @returns CategoryTheme object
 */
export const getCategoryTheme = (category: string | undefined): CategoryTheme => {
  if (!category) return DEFAULT_THEME;
  return CATEGORY_THEMES[category] || CATEGORY_THEMES[category.toLowerCase()] || DEFAULT_THEME;
};

/**
 * Get category icon name
 * @param category - The event category
 * @returns Ionicons icon name
 */
export const getCategoryIcon = (category: string | undefined): string => {
  const theme = getCategoryTheme(category);
  return theme.icon;
};
