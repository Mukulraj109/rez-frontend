/**
 * Fashion Category Data
 * Dummy data with API-ready structure for future backend integration
 */

import {
  CategoryGridItem,
  Vibe,
  Occasion,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
  BankOffer,
  CategoryBrand,
  CategoryStore,
} from '@/types/categoryTypes';

// ============================================
// Category Grid (4-column)
// ============================================

export const fashionCategories: CategoryGridItem[] = [
  { id: 'men', name: 'Men', icon: '👔', color: '#3B82F6', cashback: 18, itemCount: 1250 },
  { id: 'women', name: 'Women', icon: '👗', color: '#EC4899', cashback: 20, itemCount: 2100 },
  { id: 'kids', name: 'Kids', icon: '🧒', color: '#F59E0B', cashback: 15, itemCount: 890 },
  { id: 'footwear', name: 'Footwear', icon: '👟', color: '#10B981', cashback: 12, itemCount: 560 },
  { id: 'bags', name: 'Bags', icon: '👜', color: '#8B5CF6', cashback: 14, itemCount: 340 },
  { id: 'watches', name: 'Watches', icon: '⌚', color: '#EF4444', cashback: 16, itemCount: 280 },
  { id: 'streetwear', name: 'Streetwear', icon: '🧢', color: '#06B6D4', cashback: 22, itemCount: 420 },
  { id: 'ethnic', name: 'Ethnic', icon: '🪷', color: '#D946EF', cashback: 25, itemCount: 780 },
  { id: 'western', name: 'Western', icon: '👖', color: '#6366F1', cashback: 18, itemCount: 650 },
  { id: 'winter', name: 'Winter', icon: '🧥', color: '#64748B', cashback: 20, itemCount: 320 },
  { id: 'tailoring', name: 'Tailoring', icon: '✂️', color: '#F97316', cashback: 30, itemCount: 45 },
  { id: 'accessories', name: 'Accessories', icon: '💍', color: '#A855F7', cashback: 15, itemCount: 890 },
];

// ============================================
// Vibes (Mood-based shopping)
// ============================================

export const fashionVibes: Vibe[] = [
  { id: 'sunny', name: 'Sunny Day', icon: '☀️', color: '#FBBF24', description: 'Light & breezy outfits' },
  { id: 'party', name: 'Party Mode', icon: '🎉', color: '#EC4899', description: 'Glam & glitter looks' },
  { id: 'romantic', name: 'Romantic', icon: '💕', color: '#F43F5E', description: 'Date night ready' },
  { id: 'winter', name: 'Winter Cozy', icon: '❄️', color: '#06B6D4', description: 'Warm & stylish layers' },
  { id: 'beach', name: 'Beach Ready', icon: '🏖️', color: '#14B8A6', description: 'Summer essentials' },
  { id: 'minimal', name: 'Minimal', icon: '🤍', color: '#94A3B8', description: 'Clean & simple' },
  { id: 'artistic', name: 'Artistic', icon: '🎨', color: '#8B5CF6', description: 'Bold & creative' },
  { id: 'sporty', name: 'Sporty', icon: '🏃', color: '#22C55E', description: 'Active & athletic' },
];

// ============================================
// Occasions (Event-based shopping)
// ============================================

export const fashionOccasions: Occasion[] = [
  { id: 'wedding', name: 'Wedding', icon: '💒', color: '#F43F5E', tag: 'Hot', discount: 30 },
  { id: 'eid', name: 'Eid', icon: '🌙', color: '#10B981', tag: 'Trending', discount: 25 },
  { id: 'diwali', name: 'Diwali', icon: '🪔', color: '#F59E0B', tag: 'Coming Soon', discount: 35 },
  { id: 'christmas', name: 'Christmas', icon: '🎄', color: '#EF4444', tag: null, discount: 20 },
  { id: 'newyear', name: 'New Year', icon: '🎊', color: '#8B5CF6', tag: null, discount: 22 },
  { id: 'birthday', name: 'Birthday', icon: '🎂', color: '#EC4899', tag: 'Special', discount: 15 },
  { id: 'collegefest', name: 'College Fest', icon: '🎓', color: '#3B82F6', tag: 'Student', discount: 28 },
  { id: 'office', name: 'Office Party', icon: '🏢', color: '#64748B', tag: null, discount: 18 },
];

// ============================================
// Trending Hashtags
// ============================================

export const fashionTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#WeddingSeason', itemCount: 12, color: '#F43F5E' },
  { id: 'trend-2', tag: '#StreetStyle', itemCount: 28, color: '#06B6D4' },
  { id: 'trend-3', tag: '#OfficeLooks', itemCount: 18, color: '#64748B' },
  { id: 'trend-4', tag: '#PartyReady', itemCount: 24, color: '#EC4899' },
  { id: 'trend-5', tag: '#SustainableFashion', itemCount: 15, color: '#10B981' },
  { id: 'trend-6', tag: '#EthnicVibes', itemCount: 32, color: '#D946EF' },
];

// ============================================
// AI Suggestions
// ============================================

export const fashionAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Best for you', icon: '✨', link: '/fashion?filter=recommended' },
  { id: 2, title: 'Under ₹2000', icon: '💰', link: '/fashion?filter=budget' },
  { id: 3, title: 'Trending now', icon: '🔥', link: '/fashion?filter=trending' },
  { id: 4, title: 'Premium picks', icon: '👑', link: '/fashion?filter=premium' },
];

export const fashionAIFilterChips: AIFilterChip[] = [
  { id: 'style', label: 'Style', icon: '👗' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'occasion', label: 'Occasion', icon: '🎉' },
  { id: 'brand', label: 'Brand', icon: '🏷️' },
  { id: 'size', label: 'Size', icon: '📏' },
];

export const fashionAIPlaceholders: string[] = [
  'Find me a wedding outfit under ₹10,000',
  'Best ethnic wear for Diwali...',
  'Casual office looks for summer...',
];

// ============================================
// UGC Posts (User Generated Content)
// ============================================

export const fashionUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Priya S.',
    userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    hashtag: '#OOTD',
    likes: 234,
    comments: 18,
    coinsEarned: 150,
    isVerified: false,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Ananya R.',
    userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
    hashtag: '#StyleInspo',
    likes: 189,
    comments: 12,
    coinsEarned: 120,
    isVerified: true,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'Meera K.',
    userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    hashtag: '#Trending',
    likes: 412,
    comments: 45,
    coinsEarned: 200,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Riya M.',
    userAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    hashtag: '#Summer',
    likes: 156,
    comments: 8,
    coinsEarned: 100,
    isVerified: false,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Kavya J.',
    userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
    hashtag: '#Fashion',
    likes: 287,
    comments: 23,
    coinsEarned: 175,
    isVerified: true,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Shreya P.',
    userAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
    hashtag: '#LookBook',
    likes: 198,
    comments: 15,
    coinsEarned: 130,
    isVerified: false,
  },
];

// ============================================
// Exclusive Offers
// ============================================

export const fashionExclusiveOffers: ExclusiveOffer[] = [
  {
    id: 'student',
    title: 'Student Special',
    icon: '🎓',
    discount: '25% Extra Off',
    description: 'Valid student ID required',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'women',
    title: 'Women Exclusive',
    icon: '👩',
    discount: 'Up to 40% Off',
    description: 'On ethnic & western wear',
    color: '#EC4899',
    gradient: 'from-pink-500 to-pink-600',
  },
  {
    id: 'birthday',
    title: 'Birthday Month',
    icon: '🎂',
    discount: '30% Off + Gift',
    description: 'Celebrate with extra savings',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'corporate',
    title: 'Corporate Perks',
    icon: '🏢',
    discount: '20% Off Formals',
    description: 'For verified employees',
    color: '#64748B',
    gradient: 'from-slate-500 to-slate-600',
  },
];

// ============================================
// Brands
// ============================================

export const fashionBrands: CategoryBrand[] = [
  { id: 'zara', name: 'Zara', logo: '👗', cashback: 18, tag: 'Trending' },
  { id: 'hm', name: 'H&M', logo: '🧥', cashback: 15, tag: null },
  { id: 'nike', name: 'Nike', logo: '👟', cashback: 12, tag: 'Sports' },
  { id: 'levis', name: 'Levis', logo: '👖', cashback: 16, tag: null },
  { id: 'manyavar', name: 'Manyavar', logo: '🪷', cashback: 22, tag: 'Ethnic' },
  { id: 'fossil', name: 'Fossil', logo: '⌚', cashback: 16, tag: null },
  { id: 'rayban', name: 'Ray-Ban', logo: '🕶️', cashback: 15, tag: 'Premium' },
  { id: 'bewakoof', name: 'Bewakoof', logo: '🧢', cashback: 22, tag: 'Budget' },
];

// ============================================
// Stores
// ============================================

export const fashionStores: CategoryStore[] = [
  {
    id: 'store-1',
    name: 'Zara',
    logo: 'https://logo.clearbit.com/zara.com',
    rating: 4.6,
    cashback: 18,
    distance: '2.3 km',
    is60Min: true,
    hasPickup: true,
    categories: ['women', 'men', 'kids'],
  },
  {
    id: 'store-2',
    name: 'H&M',
    logo: 'https://logo.clearbit.com/hm.com',
    rating: 4.4,
    cashback: 15,
    distance: '1.8 km',
    is60Min: true,
    hasPickup: true,
    categories: ['women', 'men', 'kids'],
  },
  {
    id: 'store-3',
    name: 'Manyavar',
    logo: 'https://logo.clearbit.com/manyavar.com',
    rating: 4.8,
    cashback: 22,
    distance: '3.5 km',
    is60Min: false,
    hasPickup: true,
    categories: ['ethnic'],
  },
  {
    id: 'store-4',
    name: 'Nike',
    logo: 'https://logo.clearbit.com/nike.com',
    rating: 4.7,
    cashback: 12,
    distance: '2.1 km',
    is60Min: true,
    hasPickup: true,
    categories: ['footwear', 'streetwear'],
  },
];

// ============================================
// Bank Offers
// ============================================

export const fashionBankOffers: BankOffer[] = [
  { id: 'hdfc', bank: 'HDFC Bank', icon: '🏦', offer: '10% Instant Discount', maxDiscount: 1500, minOrder: 3000, cardType: 'Credit/Debit' },
  { id: 'icici', bank: 'ICICI Bank', icon: '🏛️', offer: '15% Cashback', maxDiscount: 2000, minOrder: 5000, cardType: 'Credit Card' },
  { id: 'axis', bank: 'Axis Bank', icon: '💳', offer: 'Flat ₹500 Off', maxDiscount: 500, minOrder: 2500, cardType: 'All Cards' },
  { id: 'sbi', bank: 'SBI Card', icon: '🏦', offer: '5% Cashback', maxDiscount: 750, minOrder: 2000, cardType: 'Credit Card' },
];

// ============================================
// Quick Filters
// ============================================

export const fashionQuickFilters = [
  { id: 'trending', icon: '🔥', label: 'Trending' },
  { id: '60min', icon: '⚡', label: '60-min Try' },
  { id: 'pickup', icon: '🏪', label: 'Store Pickup' },
  { id: 'vegan', icon: '🌱', label: 'Vegan' },
  { id: 'sustainable', icon: '♻️', label: 'Sustainable' },
  { id: 'premium', icon: '👑', label: 'Premium' },
  { id: 'budget', icon: '💰', label: 'Budget Friendly' },
  { id: 'sale', icon: '🏷️', label: 'On Sale' },
];

// Bundled Export for Category Page
export const fashionCategoryData = {
  categories: fashionCategories,
  vibes: fashionVibes,
  occasions: fashionOccasions,
  trendingHashtags: fashionTrendingHashtags,
  aiSuggestions: fashionAISuggestions,
  aiFilterChips: fashionAIFilterChips,
  aiPlaceholders: fashionAIPlaceholders,
  ugcData: {
    photos: fashionUGCPosts,
  },
  exclusiveOffers: fashionExclusiveOffers,
  brands: fashionBrands,
  stores: fashionStores,
  bankOffers: fashionBankOffers,
  quickFilters: fashionQuickFilters,
};
