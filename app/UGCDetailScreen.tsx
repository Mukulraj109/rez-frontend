// UGCDetailScreen.tsx - Modern TikTok/Reels Style Video Player
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Text,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { showAlert } from '@/utils/alert';
import ReportModal from '@/components/ugc/ReportModal';
import { ReportReason } from '@/types/report.types';
import { realVideosApi, Video as VideoType } from '@/services/realVideosApi';
import wishlistApi from '@/services/wishlistApi';
import useProductInteraction from '@/hooks/useProductInteraction';
import { shouldCountView, recordView } from '@/utils/viewTracker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fallback video URL
const FALLBACK_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function UGCDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video | null>(null);

  // Animation refs
  const likeScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const playPauseOpacity = useRef(new Animated.Value(0)).current;

  // View tracking ref - prevents counting same video multiple times in a session
  const viewTrackedRef = useRef<Set<string>>(new Set());

  // State
  const [ready, setReady] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Video aspect ratio detection - determines resize mode
  const [videoAspectRatio, setVideoAspectRatio] = useState<'vertical' | 'horizontal' | 'square'>('vertical');

  // Track if styles have been applied (for smooth transition)
  const [stylesApplied, setStylesApplied] = useState(false);

  // Social features state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  // Report state
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isReported, setIsReported] = useState(false);

  // Contexts
  const { state: authState } = useAuth();
  const { state: cartState } = useCart();

  // Product interaction
  const { addToCart, navigateToProduct } = useProductInteraction({
    onSuccess: () => {},
    onError: () => {},
  });

  // Parse params and fetch video
  useEffect(() => {
    if (params.item && typeof params.item === 'string') {
      try {
        const parsedItem = JSON.parse(params.item);
        setVideo(parsedItem as any);
        setLoading(false);
      } catch (err) {
        console.error('Failed to parse item param:', err);
      }
    }
  }, []);

  // Fetch video from API
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const videoId = params.id as string;
        const response = await realVideosApi.getVideoById(videoId);

        let videoData = null;
        if (response && response.success !== false) {
          if (response.data?.video) videoData = response.data.video;
          else if (response.video) videoData = response.video;
          else if (response.data?._id || response.data?.id) videoData = response.data;
          else if (response._id || response.id) videoData = response;
        }

        const extractedVideoId = videoData?._id || videoData?.id;
        if (videoData && extractedVideoId) {
          const normalizedVideo = {
            ...videoData,
            _id: extractedVideoId,
            products: videoData.products || videoData.relatedProducts || [],
          };
          setVideo(normalizedVideo);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && !video) {
      fetchVideo();
    }
  }, [params.id]);

  // Get the store ID to use for follow - prioritize store over creator
  const getFollowableStoreId = useCallback(() => {
    if (!video) return null;
    // Priority: video.store > video.storeId > creator.storeId > creator.store > creator.id
    return video.store?.id || video.store?._id ||
           (video as any).storeId ||
           video.creator?.storeId || (video.creator as any)?.store?.id || (video.creator as any)?.store?._id ||
           video.creator?.id || video.creator?._id;
  }, [video]);

  // Initialize engagement data
  useEffect(() => {
    if (video) {
      const likes = video.metrics?.likes || video.engagement?.likes;
      setLikesCount(Array.isArray(likes) ? likes.length : (Number(likes) || 0));
      setViewsCount(video.metrics?.views || video.engagement?.views || 0);
      setIsLiked(video.engagement?.liked || false);
      setIsBookmarked(video.engagement?.bookmarked || false);

      // Check follow status for the store (using wishlistApi)
      const storeIdToCheck = getFollowableStoreId();
      if (storeIdToCheck && authState.isAuthenticated) {
        wishlistApi.checkWishlistStatus('store', storeIdToCheck)
          .then(response => {
            if (response.success && response.data) {
              setIsFollowing(response.data.inWishlist || false);
            }
          })
          .catch(() => {
            // Silently fail - keep default state
          });
      }
    }
  }, [video, authState.isAuthenticated, getFollowableStoreId]);

  // Focus handling
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      StatusBar.setHidden(true);

      // Re-check follow status when screen comes into focus (might have changed in another screen)
      const storeIdToCheck = getFollowableStoreId();
      if (storeIdToCheck && authState.isAuthenticated) {
        wishlistApi.checkWishlistStatus('store', storeIdToCheck)
          .then(response => {
            if (response.success && response.data) {
              setIsFollowing(response.data.inWishlist || false);
            }
          })
          .catch(() => {});
      }

      return () => {
        setIsFocused(false);
        StatusBar.setHidden(false);
      };
    }, [getFollowableStoreId, authState.isAuthenticated])
  );

  // Playback control - only pause when screen loses focus
  useEffect(() => {
    const updatePlayback = async () => {
      if (videoRef.current && ready) {
        try {
          if (!isFocused) {
            // Only pause when navigating away from screen
            await videoRef.current.pauseAsync();
          } else if (isFocused && !isPlaying) {
            // Resume only if user hasn't manually paused
          }
        } catch (err) {
        }
      }
    };
    updatePlayback();
  }, [isFocused, ready]);

  // Force play when video loads
  useEffect(() => {
    const startPlayback = async () => {
      if (videoRef.current && ready && video?.videoUrl) {
        try {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        } catch (err) {
        }
      }
    };
    startPlayback();
  }, [ready, video?.videoUrl]);

  // Track if we've already detected the aspect ratio
  const aspectRatioDetected = useRef(false);

  // Web fallback: Try to get video dimensions from the DOM element
  useEffect(() => {
    if (Platform.OS === 'web' && ready && !aspectRatioDetected.current) {
      // Try immediately and then again after a short delay
      const detectDimensions = () => {
        try {
          const videoElements = document.querySelectorAll('video');
          for (const videoEl of videoElements) {
            if (videoEl.videoWidth && videoEl.videoHeight && videoEl.videoWidth > 0) {
              aspectRatioDetected.current = true;
              if (videoEl.videoWidth > videoEl.videoHeight) {
                setVideoAspectRatio('horizontal');
              } else if (videoEl.videoHeight > videoEl.videoWidth) {
                setVideoAspectRatio('vertical');
              }
              return true;
            }
          }
          return false;
        } catch (e) {
          return false;
        }
      };

      // Try immediately and then quickly retry
      if (!detectDimensions()) {
        // If not found, try again with faster intervals
        const timer1 = setTimeout(detectDimensions, 30);
        const timer2 = setTimeout(detectDimensions, 80);
        const timer3 = setTimeout(detectDimensions, 150);
        const timer4 = setTimeout(detectDimensions, 300);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      }
    }
  }, [ready]);

  // Web: Apply object-fit style directly to video elements for horizontal videos
  useEffect(() => {
    if (Platform.OS === 'web' && videoAspectRatio === 'horizontal') {
      let intervalId: NodeJS.Timeout;
      let attempts = 0;
      const maxAttempts = 50;

      const applyContainStyle = () => {
        try {
          const videoElements = document.querySelectorAll('video');
          attempts++;

          // For horizontal videos: background (index 0) = cover, main (index 1) = contain
          if (videoElements.length >= 2) {
            videoElements.forEach((videoEl, index) => {
              if (index === 0) {
                // Background video - should be cover (blurred) and fill entire screen
                videoEl.style.setProperty('object-fit', 'cover', 'important');
                videoEl.style.setProperty('width', '150%', 'important');
                videoEl.style.setProperty('height', '150%', 'important');
                videoEl.style.setProperty('transform', 'scale(1.5)', 'important');
                videoEl.style.setProperty('filter', 'blur(15px)', 'important');
                videoEl.style.setProperty('top', '-25%', 'important');
                videoEl.style.setProperty('left', '-25%', 'important');
                videoEl.style.setProperty('position', 'absolute', 'important');
              } else {
                // Main video - should be contain (full video visible)
                videoEl.style.setProperty('object-fit', 'contain', 'important');
                videoEl.style.setProperty('width', '100%', 'important');
                videoEl.style.setProperty('height', '100%', 'important');
                videoEl.style.setProperty('filter', 'none', 'important');
              }
            });
            // Found and styled both videos, stop checking
            if (intervalId) clearInterval(intervalId);
            setStylesApplied(true);
          } else if (videoElements.length === 1) {
            // Only main video, apply contain
            videoElements[0].style.setProperty('object-fit', 'contain', 'important');
          }

          // Stop after max attempts
          if (attempts >= maxAttempts && intervalId) {
            clearInterval(intervalId);
          }
        } catch (e) {
          // Silently handle errors
        }
      };

      // Apply immediately and keep checking with interval
      applyContainStyle();
      intervalId = setInterval(applyContainStyle, 100);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [videoAspectRatio, ready]);

  // Transform products
  const products = useMemo(() => {
    if (!video?.products) return [];
    return video.products.map(product => {
      const price = product.pricing?.selling || product.pricing?.basePrice || product.price || 0;
      const image = product.thumbnail || product.image || product.images?.[0] || '';
      return {
        ...product,
        id: product.id || product._id,
        _id: product._id || product.id,
        name: product.name || product.title || 'Product',
        title: product.title || product.name || 'Product',
        image,
        price: typeof price === 'number' ? price : 0,
      };
    });
  }, [video]);

  // Double tap to like animation
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      handleLike();
    }
    // Show heart animation
    Animated.sequence([
      Animated.timing(heartOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(heartOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [isLiked]);

  // Video press - toggle play/pause
  const lastTap = useRef<number>(0);
  const handleVideoPress = useCallback(async () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleDoubleTap();
    } else {
      // Actually toggle video playback
      if (videoRef.current) {
        try {
          if (isPlaying) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await videoRef.current.playAsync();
            setIsPlaying(true);
          }
        } catch (err) {
          // Silently handle toggle errors
        }
      }
      // Show play/pause indicator
      Animated.sequence([
        Animated.timing(playPauseOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(playPauseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
    lastTap.current = now;
  }, [handleDoubleTap, isPlaying]);

  // Track if we're currently restarting to prevent multiple restarts
  const isRestartingRef = useRef(false);

  // Playback status - handles looping like Reels/TikTok
  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const prog = (status.positionMillis / (status.durationMillis || 1)) * 100;
    setProgress(prog);
    setCurrentTime(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    // Auto-loop: Check if video reached the end (position-based for web compatibility)
    const isAtEnd = status.durationMillis &&
                    status.durationMillis > 0 &&
                    status.positionMillis >= status.durationMillis - 500; // Within 500ms of end

    if ((status.didJustFinish || isAtEnd) && !isRestartingRef.current && videoRef.current) {
      isRestartingRef.current = true;

      try {
        // For web: directly manipulate HTML5 video element
        if (Platform.OS === 'web') {
          const videoElements = document.querySelectorAll('video');
          const mainVideo = videoElements[videoElements.length - 1];
          if (mainVideo) {
            mainVideo.currentTime = 0;
            mainVideo.play().catch(() => {
              mainVideo.muted = true;
              mainVideo.play().catch(() => {});
            });
          }
        } else {
          await videoRef.current.setPositionAsync(0);
          await videoRef.current.playAsync();
        }
      } catch (err) {
        // Silently handle replay errors
      }

      // Reset flag after a short delay
      setTimeout(() => {
        isRestartingRef.current = false;
      }, 1000);
    }
  };

  // Social Actions
  const handleLike = async () => {
    if (!authState.isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to like videos', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    // Animate
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      if (!video?._id) return;
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

      const response = await realVideosApi.toggleVideoLike(video._id);
      if (response.success) {
        setIsLiked(response.data.isLiked ?? response.data.liked);
        setLikesCount(response.data.totalLikes ?? response.data.likeCount);
      }
    } catch (error) {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleBookmark = async () => {
    if (!authState.isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to save videos', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    try {
      if (!video?._id) return;
      const previousState = isBookmarked;
      setIsBookmarked(!previousState);

      const response = await realVideosApi.toggleBookmark(video._id);

      if (response?.success && response?.data) {
        setIsBookmarked(response.data.isBookmarked);
      } else if (response?.data?.isBookmarked !== undefined) {
        setIsBookmarked(response.data.isBookmarked);
      }
      // If API fails silently, keep the optimistic update
    } catch (error) {
      // Revert on error
      setIsBookmarked(isBookmarked);
      console.error('Bookmark error:', error);
    }
  };

  const handleFollow = async () => {
    if (!authState.isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to follow creators', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    // Use the same store ID as the check - this ensures consistency
    const storeIdToFollow = getFollowableStoreId();
    if (!storeIdToFollow) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      if (wasFollowing) {
        // Unfollow - use wishlistApi (backend supports this)
        const response = await wishlistApi.removeFromWishlist('store', storeIdToFollow);
        if (!response.success) {
          throw new Error(response.message || 'Failed to unfollow');
        }
      } else {
        // Follow - use wishlistApi (backend supports this)
        const creatorName = video?.creator?.name || video?.creator?.username || 'this creator';
        const response = await wishlistApi.addToWishlist({
          itemType: 'store',
          itemId: storeIdToFollow,
          notes: `Following ${creatorName}`,
          priority: 'medium',
        });
        if (!response.success) {
          throw new Error(response.message || 'Failed to follow');
        }
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(wasFollowing);
      showAlert('Error', wasFollowing ? 'Failed to unfollow' : 'Failed to follow');
    }
  };

  const handleMuteToggle = async () => {
    if (videoRef.current) {
      setIsMuted(!isMuted);
      await videoRef.current.setIsMutedAsync(!isMuted);
    }
  };

  // Track view - YouTube-like behavior with 4-hour cooldown
  useEffect(() => {
    const trackVideoView = async () => {
      if (!video || !ready || !video._id) return;

      // Check if we've already tracked this video in this component instance
      if (viewTrackedRef.current.has(video._id)) return;

      // Check if cooldown period has passed (YouTube-like)
      const canCount = await shouldCountView(video._id);

      // Mark as tracked for this component instance (prevents duplicate API calls)
      viewTrackedRef.current.add(video._id);

      if (canCount) {
        try {
          await realVideosApi.trackView(video._id);
          await recordView(video._id);
          setViewsCount(prev => prev + 1);
        } catch (error) {
          // Silently handle view tracking errors
        }
      }
    };

    trackVideoView();
  }, [video?._id, ready]);

  // Format numbers
  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Creator info
  const creatorName = video?.creator?.profile
    ? `${video.creator.profile.firstName || ''} ${video.creator.profile.lastName || ''}`.trim()
    : video?.creator?.name || video?.creator?.username || video?.store?.name || 'User';

  // Generate default avatar URL using name initials
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=8B5CF6&color=fff&size=100`;
  const creatorAvatar = video?.creator?.profile?.avatar || video?.creator?.avatar || defaultAvatarUrl;

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error || !video) {
    return (
      <View style={styles.container}>
        <Ionicons name="videocam-off-outline" size={64} color="#6B7280" />
        <Text style={styles.errorText}>{error || 'Video not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Video - Only shown for horizontal videos (blurred background effect) */}
      {videoAspectRatio === 'horizontal' && (
        <>
          <Video
            key="bg-video-horizontal"
            source={{ uri: videoError ? FALLBACK_VIDEO_URL : video.videoUrl }}
            style={[
              StyleSheet.absoluteFill,
              styles.backgroundVideo,
              Platform.OS === 'web' && {
                // @ts-ignore - web-only style
                filter: 'blur(15px)',
                transform: 'scale(1.5)',
                width: '150%',
                height: '150%',
                top: '-25%',
                left: '-25%',
              },
            ]}
            resizeMode={ResizeMode.COVER}
            isLooping={true}
            shouldPlay={true}
            isMuted={true}
            useNativeControls={false}
          />
          {/* Dark overlay to dim background */}
          <View style={styles.darkOverlay} />
        </>
      )}


      {/* Main Video Player - Dynamic resize mode based on aspect ratio */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          key={`video-${videoAspectRatio}`}
          ref={videoRef}
          source={{ uri: videoError ? FALLBACK_VIDEO_URL : video.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={videoAspectRatio === 'horizontal' ? ResizeMode.CONTAIN : ResizeMode.COVER}
          isLooping={true}
          shouldPlay={true}
          isMuted={isMuted}
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={async (status: any) => {
            setReady(true);
            setVideoError(false);

            // Detect video aspect ratio - try multiple sources
            let width = 0;
            let height = 0;

            // Try naturalSize first (native)
            if (status.naturalSize) {
              width = status.naturalSize.width;
              height = status.naturalSize.height;
            }
            // Try direct width/height (web fallback)
            else if (status.width && status.height) {
              width = status.width;
              height = status.height;
            }

            if (width > 0 && height > 0) {
              if (height > width) {
                setVideoAspectRatio('vertical');
              } else if (width > height) {
                setVideoAspectRatio('horizontal');
              } else {
                setVideoAspectRatio('square');
              }
            }

            // Force play after load
            if (videoRef.current) {
              try {
                await videoRef.current.playAsync();
                setIsPlaying(true);
              } catch (e) {
                // Silently handle play errors
              }
            }

            // Web: Set loop attribute directly on HTML5 video element
            if (Platform.OS === 'web') {
              setTimeout(() => {
                const videoElements = document.querySelectorAll('video');
                videoElements.forEach((videoEl) => {
                  videoEl.loop = true;
                });
              }, 100);
            }
          }}
          onReadyForDisplay={(event: any) => {
            // Try to get dimensions from readyForDisplay event (web)
            if (event?.naturalSize || event?.nativeEvent?.naturalSize) {
              const size = event.naturalSize || event.nativeEvent?.naturalSize;
              if (size?.width && size?.height) {
                if (size.height > size.width) {
                  setVideoAspectRatio('vertical');
                } else if (size.width > size.height) {
                  setVideoAspectRatio('horizontal');
                }
              }
            }
          }}
          onError={() => {
            setVideoError(true);
          }}
        />
        {/* Transparent overlay to capture taps on web */}
        <View
          style={[StyleSheet.absoluteFill, { pointerEvents: 'box-only' }]}
        />
      </TouchableOpacity>

      {/* Play/Pause Indicator */}
      <Animated.View style={[styles.playPauseIndicator, { opacity: playPauseOpacity }]}>
        <View style={styles.playPauseCircle}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color="#FFF" />
        </View>
      </Animated.View>

      {/* Double Tap Heart Animation */}
      <Animated.View style={[styles.heartAnimation, { opacity: heartOpacity }]}>
        <Ionicons name="heart" size={120} color="#EF4444" />
      </Animated.View>

      {/* Top Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={[styles.topGradient, { pointerEvents: 'none' }]}
      />

      {/* Bottom Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={[styles.bottomGradient, { pointerEvents: 'none' }]}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarButton} onPress={handleMuteToggle}>
            <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topBarButton} onPress={() => router.push('/CartPage')}>
            <Ionicons name="bag-outline" size={22} color="#FFF" />
            {cartState.items.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartState.items.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Right Side Social Actions */}
      <View style={styles.socialActions}>
        {/* Creator Avatar */}
        <View style={styles.creatorAvatarContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={{ uri: creatorAvatar }}
              style={styles.creatorAvatar}
            />
          </TouchableOpacity>
          {!isFollowing && (
            <TouchableOpacity style={styles.followBadge} onPress={handleFollow}>
              <Ionicons name="add" size={12} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Like */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? '#EF4444' : '#FFF'}
            />
          </Animated.View>
          <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={30}
            color={isBookmarked ? '#FBBF24' : '#FFF'}
          />
        </TouchableOpacity>

        {/* More Options */}
        <TouchableOpacity style={styles.actionButton} onPress={() => setReportModalVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        {/* Creator Info */}
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>@{creatorName.toLowerCase().replace(/\s+/g, '_')}</Text>
          {isFollowing ? (
            <View style={styles.followingBadge}>
              <Text style={styles.followingText}>Following</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Caption */}
        <Text style={styles.caption} numberOfLines={2}>
          {video.description || video.title}
        </Text>

        {/* Tags */}
        {video.hashtags && video.hashtags.length > 0 && (
          <View style={styles.tagsContainer}>
            {video.hashtags.slice(0, 3).map((tag: string, index: number) => (
              <Text key={index} style={styles.tag}>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </Text>
            ))}
          </View>
        )}

        {/* Products Section - Horizontal Scroll */}
        {products.length > 0 && (
          <View style={styles.productsSection}>
            <View style={styles.productsHeader}>
              <Ionicons name="bag-handle" size={14} color="#FFF" />
              <Text style={styles.productsTitle}>Shop Products</Text>
              <View style={styles.productsBadge}>
                <Text style={styles.productsBadgeText}>{products.length}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            >
              {products.map((product: any, index: number) => (
                <TouchableOpacity
                  key={product.id || index}
                  style={styles.productCard}
                  onPress={() => navigateToProduct(product, 'ugc_video')}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>
                        {typeof product.price === 'number' ? `₹${product.price}` : product.price}
                      </Text>
                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                      >
                        <Ionicons name="add" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        videoId={video._id}
        videoTitle={video.description || video.title}
        onReportSuccess={() => {
          setReportModalVisible(false);
          setIsReported(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { overflow: 'hidden' as const }),
  },
  backgroundVideo: {
    opacity: 0.7,
    transform: [{ scale: 1.5 }],
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Overlays
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },

  // Play/Pause Indicator
  playPauseIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playPauseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Heart Animation
  heartAnimation: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Social Actions (Right Side)
  socialActions: {
    position: 'absolute',
    right: 12,
    bottom: Platform.OS === 'ios' ? 280 : 260, // Moved up further to avoid bottom nav bar
    alignItems: 'center',
    gap: 20,
    zIndex: 20,
  },
  creatorAvatarContainer: {
    marginBottom: 10,
  },
  creatorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  followBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // Bottom Content
  bottomContent: {
    position: 'absolute',
    left: 12,
    right: 60,
    bottom: Platform.OS === 'ios' ? 100 : 80, // Moved up further to avoid bottom nav bar
    zIndex: 20,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  followButton: {
    marginLeft: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  followingBadge: {
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  followingText: {
    color: '#FFF',
    fontSize: 12,
  },
  caption: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Products Section
  productsSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
    backdropFilter: 'blur(10px)',
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  productsTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  productsBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  productsBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productsList: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 4,
  },
  productCard: {
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    backgroundColor: '#333',
    marginBottom: 6,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  addToCartButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Progress Bar
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
  },
});
