/**
 * Fitness & Sports Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const fitnessCategories: CategoryGridItem[] = [
  { id: 'gym', name: 'Gym', icon: '🏋️', color: '#EF4444', cashback: 20, itemCount: 345 },
  { id: 'yoga', name: 'Yoga', icon: '🧘', color: '#8B5CF6', cashback: 18, itemCount: 234 },
  { id: 'zumba', name: 'Zumba', icon: '💃', color: '#EC4899', cashback: 15, itemCount: 156 },
  { id: 'crossfit', name: 'CrossFit', icon: '💪', color: '#F59E0B', cashback: 22, itemCount: 89 },
  { id: 'swimming', name: 'Swimming', icon: '🏊', color: '#3B82F6', cashback: 18, itemCount: 78 },
  { id: 'martial-arts', name: 'Martial Arts', icon: '🥋', color: '#64748B', cashback: 20, itemCount: 67 },
  { id: 'sports', name: 'Sports Academy', icon: '⚽', color: '#22C55E', cashback: 15, itemCount: 145 },
  { id: 'personal', name: 'Personal Training', icon: '👨‍🏫', color: '#6366F1', cashback: 25, itemCount: 189 },
  { id: 'pilates', name: 'Pilates', icon: '🤸', color: '#D946EF', cashback: 18, itemCount: 56 },
  { id: 'cycling', name: 'Cycling', icon: '🚴', color: '#06B6D4', cashback: 15, itemCount: 34 },
  { id: 'boxing', name: 'Boxing', icon: '🥊', color: '#F43F5E', cashback: 20, itemCount: 45 },
  { id: 'dance', name: 'Dance Fitness', icon: '🩰', color: '#A855F7', cashback: 15, itemCount: 123 },
];

export const fitnessTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#FitnessGoals', itemCount: 89, color: '#EF4444' },
  { id: 'trend-2', tag: '#YogaLife', itemCount: 67, color: '#8B5CF6' },
  { id: 'trend-3', tag: '#GymMotivation', itemCount: 78, color: '#F59E0B' },
  { id: 'trend-4', tag: '#TransformationTuesday', itemCount: 56, color: '#22C55E' },
  { id: 'trend-5', tag: '#SwimLife', itemCount: 34, color: '#3B82F6' },
  { id: 'trend-6', tag: '#ZumbaLove', itemCount: 45, color: '#EC4899' },
];

export const fitnessAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Gyms near me', icon: '🏋️', link: '/fitness?filter=gym' },
  { id: 2, title: 'Free trials', icon: '🎁', link: '/fitness?filter=trial' },
  { id: 3, title: 'Best rated', icon: '⭐', link: '/fitness?filter=rated' },
  { id: 4, title: 'Home workouts', icon: '🏠', link: '/fitness?filter=home' },
];

export const fitnessAIFilterChips: AIFilterChip[] = [
  { id: 'type', label: 'Workout Type', icon: '🏋️' },
  { id: 'location', label: 'Near Me', icon: '📍' },
  { id: 'timing', label: 'Timing', icon: '⏰' },
  { id: 'price', label: 'Price', icon: '💰' },
  { id: 'amenities', label: 'Amenities', icon: '🚿' },
];

export const fitnessAIPlaceholders: string[] = [
  'Find gyms with swimming pool near me',
  'Yoga classes for beginners in morning',
  'Best CrossFit gym under ₹3,000/month',
];

export const fitnessUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Fitness Freak',
    userAvatar: 'https://randomuser.me/api/portraits/men/51.jpg',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    hashtag: '#GymLife',
    likes: 567,
    comments: 45,
    coinsEarned: 220,
    isVerified: true,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Yoga Girl',
    userAvatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400',
    hashtag: '#YogaEveryday',
    likes: 456,
    comments: 34,
    coinsEarned: 180,
    isVerified: false,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'CrossFit King',
    userAvatar: 'https://randomuser.me/api/portraits/men/53.jpg',
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400',
    hashtag: '#CrossFitLife',
    likes: 389,
    comments: 28,
    coinsEarned: 150,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Swim Queen',
    userAvatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
    hashtag: '#SwimLife',
    likes: 234,
    comments: 18,
    coinsEarned: 100,
    isVerified: true,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Zumba Diva',
    userAvatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    hashtag: '#ZumbaParty',
    likes: 345,
    comments: 26,
    coinsEarned: 140,
    isVerified: false,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Boxing Bro',
    userAvatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400',
    hashtag: '#BoxingFit',
    likes: 278,
    comments: 22,
    coinsEarned: 120,
    isVerified: false,
  },
];

export const fitnessExclusiveOffers: ExclusiveOffer[] = [
  { id: 'trial', title: 'Free Week', icon: '🎁', discount: 'Free', description: '7-day free trial', color: '#00C06A' },
  { id: 'couple', title: 'Couple Plan', icon: '💑', discount: '40% Off', description: 'For 2nd member', color: '#EC4899' },
  { id: 'annual', title: 'Annual Plan', icon: '📅', discount: '50% Off', description: 'Best value deal', color: '#8B5CF6' },
  { id: 'student', title: 'Student Offer', icon: '🎓', discount: '25% Off', description: 'Valid ID required', color: '#3B82F6' },
];

// Bundled Export for Category Page
export const fitnessCategoryData = {
  categories: fitnessCategories,
  trendingHashtags: fitnessTrendingHashtags,
  aiSuggestions: fitnessAISuggestions,
  aiFilterChips: fitnessAIFilterChips,
  aiPlaceholders: fitnessAIPlaceholders,
  ugcData: {
    photos: fitnessUGCPosts,
  },
  exclusiveOffers: fitnessExclusiveOffers,
};
