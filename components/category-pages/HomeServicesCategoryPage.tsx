/**
 * Home Services Category Page - ENHANCED
 * Based on Rez_v-2-main HomeServices.jsx design
 * Features: Service types, Providers, Maintenance plans, UGC
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
import { useRegion } from '@/contexts/RegionContext';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

const SERVICE_FILTERS = [
  { id: 'near-me', label: 'Near Me', icon: 'location-outline' },
  { id: 'urgent', label: 'Urgent', icon: 'flash-outline' },
  { id: 'scheduled', label: 'Scheduled', icon: 'calendar-outline' },
  { id: 'verified', label: 'Verified', icon: 'checkmark-circle-outline' },
];

export default function HomeServicesCategoryPage() {
  const router = useRouter();
  const slug = 'home-services';
  const categoryConfig = getCategoryConfig(slug);
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const { subcategories, stores, ugcPosts, aiPlaceholders, isLoading, error, refetch } = useCategoryPageData(slug);
  const [activeFilters, setActiveFilters] = useState<string[]>(['near-me']);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(f => f !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
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
    return <LoadingState message="Loading services..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="home-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('HomeServicesCategoryPage Error:', err)}>
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

      {/* Trust Banner */}
      <View style={styles.trustBanner}>
        <LinearGradient colors={['rgba(0, 192, 106, 0.15)', 'rgba(59, 130, 246, 0.15)']} style={styles.trustGradient}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primaryGreen} />
          <View style={styles.trustText}>
            <Text style={styles.trustTitle}>Trusted Service Providers</Text>
            <Text style={styles.trustSubtitle}>Background verified, insured & guaranteed</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {SERVICE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => toggleFilter(filter.id)}
              style={[styles.filterChip, activeFilters.includes(filter.id) && styles.filterChipActive]}
            >
              <Ionicons name={filter.icon as any} size={16} color={activeFilters.includes(filter.id) ? COLORS.white : COLORS.textSecondary} />
              <Text style={[styles.filterLabel, activeFilters.includes(filter.id) && styles.filterLabelActive]}>{filter.label}</Text>
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
        title="Browse Services"
        onCategoryPress={handleCategoryPress}
      />

      {/* Popular Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🔧</Text>
          <Text style={styles.sectionTitle}>Popular Services</Text>
        </View>
        <View style={styles.servicesGrid}>
          {['Plumbing', 'Electrical', 'Cleaning', 'AC Repair', 'Painting', 'Carpentry'].map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard} onPress={() => router.push(`/search?q=${encodeURIComponent(service)}&category=${slug}`)}>
              <Text style={styles.serviceEmoji}>{['🔧', '⚡', '🧹', '❄️', '🎨', '🪚'][index]}</Text>
              <Text style={styles.serviceName}>{service}</Text>
              <Text style={styles.serviceCashback}>10% cashback</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Top Rated Providers */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={20} color={COLORS.primaryGold} />
            <Text style={styles.sectionTitle}>Top Rated Providers</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.providersGrid}>
            {stores.slice(0, 4).map((provider) => (
              <TouchableOpacity key={provider.id} style={styles.providerCard} onPress={() => router.push(`/StorePage?storeId=${provider.id}` as any)}>
                <View style={styles.providerHeader}>
                  <View style={styles.providerLogo}>
                    {provider.logo ? <Image source={{ uri: provider.logo }} style={styles.providerLogoImage} resizeMode="contain" /> : <Text style={styles.providerEmoji}>🔧</Text>}
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
                    <View style={styles.providerRating}>
                      <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                      <Text style={styles.providerRatingText}>{provider.rating?.toFixed(1) || '4.5'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.providerBadges}>
                  {provider.isVerified && (
                    <View style={styles.providerBadge}>
                      <Ionicons name="checkmark-circle" size={12} color={COLORS.primaryGreen} />
                      <Text style={styles.providerBadgeText}>Verified</Text>
                    </View>
                  )}
                  <View style={styles.providerBadgeCashback}>
                    <Text style={styles.providerBadgeText}>{provider.cashback || 10}% Cashback</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Maintenance Plans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Maintenance Plans</Text>
        </View>
        <View style={styles.plansGrid}>
          {['Monthly', 'Quarterly', 'Yearly'].map((plan, index) => (
            <TouchableOpacity key={index} style={styles.planCard} onPress={() => router.push(`/search?q=${encodeURIComponent(plan + ' maintenance plan')}&category=${slug}`)}>
              <Text style={styles.planName}>{plan} Plan</Text>
              <Text style={styles.planPrice}>{currencySymbol}{['999', '2499', '8999'][index]}</Text>
              <Text style={styles.planDiscount}>Save up to 20%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trust Section */}
      <View style={styles.trustSection}>
        <View style={styles.trustSectionHeader}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primaryGreen} />
          <Text style={styles.trustSectionTitle}>Why Choose ReZ Services</Text>
        </View>
        <View style={styles.trustItems}>
          {['Background Verified', 'Insured Services', '24/7 Support', 'Satisfaction Guaranteed'].map((item, index) => (
            <View key={index} style={styles.trustItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primaryGreen} />
              <Text style={styles.trustItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <StreakLoyaltySection />

      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Happy Home Stories"
        subtitle="See how others transformed their homes!"
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
  trustBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  trustGradient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  trustText: { flex: 1 },
  trustTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  trustSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  filtersContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  filters: { gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.05)', gap: 6 },
  filterChipActive: { backgroundColor: COLORS.primaryGreen },
  filterLabel: { fontSize: 12, color: COLORS.textSecondary },
  filterLabelActive: { color: COLORS.white, fontWeight: '600' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  serviceEmoji: { fontSize: 32, marginBottom: 8 },
  serviceName: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 4 },
  serviceCashback: { fontSize: 11, color: COLORS.primaryGreen },
  providersGrid: { gap: 12 },
  providerCard: { padding: 12, borderRadius: 16, backgroundColor: COLORS.white, marginBottom: 12 },
  providerHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  providerLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  providerLogoImage: { width: 40, height: 40 },
  providerEmoji: { fontSize: 24 },
  providerInfo: { flex: 1, justifyContent: 'center' },
  providerName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  providerRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  providerRatingText: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary },
  providerBadges: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  providerBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(0, 192, 106, 0.1)', gap: 4 },
  providerBadgeCashback: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(0, 192, 106, 0.1)' },
  providerBadgeText: { fontSize: 11, color: COLORS.primaryGreen, fontWeight: '500' },
  bookButton: { paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primaryGreen, alignItems: 'center' },
  bookButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  plansGrid: { flexDirection: 'row', gap: 8 },
  planCard: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  planName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  planPrice: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  planDiscount: { fontSize: 12, color: COLORS.primaryGreen },
  trustSection: { marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: COLORS.white },
  trustSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  trustSectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  trustItems: { gap: 12 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustItemText: { fontSize: 14, color: '#374151' },
});
