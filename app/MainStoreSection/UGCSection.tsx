/**
 * UGCSection v2.3 - Full component (autoplay working)
 *
 * Paste this file into your project. Ensure `expo-av` is installed.
 */

import React, { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';

// Optional (recommended) — enable silent autoplay on iOS in your app root
// import { Audio } from 'expo-av';
// useEffect(() => {
//   Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true });
// }, []);

interface UGCImage {
  id: string;
  uri?: string; // fallback image
  videoUrl?: string; // MP4/HLS
  viewCount: string;
  description: string;
  shortDescription?: string;
  readMoreUrl?: string;
  category?: string;
  author?: string;

  // Product plate
  productTitle?: string;
  productPrice?: string;
  productThumb?: string;
}

interface UGCSectionProps {
  title?: string;
  images?: UGCImage[];
  onViewAllPress?: () => void;
  onImagePress?: (imageId: string) => void;
  onReadMorePress?: (imageId: string, url?: string) => void;
  cardAspectRatio?: number; // width/height
  showDescriptions?: boolean; // usually false for this visual
  maxDescriptionLength?: number;
}

/** Stable test video URLs (use your CDN in production) */
const defaultImages: UGCImage[] = [
  {
    id: 'v1',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // stable public MP4
    productThumb:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=120&h=120&fit=crop',
    productTitle: 'Casual Cotton T-Shirt',
    productPrice: '₹799',
    viewCount: '2.5K',
    description: 'Soft, breathable cotton t-shirt in pastel colors.',
    category: 'Tops',
    author: 'UrbanWear',
  },
  {
    id: 'v2',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    productThumb:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop',
    productTitle: 'Slim Fit Jeans',
    productPrice: '₹1,499',
    viewCount: '1.9K',
    description: 'Stretchable slim fit denim for everyday style.',
    category: 'Bottoms',
    author: 'DenimHouse',
  },
  {
    id: 'v3',
    videoUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    productThumb:
      'https://images.unsplash.com/photo-1520975918318-3a3d3a9a91a0?w=120&h=120&fit=crop',
    productTitle: 'Floral Summer Dress',
    productPrice: '₹1,299',
    viewCount: '3.1K',
    description: 'Lightweight floral dress perfect for summer outings.',
    category: 'Dresses',
    author: 'SunChic',
  },
   // fallback image-only
  {
    id: 'i1',
    uri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=900&fit=crop&crop=center',
    viewCount: '8.1K',
    description: 'Classic leather jacket, timeless style.',
    category: 'Outerwear',
    author: 'StyleHub',
    productTitle: 'Leather Jacket',
    productPrice: '₹3,499',
    productThumb:
      'https://cdn-icons-png.flaticon.com/512/3048/3048122.png',
  },
  {
    id: 'i2',
    uri: 'https://images.unsplash.com/photo-1546456073-92b9f0a8d413?w=600&h=900&fit=crop&crop=center',
    viewCount: '5.4K',
    description: 'Premium handwoven cotton kurta.',
    category: 'Ethnic Wear',
    author: 'Traditionals',
    productTitle: 'Handwoven Cotton Kurta',
    productPrice: '₹1,799',
    productThumb:
      'https://cdn-icons-png.flaticon.com/512/297/297743.png',
  },
];

interface UGCCardProps {
  item: UGCImage;
  cardWidth: number;
  cardHeight: number;
  showDescriptions: boolean;
  maxDescriptionLength: number;
  visibleItems: string[];
  typography: any;
  onImagePress?: (imageId: string) => void;
  onReadMorePress: (item: UGCImage) => void;
  getTruncatedDescription: (description: string, maxLength: number) => string;
  needsTruncation: (description: string, maxLength: number) => boolean;
}

/**
 * UGCCard - memoized to avoid re-renders
 */
const UGCCard = memo(function UGCCard({
  item,
  cardWidth,
  cardHeight,
  typography,
  showDescriptions,
  maxDescriptionLength,
  visibleItems,
  onImagePress,
  onReadMorePress,
  getTruncatedDescription,
  needsTruncation,
}: UGCCardProps) {
  const displayDescription = item.shortDescription || getTruncatedDescription(item.description, maxDescriptionLength);
  const showReadMore = needsTruncation(item.description, maxDescriptionLength) && !item.shortDescription;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<Video | null>(null);

  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Visible means we should mount and play media
  const isVisible = visibleItems.includes(item.id);
  const shouldLoadMedia = isVisible;

  // Press animations
  const handlePressIn = () => {
    // Disable animation on iOS to prevent conflicts
    if (Platform.OS === 'ios') {
      scaleAnim.setValue(0.98);
    } else {
      Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, tension: 300, friction: 10 }).start();
    }
  };
  const handlePressOut = () => {
    // Disable animation on iOS to prevent conflicts
    if (Platform.OS === 'ios') {
      scaleAnim.setValue(1);
    } else {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
    }
  };
  const handleImagePress = () => onImagePress?.(item.id);

  // Debug: indicate whether Video component exists
  useEffect(() => {
     
    console.log(`[UGC] Card ${item.id} isVisible=${isVisible}`);
  }, [isVisible, item.id]);

  return (
    <TouchableOpacity
      onPress={handleImagePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityLabel={`${item.category || 'Content'} by ${item.author || 'creator'}. ${item.viewCount} views. ${displayDescription}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view full content details"
    >
      <Animated.View style={[styles.cardContainer, { width: cardWidth, height: cardHeight, transform: [{ scale: scaleAnim }] }]}>
        {shouldLoadMedia ? (
          item.videoUrl ? (
            <>
              <Video
                ref={videoRef}
                source={{ uri: item.videoUrl }}
                style={styles.cardMedia}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay={isVisible} // autoplay when visible
                isMuted // muted for autoplay policies
                useNativeControls={false}
                onLoadStart={() => {
                  setMediaLoading(true);
                  setMediaError(null);
                   
                  console.log(`[VIDEO ${item.id}] onLoadStart`);
                }}
                onLoad={() => {
                  setMediaLoading(false);
                   
                  console.log(`[VIDEO ${item.id}] onLoad`);
                }}
                onError={(e) => {
                  setMediaLoading(false);
                  setMediaError(String(e));
                   
                  console.warn(`[VIDEO ${item.id}] onError`, e);
                }}
                onPlaybackStatusUpdate={(status) => {
                  if (!status) return;
                   
                  console.log(`[VIDEO ${item.id}] status`, {
                    isLoaded: !!(status as any).isLoaded,
                    isPlaying: !!(status as any).isPlaying,
                    isBuffering: !!(status as any).isBuffering,
                    error: (status as any)?.error ?? null,
                  });
                }}
                progressUpdateIntervalMillis={400}
              />

              {mediaLoading && !mediaError && (
                <View style={styles.skeletonOverlay}>
                  <LinearGradient colors={['#F3F4F6', '#E5E7EB', '#F3F4F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.skeletonGradient} />
                  <ActivityIndicator size="large" color="#4F46E5" style={styles.skeletonSpinner} />
                </View>
              )}
            </>
          ) : (
            <>
              <Image
                source={{ uri: item.uri! }}
                style={styles.cardMedia}
                resizeMode="cover"
                defaultSource={require('@/assets/images/icon.png')}
                loadingIndicatorSource={require('@/assets/images/icon.png')}
                onLoadStart={() => {
                  setMediaLoading(true);
                  setMediaError(null);
                }}
                onLoadEnd={() => setMediaLoading(false)}
                onError={() => {
                  setMediaLoading(false);
                  setMediaError('image');
                }}
              />
              {mediaLoading && !mediaError && (
                <View style={styles.skeletonOverlay}>
                  <LinearGradient colors={['#F3F4F6', '#E5E7EB', '#F3F4F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.skeletonGradient} />
                  <ActivityIndicator size="large" color="#4F46E5" style={styles.skeletonSpinner} />
                </View>
              )}
            </>
          )
        ) : (
          // Off-screen placeholder (lightweight)
          <View style={styles.cardMedia} />
        )}

        {mediaError && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        {/* Gradient for readability */}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']} style={styles.gradientOverlay} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />

        {/* View count badge */}
        <View style={styles.viewCountContainer}>
          <View style={styles.viewCountBadge}>
            <Ionicons name="eye" size={14} color="#FFFFFF" style={styles.eyeIcon} />
            <ThemedText style={[styles.viewCountText, { fontSize: typography.viewCountText }]}>{item.viewCount}</ThemedText>
          </View>
        </View>

        {/* Product plate (bottom) */}
        <View style={styles.productPlateWrapper}>
          <View style={styles.productPlate}>
            <Image source={{ uri: item.productThumb || 'https://cdn-icons-png.flaticon.com/512/565/565547.png' }} style={styles.productThumb} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <ThemedText numberOfLines={1} style={styles.productTitle}>
                {item.productTitle || item.category || 'Product'}
              </ThemedText>
              <ThemedText style={styles.productPrice}>{item.productPrice || ''}</ThemedText>
            </View>
          </View>
        </View>

        {/* Optional description/read more (usually hidden) */}
        {showDescriptions && (
          <View style={styles.contentArea}>
            <ThemedText style={[styles.descriptionText, { fontSize: typography.descriptionText }]} numberOfLines={2}>
              {displayDescription}
            </ThemedText>
            {showReadMore && (
              <TouchableOpacity onPress={() => onReadMorePress(item)} activeOpacity={0.7} style={styles.readMoreButton}>
                <ThemedText style={[styles.readMoreText, { fontSize: typography.readMoreText }]}>Read more</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

export default function UGCSection({
  title = 'UGC',
  images = defaultImages,
  onViewAllPress,
  onImagePress,
  onReadMorePress,
  cardAspectRatio = 9 / 16, // tall portrait
  showDescriptions = false,
  maxDescriptionLength = 120,
}: UGCSectionProps) {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isSmallPhone = width < 375;

  const getCardDimensions = () => {
    let cardsPerView: number;
    let horizontalPadding: number;

    if (isLargeTablet) {
      cardsPerView = 3.2;
      horizontalPadding = 28;
    } else if (isTablet) {
      cardsPerView = 2.6;
      horizontalPadding = 24;
    } else if (isSmallPhone) {
      cardsPerView = 1.7;
      horizontalPadding = 18;
    } else {
      cardsPerView = 2.0;
      horizontalPadding = 20;
    }

    const availableWidth = width - horizontalPadding * 2;
    const cardWidth = availableWidth / cardsPerView;
    const cardHeight = cardWidth / cardAspectRatio;
    return { cardWidth, cardHeight, horizontalPadding };
  };

  const { cardWidth, cardHeight, horizontalPadding } = getCardDimensions();
  const cardSpacing = isTablet ? 18 : isSmallPhone ? 12 : 14;

  const getTypographySizes = () => {
    if (isLargeTablet) {
      return { sectionTitle: 28, viewAllText: 16, descriptionText: 15, readMoreText: 14, viewCountText: 13 };
    } else if (isTablet) {
      return { sectionTitle: 26, viewAllText: 16, descriptionText: 15, readMoreText: 14, viewCountText: 12 };
    } else if (isSmallPhone) {
      return { sectionTitle: 20, viewAllText: 14, descriptionText: 13, readMoreText: 12, viewCountText: 11 };
    } else {
      return { sectionTitle: 24, viewAllText: 15, descriptionText: 14, readMoreText: 13, viewCountText: 12 };
    }
  };
  const typography = getTypographySizes();

  // Visibility tracking (stable identity for FlatList)
  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  // memoize config so identity is stable across renders
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 40, minimumViewTime: 150 }), []);

  // ref to hold the latest handler logic (updateable without changing callback identity)
  const viewableHandlerRef = useRef((info: { viewableItems: any[] }) => {
    const ids = info.viewableItems.map((v: any) => v.item.id);
    setVisibleItems(ids);
  });

  // keep the ref current (can include other dependencies if needed)
  useEffect(() => {
    viewableHandlerRef.current = (info: { viewableItems: any[] }) => {
      const ids = info.viewableItems.map((v: any) => v.item.id);
      setVisibleItems(ids);
    };
  }, []);

  // a stable wrapper passed to FlatList (never recreated)
  const stableOnViewableItemsChanged = useCallback((info: { viewableItems: any[]; changed?: any[] }) => {
    viewableHandlerRef.current(info);
  }, []);

  const getTruncatedDescription = (description: string, maxLength: number) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    const truncated = description.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > maxLength * 0.7) return truncated.substring(0, lastSpaceIndex).trim() + '...';
    return truncated.trim() + '...';
  };
  const needsTruncation = (description: string, maxLength: number) => !!description && description.length > maxLength;

  const handleReadMore = (item: UGCImage) => {
    if (onReadMorePress) onReadMorePress(item.id, item.readMoreUrl);
    else onImagePress?.(item.id);
  };

  const renderItem = useCallback(
    ({ item }: { item: UGCImage }) => (
      <UGCCard
        item={item}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        typography={typography}
        showDescriptions={showDescriptions}
        maxDescriptionLength={maxDescriptionLength}
        visibleItems={visibleItems}
        onImagePress={onImagePress}
        onReadMorePress={handleReadMore}
        getTruncatedDescription={getTruncatedDescription}
        needsTruncation={needsTruncation}
      />
    ),
    [cardWidth, cardHeight, typography, showDescriptions, maxDescriptionLength, visibleItems, onImagePress]
  );

  // debug: confirm expo-av Video import exists
  useEffect(() => {
     
    console.log('expo-av Video available:', !!Video);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <ThemedText style={[styles.sectionTitle, { fontSize: typography.sectionTitle }]}>{title}</ThemedText>
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          accessibilityLabel="View all user generated content"
          accessibilityRole="button"
          accessibilityHint={`Browse all ${images.length} posts`}
        >
          <ThemedText style={[styles.viewAllText, { fontSize: typography.viewAllText }]}>View all</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.imagesList, { paddingHorizontal: horizontalPadding }]}
        ItemSeparatorComponent={() => <View style={{ width: cardSpacing }} />}
        snapToInterval={cardWidth + cardSpacing}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: cardWidth + cardSpacing, offset: (cardWidth + cardSpacing) * index, index })}
        removeClippedSubviews
        maxToRenderPerBatch={isTablet ? 4 : 3}
        windowSize={isTablet ? 6 : 5}
        initialNumToRender={isTablet ? 3 : 2}
        updateCellsBatchingPeriod={60}
        disableIntervalMomentum
        onViewableItemsChanged={stableOnViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        accessibilityLabel={`Fashion inspiration carousel with ${images.length} posts`}
        accessibilityRole="list"
        scrollEventThrottle={80}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    opacity: 0.9,
  },
  imagesList: {
    paddingVertical: 2,
  },

  // Card
  cardContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardMedia: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },

  // Overlays
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '52%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  viewCountContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  viewCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  eyeIcon: { marginRight: 4 },
  viewCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Product plate
  productPlateWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  productPlate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  productThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  productTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  productPrice: {
    color: '#FF5F7A',
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 2,
  },

  // Optional description (usually hidden)
  contentArea: {
    position: 'absolute',
    bottom: 68,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 21,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  readMoreButton: { alignSelf: 'flex-start', marginTop: 8 },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5FD9',
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Loading/Error
  skeletonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    overflow: 'hidden',
  },
  skeletonGradient: {
    flex: 1,
    opacity: 0.7,
  },
  skeletonSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
});
