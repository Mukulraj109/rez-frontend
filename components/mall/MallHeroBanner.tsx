/**
 * MallHeroBanner Component
 *
 * Auto-rotating carousel with promotional banners
 */

import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBanner } from '../../types/mall.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 180;
const AUTO_SCROLL_INTERVAL = 5000;

interface MallHeroBannerProps {
  banners: MallBanner[];
  isLoading?: boolean;
  onBannerPress?: (banner: MallBanner) => void;
}

const MallHeroBanner: React.FC<MallHeroBannerProps> = ({
  banners,
  isLoading = false,
  onBannerPress,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (banners.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex, banners.length]);

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_WIDTH);
    if (index !== currentIndex && index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, banners.length]);

  const handleBannerPress = useCallback((banner: MallBanner) => {
    onBannerPress?.(banner);
  }, [onBannerPress]);

  // Helper to check if string is a valid image URL
  const isValidImageUrl = useCallback((url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image');
  }, []);

  const renderBanner = useCallback(({ item }: { item: MallBanner }) => {
    const gradientColors = item.gradientColors || ['#00C06A', '#00A05A'];
    const hasValidImage = isValidImageUrl(item.image);

    return (
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          {/* Banner Image (if available and valid URL) */}
          {hasValidImage && (
            <Image
              source={{ uri: item.image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          )}

          {/* Dark Overlay for better text visibility */}
          <View style={styles.darkOverlay} />

          {/* Content Overlay */}
          <View style={styles.bannerContent}>
            {/* Badge */}
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}

            {/* Title */}
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Subtitle */}
            {item.subtitle && (
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            )}

            {/* CTA Button */}
            {item.ctaText && (
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => handleBannerPress(item)}
              >
                <Text style={styles.ctaButtonText}>{item.ctaText}</Text>
                <Ionicons name="arrow-forward" size={16} color="#00C06A" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [handleBannerPress, isValidImageUrl]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E5E7EB', '#F3F4F6']}
          style={styles.loadingSkeleton}
        >
          <ActivityIndicator size="large" color="#00C06A" />
        </LinearGradient>
      </View>
    );
  }

  // Empty state
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id || item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bannerGradient: {
    flex: 1,
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: -2,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C06A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: -10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
    lineHeight: 35,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#00C06A',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  loadingSkeleton: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(MallHeroBanner);
