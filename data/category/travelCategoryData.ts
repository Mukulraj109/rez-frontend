/**
 * Travel Category Data
 */

import {
  CategoryGridItem,
  TrendingHashtag,
  AISuggestion,
  AIFilterChip,
  UGCPost,
  ExclusiveOffer,
} from '@/types/categoryTypes';

export const travelCategories: CategoryGridItem[] = [
  { id: 'flights', name: 'Flights', icon: '✈️', color: '#3B82F6', cashback: 10, itemCount: 567 },
  { id: 'hotels', name: 'Hotels', icon: '🏨', color: '#8B5CF6', cashback: 15, itemCount: 890 },
  { id: 'trains', name: 'Trains', icon: '🚆', color: '#F59E0B', cashback: 8, itemCount: 345 },
  { id: 'buses', name: 'Buses', icon: '🚌', color: '#22C55E', cashback: 12, itemCount: 234 },
  { id: 'cabs', name: 'Cabs & Rentals', icon: '🚗', color: '#EF4444', cashback: 10, itemCount: 456 },
  { id: 'packages', name: 'Holiday Packages', icon: '🏖️', color: '#EC4899', cashback: 20, itemCount: 189 },
  { id: 'homestays', name: 'Homestays', icon: '🏡', color: '#10B981', cashback: 18, itemCount: 234 },
  { id: 'adventure', name: 'Adventure', icon: '🏔️', color: '#6366F1', cashback: 15, itemCount: 156 },
  { id: 'cruise', name: 'Cruises', icon: '🚢', color: '#06B6D4', cashback: 22, itemCount: 45 },
  { id: 'visa', name: 'Visa Services', icon: '📋', color: '#64748B', cashback: 10, itemCount: 78 },
  { id: 'insurance', name: 'Travel Insurance', icon: '🛡️', color: '#D946EF', cashback: 15, itemCount: 123 },
  { id: 'forex', name: 'Forex', icon: '💱', color: '#F43F5E', cashback: 8, itemCount: 67 },
];

export const travelTrendingHashtags: TrendingHashtag[] = [
  { id: 'trend-1', tag: '#Wanderlust', itemCount: 156, color: '#3B82F6' },
  { id: 'trend-2', tag: '#BeachVibes', itemCount: 89, color: '#06B6D4' },
  { id: 'trend-3', tag: '#MountainLife', itemCount: 78, color: '#6366F1' },
  { id: 'trend-4', tag: '#WeekendGetaway', itemCount: 67, color: '#EC4899' },
  { id: 'trend-5', tag: '#RoadTrip', itemCount: 45, color: '#22C55E' },
  { id: 'trend-6', tag: '#SoloTravel', itemCount: 56, color: '#F59E0B' },
];

export const travelAISuggestions: AISuggestion[] = [
  { id: 1, title: 'Cheap flights', icon: '✈️', link: '/travel?filter=flights' },
  { id: 2, title: 'Weekend trips', icon: '🏖️', link: '/travel?filter=weekend' },
  { id: 3, title: 'Best hotels', icon: '🏨', link: '/travel?filter=hotels' },
  { id: 4, title: 'Adventure', icon: '🏔️', link: '/travel?filter=adventure' },
];

export const travelAIFilterChips: AIFilterChip[] = [
  { id: 'destination', label: 'Destination', icon: '📍' },
  { id: 'dates', label: 'Dates', icon: '📅' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'type', label: 'Trip Type', icon: '🎒' },
  { id: 'travelers', label: 'Travelers', icon: '👥' },
];

export const travelAIPlaceholders: string[] = [
  'Plan a Goa trip for 4 people under ₹50,000',
  'Cheapest flights to Mumbai this weekend',
  'Best honeymoon packages in Kerala',
];

export const travelUGCPosts: UGCPost[] = [
  {
    id: 'ugc-1',
    userId: 'user-1',
    userName: 'Travel Bug',
    userAvatar: 'https://randomuser.me/api/portraits/women/71.jpg',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    hashtag: '#BeachLife',
    likes: 567,
    comments: 45,
    coinsEarned: 220,
    isVerified: true,
  },
  {
    id: 'ugc-2',
    userId: 'user-2',
    userName: 'Mountain Man',
    userAvatar: 'https://randomuser.me/api/portraits/men/72.jpg',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    hashtag: '#Mountains',
    likes: 456,
    comments: 34,
    coinsEarned: 180,
    isVerified: false,
  },
  {
    id: 'ugc-3',
    userId: 'user-3',
    userName: 'City Explorer',
    userAvatar: 'https://randomuser.me/api/portraits/women/73.jpg',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
    hashtag: '#CityBreak',
    likes: 389,
    comments: 28,
    coinsEarned: 150,
    isVerified: false,
  },
  {
    id: 'ugc-4',
    userId: 'user-4',
    userName: 'Adventure Seeker',
    userAvatar: 'https://randomuser.me/api/portraits/men/74.jpg',
    image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400',
    hashtag: '#Adventure',
    likes: 678,
    comments: 56,
    coinsEarned: 280,
    isVerified: true,
  },
  {
    id: 'ugc-5',
    userId: 'user-5',
    userName: 'Solo Traveler',
    userAvatar: 'https://randomuser.me/api/portraits/women/75.jpg',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400',
    hashtag: '#SoloTrip',
    likes: 345,
    comments: 26,
    coinsEarned: 140,
    isVerified: false,
  },
  {
    id: 'ugc-6',
    userId: 'user-6',
    userName: 'Road Tripper',
    userAvatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
    hashtag: '#RoadTrip',
    likes: 234,
    comments: 18,
    coinsEarned: 100,
    isVerified: false,
  },
];

export const travelExclusiveOffers: ExclusiveOffer[] = [
  { id: 'first', title: 'First Booking', icon: '🎁', discount: '₹1000 Off', description: 'On flights & hotels', color: '#00C06A' },
  { id: 'weekend', title: 'Weekend Special', icon: '🏖️', discount: '25% Off', description: 'On packages', color: '#EC4899' },
  { id: 'group', title: 'Group Discount', icon: '👥', discount: '30% Off', description: '4+ travelers', color: '#8B5CF6' },
  { id: 'student', title: 'Student Travel', icon: '🎓', discount: '15% Off', description: 'Valid ID required', color: '#3B82F6' },
];

// Bundled Export for Category Page
export const travelCategoryData = {
  categories: travelCategories,
  trendingHashtags: travelTrendingHashtags,
  aiSuggestions: travelAISuggestions,
  aiFilterChips: travelAIFilterChips,
  aiPlaceholders: travelAIPlaceholders,
  ugcData: {
    photos: travelUGCPosts,
  },
  exclusiveOffers: travelExclusiveOffers,
};
