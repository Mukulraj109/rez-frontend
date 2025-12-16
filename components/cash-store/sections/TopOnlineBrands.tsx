/**
 * TopOnlineBrands Component
 *
 * Premium 3x3 grid of top online brands with cashback percentages
 * Features: Animated cards, gradient badges, ripple effects, Popular/Hot badges
 */

import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CashStoreBrand } from '../../../types/cash-store.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3; // 16px padding on each side + 8px gaps

interface TopOnlineBrandsProps {
  brands: CashStoreBrand[];
  isLoading?: boolean;
  onBrandPress: (brand: CashStoreBrand) => void;
  onViewAllPress: () => void;
  totalBrandsCount?: number;
}

const BrandCard: React.FC<{
  brand: CashStoreBrand;
  index: number;
  onPress: () => void;
}> = memo(({ brand, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const isPopular = brand.isTopBrand || brand.isFeatured;
  const isHot = brand.cashbackRate && brand.cashbackRate >= 10;

  return (
    <Animated.View
      style={[
        styles.brandCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.brandCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Popular/Hot Badge */}
        {(isPopular || isHot) && (
          <View style={[styles.statusBadge, isHot ? styles.hotBadge : styles.popularBadge]}>
            <Ionicons
              name={isHot ? 'flame' : 'star'}
              size={8}
              color="#FFFFFF"
            />
            <Text style={styles.statusBadgeText}>
              {isHot ? 'HOT' : 'POPULAR'}
            </Text>
          </View>
        )}

        {/* Logo Container */}
        <View style={styles.brandLogoContainer}>
          {brand.logo ? (
            <Image
              source={{ uri: brand.logo }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          ) : (
            <LinearGradient
              colors={['#00C06A', '#059669']}
              style={styles.brandLogoPlaceholder}
            >
              <Text style={styles.brandInitial}>{brand.name.charAt(0)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Brand Name */}
        <Text style={styles.brandName} numberOfLines={1}>
          {brand.name}
        </Text>

        {/* Cashback Badge */}
        <LinearGradient
          colors={['#00C06A', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cashbackBadge}
        >
          <Text style={styles.cashbackText}>
            Up to {brand.cashbackRate || 0}%
          </Text>
        </LinearGradient>

        {/* Rating */}
        {brand.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{brand.rating.toFixed(1)}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const SkeletonCard: React.FC<{ index: number }> = memo(({ index }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  return (
    <View style={styles.brandCardWrapper}>
      <Animated.View
        style={[
          styles.brandCard,
          {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          },
        ]}
      >
        <View style={[styles.brandLogoContainer, styles.skeleton]} />
        <View style={[styles.skeletonText, { width: 50 }]} />
        <View style={styles.skeletonBadge} />
      </Animated.View>
    </View>
  );
});

// Empty State Component
const EmptyState: React.FC<{ onViewAllPress: () => void }> = memo(({ onViewAllPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7']}
        style={styles.emptyStateGradient}
      >
        <View style={styles.emptyIconContainer}>
          <LinearGradient
            colors={['#00C06A', '#059669']}
            style={styles.emptyIconGradient}
          >
            <Ionicons name="storefront-outline" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.emptyStateTitle}>Discover Top Brands</Text>
        <Text style={styles.emptyStateSubtitle}>
          Shop from popular online brands and earn cashback on every purchase
        </Text>
        <TouchableOpacity
          onPress={onViewAllPress}
          style={styles.emptyStateCTA}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00C06A', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyStateCTAGradient}
          >
            <Text style={styles.emptyStateCTAText}>Explore Brands</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
});

const TopOnlineBrands: React.FC<TopOnlineBrandsProps> = ({
  brands,
  isLoading = false,
  onBrandPress,
  onViewAllPress,
  totalBrandsCount,
}) => {
  const displayBrands = brands.slice(0, 9); // Max 9 for 3x3 grid
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate display count - show actual count or 1000+ if totalBrandsCount is provided
  const displayCount = totalBrandsCount
    ? (totalBrandsCount >= 1000 ? '1000+' : `${totalBrandsCount}+`)
    : (brands.length > 0 ? `${brands.length}+` : null);

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Don't render the section if not loading and no brands
  const hasNoBrands = !isLoading && brands.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Top Online Brands</Text>
            {displayCount && (
              <View style={styles.brandCountBadge}>
                <Text style={styles.brandCountText}>{displayCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>Earn cashback on every purchase</Text>
        </View>
        <TouchableOpacity
          onPress={onViewAllPress}
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <View style={styles.viewAllArrow}>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Content - Grid or Empty State */}
      {hasNoBrands ? (
        <EmptyState onViewAllPress={onViewAllPress} />
      ) : (
        <View style={styles.grid}>
          {isLoading
            ? Array.from({ length: 9 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} index={index} />
              ))
            : displayBrands.map((brand, index) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  index={index}
                  onPress={() => onBrandPress(brand)}
                />
              ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 24,
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  brandCountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  brandCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  viewAllArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  brandCardWrapper: {
    width: CARD_WIDTH,
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  brandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
    zIndex: 1,
  },
  popularBadge: {
    backgroundColor: '#8B5CF6',
  },
  hotBadge: {
    backgroundColor: '#EF4444',
  },
  statusBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  brandLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandLogo: {
    width: 40,
    height: 40,
  },
  brandLogoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  cashbackBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cashbackText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonBadge: {
    width: 60,
    height: 22,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  // Empty state styles
  emptyStateContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyStateCTA: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyStateCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyStateCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(TopOnlineBrands);
