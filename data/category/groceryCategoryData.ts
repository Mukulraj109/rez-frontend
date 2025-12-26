/**
 * Grocery & Essentials Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const groceryCategories: CategoryGridItem[] = [
  { id: 'fruits', name: 'Fruits & Veggies', icon: '🍎', color: '#22C55E', cashback: 10, itemCount: 456 },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', color: '#F59E0B', cashback: 8, itemCount: 234 },
  { id: 'staples', name: 'Staples & Grains', icon: '🌾', color: '#D97706', cashback: 12, itemCount: 345 },
  { id: 'snacks', name: 'Snacks & Chips', icon: '🍿', color: '#EF4444', cashback: 15, itemCount: 567 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: '#3B82F6', cashback: 10, itemCount: 289 },
  { id: 'personal-care', name: 'Personal Care', icon: '🧴', color: '#EC4899', cashback: 18, itemCount: 378 },
  { id: 'household', name: 'Household', icon: '🧹', color: '#6366F1', cashback: 12, itemCount: 234 },
  { id: 'baby-care', name: 'Baby Care', icon: '👶', color: '#F472B6', cashback: 20, itemCount: 156 },
  { id: 'pet-care', name: 'Pet Care', icon: '🐾', color: '#8B5CF6', cashback: 15, itemCount: 98 },
  { id: 'meat', name: 'Meat & Seafood', icon: '🍖', color: '#DC2626', cashback: 8, itemCount: 145 },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊', color: '#06B6D4', cashback: 12, itemCount: 189 },
  { id: 'organic', name: 'Organic', icon: '🌿', color: '#16A34A', cashback: 18, itemCount: 234 },
];

export const groceryTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#FreshProduce', itemCount: 89, color: '#22C55E' },
  { id: 'trend-2', tag: '#OrganicLiving', itemCount: 67, color: '#16A34A' },
  { id: 'trend-3', tag: '#WeeklyGrocery', itemCount: 45, color: '#F59E0B' },
  { id: 'trend-4', tag: '#HealthySnacks', itemCount: 78, color: '#EF4444' },
  { id: 'trend-5', tag: '#BulkBuying', itemCount: 34, color: '#8B5CF6' },
  { id: 'trend-6', tag: '#QuickDelivery', itemCount: 56, color: '#3B82F6' },
];

export const groceryAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Weekly essentials', icon: '🛒', link: '/grocery?filter=essentials' },
  { id: 2, title: 'Best deals', icon: '🏷️', link: '/grocery?filter=deals' },
  { id: 3, title: 'Fresh today', icon: '🌿', link: '/grocery?filter=fresh' },
  { id: 4, title: 'Quick delivery', icon: '⚡', link: '/grocery?filter=quick' },
];

export const groceryAIFilterChips: AIFilterChip[] = [
  { id: 'category', label: 'Category', icon: '📦' },
  { id: 'brand', label: 'Brand', icon: '🏷️' },
  { id: 'price', label: 'Price', icon: '💰' },
  { id: 'organic', label: 'Organic', icon: '🌿' },
  { id: 'delivery', label: 'Delivery', icon: '🚚' },
];

export const groceryAIPlaceholders: string[] = [
  'Weekly grocery list under ₹2,000',
  'Organic fruits and vegetables',
  'Best snacks for kids party',
];

export const groceryUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Meena R.',
    userAvatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    hashtag: '#FreshProduce',
    likes: 234,
    comments: 18,
    coinsEarned: 100,
    isVerified: false,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Suresh K.',
    userAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400',
    hashtag: '#GroceryHaul',
    likes: 178,
    comments: 12,
    coinsEarned: 80,
    isVerified: true,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'Lakshmi P.',
    userAvatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400',
    hashtag: '#OrganicLife',
    likes: 312,
    comments: 24,
    coinsEarned: 120,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Ramesh V.',
    userAvatar: 'https://randomuser.me/api/portraits/men/24.jpg',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    hashtag: '#WeeklyShopping',
    likes: 145,
    comments: 8,
    coinsEarned: 60,
    isVerified: false,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Gita S.',
    userAvatar: 'https://randomuser.me/api/portraits/women/25.jpg',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400',
    hashtag: '#HealthyEating',
    likes: 267,
    comments: 19,
    coinsEarned: 110,
    isVerified: true,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Kumar N.',
    userAvatar: 'https://randomuser.me/api/portraits/men/26.jpg',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400',
    hashtag: '#FarmFresh',
    likes: 189,
    comments: 14,
    coinsEarned: 90,
    isVerified: false,
  },
];

export const groceryExclusiveOffers: ExclusiveOffer[] = [
  { id: 'first', title: 'First Order', icon: '🎁', discount: '₹200 Off', description: 'Min order ₹500', color: '#00C06A' },
  { id: 'subscription', title: 'Subscribe & Save', icon: '🔄', discount: '15% Off', description: 'On weekly delivery', color: '#3B82F6' },
  { id: 'bulk', title: 'Bulk Buy', icon: '📦', discount: '20% Off', description: 'On orders above ₹2000', color: '#8B5CF6' },
  { id: 'fresh', title: 'Fresh Guarantee', icon: '🌿', discount: 'Full Refund', description: 'If not fresh', color: '#22C55E' },
];

// Bundled Export for Category Page
export const groceryCategoryData = {
  categories: groceryCategories,
  trendingHashtags: groceryTrendingHashtags,
  aiSuggestions: groceryAISuggestions,
  aiFilterChips: groceryAIFilterChips,
  aiPlaceholders: groceryAIPlaceholders,
  ugcData: {
    photos: groceryUGCPosts,
  },
  exclusiveOffers: groceryExclusiveOffers,
};
