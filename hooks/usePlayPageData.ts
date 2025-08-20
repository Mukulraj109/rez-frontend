// Custom hook for Play Page state management
import { useState, useCallback, useEffect } from 'react';
import { Alert, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  PlayPageState, 
  PlayPageActions, 
  UsePlayPageData,
  CategoryType,
  UGCVideoItem,
  CategoryTab
} from '@/types/playPage.types';
import { 
  fetchPlayPageData, 
  likeVideo, 
  shareVideo,
  categoryTabs as defaultCategoryTabs,
  featuredVideo 
} from '@/data/playPageData';

const initialState: PlayPageState = {
  featuredVideo: undefined,
  trendingVideos: [],
  articleVideos: [],
  allVideos: [],
  activeCategory: 'trending_me',
  categories: defaultCategoryTabs,
  loading: false,
  refreshing: false,
  playingVideos: new Set(),
  mutedVideos: new Set(),
  hasMoreVideos: true,
  currentPage: 1,
  error: undefined
};

export function usePlayPageData(): UsePlayPageData {
  const [state, setState] = useState<PlayPageState>(initialState);
  const router = useRouter();

  // Data fetching
  const fetchVideos = useCallback(async (category?: CategoryType) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      const response = await fetchPlayPageData(category);
      
      setState(prev => ({
        ...prev,
        featuredVideo: response.featured || prev.featuredVideo,
        allVideos: category ? response.videos : [...prev.allVideos, ...response.videos],
        trendingVideos: category === 'trending_me' ? response.videos : prev.trendingVideos,
        articleVideos: category === 'article' ? response.videos : prev.articleVideos,
        hasMoreVideos: response.hasMore,
        loading: false
      }));
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load videos. Please try again.' 
      }));
      console.error('Failed to fetch videos:', error);
    }
  }, []);

  const refreshVideos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: undefined }));
      
      const response = await fetchPlayPageData();
      
      setState(prev => ({
        ...prev,
        featuredVideo: response.featured || featuredVideo,
        allVideos: response.videos,
        trendingVideos: response.videos.filter(v => v.category === 'trending_me'),
        articleVideos: response.videos.filter(v => v.category === 'article'),
        hasMoreVideos: response.hasMore,
        refreshing: false,
        currentPage: 1
      }));
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        refreshing: false, 
        error: 'Failed to refresh videos. Please try again.' 
      }));
      console.error('Failed to refresh videos:', error);
    }
  }, []);

  const loadMoreVideos = useCallback(async () => {
    if (!state.hasMoreVideos || state.loading) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await fetchPlayPageData(state.activeCategory);
      
      setState(prev => ({
        ...prev,
        allVideos: [...prev.allVideos, ...response.videos],
        hasMoreVideos: response.hasMore,
        currentPage: prev.currentPage + 1,
        loading: false
      }));
      
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Failed to load more videos:', error);
    }
  }, [state.hasMoreVideos, state.loading, state.activeCategory]);

  // Category management
  const setActiveCategory = useCallback((category: CategoryType) => {
    setState(prev => ({
      ...prev,
      activeCategory: category,
      categories: prev.categories.map(cat => ({
        ...cat,
        isActive: cat.type === category
      }))
    }));
    
    // Fetch videos for the new category
    fetchVideos(category);
  }, [fetchVideos]);

  // Video playback control
  const playVideo = useCallback((videoId: string) => {
    setState(prev => ({
      ...prev,
      playingVideos: new Set([...prev.playingVideos, videoId])
    }));
  }, []);

  const pauseVideo = useCallback((videoId: string) => {
    setState(prev => {
      const newPlayingVideos = new Set(prev.playingVideos);
      newPlayingVideos.delete(videoId);
      return {
        ...prev,
        playingVideos: newPlayingVideos
      };
    });
  }, []);

  const toggleMute = useCallback((videoId: string) => {
    setState(prev => {
      const newMutedVideos = new Set(prev.mutedVideos);
      if (newMutedVideos.has(videoId)) {
        newMutedVideos.delete(videoId);
      } else {
        newMutedVideos.add(videoId);
      }
      return {
        ...prev,
        mutedVideos: newMutedVideos
      };
    });
  }, []);

  // User interactions
  const likeVideoAction = useCallback(async (videoId: string): Promise<boolean> => {
    try {
      const response = await likeVideo(videoId);
      
      if (response.success) {
        // Update video like status in state
        setState(prev => ({
          ...prev,
          allVideos: prev.allVideos.map(video => 
            video.id === videoId 
              ? { ...video, isLiked: !video.isLiked, likes: response.newCount }
              : video
          ),
          featuredVideo: prev.featuredVideo?.id === videoId 
            ? { ...prev.featuredVideo, isLiked: !prev.featuredVideo.isLiked, likes: response.newCount }
            : prev.featuredVideo
        }));
      }
      
      return response.success;
    } catch (error) {
      console.error('Failed to like video:', error);
      return false;
    }
  }, []);

  const shareVideoAction = useCallback(async (video: UGCVideoItem) => {
    try {
      const response = await shareVideo(video);
      
      if (response.success) {
        await Share.share({
          message: `Check out this amazing fashion video: ${video.description}`,
          url: response.shareUrl,
        });
        
        // Update share count
        setState(prev => ({
          ...prev,
          allVideos: prev.allVideos.map(v => 
            v.id === video.id 
              ? { ...v, isShared: true, shares: (v.shares || 0) + 1 }
              : v
          )
        }));
      }
    } catch (error) {
      console.error('Failed to share video:', error);
      Alert.alert('Share Failed', 'Unable to share video. Please try again.');
    }
  }, []);

  // Navigation
  const navigateToDetail = useCallback((video: UGCVideoItem) => {
    // Pause all currently playing videos before navigation
    setState(prev => ({ ...prev, playingVideos: new Set() }));
    
    // Navigate to UGCDetailScreen with video data
    router.push({
      pathname: '/UGCDetailScreen',
      params: { item: JSON.stringify(video) }
    });
  }, [router]);

  // Error handling
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  // Initialize data on mount
  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  // iOS-specific video management
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // On iOS, we need to be more aggressive about video management
      // Pause videos when too many are playing to prevent memory issues
      if (state.playingVideos.size > 3) {
        const videosArray = Array.from(state.playingVideos);
        const videosToKeep = videosArray.slice(-2); // Keep only last 2 videos playing
        const videosToPause = videosArray.slice(0, -2);
        
        videosToPause.forEach(videoId => {
          pauseVideo(videoId);
        });
      }
    }
  }, [state.playingVideos]);

  const actions: PlayPageActions = {
    fetchVideos,
    refreshVideos,
    loadMoreVideos,
    setActiveCategory,
    playVideo,
    pauseVideo,
    toggleMute,
    likeVideo: likeVideoAction,
    shareVideo: shareVideoAction,
    navigateToDetail,
    clearError
  };

  return { state, actions };
}