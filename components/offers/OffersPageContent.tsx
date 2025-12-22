/**
 * OffersPageContent Component
 *
 * Shared content layout for both Near U and Prive pages
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
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
import { OffersTabType, DiscountBucket, HotspotDeal } from '@/types/offers.types';
import dummyData from '@/data/offersPageDummyData';
import { Spacing, Typography } from '@/constants/DesignSystem';

interface OffersPageContentProps {
  onRefresh?: () => Promise<void>;
}

export const OffersPageContent: React.FC<OffersPageContentProps> = ({
  onRefresh,
}) => {
  const { theme, isDark } = useOffersTheme();
  const [activeTab, setActiveTab] = useState<OffersTabType>('offers');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string | undefined>();
  const [selectedHotspot, setSelectedHotspot] = useState<string | undefined>();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, [onRefresh]);

  const handleBucketPress = (bucket: DiscountBucket) => {
    setSelectedBucket(
      selectedBucket === bucket.filterValue ? undefined : bucket.filterValue
    );
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
  });

  const renderOffersTab = () => (
    <>
      {/* Lightning Deals */}
      <LightningDealsSection
        deals={dummyData.lightningDeals}
        onViewAll={() => {}}
      />

      {/* Discount Buckets */}
      <DiscountBucketsSection
        buckets={dummyData.discountBuckets}
        selectedBucket={selectedBucket}
        onBucketPress={handleBucketPress}
      />

      {/* Nearby Offers */}
      <NearbyOffersSection
        offers={dummyData.nearbyOffers}
        onViewAll={() => {}}
      />

      {/* Sales & Clearance */}
      <SalesClearanceSection
        offers={dummyData.saleOffers}
        onViewAll={() => {}}
      />

      {/* Buy 1 Get 1 */}
      <BOGOSection
        offers={dummyData.bogoOffers}
        onViewAll={() => {}}
      />

      {/* Free Delivery */}
      <FreeDeliverySection
        offers={dummyData.freeDeliveryOffers}
        onViewAll={() => {}}
      />

      {/* Today's Offers */}
      <TodaysOffersSection
        offers={dummyData.todaysOffers}
        onViewAll={() => {}}
      />

      {/* Trending Now */}
      <TrendingNowSection
        offers={dummyData.trendingOffers}
        onViewAll={() => {}}
      />

      {/* AI Recommended */}
      <AIRecommendedSection
        offers={dummyData.aiRecommendedOffers}
        onViewAll={() => {}}
      />

      {/* Friends Redeemed */}
      <FriendsRedeemedSection
        offers={dummyData.friendsRedeemed}
        onViewAll={() => {}}
      />

      {/* Hotspot Deals */}
      <HotspotDealsSection
        hotspots={dummyData.hotspotDeals}
        onHotspotPress={handleHotspotPress}
        selectedHotspot={selectedHotspot}
      />

      {/* Last Chance */}
      <LastChanceSection
        offers={dummyData.lastChanceOffers}
        onViewAll={() => {}}
      />

      {/* New Today */}
      <NewTodaySection
        offers={dummyData.newTodayOffers}
        onViewAll={() => {}}
      />
    </>
  );

  const renderCashbackTab = () => (
    <>
      {/* Double Cashback Banner */}
      {dummyData.doubleCashbackCampaign && (
        <DoubleCashbackBanner
          campaign={dummyData.doubleCashbackCampaign}
          onPress={() => {}}
        />
      )}

      {/* Big Coin Drops */}
      <CoinDropsSection
        coinDrops={dummyData.coinDrops}
        onViewAll={() => {}}
      />

      {/* Super Cashback Stores */}
      <SuperCashbackSection
        stores={dummyData.superCashbackStores}
        onViewAll={() => {}}
      />

      {/* Upload Bill, Earn Coins */}
      <UploadBillSection
        stores={dummyData.uploadBillStores}
        onViewAll={() => {}}
      />

      {/* Bank & Wallet Offers */}
      <BankOffersSection
        offers={dummyData.bankOffers}
        onViewAll={() => {}}
      />

      {/* Nearby Offers with Cashback */}
      <NearbyOffersSection
        offers={dummyData.nearbyOffers.filter((o) => o.cashbackPercentage > 0)}
        onViewAll={() => {}}
      />

      {/* Trending Cashback */}
      <TrendingNowSection
        offers={dummyData.trendingOffers}
        onViewAll={() => {}}
      />
    </>
  );

  const renderExclusiveTab = () => (
    <>
      {/* Birthday Week Banner */}
      <BirthdayBanner
        isActive={true}
        daysRemaining={5}
        onPress={() => {}}
      />

      {/* Exclusive Categories Grid */}
      <ExclusiveCategoriesGrid categories={dummyData.exclusiveCategories} />

      {/* Special Profiles */}
      <SpecialProfilesSection
        profiles={dummyData.specialProfiles}
        onViewAll={() => {}}
      />

      {/* Loyalty Progress */}
      <LoyaltyProgressSection
        progress={dummyData.loyaltyProgress}
        onViewAll={() => {}}
      />

      {/* AI Picks - Exclusive */}
      <AIRecommendedSection
        offers={dummyData.aiRecommendedOffers}
        onViewAll={() => {}}
      />

      {/* New Today */}
      <NewTodaySection
        offers={dummyData.newTodayOffers}
        onViewAll={() => {}}
      />
    </>
  );

  const renderTabContent = () => {
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
