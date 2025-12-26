/**
 * Travel & Experiences Category Page - ENHANCED
 * Based on Rez_v-2-main Travel.jsx design
 * Features: Tabs, Destinations, Deals, UGC
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import CategoryHeader from '@/components/CategoryHeader';
import { getCategoryConfig } from '@/config/categoryConfig';
import QuickActionBar from '@/components/category/QuickActionBar';
import StreakLoyaltySection from '@/components/category/StreakLoyaltySection';
import FooterTrustSection from '@/components/category/FooterTrustSection';
import BrowseCategoryGrid from '@/components/category/BrowseCategoryGrid';
import EnhancedAISuggestionsSection from '@/components/category/EnhancedAISuggestionsSection';
import EnhancedUGCSocialProofSection from '@/components/category/EnhancedUGCSocialProofSection';
import { useCategoryPageData } from '@/hooks/useCategoryPageData';
// Error and Loading States
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EmptyState from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

const TRAVEL_TABS = [
  { id: 'flights', label: 'Flights', icon: 'airplane-outline' },
  { id: 'hotels', label: 'Hotels', icon: 'bed-outline' },
  { id: 'destinations', label: 'Destinations', icon: 'map-outline' },
  { id: 'taxis', label: 'Taxis', icon: 'car-outline' },
];

export default function TravelCategoryPage() {
  const router = useRouter();
  const slug = 'travel-experiences';
  const categoryConfig = getCategoryConfig(slug);

  const { subcategories, stores, ugcPosts, aiPlaceholders, isLoading, error, refetch } = useCategoryPageData(slug);
  const [activeTab, setActiveTab] = useState('flights');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: any) => {
    router.push(`/category/${slug}/subcategory/${category.slug || category.id}` as any);
  };

  const handleAISearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&category=${slug}`);
  };


  if (!categoryConfig) return null;

  // Show loading state
  if (isLoading && !refreshing && stores.length === 0) {
    return <LoadingState message="Loading travel..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="airplane-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('TravelCategoryPage Error:', err)}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[categoryConfig.primaryColor]} />}
    >
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* Travel Rewards Banner */}
      <View style={styles.rewardsBanner}>
        <LinearGradient colors={['rgba(59, 130, 246, 0.15)', 'rgba(139, 92, 246, 0.15)']} style={styles.rewardsGradient}>
          <Ionicons name="airplane" size={24} color="#3B82F6" />
          <View style={styles.rewardsText}>
            <Text style={styles.rewardsTitle}>Travel & Earn Rewards</Text>
            <Text style={styles.rewardsSubtitle}>Get cashback on flights, hotels & experiences</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TRAVEL_TABS.map((tab) => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.tab, activeTab === tab.id && styles.tabActive]}>
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? COLORS.white : COLORS.textSecondary} />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <QuickActionBar categorySlug={slug} />

      <EnhancedAISuggestionsSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        placeholders={aiPlaceholders}
        onSearch={handleAISearch}
      />

      <BrowseCategoryGrid
        categories={subcategories}
        title="Browse Travel"
        onCategoryPress={handleCategoryPress}
      />

      {/* Flight Deals */}
      {activeTab === 'flights' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="airplane-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Top Flight Deals</Text>
            <TouchableOpacity onPress={() => router.push(`/search?q=flights&category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.dealsGrid}>
            {['Delhi → Mumbai', 'Bangalore → Goa', 'Mumbai → Dubai'].map((deal, index) => (
              <TouchableOpacity key={index} style={styles.dealCard} onPress={() => router.push(`/search?q=${encodeURIComponent(deal)}&category=${slug}`)}>
                <Text style={styles.dealRoute}>{deal}</Text>
                <Text style={styles.dealPrice}>From ₹{['4999', '3999', '12999'][index]}</Text>
                <Text style={styles.dealCashback}>10% cashback</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Hotels */}
      {activeTab === 'hotels' && stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bed-outline" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Hotels Near You</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hotelsList}>
            {stores.slice(0, 5).map((hotel) => (
              <TouchableOpacity key={hotel.id} style={styles.hotelCard} onPress={() => router.push(`/StorePage?storeId=${hotel.id}` as any)}>
                <Image source={{ uri: hotel.logo || 'https://via.placeholder.com/300' }} style={styles.hotelImage} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.hotelGradient} />
                <View style={styles.hotelContent}>
                  <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
                  <View style={styles.hotelMeta}>
                    <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                    <Text style={styles.hotelRating}>{hotel.rating?.toFixed(1) || '4.5'}</Text>
                  </View>
                  <Text style={styles.hotelPrice}>₹1999/night</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular Destinations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>✈️</Text>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationsList}>
          {['Goa', 'Manali', 'Kerala', 'Jaipur', 'Udaipur'].map((destination, index) => (
            <TouchableOpacity key={index} style={styles.destinationCard} onPress={() => router.push(`/search?q=${encodeURIComponent(destination)}&category=${slug}`)}>
              <LinearGradient colors={[['#DBEAFE', '#93C5FD'], ['#D1FAE5', '#6EE7B7'], ['#FEF3C7', '#FCD34D'], ['#FCE7F3', '#F9A8D4'], ['#EDE9FE', '#C4B5FD']][index]} style={styles.destinationGradient}>
                <Text style={styles.destinationEmoji}>{['🏖️', '🏔️', '🌴', '🏰', '🕌'][index]}</Text>
                <Text style={styles.destinationName}>{destination}</Text>
                <Text style={styles.destinationPrice}>From ₹{['9999', '7999', '11999', '6999', '8999'][index]}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Travel Packages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🎒</Text>
          <Text style={styles.sectionTitle}>Travel Packages</Text>
        </View>
        <View style={styles.packagesGrid}>
          {['Weekend Getaway', 'Family Package', 'Honeymoon Special'].map((deal, index) => (
            <TouchableOpacity key={index} style={styles.packageCard} onPress={() => router.push(`/search?q=${encodeURIComponent(deal)}&category=${slug}`)}>
              <Text style={styles.packageEmoji}>{['🏖️', '👨‍👩‍👧‍👦', '💑'][index]}</Text>
              <Text style={styles.packageName}>{deal}</Text>
              <Text style={styles.packageDiscount}>Up to 30% off</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <StreakLoyaltySection />

      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Travel Diaries"
        subtitle="Real experiences from fellow travelers!"
        onPostPress={(post) => router.push(`/ugc/${post.id}` as any)}
        onSharePress={() => router.push('/share' as any)}
      />

      <FooterTrustSection />
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 100 },
  rewardsBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  rewardsGradient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  rewardsText: { flex: 1 },
  rewardsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  rewardsSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  tabsContainer: { backgroundColor: COLORS.white, paddingVertical: 8, marginTop: 12 },
  tabs: { paddingHorizontal: 16, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.05)', gap: 6 },
  tabActive: { backgroundColor: COLORS.primaryGreen },
  tabLabel: { fontSize: 14, color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.white, fontWeight: '600' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  dealsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dealCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  dealRoute: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  dealPrice: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  dealCashback: { fontSize: 11, color: COLORS.primaryGreen },
  hotelsList: { gap: 12, paddingRight: 16 },
  hotelCard: { width: 280, height: 200, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  hotelImage: { width: '100%', height: '100%' },
  hotelGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  hotelContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  hotelName: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  hotelRating: { fontSize: 12, color: COLORS.white },
  hotelPrice: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  destinationsList: { gap: 12, paddingRight: 16 },
  destinationCard: { width: 140, borderRadius: 16, overflow: 'hidden' },
  destinationGradient: { padding: 16, alignItems: 'center', minHeight: 120 },
  destinationEmoji: { fontSize: 32, marginBottom: 8 },
  destinationName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  destinationPrice: { fontSize: 12, color: COLORS.textSecondary },
  packagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  packageCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  packageEmoji: { fontSize: 32, marginBottom: 8 },
  packageName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  packageDiscount: { fontSize: 12, color: '#EF4444' },
});
