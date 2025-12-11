/**
 * Service Section Configuration
 * Defines subcategories and settings for the homepage "Service" section
 */

export interface ServiceSubcategory {
  id: string;
  label: string;
  slug: string;
  icon: string;
}

// 4 Service subcategories (mix of home services and beauty/wellness)
export const SERVICE_SUBCATEGORIES: ServiceSubcategory[] = [
  { id: 'ac-repair', label: 'AC Repair', slug: 'ac-repair', icon: 'snow-outline' },
  { id: 'salons', label: 'Salons', slug: 'salons', icon: 'cut-outline' },
  { id: 'cleaning', label: 'Cleaning', slug: 'cleaning', icon: 'sparkles-outline' },
  { id: 'spa-massage', label: 'Spa & Massage', slug: 'spa-massage', icon: 'leaf-outline' },
];

// Section configuration
export const SERVICE_SECTION_CONFIG = {
  title: 'Services',
  subtitle: 'Expert services at your doorstep',
  badgeText: 'Expert',
  productsPerCategory: 6,
  cardWidth: 160,
  cardHeight: 220,
  cardGap: 12,
  imageHeight: 100,
};

// ReZ Brand Colors for the section
export const SERVICE_COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',
  white: '#FFFFFF',
  surface: '#F7FAFC',
  cashbackGradient: ['#00C06A', '#00896B'] as [string, string],
};

export default {
  subcategories: SERVICE_SUBCATEGORIES,
  config: SERVICE_SECTION_CONFIG,
  colors: SERVICE_COLORS,
};
