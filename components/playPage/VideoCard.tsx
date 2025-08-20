import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';
import { VideoCardProps, VIDEO_CARD_SIZES, PLAY_PAGE_COLORS } from '@/types/playPage.types';
import { getIOSVideoProps, getVideoLoadingStrategy } from '@/utils/videoUtils';
import ShimmerEffect from '@/components/common/ShimmerEffect';
import { useVideoManager } from '@/hooks/useVideoManager';

const { width: screenWidth } = Dimensions.get('window');

export default function VideoCard({ 
  item, 
  onPress, 
  onPlay,
  onPause,
  autoPlay = true,
  showProductCount = true,
  showHashtags = true,
  size = 'medium',
  style 
}: VideoCardProps) {
  // Use the video manager hook
  const { 
    videoRef, 
    isPlaying, 
    isLoaded: isVideoReady, 
    startPlayback, 
    stopPlayback, 
    setLoaded,
    getManagerStatus 
  } = useVideoManager(item.id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Get iOS-optimized video props
  const videoProps = getIOSVideoProps(item.videoUrl, item.thumbnailUrl);
  const loadingStrategy = getVideoLoadingStrategy();

  const sizeConfig = VIDEO_CARD_SIZES[size];
  const cardWidth = size === 'large' || size === 'featured' 
    ? screenWidth - 40 
    : (screenWidth - 60) / 2; // More spacing between cards

  // Preload video immediately when component mounts
  useEffect(() => {
    const loadVideo = async () => {
      if (videoRef.current) {
        try {
          // Load video but don't play yet for faster initial loading
          await videoRef.current.loadAsync(
            { uri: item.videoUrl },
            {
              shouldPlay: false, // Load but don't play initially
              isLooping: true,
              isMuted: true,
              volume: 0,
            }
          );
        } catch (error) {
          console.warn('Video loading error:', error);
          setHasError(true);
        }
      }
    };
    
    loadVideo();
  }, [item.videoUrl]);
  
  // Handle auto-play when video is ready
  useEffect(() => {
    const handleAutoPlay = async () => {
      if (autoPlay && isVideoReady && !isPlaying) {
        const status = getManagerStatus();
        console.log(`Attempting auto-play for ${item.id}`, status);
        
        const success = await startPlayback();
        if (success) {
          onPlay?.();
        } else {
          console.warn(`Auto-play failed for ${item.id}`);
        }
      } else if (!autoPlay && isPlaying) {
        await stopPlayback();
        onPause?.();
      }
    };
    
    handleAutoPlay();
  }, [autoPlay, isVideoReady, item.id]);

  const handleVideoLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setLoaded(true); // Notify video manager that video is loaded
      
      console.log(`Video loaded successfully: ${item.id}`);
      
      // Fade in animation
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    
    // Track loading progress
    if (status.isLoaded && 'playableDurationMillis' in status && 'durationMillis' in status) {
      const progress = status.playableDurationMillis && status.durationMillis 
        ? (status.playableDurationMillis / status.durationMillis) * 100
        : 0;
      setLoadingProgress(progress);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleCardPress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress(item);
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.container, 
          { 
            width: cardWidth, 
            height: sizeConfig.height 
          }, 
          style
        ]}
        onPress={handleCardPress}
        activeOpacity={1} // Disable default opacity since we have custom animation
      >
      <View style={styles.videoContainer}>
        {!hasError ? (
          <Video
            ref={videoRef}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isPlaying && isVideoReady}
            onPlaybackStatusUpdate={handleVideoLoad}
            onError={handleVideoError}
            {...videoProps} // Apply iOS-optimized props
            // Override props to ensure auto-play compatibility
            isLooping={true}
            isMuted={true}
            volume={0}
            progressUpdateIntervalMillis={200}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
            <Ionicons name="videocam-off" size={40} color="#666" />
            <ThemedText style={styles.errorText}>Video unavailable</ThemedText>
          </View>
        )}

        {/* Enhanced loading overlay with shimmer */}
        {isLoading && !hasError && (
          <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
            {/* Shimmer background effect */}
            <ShimmerEffect
              width="100%"
              height="100%"
              style={styles.shimmerBackground}
              shimmerColors={['#E5E7EB', '#FFFFFF', '#E5E7EB']}
              duration={1200}
            />
            
            <View style={styles.loadingContent}>
              <View style={styles.loadingSpinner}>
                <Ionicons name="play-circle" size={36} color="#FFFFFF" />
              </View>
              
              {loadingProgress > 0 && (
                <View style={styles.loadingProgress}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${loadingProgress}%` }
                      ]} 
                    />
                  </View>
                  <ThemedText style={styles.loadingText}>
                    {Math.round(loadingProgress)}%
                  </ThemedText>
                </View>
              )}
              
              {loadingProgress === 0 && (
                <ThemedText style={styles.loadingText}>
                  Preparing video...
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={PLAY_PAGE_COLORS.gradient.cardOverlay as any}
          style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* View count overlay */}
        <View style={styles.viewCountContainer}>
          <View style={styles.viewCountPill}>
            <Ionicons name="eye" size={12} color="#FFFFFF" />
            <ThemedText style={styles.viewCountText}>
              {item.viewCount}
            </ThemedText>
          </View>
        </View>

       

        {/* Content overlay */}
        <View style={styles.contentOverlay}>
          {/* Description */}
          <ThemedText 
            style={[
              styles.description, 
              { fontSize: sizeConfig.fontSize }
            ]} 
            numberOfLines={size === 'featured' ? 3 : 2}
          >
            {item.description}
          </ThemedText>

          {/* Hashtags */}
          {showHashtags && item.hashtags && item.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {item.hashtags.slice(0, 2).map((hashtag, index) => (
                <View key={index} style={styles.hashtagPill}>
                  <ThemedText style={styles.hashtagText}>
                    {hashtag}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

       
        </View>

        {/* Play/Pause indicator (subtle) */}
        {!isLoading && !hasError && (
          <View style={styles.playIndicator}>
            <View style={[styles.playDot, { opacity: isPlaying ? 1 : 0.5 }]} />
          </View>
        )}
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20, // More rounded corners
    overflow: 'hidden',
    backgroundColor: PLAY_PAGE_COLORS.cardBackground,
    shadowColor: PLAY_PAGE_COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20, // More spacing between cards
    marginHorizontal: 2, // Subtle horizontal spacing
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  shimmerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingProgress: {
    alignItems: 'center',
    width: '80%',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewCountContainer: {
    position: 'absolute',
    top: 16, // More spacing from edge
    left: 16,
  },
  viewCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // More subtle
    borderRadius: 16, // More rounded
    paddingHorizontal: 12,
    paddingVertical: 6, // More padding
    gap: 6,
    backdropFilter: 'blur(10px)', // Glass effect (iOS)
  },
  viewCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  productCountContainer: {
    position: 'absolute',
    top: 16, // More spacing from edge
    right: 16,
  },
  productCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PLAY_PAGE_COLORS.primary,
    borderRadius: 16, // More rounded
    paddingHorizontal: 12,
    paddingVertical: 6, // More padding
    gap: 6,
    shadowColor: PLAY_PAGE_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  productCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20, // More generous padding
  },
  description: {
    color: '#FFFFFF',
    fontWeight: '600', // Slightly bolder
    lineHeight: 22, // Better line spacing
    marginBottom: 12, // More space below
    letterSpacing: 0.3, // Better letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // More space between hashtags
    marginBottom: 12, // More space below
  },
  hashtagPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // More subtle
    borderRadius: 14, // More rounded
    paddingHorizontal: 12,
    paddingVertical: 6, // More padding
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hashtagText: {
    color: '#FFFFFF',
    fontSize: 11, // Slightly larger
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  

  playIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  playDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
});