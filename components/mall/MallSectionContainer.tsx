/**
 * MallSectionContainer Component
 *
 * Main container that orchestrates all mall sections
 * with pull-to-refresh and loading states.
 *
 * ReZ Mall = In-app delivery marketplace
 * - Fetches stores with deliveryCategories.mall === true
 * - Users browse stores, order products, earn ReZ Coins
 * - Navigates to /store/[storeId] for store pages
 *
 * NOTE: This is different from Cash Store (affiliate cashback for external websites)
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useMallSection } from '../../hooks/useMallSection';
import {
  MallBrand,
  MallCategory,
  MallCollection,
  MallOffer,
  MallBanner,
} from '../../types/mall.types';

// Section Components
import MallHeroBanner from './MallHeroBanner';
import MallFeaturedBrands from './MallFeaturedBrands';
import MallCollections from './MallCollections';
import MallCategoriesGrid from './MallCategoriesGrid';
import MallExclusiveOffers from './MallExclusiveOffers';
import MallNewArrivals from './MallNewArrivals';
import MallTopRated from './MallTopRated';
import MallLuxuryZone from './MallLuxuryZone';

interface MallSectionContainerProps {
  onScrollToTop?: () => void;
}

const MallSectionContainer: React.FC<MallSectionContainerProps> = ({
  onScrollToTop,
}) => {
  const router = useRouter();
  const {
    heroBanners,
    featuredBrands,
    collections,
    categories,
    exclusiveOffers,
    newArrivals,
    topRatedBrands,
    luxuryBrands,
    isLoading,
    isRefreshing,
    error,
    refresh,
    trackBrandClick,
  } = useMallSection();

  // Navigation handlers
  const handleBrandPress = useCallback(
    (brand: MallBrand) => {
      const storeId = brand.id || brand._id;
      trackBrandClick(storeId);

      // ReZ Mall navigates to in-app store page (not external brand page)
      // The store page shows products, allows ordering, and users earn ReZ Coins
      router.push(`/MainStorePage?storeId=${storeId}` as any);
    },
    [router, trackBrandClick]
  );

  const handleCategoryPress = useCallback(
    (category: MallCategory) => {
      // Navigate to category page
      router.push(`/mall/category/${category.slug}` as any);
    },
    [router]
  );

  const handleCollectionPress = useCallback(
    (collection: MallCollection) => {
      // Navigate to collection page
      router.push(`/mall/collection/${collection.slug}` as any);
    },
    [router]
  );

  const handleOfferPress = useCallback(
    (offer: MallOffer) => {
      // Navigate to offer details or brand
      if (offer.brand) {
        const brandId = offer.brand.id || offer.brand._id;
        router.push(`/mall/brand/${brandId}` as any);
      }
    },
    [router]
  );

  const handleBannerPress = useCallback(
    (banner: MallBanner) => {
      // Navigate based on banner CTA URL
      if (banner.ctaUrl) {
        // Handle deep link or internal navigation
        console.log('Banner CTA pressed:', banner.ctaUrl);
      }
    },
    []
  );

  // View all handlers
  const handleViewAllFeatured = useCallback(() => {
    router.push('/mall/brands?filter=featured' as any);
  }, [router]);

  const handleViewAllCollections = useCallback(() => {
    router.push('/mall/collections' as any);
  }, [router]);

  const handleViewAllCategories = useCallback(() => {
    router.push('/mall/categories' as any);
  }, [router]);

  const handleViewAllOffers = useCallback(() => {
    router.push('/mall/offers' as any);
  }, [router]);

  const handleViewAllNewArrivals = useCallback(() => {
    router.push('/mall/brands?filter=new' as any);
  }, [router]);

  const handleViewAllTopRated = useCallback(() => {
    router.push('/mall/brands?filter=top-rated' as any);
  }, [router]);

  const handleViewAllLuxury = useCallback(() => {
    router.push('/mall/brands?filter=luxury' as any);
  }, [router]);

  // Quick actions handlers for new pages
  const handleAllianceStores = useCallback(() => {
    router.push('/mall/alliance-store' as any);
  }, [router]);

  const handleLowestPrice = useCallback(() => {
    router.push('/mall/lowest-price' as any);
  }, [router]);

  // Debug logging
  console.log('[MallSectionContainer] State:', {
    isLoading,
    isRefreshing,
    error,
    bannersCount: heroBanners.length,
    featuredCount: featuredBrands.length,
    categoriesCount: categories.length
  });

  // Error state
  if (error && !isLoading && !heroBanners.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load mall content</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Text style={styles.errorSubtext}>Pull down to try again</Text>
      </View>
    );
  }

  // Initial loading state
  if (isLoading && !heroBanners.length && !featuredBrands.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C06A" />
        <Text style={styles.loadingText}>Loading ReZ Mall...</Text>
      </View>
    );
  }

  // Empty state (no data after loading)
  const hasNoData = !isLoading &&
    !heroBanners.length &&
    !featuredBrands.length &&
    !categories.length &&
    !collections.length;

  if (hasNoData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No mall content available</Text>
        <Text style={styles.emptySubtext}>
          Run the seed script to populate mall data
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Gradient Background - Starts from HomeTabSection's end color for seamless transition */}
      <LinearGradient
        colors={['#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5', '#F9FAFB', '#FFFFFF']}
        locations={[0, 0.08, 0.2, 0.35, 0.5, 0.7, 1]}
        style={styles.gradientBackground}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#00C06A"
            colors={['#00C06A']}
          />
        }
      >
        {/* Hero Banner moved to header area - MallHeroCarousel in index.tsx */}

      {/* Mall Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.quickActionsTitle}>Quick Access</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleAllianceStores}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="link" size={24} color="#FFF" />
              <Text style={styles.quickActionText}>Alliance</Text>
              <Text style={styles.quickActionSubtext}>Partner stores</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleLowestPrice}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.quickActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="pricetag" size={24} color="#FFF" />
              <Text style={styles.quickActionText}>Lowest Price</Text>
              <Text style={styles.quickActionSubtext}>Price guarantee</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Featured Brands */}
      <MallFeaturedBrands
        brands={featuredBrands}
        isLoading={isLoading && !featuredBrands.length}
        onBrandPress={handleBrandPress}
        onViewAllPress={handleViewAllFeatured}
      />

      {/* 3. Curated Collections */}
      <MallCollections
        collections={collections}
        isLoading={isLoading && !collections.length}
        onCollectionPress={handleCollectionPress}
        onViewAllPress={handleViewAllCollections}
      />

      {/* 4. Categories Grid */}
      <MallCategoriesGrid
        categories={categories}
        isLoading={isLoading && !categories.length}
        onCategoryPress={handleCategoryPress}
        onViewAllPress={handleViewAllCategories}
      />

      {/* 5. Exclusive Offers */}
      <MallExclusiveOffers
        offers={exclusiveOffers}
        isLoading={isLoading && !exclusiveOffers.length}
        onOfferPress={handleOfferPress}
        onViewAllPress={handleViewAllOffers}
      />

      {/* 6. New Arrivals */}
      <MallNewArrivals
        brands={newArrivals}
        isLoading={isLoading && !newArrivals.length}
        onBrandPress={handleBrandPress}
        onViewAllPress={handleViewAllNewArrivals}
      />

      {/* 7. Top Rated Brands */}
      <MallTopRated
        brands={topRatedBrands}
        isLoading={isLoading && !topRatedBrands.length}
        onBrandPress={handleBrandPress}
        onViewAllPress={handleViewAllTopRated}
        limit={5}
      />

      {/* 8. Luxury Zone */}
      <MallLuxuryZone
        brands={luxuryBrands}
        isLoading={isLoading && !luxuryBrands.length}
        onBrandPress={handleBrandPress}
        onViewAllPress={handleViewAllLuxury}
      />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Gradient covers full screen
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make transparent to show gradient
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});

export default memo(MallSectionContainer);
