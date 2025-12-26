/**
 * Healthcare Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const healthcareCategories: CategoryGridItem[] = [
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', color: '#EF4444', cashback: 15, itemCount: 567 },
  { id: 'doctors', name: 'Doctors', icon: '👨‍⚕️', color: '#3B82F6', cashback: 10, itemCount: 345 },
  { id: 'diagnostics', name: 'Lab Tests', icon: '🔬', color: '#8B5CF6', cashback: 20, itemCount: 189 },
  { id: 'dental', name: 'Dental Care', icon: '🦷', color: '#06B6D4', cashback: 18, itemCount: 145 },
  { id: 'eye-care', name: 'Eye Care', icon: '👁️', color: '#10B981', cashback: 15, itemCount: 98 },
  { id: 'physiotherapy', name: 'Physiotherapy', icon: '🏃', color: '#F59E0B', cashback: 22, itemCount: 78 },
  { id: 'mental-health', name: 'Mental Health', icon: '🧠', color: '#EC4899', cashback: 25, itemCount: 56 },
  { id: 'ayurveda', name: 'Ayurveda', icon: '🌿', color: '#22C55E', cashback: 18, itemCount: 234 },
  { id: 'homeopathy', name: 'Homeopathy', icon: '🧪', color: '#6366F1', cashback: 15, itemCount: 123 },
  { id: 'veterinary', name: 'Pet Health', icon: '🐾', color: '#D946EF', cashback: 12, itemCount: 67 },
  { id: 'equipment', name: 'Medical Devices', icon: '🩺', color: '#64748B', cashback: 10, itemCount: 289 },
  { id: 'wellness', name: 'Health Checkup', icon: '💉', color: '#F43F5E', cashback: 25, itemCount: 45 },
];

export const healthcareTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#HealthFirst', itemCount: 78, color: '#EF4444' },
  { id: 'trend-2', tag: '#MentalWellness', itemCount: 56, color: '#EC4899' },
  { id: 'trend-3', tag: '#LabTests', itemCount: 34, color: '#8B5CF6' },
  { id: 'trend-4', tag: '#AyurvedaLife', itemCount: 45, color: '#22C55E' },
  { id: 'trend-5', tag: '#DentalCare', itemCount: 23, color: '#06B6D4' },
  { id: 'trend-6', tag: '#FitnessHealth', itemCount: 67, color: '#F59E0B' },
];

export const healthcareAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Find doctors', icon: '👨‍⚕️', link: '/healthcare?filter=doctors' },
  { id: 2, title: 'Lab tests', icon: '🔬', link: '/healthcare?filter=tests' },
  { id: 3, title: 'Medicine delivery', icon: '💊', link: '/healthcare?filter=pharmacy' },
  { id: 4, title: 'Health checkup', icon: '🩺', link: '/healthcare?filter=checkup' },
];

export const healthcareAIFilterChips: AIFilterChip[] = [
  { id: 'specialty', label: 'Specialty', icon: '👨‍⚕️' },
  { id: 'location', label: 'Near Me', icon: '📍' },
  { id: 'availability', label: 'Available', icon: '📅' },
  { id: 'insurance', label: 'Insurance', icon: '🏥' },
  { id: 'rating', label: 'Rating', icon: '⭐' },
];

export const healthcareAIPlaceholders: string[] = [
  'Find cardiologist near me',
  'Book full body checkup under ₹2,000',
  'Order diabetes medicines with delivery',
];

export const healthcareUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Dr. Sharma',
    userAvatar: 'https://randomuser.me/api/portraits/men/31.jpg',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    hashtag: '#HealthTips',
    likes: 567,
    comments: 45,
    coinsEarned: 250,
    isVerified: true,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Amit K.',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
    hashtag: '#FitnessJourney',
    likes: 345,
    comments: 28,
    coinsEarned: 150,
    isVerified: false,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'Prerna S.',
    userAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400',
    hashtag: '#WellnessWednesday',
    likes: 234,
    comments: 18,
    coinsEarned: 120,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Yoga Guru',
    userAvatar: 'https://randomuser.me/api/portraits/women/34.jpg',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    hashtag: '#YogaLife',
    likes: 456,
    comments: 34,
    coinsEarned: 180,
    isVerified: true,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Rahul M.',
    userAvatar: 'https://randomuser.me/api/portraits/men/35.jpg',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    hashtag: '#HealthGoals',
    likes: 189,
    comments: 15,
    coinsEarned: 100,
    isVerified: false,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Dr. Priya',
    userAvatar: 'https://randomuser.me/api/portraits/women/36.jpg',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
    hashtag: '#DoctorAdvice',
    likes: 678,
    comments: 56,
    coinsEarned: 280,
    isVerified: true,
  },
];

export const healthcareExclusiveOffers: ExclusiveOffer[] = [
  { id: 'checkup', title: 'Full Body Checkup', icon: '🩺', discount: '50% Off', description: '60+ tests included', color: '#EF4444' },
  { id: 'consult', title: 'Free Consultation', icon: '👨‍⚕️', discount: 'Free', description: 'First online consult', color: '#3B82F6' },
  { id: 'medicine', title: 'Medicine Delivery', icon: '💊', discount: '20% Off', description: 'On first order', color: '#00C06A' },
  { id: 'dental', title: 'Dental Checkup', icon: '🦷', discount: '30% Off', description: 'Cleaning + Checkup', color: '#06B6D4' },
];

// Bundled Export for Category Page
export const healthcareCategoryData = {
  categories: healthcareCategories,
  trendingHashtags: healthcareTrendingHashtags,
  aiSuggestions: healthcareAISuggestions,
  aiFilterChips: healthcareAIFilterChips,
  aiPlaceholders: healthcareAIPlaceholders,
  ugcData: {
    photos: healthcareUGCPosts,
  },
  exclusiveOffers: healthcareExclusiveOffers,
};
