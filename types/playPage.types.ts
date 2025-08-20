// Play Page Types for UGC Video Content
// Based on screenshots analysis and UGCDetailScreen integration

export type CategoryType = 'trending_me' | 'trending_her' | 'waist' | 'article' | 'featured';

export interface CategoryTab {
  id: string;
  title: string;
  emoji: string;
  isActive: boolean;
  type: CategoryType;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  rating?: number;
  cashbackText?: string;
  image: string;
  category?: string;
}

export interface UGCVideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  viewCount: string; // "2.5L" format
  description: string;
  hashtags?: string[];
  productCount?: number;
  category: CategoryType;
  isLiked?: boolean;
  isShared?: boolean;
  products?: Product[];
  // Additional metadata
  author?: string;
  duration?: number; // in seconds
  createdAt?: string;
  likes?: number;
  shares?: number;
}

export interface VideoCardProps {
  item: UGCVideoItem;
  onPress: (item: UGCVideoItem) => void;
  onPlay?: () => void;
  onPause?: () => void;
  autoPlay?: boolean;
  showProductCount?: boolean;
  showHashtags?: boolean;
  size?: 'small' | 'medium' | 'large' | 'featured';
  style?: any;
}

export interface FeaturedVideoCardProps {
  item: UGCVideoItem;
  onPress: (item: UGCVideoItem) => void;
  onLike?: (itemId: string) => void;
  onShare?: (item: UGCVideoItem) => void;
  autoPlay?: boolean;
}

export interface VideoGridProps {
  items: UGCVideoItem[];
  onItemPress: (item: UGCVideoItem) => void;
  columns?: number;
  autoPlay?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

export interface CategoryHeaderProps {
  categories: CategoryTab[];
  onCategoryPress: (category: CategoryTab) => void;
  activeCategory: CategoryType;
}

export interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  style?: any;
}

// State Management Types
export interface PlayPageState {
  // Video data
  featuredVideo?: UGCVideoItem;
  trendingVideos: UGCVideoItem[];
  articleVideos: UGCVideoItem[];
  allVideos: UGCVideoItem[];
  
  // UI state
  activeCategory: CategoryType;
  categories: CategoryTab[];
  loading: boolean;
  refreshing: boolean;
  
  // Video playback state
  playingVideos: Set<string>; // Set of video IDs currently playing
  mutedVideos: Set<string>; // Set of video IDs that are muted
  
  // Pagination
  hasMoreVideos: boolean;
  currentPage: number;
  
  // Error handling
  error?: string;
}

export interface PlayPageActions {
  // Data fetching
  fetchVideos: (category?: CategoryType) => Promise<void>;
  refreshVideos: () => Promise<void>;
  loadMoreVideos: () => Promise<void>;
  
  // Category management
  setActiveCategory: (category: CategoryType) => void;
  
  // Video playback control
  playVideo: (videoId: string) => void;
  pauseVideo: (videoId: string) => void;
  toggleMute: (videoId: string) => void;
  
  // User interactions
  likeVideo: (videoId: string) => Promise<boolean>;
  shareVideo: (video: UGCVideoItem) => Promise<void>;
  
  // Navigation
  navigateToDetail: (video: UGCVideoItem) => void;
  
  // Error handling
  clearError: () => void;
}

// Navigation Types
export interface PlayScreenNavigationParams {
  category?: CategoryType;
  videoId?: string;
}

export interface UGCDetailNavigationParams {
  item: UGCVideoItem;
  fromPlayScreen?: boolean;
}

// API Response Types
export interface PlayPageApiResponse {
  featured?: UGCVideoItem;
  trending: UGCVideoItem[];
  articles: UGCVideoItem[];
  hasMore: boolean;
  nextPage?: number;
}

export interface VideoInteractionResponse {
  success: boolean;
  newCount?: number;
  message?: string;
}

// Hook Types
export interface UsePlayPageData {
  state: PlayPageState;
  actions: PlayPageActions;
}

export interface UseVideoPlayback {
  playingVideos: Set<string>;
  playVideo: (videoId: string) => void;
  pauseVideo: (videoId: string) => void;
  pauseAllVideos: () => void;
  isVideoPlaying: (videoId: string) => boolean;
}

// Constants
export const CATEGORY_TYPES: Record<CategoryType, string> = {
  trending_me: 'Trends for me',
  trending_her: 'Trends for her',
  waist: 'Waist pe',
  article: 'Article',
  featured: 'Featured'
};

export const CATEGORY_EMOJIS: Record<CategoryType, string> = {
  trending_me: '👑',
  trending_her: '👸',
  waist: '⚡',
  article: '📖',
  featured: '🌟'
};

// Video Card Size Configurations - More spacious and modern
export const VIDEO_CARD_SIZES = {
  small: {
    height: 200,
    width: '48%',
    fontSize: 13,
    padding: 16,
  },
  medium: {
    height: 280,
    width: '48%',
    fontSize: 14,
    padding: 20,
  },
  large: {
    height: 320,
    width: '100%',
    fontSize: 15,
    padding: 24,
  },
  featured: {
    height: 420,
    width: '100%',
    fontSize: 17,
    padding: 28,
  }
};

// Modern Color scheme for Play Page
export const PLAY_PAGE_COLORS = {
  primary: '#6366F1', // Modern indigo
  secondary: '#8B5CF6', // Purple accent
  background: '#FAFAFA', // Softer background
  cardBackground: '#FFFFFF',
  text: '#1F2937', // Darker, more readable text
  textSecondary: '#6B7280', // Modern gray
  textTertiary: '#9CA3AF', // Light gray
  textOverlay: '#FFFFFF',
  shadow: '#000000',
  like: '#F59E0B', // Warmer like color
  share: '#10B981', // Modern green
  overlay: 'rgba(0, 0, 0, 0.2)',
  border: '#E5E7EB',
  accent: '#F3F4F6',
  gradient: {
    header: ['#6366F1', '#8B5CF6', '#A855F7'], // 3-color gradient
    videoOverlay: ['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)'],
    cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)'],
    subtle: ['#F8FAFC', '#F1F5F9']
  }
};