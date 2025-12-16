/**
 * CashStoreHeroBanner Component
 *
 * Hero banner section for Cash Store with promotional content
 */

import React, { memo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CashStoreHeroBanner as HeroBannerType } from '../../../types/cash-store.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

interface CashStoreHeroBannerProps {
  banners: HeroBannerType[];
  isLoading?: boolean;
  onBannerPress?: (banner: HeroBannerType) => void;
}

const CashStoreHeroBanner: React.FC<CashStoreHeroBannerProps> = ({
  banners,
  isLoading = false,
  onBannerPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / BANNER_WIDTH);
    setActiveIndex(index);
  }, []);

  const renderBanner = useCallback(
    ({ item }: { item: HeroBannerType }) => (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onBannerPress?.(item)}
        style={styles.bannerWrapper}
      >
        <LinearGradient
          colors={item.gradientColors || ['#FF9F1C', '#F77F00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          {/* Badge */}
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.bannerContent}>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: item.textColor }]}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={[styles.subtitle, { color: item.textColor }]}>
                  {item.subtitle}
                </Text>
              )}

              {/* CTA Button */}
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaText}>{item.ctaText}</Text>
                <Ionicons name="arrow-forward" size={16} color="#00C06A" />
              </TouchableOpacity>
            </View>

            {/* Icon/Image */}
            <View style={styles.iconContainer}>
              <Ionicons name="cart" size={60} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    ),
    [onBannerPress]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.bannerWrapper, styles.skeletonBanner]}>
          <LinearGradient
            colors={['#E5E7EB', '#F3F4F6']}
            style={styles.bannerCard}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH + 8}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
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
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  bannerWrapper: {
    width: BANNER_WIDTH,
    marginRight: 8,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#00C06A',
  },
  skeletonBanner: {
    marginHorizontal: 16,
  },
});

export default memo(CashStoreHeroBanner);
