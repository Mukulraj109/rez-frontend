/**
 * Privé Theme Constants
 * Luxury dark theme with gold accents
 */

export const PRIVE_COLORS = {
  // Primary backgrounds
  background: {
    primary: '#0A0A0A',      // Deep black
    secondary: '#141414',    // Charcoal
    tertiary: '#1C1C1E',     // Dark grey
    elevated: '#1F1F1F',     // Elevated surfaces
    card: '#181818',         // Card backgrounds
  },

  // Gold accent system
  gold: {
    primary: '#C9A962',      // Main gold
    light: '#D4B978',        // Light gold
    dark: '#A88B4A',         // Dark gold
    muted: '#8B7355',        // Muted gold
    glow: 'rgba(201, 169, 98, 0.15)',
    gradient: ['#C9A962', '#A88B4A'] as const,
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#6B6B6B',
    disabled: '#4A4A4A',
    inverse: '#0A0A0A',
  },

  // Status colors
  status: {
    success: '#4CAF50',
    successMuted: '#2E7D32',
    warning: '#FF9800',
    warningMuted: '#E65100',
    error: '#EF5350',
    errorMuted: '#C62828',
    info: '#64B5F6',
  },

  // Borders
  border: {
    primary: '#2A2A2A',
    secondary: '#1F1F1F',
    gold: '#C9A962',
    goldMuted: 'rgba(201, 169, 98, 0.3)',
  },

  // Transparent variants
  transparent: {
    white05: 'rgba(255, 255, 255, 0.05)',
    white08: 'rgba(255, 255, 255, 0.08)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    black50: 'rgba(0, 0, 0, 0.5)',
    gold05: 'rgba(201, 169, 98, 0.05)',
    gold10: 'rgba(201, 169, 98, 0.1)',
    gold15: 'rgba(201, 169, 98, 0.15)',
    gold20: 'rgba(201, 169, 98, 0.2)',
  },
};

export const PRIVE_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const PRIVE_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  full: 9999,
};

// 6-Pillar Configuration
export const PILLAR_CONFIG = {
  engagement: {
    id: 'engagement',
    name: 'Engagement',
    shortName: 'Engage',
    weight: 0.25,
    color: '#4CAF50',
    icon: '📊',
    description: 'How deeply you use ReZ',
  },
  trust: {
    id: 'trust',
    name: 'Trust & Integrity',
    shortName: 'Trust',
    weight: 0.20,
    color: '#2196F3',
    icon: '🛡️',
    description: 'Your reliability for brands',
  },
  influence: {
    id: 'influence',
    name: 'Influence',
    shortName: 'Influence',
    weight: 0.20,
    color: '#E91E63',
    icon: '📢',
    description: 'Your real social influence',
  },
  economic: {
    id: 'economic',
    name: 'Economic Value',
    shortName: 'Economic',
    weight: 0.15,
    color: '#9C27B0',
    icon: '💰',
    description: 'Value you bring to ecosystem',
  },
  brand_affinity: {
    id: 'brand_affinity',
    name: 'Brand Affinity',
    shortName: 'Brand',
    weight: 0.10,
    color: '#FF9800',
    icon: '🎯',
    description: 'How brands perceive you',
  },
  network: {
    id: 'network',
    name: 'Network & Community',
    shortName: 'Network',
    weight: 0.10,
    color: '#00BCD4',
    icon: '🔗',
    description: 'Ecosystem expansion impact',
  },
};

export type PillarId = keyof typeof PILLAR_CONFIG;
