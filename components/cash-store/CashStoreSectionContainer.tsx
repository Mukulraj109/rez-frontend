/**
 * CashStoreSectionContainer Component
 *
 * Main container that orchestrates all Cash Store sections
 * with pull-to-refresh and loading states.
 *
 * Cash Store = Affiliate Cashback System
 * - External brand websites (Amazon, Myntra, Flipkart, etc.)
 * - Users click through and shop on external sites
 * - Brand sends webhook when purchase is made
 * - Users earn real cashback (rupees)
 *
 * NOTE: This is different from ReZ Mall (in-app delivery marketplace with ReZ Coins)
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useRouter } from 'expo-router';
import { useCashStoreSection } from '../../hooks/useCashStoreSection';
import cashStoreApi from '../../services/cashStoreApi';
import {
  CashStoreBrand,
  TrendingDeal,
  GiftCardBrand,
  CashStoreCoupon,
  HighCashbackDeal,
  TravelDeal,
  CashbackActivity,
  CashStoreCategoryFilterKey,
} from '../../types/cash-store.types';

// Section Components
import CashStoreHeroBanner from './sections/CashStoreHeroBanner';
import CashStoreQuickActions from './sections/CashStoreQuickActions';
import CategoryFilterRow from './sections/CategoryFilterRow';
import TopOnlineBrands from './sections/TopOnlineBrands';
import TrendingCashback from './sections/TrendingCashback';
import BuyCouponSection from './sections/BuyCouponSection';
import BestCouponCodes from './sections/BestCouponCodes';
import HighCashbackDeals from './sections/HighCashbackDeals';
import TravelBookingDeals from './sections/TravelBookingDeals';
import HowItWorksPreview from './sections/HowItWorksPreview';
import CashbackActivitySection from './sections/CashbackActivitySection';
import CashStoreSkeleton from './skeletons/CashStoreSkeleton';

interface CashStoreSectionContainerProps {
  onScrollToTop?: () => void;
}

const CashStoreSectionContainer: React.FC<CashStoreSectionContainerProps> = ({
  onScrollToTop,
}) => {
  const router = useRouter();
  const {
    cashbackSummary,
    heroBanners,
    quickActions,
    topBrands,
    trendingDeals,
    giftCardBrands,
    couponCodes,
    highCashbackDeals,
    travelDeals,
    recentActivity,
    selectedCategory,
    setSelectedCategory,
    filteredTopBrands,
    isLoading,
    isRefreshing,
    error,
    refresh,
    trackBrandClick,
    copyCouponCode,
    navigateToBrand,
  } = useCashStoreSection();

  // Navigation handlers
  const handleBrandPress = useCallback(
    (brand: CashStoreBrand) => {
      navigateToBrand(brand);
    },
    [navigateToBrand]
  );

  const handleTrendingDealPress = useCallback(
    async (deal: TrendingDeal) => {
      trackBrandClick(deal.brand.id);

      // If deal has external URL, track affiliate click and open in browser
      if (deal.externalUrl) {
        try {
          const trackingResult = await cashStoreApi.trackAffiliateClick(deal.brand.id);
          const urlToOpen = trackingResult?.trackingUrl || deal.externalUrl;

          await WebBrowser.openBrowserAsync(urlToOpen, {
            toolbarColor: '#00C06A',
            controlsColor: '#FFFFFF',
          });
        } catch (error) {
          console.error('[Cash Store] Error opening trending deal:', error);
          if (deal.externalUrl) {
            await Linking.openURL(deal.externalUrl);
          }
        }
      } else {
        // Navigate to in-app offer detail
        router.push(`/offers/${deal.id}` as any);
      }
    },
    [router, trackBrandClick]
  );

  const handleGiftCardPress = useCallback(
    (brand: GiftCardBrand) => {
      router.push(`/vouchers/brand/${brand.id}` as any);
    },
    [router]
  );

  const handleCouponCopy = useCallback(
    (coupon: CashStoreCoupon) => {
      copyCouponCode(coupon.code);
    },
    [copyCouponCode]
  );

  const handleHighCashbackPress = useCallback(
    async (deal: HighCashbackDeal) => {
      trackBrandClick(deal.brand.id);

      // If deal has external URL, track affiliate click and open in browser
      if (deal.externalUrl) {
        try {
          const trackingResult = await cashStoreApi.trackAffiliateClick(deal.brand.id);
          const urlToOpen = trackingResult?.trackingUrl || deal.externalUrl;

          await WebBrowser.openBrowserAsync(urlToOpen, {
            toolbarColor: '#00C06A',
            controlsColor: '#FFFFFF',
          });
        } catch (error) {
          console.error('[Cash Store] Error opening high cashback deal:', error);
          if (deal.externalUrl) {
            await Linking.openURL(deal.externalUrl);
          }
        }
      } else {
        // Navigate to offers page
        router.push(`/offers` as any);
      }
    },
    [router, trackBrandClick]
  );

  const handleTravelDealPress = useCallback(
    (deal: TravelDeal) => {
      // Navigate to travel section or external
      router.push(`/travel/${deal.category}` as any);
    },
    [router]
  );

  const handleActivityPress = useCallback(
    (activity: CashbackActivity) => {
      router.push(`/account/cashback` as any);
    },
    [router]
  );

  const handleLearnMore = useCallback(() => {
    router.push('/how-cash-store-works' as any);
  }, [router]);

  const handleQuickActionPress = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'buy-coupons':
          router.push('/online-vouchers' as any);
          break;
        case 'extra-coins':
          router.push('/offers?filter=bonus-coins' as any);
          break;
        case 'trending':
          router.push('/offers?filter=trending' as any);
          break;
        case 'track-cashback':
          router.push('/account/cashback' as any);
          break;
      }
    },
    [router]
  );

  // Category filter handler
  const handleCategorySelect = useCallback(
    (category: CashStoreCategoryFilterKey) => {
      setSelectedCategory(category);
    },
    [setSelectedCategory]
  );

  // View all handlers
  const handleViewAllBrands = useCallback(() => {
    router.push('/cash-store/brands' as any);
  }, [router]);

  const handleViewAllTrending = useCallback(() => {
    router.push('/offers?filter=trending' as any);
  }, [router]);

  const handleViewAllGiftCards = useCallback(() => {
    router.push('/online-vouchers' as any);
  }, [router]);

  const handleViewAllCoupons = useCallback(() => {
    router.push('/coupons' as any);
  }, [router]);

  const handleViewAllHighCashback = useCallback(() => {
    router.push('/offers?filter=high-cashback' as any);
  }, [router]);

  const handleViewAllTravel = useCallback(() => {
    router.push('/travel' as any);
  }, [router]);

  const handleViewAllActivity = useCallback(() => {
    router.push('/account/cashback' as any);
  }, [router]);

  // Error state
  if (error && !isLoading && !topBrands.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load Cash Store</Text>
        <Text style={styles.errorSubtext}>Pull down to try again</Text>
      </View>
    );
  }

  // Initial loading state with skeleton
  if (isLoading && !topBrands.length && !giftCardBrands.length) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <CashStoreSkeleton />
      </ScrollView>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Gradient Background - Starts from HomeTabSection's end color for seamless transition */}
      <LinearGradient
        colors={['#4ADE80', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5', '#F9FAFB', '#FFFFFF']}
        locations={[0, 0.08, 0.2, 0.35, 0.5, 0.7, 1]}
        style={styles.gradientBackground}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#00C06A"
            colors={['#00C06A']}
          />
        }
      >
        {/* 1. Hero Banner */}
      <CashStoreHeroBanner
        banners={heroBanners}
        isLoading={isLoading && !heroBanners.length}
      />

      {/* 3. Quick Actions */}
      <CashStoreQuickActions
        actions={quickActions}
        onActionPress={handleQuickActionPress}
      />

      {/* 4. Top Categories - Category Filter */}
      <CategoryFilterRow
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        isLoading={isLoading && !topBrands.length}
      />

      {/* 5. Top Online Brands - Filtered by category */}
      <TopOnlineBrands
        brands={filteredTopBrands}
        isLoading={isLoading && !topBrands.length}
        onBrandPress={handleBrandPress}
        onViewAllPress={handleViewAllBrands}
        activeFilter={selectedCategory}
        onResetFilter={() => setSelectedCategory('all')}
      />

      {/* 5. Trending Cashback */}
      <TrendingCashback
        deals={trendingDeals}
        isLoading={isLoading && !trendingDeals.length}
        onDealPress={handleTrendingDealPress}
        onViewAllPress={handleViewAllTrending}
      />

      {/* 6. Buy Coupon & Save */}
      <BuyCouponSection
        brands={giftCardBrands}
        isLoading={isLoading && !giftCardBrands.length}
        onBrandPress={handleGiftCardPress}
        onViewAllPress={handleViewAllGiftCards}
      />

      {/* 7. Best Coupon Codes */}
      <BestCouponCodes
        coupons={couponCodes}
        isLoading={isLoading && !couponCodes.length}
        onCouponCopy={handleCouponCopy}
        onViewAllPress={handleViewAllCoupons}
      />

      {/* 8. High Cashback Deals */}
      <HighCashbackDeals
        deals={highCashbackDeals}
        isLoading={isLoading && !highCashbackDeals.length}
        onDealPress={handleHighCashbackPress}
        onViewAllPress={handleViewAllHighCashback}
      />

      {/* 9. Travel & Booking Deals */}
      <TravelBookingDeals
        deals={travelDeals}
        isLoading={isLoading && !travelDeals.length}
        onDealPress={handleTravelDealPress}
        onViewAllPress={handleViewAllTravel}
      />

      {/* 10. How It Works */}
      <HowItWorksPreview onLearnMore={handleLearnMore} />

      {/* 11. Cashback Activity */}
      <CashbackActivitySection
        activities={recentActivity}
        isLoading={isLoading && !recentActivity.length}
        onActivityPress={handleActivityPress}
        onViewAllPress={handleViewAllActivity}
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
    bottom: 0, // Gradient covers full container
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make transparent to show gradient
  },
  contentContainer: {
    paddingTop: 0,
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
  bottomSpacer: {
    height: 40,
  },
});

export default memo(CashStoreSectionContainer);
