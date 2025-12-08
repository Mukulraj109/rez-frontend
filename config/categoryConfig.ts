/**
 * Category Configuration
 * Hardcoded configuration for all main categories
 * Based on category.md specifications
 */

export interface CategoryBanner {
  title: string;
  subtitle: string;
  discount: string;
  tag: string;
}

export interface SubcategoryItem {
  slug: string;
  name: string;
  icon?: string;
}

export interface CategoryConfig {
  slug: string;
  name: string;
  icon: string; // Ionicons name
  primaryColor: string;
  gradientColors?: [string, string, string]; // Custom gradient if needed
  keywords: string[];
  subcategories: SubcategoryItem[];
  banner: CategoryBanner;
  categoryId?: string; // MongoDB ObjectId if known
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  // 1. FOOD & DINING
  'food-dining': {
    slug: 'food-dining',
    name: 'Food & Dining',
    icon: 'restaurant-outline',
    primaryColor: '#FF6B35',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'], // Same nice green gradient as Fashion
    keywords: ['food', 'restaurant', 'cafe', 'dining', 'qsr', 'fast food', 'bakery', 'dessert', 'ice cream', 'cloud kitchen', 'street food', 'confectionery', 'sweet'],
    subcategories: [
      { slug: 'cafes', name: 'Cafés', icon: 'cafe-outline' },
      { slug: 'qsr-fast-food', name: 'QSR / Fast Food', icon: 'fast-food-outline' },
      { slug: 'family-restaurants', name: 'Family Restaurants', icon: 'people-outline' },
      { slug: 'fine-dining', name: 'Fine Dining', icon: 'wine-outline' },
      { slug: 'ice-cream-dessert', name: 'Ice Cream & Dessert', icon: 'ice-cream-outline' },
      { slug: 'bakery-confectionery', name: 'Bakery & Confectionery', icon: 'nutrition-outline' },
      { slug: 'cloud-kitchens', name: 'Cloud Kitchens', icon: 'cloud-outline' },
      { slug: 'street-food', name: 'Street Food', icon: 'storefront-outline' },
    ],
    banner: {
      title: 'Taste the Best',
      subtitle: 'Local Flavors',
      discount: '30%',
      tag: 'FRESH DEALS',
    },
  },

  // 2. GROCERY & ESSENTIALS
  'grocery-essentials': {
    slug: 'grocery-essentials',
    name: 'Grocery & Essentials',
    icon: 'basket-outline',
    primaryColor: '#10B981',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['grocery', 'supermarket', 'kirana', 'vegetables', 'fruits', 'meat', 'fish', 'dairy', 'packaged', 'water', 'essentials', 'fresh'],
    subcategories: [
      { slug: 'supermarkets', name: 'Supermarkets', icon: 'cart-outline' },
      { slug: 'kirana-stores', name: 'Kirana Stores', icon: 'storefront-outline' },
      { slug: 'fresh-vegetables', name: 'Fresh Vegetables', icon: 'leaf-outline' },
      { slug: 'meat-fish', name: 'Meat & Fish', icon: 'fish-outline' },
      { slug: 'dairy', name: 'Dairy', icon: 'water-outline' },
      { slug: 'packaged-goods', name: 'Packaged Goods', icon: 'cube-outline' },
      { slug: 'water-cans', name: 'Water Cans', icon: 'water-outline' },
    ],
    banner: {
      title: 'Fresh Daily',
      subtitle: 'Essentials',
      discount: '25%',
      tag: 'DAILY DEALS',
    },
  },

  // 3. BEAUTY, WELLNESS & PERSONAL CARE
  'beauty-wellness': {
    slug: 'beauty-wellness',
    name: 'Beauty & Wellness',
    icon: 'flower-outline',
    primaryColor: '#EC4899',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['beauty', 'salon', 'spa', 'wellness', 'skincare', 'cosmetology', 'dermatology', 'nail', 'grooming', 'massage', 'cosmetics', 'personal care'],
    subcategories: [
      { slug: 'salons', name: 'Salons', icon: 'cut-outline' },
      { slug: 'spa-massage', name: 'Spa & Massage', icon: 'leaf-outline' },
      { slug: 'beauty-services', name: 'Beauty Services', icon: 'sparkles-outline' },
      { slug: 'cosmetology', name: 'Cosmetology', icon: 'color-palette-outline' },
      { slug: 'dermatology', name: 'Dermatology', icon: 'medical-outline' },
      { slug: 'skincare-cosmetics', name: 'Skincare & Cosmetics', icon: 'flask-outline' },
      { slug: 'nail-studios', name: 'Nail Studios', icon: 'hand-left-outline' },
      { slug: 'grooming-men', name: 'Grooming for Men', icon: 'man-outline' },
    ],
    banner: {
      title: 'Glow Up',
      subtitle: 'Self Care',
      discount: '40%',
      tag: 'WELLNESS WEEK',
    },
  },

  // 4. HEALTHCARE
  'healthcare': {
    slug: 'healthcare',
    name: 'Healthcare',
    icon: 'medical-outline',
    primaryColor: '#EF4444',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['health', 'pharmacy', 'clinic', 'diagnostic', 'dental', 'physiotherapy', 'nursing', 'eyewear', 'vision', 'medicine', 'doctor', 'hospital'],
    subcategories: [
      { slug: 'pharmacy', name: 'Pharmacy', icon: 'medkit-outline' },
      { slug: 'clinics', name: 'Clinics', icon: 'fitness-outline' },
      { slug: 'diagnostics', name: 'Diagnostics', icon: 'pulse-outline' },
      { slug: 'dental', name: 'Dental', icon: 'happy-outline' },
      { slug: 'physiotherapy', name: 'Physiotherapy', icon: 'body-outline' },
      { slug: 'home-nursing', name: 'Home Nursing', icon: 'home-outline' },
      { slug: 'vision-eyewear', name: 'Vision & Eyewear', icon: 'eye-outline' },
    ],
    banner: {
      title: 'Health First',
      subtitle: 'Care for You',
      discount: '20%',
      tag: 'HEALTH WEEK',
    },
  },

  // 5. FASHION
  'fashion': {
    slug: 'fashion',
    name: 'Fashion',
    icon: 'shirt-outline',
    primaryColor: '#00C06A',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['fashion', 'clothing', 'apparel', 'beauty', 'jacket', 'jeans', 'dress', 'shirt', 'shoe', 'sneaker', 'sunglasses', 'handbag', 'blazer', 'footwear', 'accessories', 'watch', 'jewelry', 'bags'],
    subcategories: [
      { slug: 'footwear', name: 'Footwear', icon: 'footsteps-outline' },
      { slug: 'bags-accessories', name: 'Bags & Accessories', icon: 'bag-outline' },
      { slug: 'electronics', name: 'Electronics', icon: 'phone-portrait-outline' },
      { slug: 'mobile-accessories', name: 'Mobile Accessories', icon: 'headset-outline' },
      { slug: 'watches', name: 'Watches', icon: 'watch-outline' },
      { slug: 'jewelry', name: 'Jewelry', icon: 'diamond-outline' },
      { slug: 'local-brands', name: 'Local Brands', icon: 'storefront-outline' },
    ],
    banner: {
      title: 'Wedding Glam',
      subtitle: 'in a Flash',
      discount: '50%',
      tag: 'LIMITED TIME',
    },
    categoryId: '68ecdb9f55f086b04de299ef', // Fashion & Beauty category ID from database
  },

  // 6. FITNESS & SPORTS
  'fitness-sports': {
    slug: 'fitness-sports',
    name: 'Fitness & Sports',
    icon: 'fitness-outline',
    primaryColor: '#8B5CF6',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['gym', 'fitness', 'crossfit', 'yoga', 'zumba', 'martial arts', 'sports', 'sportswear', 'academy', 'workout', 'exercise', 'training'],
    subcategories: [
      { slug: 'gyms', name: 'Gyms', icon: 'barbell-outline' },
      { slug: 'crossfit', name: 'CrossFit', icon: 'flame-outline' },
      { slug: 'yoga', name: 'Yoga', icon: 'body-outline' },
      { slug: 'zumba', name: 'Zumba', icon: 'musical-notes-outline' },
      { slug: 'martial-arts', name: 'Martial Arts', icon: 'hand-right-outline' },
      { slug: 'sports-academies', name: 'Sports Academies', icon: 'trophy-outline' },
      { slug: 'sportswear', name: 'Sportswear', icon: 'shirt-outline' },
    ],
    banner: {
      title: 'Get Fit',
      subtitle: 'Stay Strong',
      discount: '35%',
      tag: 'FITNESS SALE',
    },
  },

  // 7. EDUCATION & LEARNING
  'education-learning': {
    slug: 'education-learning',
    name: 'Education & Learning',
    icon: 'school-outline',
    primaryColor: '#3B82F6',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['education', 'coaching', 'skill', 'music', 'dance', 'art', 'craft', 'vocational', 'language', 'training', 'learning', 'class', 'tuition'],
    subcategories: [
      { slug: 'coaching-centers', name: 'Coaching Centers', icon: 'book-outline' },
      { slug: 'skill-development', name: 'Skill Development', icon: 'bulb-outline' },
      { slug: 'music-dance-classes', name: 'Music/Dance Classes', icon: 'musical-notes-outline' },
      { slug: 'art-craft', name: 'Art & Craft', icon: 'color-palette-outline' },
      { slug: 'vocational', name: 'Vocational', icon: 'construct-outline' },
      { slug: 'language-training', name: 'Language Training', icon: 'language-outline' },
    ],
    banner: {
      title: 'Learn More',
      subtitle: 'Grow Skills',
      discount: '25%',
      tag: 'LEARNING FEST',
    },
  },

  // 8. HOME SERVICES
  'home-services': {
    slug: 'home-services',
    name: 'Home Services',
    icon: 'home-outline',
    primaryColor: '#F59E0B',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['home', 'ac repair', 'plumbing', 'electrical', 'cleaning', 'pest control', 'shifting', 'laundry', 'tutor', 'dry cleaning', 'repair', 'maintenance'],
    subcategories: [
      { slug: 'ac-repair', name: 'AC Repair', icon: 'snow-outline' },
      { slug: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
      { slug: 'electrical', name: 'Electrical', icon: 'flash-outline' },
      { slug: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
      { slug: 'pest-control', name: 'Pest Control', icon: 'bug-outline' },
      { slug: 'house-shifting', name: 'House Shifting', icon: 'cube-outline' },
      { slug: 'laundry-dry-cleaning', name: 'Laundry & Dry Cleaning', icon: 'shirt-outline' },
      { slug: 'home-tutors', name: 'Home Tutors', icon: 'school-outline' },
    ],
    banner: {
      title: 'Home Help',
      subtitle: 'At Your Door',
      discount: '30%',
      tag: 'SERVICE DEALS',
    },
  },

  // 9. TRAVEL & EXPERIENCES
  'travel-experiences': {
    slug: 'travel-experiences',
    name: 'Travel & Experiences',
    icon: 'airplane-outline',
    primaryColor: '#06B6D4',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['travel', 'hotel', 'taxi', 'bike rental', 'tour', 'getaway', 'weekend', 'activity', 'intercity', 'airport', 'vacation', 'trip'],
    subcategories: [
      { slug: 'hotels', name: 'Hotels', icon: 'bed-outline' },
      { slug: 'intercity-travel', name: 'Intercity Travel', icon: 'bus-outline' },
      { slug: 'taxis', name: 'Taxis', icon: 'car-outline' },
      { slug: 'bike-rentals', name: 'Bike Rentals', icon: 'bicycle-outline' },
      { slug: 'weekend-getaways', name: 'Weekend Getaways', icon: 'sunny-outline' },
      { slug: 'tours', name: 'Tours', icon: 'map-outline' },
      { slug: 'activities', name: 'Activities', icon: 'rocket-outline' },
    ],
    banner: {
      title: 'Explore More',
      subtitle: 'Adventure Awaits',
      discount: '45%',
      tag: 'TRAVEL DEALS',
    },
  },

  // 10. ENTERTAINMENT
  'entertainment': {
    slug: 'entertainment',
    name: 'Entertainment',
    icon: 'film-outline',
    primaryColor: '#A855F7',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['movie', 'event', 'festival', 'workshop', 'amusement', 'gaming', 'vr', 'ar', 'live', 'concert', 'show', 'fun'],
    subcategories: [
      { slug: 'movies', name: 'Movies', icon: 'film-outline' },
      { slug: 'live-events', name: 'Live Events', icon: 'mic-outline' },
      { slug: 'festivals', name: 'Festivals', icon: 'balloon-outline' },
      { slug: 'workshops', name: 'Workshops', icon: 'build-outline' },
      { slug: 'amusement-parks', name: 'Amusement Parks', icon: 'happy-outline' },
      { slug: 'gaming-cafes', name: 'Gaming Cafés', icon: 'game-controller-outline' },
      { slug: 'vr-ar-experiences', name: 'VR/AR Experiences', icon: 'glasses-outline' },
    ],
    banner: {
      title: 'Fun Times',
      subtitle: 'Entertainment',
      discount: '40%',
      tag: 'FUN WEEK',
    },
  },

  // 11. FINANCIAL LIFESTYLE
  'financial-lifestyle': {
    slug: 'financial-lifestyle',
    name: 'Financial Lifestyle',
    icon: 'wallet-outline',
    primaryColor: '#14B8A6',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    keywords: ['bill', 'recharge', 'broadband', 'cable', 'ott', 'insurance', 'gold', 'savings', 'donation', 'payment', 'finance', 'mobile'],
    subcategories: [
      { slug: 'bill-payments', name: 'Bill Payments', icon: 'receipt-outline' },
      { slug: 'mobile-recharge', name: 'Mobile Recharge', icon: 'phone-portrait-outline' },
      { slug: 'broadband', name: 'Broadband', icon: 'wifi-outline' },
      { slug: 'cable-ott', name: 'Cable/OTT', icon: 'tv-outline' },
      { slug: 'insurance', name: 'Insurance', icon: 'shield-checkmark-outline' },
      { slug: 'gold-savings', name: 'Gold Savings', icon: 'diamond-outline' },
      { slug: 'donations', name: 'Donations', icon: 'heart-outline' },
    ],
    banner: {
      title: 'Smart Money',
      subtitle: 'Save More',
      discount: '10%',
      tag: 'CASHBACK',
    },
  },
};

/**
 * Get category configuration by slug
 */
export const getCategoryConfig = (slug: string): CategoryConfig | null => {
  return CATEGORY_CONFIGS[slug] || null;
};

/**
 * Get all category slugs
 */
export const getAllCategorySlugs = (): string[] => {
  return Object.keys(CATEGORY_CONFIGS);
};

/**
 * Get all categories as array
 */
export const getAllCategories = (): CategoryConfig[] => {
  return Object.values(CATEGORY_CONFIGS);
};

export default CATEGORY_CONFIGS;
