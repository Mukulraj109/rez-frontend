/**
 * Food & Dining Category Data
 * Dummy data with API-ready structure for future backend integration
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
  BankOffer,
} from '@/types/categoryTypes';

// ============================================
// Category Grid (4-column) - "Browse Categories"
// ============================================

export const foodCategories: CategoryGridItem[] = [
  { id: 'family-restaurant', name: 'Family Restaurant', icon: '👨‍👩‍👧‍👦', color: '#8B5CF6', cashback: 15, itemCount: 245 },
  { id: 'fine-dining', name: 'Fine Dining', icon: '🍽️', color: '#F59E0B', cashback: 20, itemCount: 89 },
  { id: 'ice-cream', name: 'Ice Cream & Desserts', icon: '🍦', color: '#10B981', cashback: 12, itemCount: 156 },
  { id: 'bakery', name: 'Bakery & Cafe', icon: '🥐', color: '#EC4899', cashback: 18, itemCount: 178 },
  { id: 'cloud-kitchen', name: 'Cloud Kitchen', icon: '☁️', color: '#6366F1', cashback: 22, itemCount: 312 },
  { id: 'street-food', name: 'Street Food', icon: '🍜', color: '#EF4444', cashback: 10, itemCount: 234 },
  { id: 'fast-food', name: 'Fast Food', icon: '🍔', color: '#F97316', cashback: 15, itemCount: 289 },
  { id: 'biryani', name: 'Biryani & Kebabs', icon: '🍗', color: '#D946EF', cashback: 18, itemCount: 167 },
  { id: 'pizza', name: 'Pizza & Italian', icon: '🍕', color: '#EF4444', cashback: 16, itemCount: 145 },
  { id: 'chinese', name: 'Chinese & Asian', icon: '🥡', color: '#3B82F6', cashback: 14, itemCount: 198 },
  { id: 'healthy', name: 'Healthy Food', icon: '🥗', color: '#22C55E', cashback: 20, itemCount: 87 },
  { id: 'thali', name: 'Thali Meals', icon: '🍱', color: '#F59E0B', cashback: 18, itemCount: 112 },
  { id: 'cafe', name: 'Cafe & Coffee', icon: '☕', color: '#78350F', cashback: 12, itemCount: 134 },
];

// ============================================
// Cuisine Filters
// ============================================

export const foodCuisineFilters = [
  { id: 'all', label: 'All', icon: '🌍' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'chinese', label: 'Chinese', icon: '🥡' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'thai', label: 'Thai', icon: '🍜' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'south-indian', label: 'South Indian', icon: '🥘' },
  { id: 'north-indian', label: 'North Indian', icon: '🍛' },
  { id: 'continental', label: 'Continental', icon: '🥩' },

  { id: 'japanese', label: 'Japanese', icon: '🍣' },
  { id: 'thali', label: 'Thali', icon: '🍱' },
  { id: 'biryani', label: 'Biryani', icon: '🍗' },
  { id: 'street-food', label: 'Street Food', icon: '🌮' },
  { id: 'ice-cream', label: 'Ice Cream', icon: '🍦' },
  { id: 'healthy', label: 'Healthy', icon: '🥗' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
];

// ============================================
// Mode Filters (Dietary)
// ============================================

export const foodModeFilters = [
  { id: 'halal', label: 'Halal', icon: '✓', color: '#10B981' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🌱', color: '#22C55E' },
  { id: 'vegan', label: 'Vegan', icon: '🥬', color: '#16A34A' },
  { id: 'jain', label: 'Jain', icon: '🕉️', color: '#8B5CF6' },
];

// ============================================
// Trending Hashtags
// ============================================

export const foodTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#BiryaniLovers', itemCount: 45, color: '#D946EF' },
  { id: 'trend-2', tag: '#HealthyEats', itemCount: 32, color: '#22C55E' },
  { id: 'trend-3', tag: '#WeekendBrunch', itemCount: 28, color: '#F59E0B' },
  { id: 'trend-4', tag: '#LateNightCravings', itemCount: 56, color: '#8B5CF6' },
  { id: 'trend-5', tag: '#DessertTime', itemCount: 38, color: '#EC4899' },
  { id: 'trend-6', tag: '#CafeVibes', itemCount: 22, color: '#78350F' },
];

// ============================================
// AI Suggestions
// ============================================

export const foodAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Best for you', icon: '✨', link: '/food?filter=recommended' },
  { id: 2, title: 'Under ₹300', icon: '💰', link: '/food?filter=budget' },
  { id: 3, title: 'Quick bites', icon: '⚡', link: '/food?filter=quick' },
  { id: 4, title: 'Healthy picks', icon: '🥗', link: '/food?filter=healthy' },
];

export const foodAIFilterChips: AIFilterChip[] = [
  { id: 'cuisine', label: 'Cuisine', icon: '🍽️' },
  { id: 'diet', label: 'Diet', icon: '🥬' },
  { id: 'price', label: 'Price', icon: '💰' },
  { id: 'rating', label: 'Rating', icon: '⭐' },
  { id: 'time', label: 'Delivery Time', icon: '⏱️' },
];

export const foodAIPlaceholders: string[] = [
  'Find me a romantic dinner spot under ₹2,000',
  'Best biryani places with 60-min delivery',
  'Healthy lunch options near me',
];

// ============================================
// UGC Posts (User Generated Content)
// ============================================

export const foodUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Rahul K.',
    userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    hashtag: '#PizzaNight',
    likes: 312,
    comments: 24,
    coinsEarned: 180,
    isVerified: false,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Sneha M.',
    userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    hashtag: '#FoodieLife',
    likes: 256,
    comments: 18,
    coinsEarned: 150,
    isVerified: true,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'Vikram S.',
    userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    hashtag: '#BiryaniLove',
    likes: 489,
    comments: 56,
    coinsEarned: 220,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Priya R.',
    userAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    hashtag: '#BrunchGoals',
    likes: 178,
    comments: 12,
    coinsEarned: 100,
    isVerified: false,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Arjun P.',
    userAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    hashtag: '#DessertTime',
    likes: 345,
    comments: 28,
    coinsEarned: 160,
    isVerified: true,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Nisha T.',
    userAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    hashtag: '#HealthyEats',
    likes: 223,
    comments: 15,
    coinsEarned: 130,
    isVerified: false,
  },
];

// ============================================
// Exclusive Offers
// ============================================

export const foodExclusiveOffers: ExclusiveOffer[] = [
  {
    id: 'student',
    title: 'Student Meal Deal',
    icon: '🎓',
    discount: '30% Off',
    description: 'Valid student ID required',
    color: '#3B82F6',
  },
  {
    id: 'family',
    title: 'Family Feast',
    icon: '👨‍👩‍👧‍👦',
    discount: 'Buy 3 Get 1 Free',
    description: 'On family combos',
    color: '#8B5CF6',
  },
  {
    id: 'firstorder',
    title: 'First Order',
    icon: '🎁',
    discount: '50% Off',
    description: 'Max discount ₹150',
    color: '#00C06A',
  },
  {
    id: 'latenight',
    title: 'Late Night',
    icon: '🌙',
    discount: '20% Off',
    description: 'Orders after 10 PM',
    color: '#64748B',
  },
];

// ============================================
// Bank Offers
// ============================================

export const foodBankOffers: BankOffer[] = [
  { id: 'hdfc', bank: 'HDFC Bank', icon: '🏦', offer: '15% Instant Discount', maxDiscount: 200, minOrder: 500, cardType: 'Credit/Debit' },
  { id: 'icici', bank: 'ICICI Bank', icon: '🏛️', offer: '20% Cashback', maxDiscount: 300, minOrder: 600, cardType: 'Credit Card' },
  { id: 'paytm', bank: 'Paytm', icon: '💳', offer: 'Flat ₹75 Off', maxDiscount: 75, minOrder: 299, cardType: 'Wallet' },
  { id: 'phonepe', bank: 'PhonePe', icon: '📱', offer: '₹50 Cashback', maxDiscount: 50, minOrder: 199, cardType: 'UPI' },
];

// ============================================
// Tabs
// ============================================

export const foodTabs = [
  { id: 'delivery', label: 'Delivery', icon: 'bicycle-outline' },
  { id: 'dineIn', label: 'Dine-In', icon: 'restaurant-outline' },
  { id: 'offers', label: 'Offers', icon: 'pricetag-outline' },
  { id: 'experiences', label: 'Experiences', icon: 'sparkles-outline' },
];

// ============================================
// Bundled Export for Category Page
// ============================================

export const foodCategoryData = {
  categories: foodCategories,
  cuisineFilters: foodCuisineFilters,
  modeFilters: foodModeFilters,
  trendingHashtags: foodTrendingHashtags,
  aiSuggestions: foodAISuggestions,
  aiFilterChips: foodAIFilterChips,
  aiPlaceholders: foodAIPlaceholders,
  ugcData: {
    photos: foodUGCPosts,
  },
  exclusiveOffers: foodExclusiveOffers,
  bankOffers: foodBankOffers,
  tabs: foodTabs,
};
