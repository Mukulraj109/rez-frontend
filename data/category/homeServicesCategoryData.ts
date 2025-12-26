/**
 * Home Services Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const homeServicesCategories: CategoryGridItem[] = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', color: '#3B82F6', cashback: 15, itemCount: 234 },
  { id: 'electrical', name: 'Electrical', icon: '⚡', color: '#F59E0B', cashback: 15, itemCount: 189 },
  { id: 'cleaning', name: 'Home Cleaning', icon: '🧹', color: '#22C55E', cashback: 20, itemCount: 345 },
  { id: 'ac-repair', name: 'AC Repair', icon: '❄️', color: '#06B6D4', cashback: 18, itemCount: 156 },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌', color: '#8B5CF6', cashback: 15, itemCount: 178 },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚', color: '#D97706', cashback: 18, itemCount: 98 },
  { id: 'painting', name: 'Painting', icon: '🎨', color: '#EC4899', cashback: 22, itemCount: 87 },
  { id: 'pest-control', name: 'Pest Control', icon: '🪲', color: '#EF4444', cashback: 20, itemCount: 67 },
  { id: 'shifting', name: 'Packers & Movers', icon: '📦', color: '#6366F1', cashback: 12, itemCount: 145 },
  { id: 'interior', name: 'Interior Design', icon: '🏠', color: '#D946EF', cashback: 25, itemCount: 56 },
  { id: 'gardening', name: 'Gardening', icon: '🌱', color: '#16A34A', cashback: 15, itemCount: 78 },
  { id: 'security', name: 'Security Systems', icon: '🔒', color: '#64748B', cashback: 18, itemCount: 45 },
];

export const homeServicesTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#HomeRepair', itemCount: 56, color: '#3B82F6' },
  { id: 'trend-2', tag: '#DeepCleaning', itemCount: 78, color: '#22C55E' },
  { id: 'trend-3', tag: '#ACService', itemCount: 45, color: '#06B6D4' },
  { id: 'trend-4', tag: '#HomeMakeover', itemCount: 34, color: '#EC4899' },
  { id: 'trend-5', tag: '#MovingDay', itemCount: 23, color: '#6366F1' },
  { id: 'trend-6', tag: '#PestFree', itemCount: 29, color: '#EF4444' },
];

export const homeServicesAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Emergency service', icon: '🚨', link: '/home-services?filter=emergency' },
  { id: 2, title: 'Same day', icon: '⚡', link: '/home-services?filter=sameday' },
  { id: 3, title: 'Best rated', icon: '⭐', link: '/home-services?filter=rated' },
  { id: 4, title: 'Budget friendly', icon: '💰', link: '/home-services?filter=budget' },
];

export const homeServicesAIFilterChips: AIFilterChip[] = [
  { id: 'service', label: 'Service', icon: '🔧' },
  { id: 'urgency', label: 'Urgency', icon: '⏰' },
  { id: 'price', label: 'Budget', icon: '💰' },
  { id: 'rating', label: 'Rating', icon: '⭐' },
  { id: 'availability', label: 'Available', icon: '📅' },
];

export const homeServicesAIPlaceholders: string[] = [
  'AC not cooling, need repair today',
  'Deep cleaning for 3BHK apartment',
  'Packers and movers for local shifting',
];

export const homeServicesUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Happy Home',
    userAvatar: 'https://randomuser.me/api/portraits/women/61.jpg',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    hashtag: '#CleanHome',
    likes: 234,
    comments: 18,
    coinsEarned: 100,
    isVerified: false,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Plumber Pro',
    userAvatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
    hashtag: '#PlumbingDone',
    likes: 178,
    comments: 12,
    coinsEarned: 80,
    isVerified: true,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'AC Expert',
    userAvatar: 'https://randomuser.me/api/portraits/men/63.jpg',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    hashtag: '#ACRepair',
    likes: 312,
    comments: 24,
    coinsEarned: 140,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Paint Master',
    userAvatar: 'https://randomuser.me/api/portraits/men/64.jpg',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    hashtag: '#FreshPaint',
    likes: 256,
    comments: 19,
    coinsEarned: 120,
    isVerified: false,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Green Thumb',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    hashtag: '#GardenGoals',
    likes: 189,
    comments: 14,
    coinsEarned: 90,
    isVerified: true,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Move Easy',
    userAvatar: 'https://randomuser.me/api/portraits/men/66.jpg',
    image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400',
    hashtag: '#MovingDay',
    likes: 145,
    comments: 11,
    coinsEarned: 70,
    isVerified: false,
  },
];

export const homeServicesExclusiveOffers: ExclusiveOffer[] = [
  { id: 'first', title: 'First Service', icon: '🎁', discount: '30% Off', description: 'New customers only', color: '#00C06A' },
  { id: 'combo', title: 'Combo Deal', icon: '💎', discount: 'Save ₹500', description: 'AC + Cleaning', color: '#8B5CF6' },
  { id: 'annual', title: 'Annual Plan', icon: '📅', discount: '40% Off', description: 'On maintenance', color: '#3B82F6' },
  { id: 'emergency', title: '24x7 Service', icon: '🚨', discount: 'No Extra Charge', description: 'Emergency visits', color: '#EF4444' },
];

// Bundled Export for Category Page
export const homeServicesCategoryData = {
  categories: homeServicesCategories,
  trendingHashtags: homeServicesTrendingHashtags,
  aiSuggestions: homeServicesAISuggestions,
  aiFilterChips: homeServicesAIFilterChips,
  aiPlaceholders: homeServicesAIPlaceholders,
  ugcData: {
    photos: homeServicesUGCPosts,
  },
  exclusiveOffers: homeServicesExclusiveOffers,
};
