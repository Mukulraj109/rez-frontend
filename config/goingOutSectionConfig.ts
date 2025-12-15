/**
 * Going Out Section Configuration
 * Defines subcategories and settings for the homepage "Going Out" section
 * Now displays stores instead of products
 */

export interface GoingOutSubcategory {
  id: string;
  label: string;
  slug: string;
  icon: string;
}

// 4 Food & Dining subcategories for the Going Out section
export const GOING_OUT_SUBCATEGORIES: GoingOutSubcategory[] = [
  { id: 'cafes', label: 'Cafes', slug: 'cafes', icon: 'cafe-outline' },
  { id: 'family-restaurants', label: 'Family Restaurants', slug: 'family-restaurants', icon: 'people-outline' },
  { id: 'fine-dining', label: 'Fine Dining', slug: 'fine-dining', icon: 'wine-outline' },
  { id: 'qsr-fast-food', label: 'QSR/Fast Food', slug: 'qsr-fast-food', icon: 'fast-food-outline' },
];

// Section configuration
export const GOING_OUT_SECTION_CONFIG = {
  title: 'Going Out',
  subtitle: 'Discover restaurants, cafes & more',
  storesPerCategory: 6,
  cardWidth: 200,
  cardHeight: 240,
  cardGap: 12,
  imageHeight: 120,
  avgOrderValue: 500, // Used to calculate earn amount from cashback %
};

// ReZ Brand Colors for the section
export const GOING_OUT_COLORS = {
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
  subcategories: GOING_OUT_SUBCATEGORIES,
  config: GOING_OUT_SECTION_CONFIG,
  colors: GOING_OUT_COLORS,
};
