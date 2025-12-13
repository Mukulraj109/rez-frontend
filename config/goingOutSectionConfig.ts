/**
 * Going Out Section Configuration
 * Defines subcategories and settings for the homepage "Going Out" section
 */

export interface GoingOutSubcategory {
  id: string;
  label: string;
  slug: string;
  icon: string;
  image: any;
}

// Category images
const CATEGORY_IMAGES = {
  cafes: require('@/assets/images/going-out-categories/cafes.png'),
  familyRestaurants: require('@/assets/images/going-out-categories/family-restaurants.png'),
  fineDining: require('@/assets/images/going-out-categories/fine-dining.png'),
  qsrFastFood: require('@/assets/images/going-out-categories/qsr-fast-food.png'),
};

// 4 Food & Dining subcategories for the Going Out section
export const GOING_OUT_SUBCATEGORIES: GoingOutSubcategory[] = [
  { id: 'cafes', label: 'Cafes', slug: 'cafes', icon: 'cafe-outline', image: CATEGORY_IMAGES.cafes },
  { id: 'family-restaurants', label: 'Family Restaurants', slug: 'family-restaurants', icon: 'people-outline', image: CATEGORY_IMAGES.familyRestaurants },
  { id: 'fine-dining', label: 'Fine Dining', slug: 'fine-dining', icon: 'wine-outline', image: CATEGORY_IMAGES.fineDining },
  { id: 'qsr-fast-food', label: 'QSR/Fast Food', slug: 'qsr-fast-food', icon: 'fast-food-outline', image: CATEGORY_IMAGES.qsrFastFood },
];

// Section configuration
export const GOING_OUT_SECTION_CONFIG = {
  title: 'Going Out',
  subtitle: 'Discover restaurants, cafes & more',
  badgeText: 'Best Deals',
  productsPerCategory: 6,
  cardWidth: 160,
  cardHeight: 220,
  cardGap: 12,
  imageHeight: 100,
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
