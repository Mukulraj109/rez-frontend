/**
 * Home Delivery Section Configuration
 * Defines subcategories and settings for the homepage "Home Delivery" section
 */

export interface HomeDeliverySubcategory {
  id: string;
  label: string;
  slug: string;
  icon: string;
}

// 4 Mixed (Food + Grocery) subcategories for the Home Delivery section
export const HOME_DELIVERY_SUBCATEGORIES: HomeDeliverySubcategory[] = [
  { id: 'cloud-kitchens', label: 'Cloud Kitchens', slug: 'cloud-kitchens', icon: 'cloud-outline' },
  { id: 'supermarkets', label: 'Supermarkets', slug: 'supermarkets', icon: 'cart-outline' },
  { id: 'pharmacy', label: 'Pharmacy', slug: 'pharmacy', icon: 'medkit-outline' },
  { id: 'fresh-vegetables', label: 'Fresh Vegetables', slug: 'fresh-vegetables', icon: 'leaf-outline' },
];

// Section configuration
export const HOME_DELIVERY_SECTION_CONFIG = {
  title: 'Home Delivery',
  subtitle: 'Everything delivered to your door',
  badgeText: 'Under ₹99',
  productsPerCategory: 6,
  cardWidth: 160,
  cardHeight: 220,
  cardGap: 12,
  imageHeight: 100,
};

// ReZ Brand Colors for the section
export const HOME_DELIVERY_COLORS = {
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
  subcategories: HOME_DELIVERY_SUBCATEGORIES,
  config: HOME_DELIVERY_SECTION_CONFIG,
  colors: HOME_DELIVERY_COLORS,
};
