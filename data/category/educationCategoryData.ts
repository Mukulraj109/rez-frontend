/**
 * Education & Learning Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const educationCategories: CategoryGridItem[] = [
  { id: 'coaching', name: 'Coaching', icon: '📚', color: '#3B82F6', cashback: 20, itemCount: 345 },
  { id: 'tuition', name: 'Tuition', icon: '✏️', color: '#8B5CF6', cashback: 15, itemCount: 567 },
  { id: 'music', name: 'Music Classes', icon: '🎵', color: '#EC4899', cashback: 18, itemCount: 189 },
  { id: 'dance', name: 'Dance Classes', icon: '💃', color: '#F43F5E', cashback: 18, itemCount: 156 },
  { id: 'art', name: 'Art & Craft', icon: '🎨', color: '#F59E0B', cashback: 15, itemCount: 134 },
  { id: 'language', name: 'Languages', icon: '🌍', color: '#10B981', cashback: 20, itemCount: 234 },
  { id: 'coding', name: 'Coding', icon: '💻', color: '#6366F1', cashback: 25, itemCount: 289 },
  { id: 'sports', name: 'Sports Training', icon: '⚽', color: '#22C55E', cashback: 15, itemCount: 178 },
  { id: 'competitive', name: 'Competitive Exams', icon: '🎯', color: '#EF4444', cashback: 22, itemCount: 345 },
  { id: 'skill', name: 'Skill Development', icon: '🔧', color: '#64748B', cashback: 18, itemCount: 234 },
  { id: 'hobby', name: 'Hobby Classes', icon: '🎭', color: '#D946EF', cashback: 12, itemCount: 145 },
  { id: 'online', name: 'Online Courses', icon: '📱', color: '#06B6D4', cashback: 30, itemCount: 456 },
];

export const educationTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#LearnFromHome', itemCount: 89, color: '#3B82F6' },
  { id: 'trend-2', tag: '#CodingLife', itemCount: 67, color: '#6366F1' },
  { id: 'trend-3', tag: '#MusicLovers', itemCount: 45, color: '#EC4899' },
  { id: 'trend-4', tag: '#ExamPrep', itemCount: 78, color: '#EF4444' },
  { id: 'trend-5', tag: '#SkillUp', itemCount: 56, color: '#F59E0B' },
  { id: 'trend-6', tag: '#DanceClass', itemCount: 34, color: '#F43F5E' },
];

export const educationAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Near me', icon: '📍', link: '/education?filter=nearby' },
  { id: 2, title: 'Online classes', icon: '💻', link: '/education?filter=online' },
  { id: 3, title: 'Best rated', icon: '⭐', link: '/education?filter=rated' },
  { id: 4, title: 'Free trials', icon: '🎁', link: '/education?filter=trial' },
];

export const educationAIFilterChips: AIFilterChip[] = [
  { id: 'subject', label: 'Subject', icon: '📚' },
  { id: 'mode', label: 'Mode', icon: '💻' },
  { id: 'level', label: 'Level', icon: '📊' },
  { id: 'age', label: 'Age Group', icon: '👤' },
  { id: 'price', label: 'Fee', icon: '💰' },
];

export const educationAIPlaceholders: string[] = [
  'Find coding classes for kids near me',
  'Best UPSC coaching in my area',
  'Guitar lessons for beginners',
];

export const educationUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Aryan T.',
    userAvatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400',
    hashtag: '#StudyGram',
    likes: 345,
    comments: 28,
    coinsEarned: 150,
    isVerified: false,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Sanya K.',
    userAvatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    hashtag: '#CodingKids',
    likes: 456,
    comments: 34,
    coinsEarned: 180,
    isVerified: true,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'Music Mom',
    userAvatar: 'https://randomuser.me/api/portraits/women/43.jpg',
    image: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=400',
    hashtag: '#PianoLessons',
    likes: 289,
    comments: 22,
    coinsEarned: 120,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Dance Dad',
    userAvatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    image: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=400',
    hashtag: '#DanceKids',
    likes: 234,
    comments: 18,
    coinsEarned: 100,
    isVerified: false,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Art Teacher',
    userAvatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    hashtag: '#ArtClass',
    likes: 378,
    comments: 29,
    coinsEarned: 160,
    isVerified: true,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Exam Topper',
    userAvatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    hashtag: '#StudyTips',
    likes: 567,
    comments: 45,
    coinsEarned: 220,
    isVerified: false,
  },
];

export const educationExclusiveOffers: ExclusiveOffer[] = [
  { id: 'trial', title: 'Free Trial', icon: '🎁', discount: 'Free', description: 'First class free', color: '#00C06A' },
  { id: 'sibling', title: 'Sibling Discount', icon: '👨‍👩‍👧‍👦', discount: '20% Off', description: 'For 2nd child', color: '#3B82F6' },
  { id: 'annual', title: 'Annual Plan', icon: '📅', discount: '30% Off', description: 'Pay yearly, save more', color: '#8B5CF6' },
  { id: 'referral', title: 'Refer & Earn', icon: '🤝', discount: '₹500 Each', description: 'For you & friend', color: '#F59E0B' },
];

// Bundled Export for Category Page
export const educationCategoryData = {
  categories: educationCategories,
  trendingHashtags: educationTrendingHashtags,
  aiSuggestions: educationAISuggestions,
  aiFilterChips: educationAIFilterChips,
  aiPlaceholders: educationAIPlaceholders,
  ugcData: {
    photos: educationUGCPosts,
  },
  exclusiveOffers: educationExclusiveOffers,
};
