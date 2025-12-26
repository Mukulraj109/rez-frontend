/**
 * Beauty & Wellness Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const beautyCategories: CategoryGridItem[] = [
  { id: 'salon', name: 'Salon', icon: '💇‍♀️', color: '#EC4899', cashback: 20, itemCount: 345 },
  { id: 'spa', name: 'Spa & Massage', icon: '💆', color: '#8B5CF6', cashback: 25, itemCount: 189 },
  { id: 'skincare', name: 'Skincare', icon: '✨', color: '#F59E0B', cashback: 18, itemCount: 456 },
  { id: 'makeup', name: 'Makeup', icon: '💄', color: '#EF4444', cashback: 22, itemCount: 567 },
  { id: 'haircare', name: 'Hair Care', icon: '💇', color: '#3B82F6', cashback: 15, itemCount: 234 },
  { id: 'nails', name: 'Nail Art', icon: '💅', color: '#D946EF', cashback: 18, itemCount: 156 },
  { id: 'men-grooming', name: 'Men Grooming', icon: '🧔', color: '#6366F1', cashback: 16, itemCount: 178 },
  { id: 'bridal', name: 'Bridal Services', icon: '👰', color: '#F43F5E', cashback: 30, itemCount: 89 },
  { id: 'wellness', name: 'Wellness', icon: '🧘', color: '#10B981', cashback: 20, itemCount: 145 },
  { id: 'ayurveda', name: 'Ayurveda', icon: '🌿', color: '#22C55E', cashback: 22, itemCount: 98 },
  { id: 'perfume', name: 'Perfumes', icon: '🌸', color: '#A855F7', cashback: 15, itemCount: 234 },
  { id: 'organic', name: 'Organic Beauty', icon: '🍃', color: '#16A34A', cashback: 18, itemCount: 167 },
];

export const beautyTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#GlowUp', itemCount: 56, color: '#F59E0B' },
  { id: 'trend-2', tag: '#SkinCareRoutine', itemCount: 78, color: '#EC4899' },
  { id: 'trend-3', tag: '#BridalGlow', itemCount: 34, color: '#F43F5E' },
  { id: 'trend-4', tag: '#SelfCareSunday', itemCount: 45, color: '#8B5CF6' },
  { id: 'trend-5', tag: '#NaturalBeauty', itemCount: 67, color: '#22C55E' },
  { id: 'trend-6', tag: '#SpaDay', itemCount: 29, color: '#06B6D4' },
];

export const beautyAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Best salons', icon: '💇‍♀️', link: '/beauty?filter=salons' },
  { id: 2, title: 'Under ₹500', icon: '💰', link: '/beauty?filter=budget' },
  { id: 3, title: 'Trending now', icon: '🔥', link: '/beauty?filter=trending' },
  { id: 4, title: 'At home', icon: '🏠', link: '/beauty?filter=home-service' },
];

export const beautyAIFilterChips: AIFilterChip[] = [
  { id: 'service', label: 'Service', icon: '💆' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'location', label: 'Near Me', icon: '📍' },
  { id: 'rating', label: 'Rating', icon: '⭐' },
  { id: 'gender', label: 'For', icon: '👤' },
];

export const beautyAIPlaceholders: string[] = [
  'Best bridal makeup artist near me',
  'Affordable spa packages under ₹2,000',
  'Organic skincare products for sensitive skin',
];

export const beautyUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Aarti S.',
    userAvatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    hashtag: '#GlowUp',
    likes: 456,
    comments: 34,
    coinsEarned: 200,
    isVerified: true,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Divya M.',
    userAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    hashtag: '#SpaDay',
    likes: 234,
    comments: 18,
    coinsEarned: 150,
    isVerified: false,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'Pooja R.',
    userAvatar: 'https://randomuser.me/api/portraits/women/13.jpg',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
    hashtag: '#SkinCare',
    likes: 389,
    comments: 28,
    coinsEarned: 175,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Neha K.',
    userAvatar: 'https://randomuser.me/api/portraits/women/14.jpg',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    hashtag: '#BridalLook',
    likes: 567,
    comments: 45,
    coinsEarned: 250,
    isVerified: true,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Swati P.',
    userAvatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    hashtag: '#NailArt',
    likes: 289,
    comments: 22,
    coinsEarned: 140,
    isVerified: false,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Anjali T.',
    userAvatar: 'https://randomuser.me/api/portraits/women/16.jpg',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400',
    hashtag: '#Wellness',
    likes: 198,
    comments: 15,
    coinsEarned: 120,
    isVerified: false,
  },
];

export const beautyExclusiveOffers: ExclusiveOffer[] = [
  { id: 'bridal', title: 'Bridal Package', icon: '👰', discount: '25% Off', description: 'Complete bridal makeover', color: '#F43F5E' },
  { id: 'first', title: 'First Visit', icon: '🎁', discount: '40% Off', description: 'New customers only', color: '#00C06A' },
  { id: 'membership', title: 'Membership', icon: '⭐', discount: 'Extra 15% Off', description: 'On all services', color: '#F59E0B' },
  { id: 'combo', title: 'Combo Deal', icon: '💎', discount: 'Save ₹500', description: 'Hair + Makeup + Nails', color: '#8B5CF6' },
];

// Bundled Export for Category Page
export const beautyCategoryData = {
  categories: beautyCategories,
  trendingHashtags: beautyTrendingHashtags,
  aiSuggestions: beautyAISuggestions,
  aiFilterChips: beautyAIFilterChips,
  aiPlaceholders: beautyAIPlaceholders,
  ugcData: {
    photos: beautyUGCPosts,
  },
  exclusiveOffers: beautyExclusiveOffers,
};
