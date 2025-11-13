// UGCDetailScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Platform, ActivityIndicator, Text, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';
import ProductCarousel from '@/components/ugc/ProductCarousel';
import VideoControls from '@/components/ugc/VideoControls';
import SocialActions from '@/components/ugc/SocialActions';
import CreatorInfo from '@/components/ugc/CreatorInfo';
import useProductInteraction from '@/hooks/useProductInteraction';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { showAlert } from '@/utils/alert';
import ReportModal from '@/components/ugc/ReportModal';
import ReportToast from '@/components/common/ReportToast';
import { useVideoReport } from '@/hooks/useVideoReport';
import { ReportReason } from '@/types/report.types';
import { realVideosApi, Video as VideoType } from '@/services/realVideosApi';

type ProductCard = {
  id: string;
  title: string;
  price: string;
  rating?: number;
  cashbackText?: string;
  image: string;
};

type UGCItem = {
  id: string;
  videoUrl?: string;
  uri?: string;
  viewCount: string;
  description: string;
  tag?: string;
  productCards?: ProductCard[];
  products?: any[]; // Tagged products from backend
  likes?: number;
  comments?: number;
  shares?: number;
};

// Fallback video URL for when backend video URL fails (404)
const FALLBACK_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function UGCDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video | null>(null);
  const [ready, setReady] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Backend API state
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug and parse params on mount
  useEffect(() => {
    console.log('🔍 [UGCDetailScreen] Component mounted');
    console.log('🔍 [UGCDetailScreen] All params:', params);
    console.log('🔍 [UGCDetailScreen] params.id:', params.id);
    console.log('🔍 [UGCDetailScreen] params.item:', params.item);

    // If item is passed as JSON string, parse it and use directly
    if (params.item && typeof params.item === 'string') {
      try {
        const parsedItem = JSON.parse(params.item);
        console.log('✅ [UGCDetailScreen] Parsed item from params:', parsedItem);

        // Use the passed video data directly instead of fetching
        setVideo(parsedItem as any);
        setLoading(false);
        console.log('✅ [UGCDetailScreen] Using passed video data, skipping API fetch');
      } catch (err) {
        console.error('❌ [UGCDetailScreen] Failed to parse item param:', err);
      }
    }
  }, []);

  // Report functionality state
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isReported, setIsReported] = useState(false);

  // Video controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Social features state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);

  // Toast state for report feedback
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    visible: false,
    type: 'success',
    message: '',
  });

  // Auth context for checking user login status
  const { state: authState } = useAuth();

  // Cart context for cart badge
  const { state: cartState } = useCart();

  // Product interaction hook
  const { addToCart, navigateToProduct } = useProductInteraction({
    onSuccess: (message) => {
      console.log('Success:', message);
      // Could show a toast notification here
    },
    onError: (error) => {
      console.error('Error:', error);
      // Could show an error toast here
    },
  });

  // Fetch video data from backend (only if not already loaded from params.item)
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const videoId = params.id as string;
        console.log('🎬 [UGCDetailScreen] Fetching video with ID:', videoId);
        const response = await realVideosApi.getVideoById(videoId);
        console.log('📦 [UGCDetailScreen] Full API response:', response);
        console.log('📦 [UGCDetailScreen] response.success:', response?.success);
        console.log('📦 [UGCDetailScreen] response.data:', response?.data);

        // Handle different response structures
        let videoData = null;

        if (response && response.success !== false) {
          // Try to extract video from various possible structures
          if (response.data && response.data.video) {
            // Structure: { success: true, data: { video: {...} } }
            videoData = response.data.video;
            console.log('✅ [UGCDetailScreen] Found video in response.data.video');
          } else if (response.video) {
            // Structure: { video: {...} }
            videoData = response.video;
            console.log('✅ [UGCDetailScreen] Found video in response.video');
          } else if (response.data && response.data._id) {
            // Structure: { data: Video }
            videoData = response.data;
            console.log('✅ [UGCDetailScreen] Found video in response.data');
          } else if (response._id) {
            // Structure: Video (direct)
            videoData = response;
            console.log('✅ [UGCDetailScreen] Response is the video object');
          }
        }

        if (videoData && videoData._id) {
          console.log('📦 [UGCDetailScreen] Extracted video data keys:', Object.keys(videoData));
          console.log('🛍️ [UGCDetailScreen] Products in video:', videoData.products?.length || 0);
          console.log('🎥 [UGCDetailScreen] Video URL:', videoData.videoUrl);
          console.log('🖼️ [UGCDetailScreen] Thumbnail:', videoData.thumbnail);
          console.log('🎬 [UGCDetailScreen] Video ID:', videoData._id);
          console.log('📝 [UGCDetailScreen] Description:', videoData.description);
          console.log('🔍 [UGCDetailScreen] Has videoUrl:', !!videoData.videoUrl);
          console.log('🔍 [UGCDetailScreen] VideoUrl type:', typeof videoData.videoUrl);

          setVideo(videoData);
          console.log('✅ [UGCDetailScreen] Video state set successfully');

          if (videoData.products && videoData.products.length > 0) {
            console.log('✅ [UGCDetailScreen] Video has products:', videoData.products.length);
            videoData.products.forEach((product: any, index: number) => {
              console.log(`   Product ${index + 1}: ${product.name || product.title} (ID: ${product._id})`);
            });
          } else {
            console.warn('⚠️ [UGCDetailScreen] Video has no products');
          }
        } else {
          console.error('❌ [UGCDetailScreen] Could not extract video from response');
          console.error('Response structure:', JSON.stringify(response, null, 2));
          setError('Video not found');
        }
      } catch (err) {
        console.error('❌ Error fetching video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have params.id and don't already have video data from params.item
    if (params.id && !video) {
      fetchVideo();
    }
  }, [params.id]);

  // Initialize engagement data from video
  useEffect(() => {
    if (video) {
      // Handle both formats: engagement.likes array and video.likes number
      if (video.engagement?.likes) {
        if (Array.isArray(video.engagement.likes)) {
          setIsLiked(video.engagement.likes.includes(authState.user?.id || '') || false);
          setLikesCount(video.engagement.likes.length);
        } else {
          setLikesCount(Number(video.engagement.likes) || 0);
        }
      } else if (video.likes !== undefined) {
        // Play page format: video.likes is a number
        setLikesCount(Number(video.likes) || 0);
      }

      if (video.engagement?.shares !== undefined) {
        setSharesCount(video.engagement.shares);
      } else if (video.shares !== undefined) {
        // Play page format: video.shares is a number
        setSharesCount(Number(video.shares) || 0);
      }

      console.log(`💖 Engagement: ${likesCount} likes, ${sharesCount} shares, isLiked: ${isLiked}`);
      // TODO: Check if user follows creator
      // TODO: Check if user bookmarked video
    }
  }, [video, authState.user]);

  // Handle focus state for video playback
  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 Screen focused');
      setIsFocused(true);
      return () => {
        console.log('🎯 Screen unfocused');
        setIsFocused(false);
      };
    }, [])
  );

  // Update playback when focus or playing state changes
  useEffect(() => {
    const updatePlayback = async () => {
      try {
        if (videoRef.current && ready) {
          const shouldBePlayingNow = isFocused && isPlaying;
          console.log(`🎮 Playback update: isFocused=${isFocused}, isPlaying=${isPlaying}, shouldPlay=${shouldBePlayingNow}`);

          if (shouldBePlayingNow) {
            await videoRef.current.playAsync();
          } else {
            await videoRef.current.pauseAsync();
          }
        }
      } catch (error) {
        console.warn('⚠️ Video playback update error:', error);
      }
    };

    updatePlayback();
  }, [isFocused, isPlaying, ready]);

  const { width } = Dimensions.get('window');

  // Transform product data for ProductCarousel
  const products = useMemo(() => {
    if (!video?.products) return [];

    return video.products.map(product => {
      // Handle both backend format (pricing object) and play page format (price string)
      let priceValue = 0;
      let originalPrice = 0;

      // ✅ FIX: Check for pricing.selling (food products like Butter Chicken, Biryani)
      if (product.pricing?.selling !== undefined) {
        priceValue = product.pricing.selling;
        originalPrice = product.pricing.mrp || product.pricing.base || priceValue;
      } else if (product.pricing?.basePrice) {
        // Backend API format (old)
        priceValue = product.pricing.basePrice;
        originalPrice = product.pricing.salePrice || priceValue;
      } else if (product.pricing?.current) {
        // New format: pricing object with current/original
        priceValue = product.pricing.current;
        originalPrice = product.pricing.original || priceValue;
      } else if (typeof product.price === 'object' && product.price?.current) {
        // Direct price object from transformer
        priceValue = product.price.current;
        originalPrice = product.price.original || priceValue;
      } else if (typeof product.price === 'string') {
        // Play page format - parse string like "₹2,199" or "₹0"
        const priceStr = String(product.price).replace(/[₹,]/g, '').trim();
        priceValue = parseInt(priceStr, 10) || 0;
        originalPrice = priceValue;
      } else if (typeof product.price === 'number') {
        priceValue = product.price;
        originalPrice = priceValue;
      }

      // Calculate discount percentage if not provided
      let discount = product.pricing?.discount || product.price?.discount;
      if (!discount && originalPrice && priceValue && originalPrice > priceValue) {
        discount = Math.round(((originalPrice - priceValue) / originalPrice) * 100);
      }

      console.log(`📦 [UGCDetailScreen] Product: ${product.title}, Price: ${priceValue}, Original: ${originalPrice}, Discount: ${discount}%`);

      return {
        ...product,
        // Ensure we have both id and _id for compatibility
        id: product.id || product._id,
        _id: product._id || product.id,
        // Ensure we have name field (fallback to title)
        name: product.name || product.title || 'Unknown Product',
        title: product.title || product.name || 'Unknown Product',
        price: {
          current: priceValue,
          original: originalPrice,
          discount: discount || 0,
          currency: '₹'
        },
        availabilityStatus: product.inventory?.isAvailable !== false ? 'in_stock' : 'out_of_stock',
        inventory: {
          isAvailable: product.inventory?.isAvailable !== false,
          stock: product.inventory?.stock || 0
        },
        store: product.store
      };
    });
  }, [video]);

  const hasProducts = products.length > 0;

  // Debug products
  React.useEffect(() => {
    console.log('🛍️ [UGCDetailScreen] Products count:', products.length);
    console.log('🛍️ [UGCDetailScreen] Has products:', hasProducts);

    // Log ALL products with their IDs
    products.forEach((product, index) => {
      console.log(`🛍️ [UGCDetailScreen] Product ${index}:`, {
        id: product.id,
        _id: product._id,
        title: product.title,
        name: product.name,
        price: product.price
      });
    });
  }, [products, hasProducts]);

  /**
   * Handle product card press
   * Now passes complete product object for better ProductPage navigation
   */
  const handleProductPress = (product: any) => {
    console.log('🔍 [UGCDetailScreen] Product pressed:', product);
    console.log('🔍 [UGCDetailScreen] Product._id:', product._id);
    console.log('🔍 [UGCDetailScreen] Product.id:', product.id);
    console.log('🔍 [UGCDetailScreen] Product.title:', product.title);
    console.log('🔍 [UGCDetailScreen] Product data:', JSON.stringify(product, null, 2));

    const productId = product._id || product.id;
    console.log('🔍 [UGCDetailScreen] Extracted productId:', productId);

    if (productId) {
      console.log('✅ [UGCDetailScreen] Navigating to product with full data');
      // Pass the complete product object for better navigation
      navigateToProduct(product, 'ugc_video');
    } else {
      console.error('❌ [UGCDetailScreen] No product ID found!');
    }
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = async (product: any) => {
    await addToCart(product, 1);
  };

  /**
   * Handle play/pause toggle
   */
  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  /**
   * Handle mute toggle
   */
  const handleMuteToggle = async () => {
    if (!videoRef.current) return;
    setIsMuted(!isMuted);
    await videoRef.current.setIsMutedAsync(!isMuted);
  };

  /**
   * Handle video press to show/hide controls
   */
  const handleVideoPress = () => {
    setShowControls(!showControls);
    // Auto-hide controls after 3 seconds
    setTimeout(() => setShowControls(false), 3000);
  };

  /**
   * Handle playback status updates
   */
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const progress = (status.positionMillis / (status.durationMillis || 1)) * 100;
      setProgress(progress);
      setIsPlaying(status.isPlaying);

      // Debug logging (only log every 10% progress to avoid spam)
      if (Math.floor(progress) % 10 === 0 && progress > 0) {
        console.log(`📊 Playback: ${Math.floor(progress)}%, Playing: ${status.isPlaying}, Position: ${Math.floor(status.positionMillis / 1000)}s / ${Math.floor((status.durationMillis || 0) / 1000)}s`);
      }
    } else if ('error' in status) {
      console.error('❌ Playback error in status update:', status.error);
    }
  };

  /**
   * Handle report button press
   * Checks if user is authenticated before showing report modal
   */
  const handleReportPress = () => {
    if (!authState.isAuthenticated || !authState.user) {
      showAlert(
        'Sign In Required',
        'Please sign in to report videos',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/sign-in')
          }
        ]
      );
      return;
    }

    if (isReported) {
      showAlert('Already Reported', 'You have already reported this video.');
      return;
    }

    setReportModalVisible(true);
  };

  /**
   * Handle report submission
   * Called by ReportModal when user submits a report
   */
  const handleReportSubmit = async (reason: ReportReason, details?: string) => {
    try {
      if (!video) {
        throw new Error('Video not found');
      }

      const response = await realVideosApi.reportVideo(video._id, reason, details);

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit report');
      }

      // Success - report submitted
      return Promise.resolve();
    } catch (error: any) {
      // Error - pass it up to the modal
      throw error;
    }
  };

  /**
   * Handle successful report submission
   * Called by ReportModal after report is submitted
   */
  const handleReportSuccess = () => {
    setReportModalVisible(false);
    setIsReported(true);

    // Show success toast
    setToastConfig({
      visible: true,
      type: 'success',
      message: "Thank you for your report. We'll review it shortly.",
    });
  };

  /**
   * Handle report error
   * Called by ReportModal if report submission fails
   */
  const handleReportError = (error: string) => {
    // Show error toast
    setToastConfig({
      visible: true,
      type: 'error',
      message: error || 'Failed to submit report. Please try again.',
    });
  };

  /**
   * Social Action Handlers
   */

  // Like handler
  const handleLike = async () => {
    if (!authState.isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to like videos', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    try {
      if (!video) return;
      const response = await realVideosApi.toggleVideoLike(video._id);
      if (response.success) {
        setIsLiked(response.data.isLiked || response.data.liked);
        setLikesCount(response.data.totalLikes || response.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  // Comment handler
  const handleComment = () => {
    // TODO: Navigate to comments page (to be implemented)
    console.log('Navigate to comments');
    // router.push(`/comments/${video._id}`);
  };

  // Share handler
  const handleShare = async () => {
    try {
      if (!video) return;
      const result = await Share.share({
        message: `Check out this video: ${video.title || video.description}`,
        url: `https://yourapp.com/video/${video._id}`,
        title: video.title || 'Amazing Video',
      });

      if (result.action === Share.sharedAction) {
        setSharesCount(prev => prev + 1);
        // TODO: Track share in backend
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Bookmark handler
  const handleBookmark = async () => {
    if (!authState.isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to bookmark videos', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    try {
      // TODO: Implement bookmark API
      setIsBookmarked(!isBookmarked);
      console.log('Bookmark toggled');
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  // Creator press handler
  const handleCreatorPress = () => {
    if (!video?.creator) return;
    // TODO: Navigate to creator profile
    console.log('Navigate to creator profile:', video.creator._id);
    // router.push(`/profile/${video.creator._id}`);
  };

  // Follow handler
  const handleFollow = async () => {
    if (!authState.isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to follow creators', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    try {
      // TODO: Implement follow API
      setIsFollowing(!isFollowing);
      console.log('Follow toggled');
    } catch (error) {
      console.error('Error following:', error);
    }
  };

  // Track video view when video loads
  useEffect(() => {
    if (video && ready) {
      trackVideoView();
    }
  }, [video, ready]);

  const trackVideoView = async () => {
    try {
      if (!video) return;
      // TODO: Implement view tracking API
      // await realVideosApi.trackVideoView(video._id);
      console.log('Video view tracked:', video._id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Format view count
  const formattedViewCount = useMemo(() => {
    // Handle both formats: engagement.views and viewCount string
    if (video?.viewCount && typeof video.viewCount === 'string') {
      // Play page format: already formatted like "67.3K"
      return video.viewCount;
    }

    const views = video?.engagement?.views || 0;
    if (views >= 100000) {
      return (views / 100000).toFixed(1) + 'L';
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }, [video]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6F45FF" />
        <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
      </View>
    );
  }

  // Error state
  if (error || !video) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="videocam-off-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.errorText}>{error || 'Video not found'}</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Double tap to return to previous screen"
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Log video state before rendering
  console.log('🎬 [RENDER] About to render video player');
  console.log('🎬 [RENDER] video object exists:', !!video);
  console.log('🎬 [RENDER] video.videoUrl:', video?.videoUrl);
  console.log('🎬 [RENDER] videoError:', videoError);
  console.log('🎬 [RENDER] isFocused:', isFocused);
  console.log('🎬 [RENDER] isPlaying:', isPlaying);
  console.log('🎬 [RENDER] ready:', ready);

  return (
    <View style={styles.container}>
      {/* Video Player */}
      {video.videoUrl ? (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleVideoPress}
          activeOpacity={1}
          accessible={true}
          accessibilityLabel={`Video: ${video.description || video.title}. Double tap to show or hide controls`}
          accessibilityRole="button"
          accessibilityHint="Double tap to show or hide video controls"
        >
          <Video
            ref={videoRef}
            source={{ uri: videoError ? FALLBACK_VIDEO_URL : video.videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isFocused && isPlaying}
            isMuted={isMuted}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoad={() => {
              console.log('✅ Video onLoad fired - Video component ready');
              console.log('📹 Currently using URL:', videoError ? FALLBACK_VIDEO_URL : video.videoUrl);
              setReady(true);
              setVideoError(false); // Video loaded successfully
              if (Platform.OS === 'web' && videoRef.current) {
                console.log('🌐 Web platform detected, calling playAsync()');
                videoRef.current.playAsync().catch((err) => {
                  console.error('❌ Web playAsync error:', err);
                });
              }
            }}
            onError={(error) => {
              console.error('❌ Video onError fired:', error);
              console.error('🔴 Failed to load video:', video.videoUrl);
              console.log('🔄 Switching to fallback video:', FALLBACK_VIDEO_URL);
              setVideoError(true);
            }}
          />
        </TouchableOpacity>
      ) : (
        <>
          <Image source={{ uri: video.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }], backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, borderRadius: 10 }}>
            <ThemedText style={{ color: '#FFF', fontSize: 14 }}>⚠️ No video URL available</ThemedText>
          </View>
        </>
      )}

      {/* Video Error Warning */}
      {videoError && (
        <View style={styles.videoErrorBanner}>
          <Ionicons name="warning" size={16} color="#F59E0B" />
          <ThemedText style={styles.videoErrorText}>
            Original video unavailable. Playing sample video.
          </ThemedText>
        </View>
      )}

      {/* Top Gradient - Lighter for better video visibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent']}
        style={[StyleSheet.absoluteFill, { height: 140 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Bottom Gradient - Very subtle for video visibility */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
        style={[StyleSheet.absoluteFill, { top: '65%' }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconPill}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {/* Cart Button */}
          <TouchableOpacity
            style={[styles.iconPill, { backgroundColor: '#FFFFFFE6', marginRight: 8 }]}
            onPress={() => router.push('/CartPage')}
            accessibilityLabel={`View cart${cartState.items.length > 0 ? `. ${cartState.items.length} items in cart` : ''}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view shopping cart"
          >
            <Ionicons name="cart-outline" size={18} color="#111827" />
            {cartState.items.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartState.items.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* View Count */}
          <View
            style={[styles.iconPill, { backgroundColor: '#FFFFFFE6' }]}
            accessible={true}
            accessibilityLabel={`${formattedViewCount} views`}
            accessibilityRole="text"
          >
            <Ionicons name="eye" size={14} color="#111827" />
            <ThemedText style={{ marginLeft: 6, fontWeight: '700', color: '#111827' }}>
              {formattedViewCount}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Video Info Section - Horizontal Layout */}
      <View style={styles.videoInfoSection}>
        {/* Left Side: Caption and Hashtag */}
        <View style={styles.captionContainer}>
          <View
            style={styles.captionBlock}
            accessible={true}
            accessibilityLabel={`Caption: ${video.description || video.title}${video.hashtags && video.hashtags.length > 0 ? `. Hashtag: ${video.hashtags[0]}` : ''}`}
            accessibilityRole="text"
          >
            <ThemedText style={styles.captionText} numberOfLines={1}>
              {video.description || video.title}
            </ThemedText>
            {video.hashtags && video.hashtags.length > 0 && (
              <View style={styles.tagPill}>
                <ThemedText style={styles.tagText}>#{video.hashtags[0]}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Right Side: Product Count Badge */}
        {hasProducts && (
          <View
            style={styles.productCountBadge}
            accessible={true}
            accessibilityLabel={`${products.length} ${products.length === 1 ? 'product' : 'products'} tagged`}
            accessibilityRole="text"
          >
            <Ionicons name="bag-outline" size={14} color="#FFFFFF" />
            <ThemedText style={styles.productCountText}>
              {products.length}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Product Carousel */}
      {hasProducts && (
        <View
          style={styles.productCarouselContainer}
          accessible={false}
          accessibilityLabel={`${products.length} tagged ${products.length === 1 ? 'product' : 'products'}`}
        >
          <ProductCarousel
            products={products}
            title="" // No title for cleaner look
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            loading={productsLoading}
            showAddButton={true}
            cardWidth={140}
          />
        </View>
      )}

      {/* Debug: Show if no products */}
      {!hasProducts && (
        <View style={{ position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(255,0,0,0.5)', padding: 10 }}>
          <Text style={{ color: '#fff' }}>No products available</Text>
        </View>
      )}

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        videoId={video._id}
        videoTitle={video.description || video.title}
        onReportSuccess={handleReportSuccess}
      />

      {/* Report Toast */}
      <ReportToast
        visible={toastConfig.visible}
        type={toastConfig.type}
        message={toastConfig.message}
        onDismiss={() => setToastConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

/**
 * Format large numbers (e.g., 1000 -> 1K, 1000000 -> 1M)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Video Error Banner
  videoErrorBanner: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  videoErrorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // Header Styles
  header: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 18,
  },
  cartButton: {
    backgroundColor: '#FFFFFFE6',
    marginRight: 8,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
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

  // Video Info Section - Horizontal Layout
  videoInfoSection: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 300, // Moved up more to prevent overlap with product carousel
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  captionContainer: {
    flex: 1,
    marginRight: 8,
  },
  captionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  tagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  productCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(111, 69, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#6F45FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  productCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Product Carousel Container
  productCarouselContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60, // Add spacing for bottom navigation (tab bar is ~50px + 10px buffer)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // Loading/Error states
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6F45FF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
