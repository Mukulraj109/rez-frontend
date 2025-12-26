/**
 * OffersPageContent Component
 *
 * Shared content layout for both Near U and Prive pages
 * Uses real API data only - shows empty placeholders when no data available
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOffersTheme } from '@/contexts/OffersThemeContext';
import { OffersTabs } from './OffersTabs';
import {
  // Offers Tab
  LightningDealsSection,
  NearbyOffersSection,
  TodaysOffersSection,
  DiscountBucketsSection,
  TrendingNowSection,
  AIRecommendedSection,
  FriendsRedeemedSection,
  HotspotDealsSection,
  LastChanceSection,
  NewTodaySection,
  SalesClearanceSection,
  BOGOSection,
  FreeDeliverySection,
  // Cashback Tab
  SuperCashbackSection,
  DoubleCashbackBanner,
  CoinDropsSection,
  UploadBillSection,
  BankOffersSection,
  // Exclusive Tab
  ExclusiveCategoriesGrid,
  LoyaltyProgressSection,
  SpecialProfilesSection,
  BirthdayBanner,
} from './sections';
import { OffersTabType, DiscountBucket, HotspotDeal, LightningDeal } from '@/types/offers.types';
import { useOffersData } from '@/hooks/useOffersData';
import { Spacing, Typography } from '@/constants/DesignSystem';

interface OffersPageContentProps {
  onRefresh?: () => Promise<void>;
}

export const OffersPageContent: React.FC<OffersPageContentProps> = ({
  onRefresh,
}) => {
  const { theme, isDark } = useOffersTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OffersTabType>('offers');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string | undefined>();
  const [selectedHotspot, setSelectedHotspot] = useState<string | undefined>();

  // Get real API data from hook
  const { apiData, loading, error, refreshData, isUsingRealApi } = useOffersData();

  // Navigation handlers for View All buttons
  const handleViewAllOffers = useCallback((category: string) => {
    router.push({
      pathname: '/offers/view-all',
      params: { category },
    } as any);
  }, [router]);

  const handleViewAllStores = useCallback((type: string) => {
    // Navigate to store list with filter
    router.push({
      pathname: '/StoreListPage',
      params: { filter: type },
    } as any);
  }, [router]);

  const handleNavigateTo = useCallback((path: string, params?: Record<string, string>) => {
    try {
      if (params) {
        router.push({ pathname: path, params } as any);
      } else {
        router.push(path as any);
      }
    } catch (error) {
      // If route doesn't exist, just log it
      console.log(`Navigation to ${path} not available yet`);
    }
  }, [router]);

  // Transform flash sales data to match LightningDeal interface
  const transformedLightningDeals = useMemo((): LightningDeal[] => {
    if (!apiData.lightningDeals || apiData.lightningDeals.length === 0) {
      return [];
    }

    return apiData.lightningDeals.map((flashSale: any) => {
      return {
        id: flashSale._id || flashSale.id,
        title: flashSale.title,
        subtitle: flashSale.description || '',
        image: flashSale.image,
        store: {
          id: flashSale.stores?.[0]?._id || flashSale.stores?.[0]?.id || '',
          name: flashSale.stores?.[0]?.name || 'Store',
          logo: flashSale.stores?.[0]?.logo || flashSale.image,
        },
        originalPrice: flashSale.originalPrice,
        discountedPrice: flashSale.flashSalePrice,
        discountPercentage: flashSale.discountPercentage,
        cashbackPercentage: flashSale.cashbackPercentage || 0,
        totalQuantity: flashSale.maxQuantity || 100,
        claimedQuantity: flashSale.soldQuantity || 0,
        endTime: flashSale.endTime,
        promoCode: flashSale.promoCode,
      };
    });
  }, [apiData.lightningDeals]);

  // Use only real API data - no dummy fallbacks
  const offersData = useMemo(() => ({
    lightningDeals: transformedLightningDeals,
    discountBuckets: apiData.discountBuckets || [],
    nearbyOffers: apiData.nearbyOffers || [],
    saleOffers: apiData.saleOffers || [],
    bogoOffers: apiData.bogoOffers || [],
    freeDeliveryOffers: apiData.freeDeliveryOffers || [],
    todaysOffers: apiData.todaysOffers || [],
    trendingOffers: apiData.trendingOffers || [],
    aiRecommendedOffers: apiData.aiRecommendedOffers || [],
    friendsRedeemed: apiData.friendsRedeemed || [],
    hotspotDeals: apiData.hotspots || [],
    lastChanceOffers: apiData.lastChanceOffers || [],
    newTodayOffers: apiData.newTodayOffers || [],
    // Cashback tab
    doubleCashbackCampaign: apiData.doubleCashback?.[0] || null,
    coinDrops: apiData.coinDrops || [],
    superCashbackStores: apiData.superCashbackStores || [],
    uploadBillStores: apiData.uploadBillStores || [],
    bankOffers: apiData.bankOffers || [],
    // Exclusive tab
    exclusiveCategories: apiData.exclusiveZones || [],
    specialProfiles: apiData.specialProfiles || [],
    loyaltyProgress: apiData.loyaltyMilestones || [],
  }), [apiData, transformedLightningDeals]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    // Refresh real API data
    refreshData();
    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, [onRefresh, refreshData]);

  const handleBucketPress = (bucket: DiscountBucket) => {
    // Toggle selection state for visual feedback
    const newSelection = selectedBucket === bucket.filterValue ? undefined : bucket.filterValue;
    setSelectedBucket(newSelection);

    // Navigate to filtered offers view
    if (newSelection) {
      router.push({
        pathname: '/offers/view-all',
        params: {
          category: bucket.filterValue === 'free_delivery' ? 'free-delivery' : 'discount',
          discount: bucket.filterValue,
          title: bucket.label,
        },
      } as any);
    }
  };

  const handleHotspotPress = (hotspot: HotspotDeal) => {
    setSelectedHotspot(
      selectedHotspot === hotspot.areaId ? undefined : hotspot.areaId
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: 100,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['4xl'],
    },
    emptyText: {
      ...Typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['4xl'],
      minHeight: 300,
    },
    // Empty section placeholder
    emptySectionContainer: {
      marginHorizontal: Spacing.base,
      marginVertical: Spacing.sm,
      padding: Spacing.lg,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptySectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    emptySectionSubtitle: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
  });

  // Empty section placeholder component
  const EmptySection = ({ title }: { title: string }) => (
    <View style={styles.emptySectionContainer}>
      <Text style={styles.emptySectionTitle}>No {title} Available</Text>
      <Text style={styles.emptySectionSubtitle}>Check back soon for new offers!</Text>
    </View>
  );

  const renderOffersTab = () => (
    <>
      {/* Lightning Deals */}
      {offersData.lightningDeals.length > 0 ? (
        <LightningDealsSection
          deals={offersData.lightningDeals}
          onViewAll={() => handleViewAllOffers('flash_sale')}
        />
      ) : (
        <EmptySection title="Lightning Deals" />
      )}

      {/* Discount Buckets */}
      {offersData.discountBuckets.length > 0 ? (
        <DiscountBucketsSection
          buckets={offersData.discountBuckets}
          selectedBucket={selectedBucket}
          onBucketPress={handleBucketPress}
        />
      ) : (
        <EmptySection title="Discount Buckets" />
      )}

      {/* Nearby Offers */}
      {offersData.nearbyOffers.length > 0 ? (
        <NearbyOffersSection
          offers={offersData.nearbyOffers}
          onViewAll={() => handleViewAllOffers('nearby')}
        />
      ) : (
        <EmptySection title="Nearby Offers" />
      )}

      {/* Sales & Clearance */}
      {offersData.saleOffers.length > 0 ? (
        <SalesClearanceSection
          offers={offersData.saleOffers}
          onViewAll={() => handleViewAllOffers('sale')}
        />
      ) : (
        <EmptySection title="Sales & Clearance" />
      )}

      {/* Buy 1 Get 1 */}
      {offersData.bogoOffers.length > 0 ? (
        <BOGOSection
          offers={offersData.bogoOffers}
          onViewAll={() => handleViewAllOffers('bogo')}
        />
      ) : (
        <EmptySection title="Buy 1 Get 1 Offers" />
      )}

      {/* Free Delivery */}
      {offersData.freeDeliveryOffers.length > 0 ? (
        <FreeDeliverySection
          offers={offersData.freeDeliveryOffers}
          onViewAll={() => handleViewAllOffers('free_delivery')}
        />
      ) : (
        <EmptySection title="Free Delivery Offers" />
      )}

      {/* Today's Offers */}
      {offersData.todaysOffers.length > 0 ? (
        <TodaysOffersSection
          offers={offersData.todaysOffers}
          onViewAll={() => handleViewAllOffers('today')}
        />
      ) : (
        <EmptySection title="Today's Offers" />
      )}

      {/* Trending Now */}
      {offersData.trendingOffers.length > 0 ? (
        <TrendingNowSection
          offers={offersData.trendingOffers}
          onViewAll={() => handleViewAllOffers('trending')}
        />
      ) : (
        <EmptySection title="Trending Offers" />
      )}

      {/* AI Recommended */}
      {offersData.aiRecommendedOffers.length > 0 ? (
        <AIRecommendedSection
          offers={offersData.aiRecommendedOffers}
          onViewAll={() => handleViewAllOffers('recommended')}
        />
      ) : (
        <EmptySection title="AI Recommended" />
      )}

      {/* Friends Redeemed */}
      {offersData.friendsRedeemed.length > 0 ? (
        <FriendsRedeemedSection
          offers={offersData.friendsRedeemed}
          onViewAll={() => handleViewAllOffers('friends_redeemed')}
        />
      ) : (
        <EmptySection title="Friends Redeemed" />
      )}

      {/* Hotspot Deals */}
      {offersData.hotspotDeals.length > 0 ? (
        <HotspotDealsSection
          hotspots={offersData.hotspotDeals}
          onHotspotPress={handleHotspotPress}
          selectedHotspot={selectedHotspot}
        />
      ) : (
        <EmptySection title="Hotspot Deals" />
      )}

      {/* Last Chance */}
      {offersData.lastChanceOffers.length > 0 ? (
        <LastChanceSection
          offers={offersData.lastChanceOffers}
          onViewAll={() => handleViewAllOffers('expiring')}
        />
      ) : (
        <EmptySection title="Last Chance Offers" />
      )}

      {/* New Today */}
      {offersData.newTodayOffers.length > 0 ? (
        <NewTodaySection
          offers={offersData.newTodayOffers}
          onViewAll={() => handleViewAllOffers('new_arrival')}
        />
      ) : (
        <EmptySection title="New Today" />
      )}
    </>
  );

  const renderCashbackTab = () => {
    const cashbackOffers = offersData.nearbyOffers.filter((o: any) => o.cashbackPercentage > 0);

    return (
      <>
        {/* Double Cashback Banner */}
        {offersData.doubleCashbackCampaign ? (
          <DoubleCashbackBanner
            campaign={offersData.doubleCashbackCampaign}
            onPress={() => handleNavigateTo('/cashback/double-cashback')}
          />
        ) : (
          <EmptySection title="Double Cashback Campaign" />
        )}

        {/* Big Coin Drops */}
        {offersData.coinDrops.length > 0 ? (
          <CoinDropsSection
            coinDrops={offersData.coinDrops}
            onViewAll={() => handleNavigateTo('/cashback/coin-drops')}
          />
        ) : (
          <EmptySection title="Coin Drops" />
        )}

        {/* Super Cashback Stores */}
        {offersData.superCashbackStores.length > 0 ? (
          <SuperCashbackSection
            stores={offersData.superCashbackStores}
            onViewAll={() => handleViewAllStores('super_cashback')}
          />
        ) : (
          <EmptySection title="Super Cashback Stores" />
        )}

        {/* Upload Bill, Earn Coins */}
        {offersData.uploadBillStores.length > 0 ? (
          <UploadBillSection
            stores={offersData.uploadBillStores}
            onViewAll={() => handleNavigateTo('/upload-bill')}
          />
        ) : (
          <EmptySection title="Upload Bill Stores" />
        )}

        {/* Bank & Wallet Offers */}
        {offersData.bankOffers.length > 0 ? (
          <BankOffersSection
            offers={offersData.bankOffers}
            onViewAll={() => handleNavigateTo('/bank-offers')}
          />
        ) : (
          <EmptySection title="Bank & Wallet Offers" />
        )}

        {/* Nearby Offers with Cashback */}
        {cashbackOffers.length > 0 ? (
          <NearbyOffersSection
            offers={cashbackOffers}
            onViewAll={() => handleViewAllOffers('cashback')}
          />
        ) : (
          <EmptySection title="Nearby Cashback Offers" />
        )}

        {/* Trending Cashback */}
        {offersData.trendingOffers.length > 0 ? (
          <TrendingNowSection
            offers={offersData.trendingOffers}
            onViewAll={() => handleViewAllOffers('trending')}
          />
        ) : (
          <EmptySection title="Trending Cashback" />
        )}
      </>
    );
  };

  const renderExclusiveTab = () => (
    <>
      {/* Birthday Week Banner - Always show for now, can be controlled by API later */}
      <BirthdayBanner
        isActive={true}
        daysRemaining={5}
        onPress={() => handleNavigateTo('/offers/zones/birthday')}
      />

      {/* Exclusive Categories Grid */}
      {offersData.exclusiveCategories.length > 0 ? (
        <ExclusiveCategoriesGrid categories={offersData.exclusiveCategories} />
      ) : (
        <EmptySection title="Exclusive Categories" />
      )}

      {/* Special Profiles */}
      {offersData.specialProfiles.length > 0 ? (
        <SpecialProfilesSection
          profiles={offersData.specialProfiles}
          onViewAll={() => handleNavigateTo('/special-profiles')}
        />
      ) : (
        <EmptySection title="Special Profiles" />
      )}

      {/* Loyalty Progress */}
      {offersData.loyaltyProgress.length > 0 ? (
        <LoyaltyProgressSection
          progress={offersData.loyaltyProgress}
          onViewAll={() => handleNavigateTo('/loyalty')}
        />
      ) : (
        <EmptySection title="Loyalty Progress" />
      )}

      {/* AI Picks - Exclusive */}
      {offersData.aiRecommendedOffers.length > 0 ? (
        <AIRecommendedSection
          offers={offersData.aiRecommendedOffers}
          onViewAll={() => handleViewAllOffers('exclusive')}
        />
      ) : (
        <EmptySection title="AI Picks" />
      )}

      {/* New Today */}
      {offersData.newTodayOffers.length > 0 ? (
        <NewTodaySection
          offers={offersData.newTodayOffers}
          onViewAll={() => handleViewAllOffers('new_arrival')}
        />
      ) : (
        <EmptySection title="New Today" />
      )}
    </>
  );

  const renderTabContent = () => {
    // Show loading state when data is being fetched
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          <Text style={[styles.emptyText, { marginTop: Spacing.md }]}>Loading offers...</Text>
        </View>
      );
    }

    // Show error state if there's an error
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'offers':
        return renderOffersTab();
      case 'cashback':
        return renderCashbackTab();
      case 'exclusive':
        return renderExclusiveTab();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <OffersTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent.primary}
            colors={[theme.colors.accent.primary]}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

export default OffersPageContent;
